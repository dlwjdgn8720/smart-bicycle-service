import os
import pickle
import traceback
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
import holidays
import httpx
import math
import asyncio
import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from database.connection import Base, engine
from routes.member import member_router
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# 실시간 따릉이 대여정보 api키
SEOUL_API_KEY = os.getenv("SEOUL_API_KEY", "seoul-api-key-default")

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

# 전역 캐시 변수 (CSV에서 추출한 통계 값)
STAT_CACHE = {
    "avg_use_time": 24,  # 기본 평균 이용시간 (분)
    "hourly_ratio": [],  # CSV 기반 24시간 누적 대여 비율
    "weekday_hourly":[],
    "weekend_hourly":[]
}

def load_precalculated_statistics():
    """미리 연산된 경량 JSON 통계 파일 로드 (0.001초 소요)"""
    global STAT_CACHE
    try:
        with open("data/bike_stats_2025.json", "r", encoding="utf-8") as f:
            STAT_CACHE = json.load(f)
        print("✅ 경량 통계 파일 로드 완료")
    except Exception as e:
        print(f"⚠️ 통계 파일 로드 실패 (기본값 사용): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 기동 시 딜레이 없이 즉시 로드
    load_precalculated_statistics()
    yield

app = FastAPI(lifespan=lifespan)

# CORS 설정
origins = os.getenv("FRONT_ORIGINS", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(member_router, prefix="/api/member")

# ==========================================
# 1. 트렌드 예측 모델 로드 (변수명: trend_model)
# ==========================================
try:
    trend_assets = joblib.load("models/bike_model.pkl")
    trend_model = trend_assets["model"]
    avg_features = trend_assets["avg_features"]
    raw_2024 = trend_assets["raw_2024"]
    print("트렌드 모델 로드 성공")
except Exception as e:
    print(f"트렌드 모델 로드 실패: {e}")
    trend_model = None

# ==========================================
# 2. 수요 예측 모델 로드 (변수명: forecast_model)
# ==========================================
FORECAST_MODEL_PATH = "models/bike_multi_target_models.pkl"
demand_model = None
model_features = []
STATION_METADATA = {}

try:
    lgb.LGBMRegressor.silent = False  
    with open(FORECAST_MODEL_PATH, "rb") as f:
        forecast_model = pickle.load(f)

        # pkl 내부 딕셔너리 구조 추출
    if isinstance(forecast_model, dict):
        demand_model = forecast_model.get("demand_model")
        model_features = forecast_model.get("features", [])
    else:
        demand_model = forecast_model

    # LightGBM C++ 핸들(handle) 메모리 재생성 로직
    if demand_model is not None:
        # LGBMRegressor 등 wrapper 객체 또는 순수 Booster 객체 구분
        target_booster = getattr(demand_model, "_Booster", demand_model)
        
        # 모델 구조 문자열 추출
        try:
            m_str = target_booster.model_to_string()
        except Exception:
            m_str = getattr(target_booster, "_handle", None)

        # C++ 포인터/핸들을 보유한 새로운 Booster 객체 생성 및 교체
        if isinstance(m_str, str):
            fresh_booster = lgb.Booster(model_str=m_str)
            if hasattr(demand_model, "_Booster"):
                demand_model._Booster = fresh_booster
            else:
                demand_model = fresh_booster

    print("수요 예측 모델 로드 성공")
except Exception as e:
    print(f"수요 예측 모델 로드 실패: {e}")

    
# 대여소 메타데이터 로드
try:
    STATION_METADATA = joblib.load("models/station_metadata.pkl")
    print("대여소 메타데이터 로드 성공")
except Exception as e:
    print(f"대여소 메타데이터 로드 실패 (기본값 사용): {e}")
    STATION_METADATA = {
    101: {"자치구": 1, "거치대수": 15, "lag_1h": 12, "lag_24h": 15, "station_hour_mean": 11},
    102: {"자치구": 1, "거치대수": 20, "lag_1h": 28, "lag_24h": 31, "station_hour_mean": 29},
    }   

# Top 10 데이터 로드
try:
    top_stations_data = joblib.load("models/top_stations_2025.pkl")
except Exception as e:
    print(f"Top 10 데이터 로드 실패: {e}")
    top_stations_data = []

# ==========================================
# 라우터 엔드포인트
# ==========================================

@app.get("/api/bike-trends")
def get_bike_trends():
    if trend_model is None:
        raise HTTPException(status_code=500, detail="트렌드 예측 모델이 로드되지 않았습니다.")

    result = []
    future_months = list(range(1, 13))
    future_X = []

    for m in future_months:
        sin_val = np.sin(2 * np.pi * m / 12)
        cos_val = np.cos(2 * np.pi * m / 12)
        dist = avg_features["distance"][m] * 1.02
        time = avg_features["time"][m] * 1.02
        future_X.append([sin_val, cos_val, dist, time])

    # trend_model 전용 예측 수행
    predictions = trend_model.predict(future_X)

    for m, pred in zip(future_months, predictions):
        result.append({
            "month": f"25년 {m}월(AI)",
            "usage": int(pred),
            "isPredicted": True,
        })

    return {"data": result}


@app.get("/api/top-stations")
def get_top_stations():
    return {"data": top_stations_data}


@app.get("/api/stations_info")
def get_stations_info():
    station_names = {
    station_id: info['대여소명'] 
    for station_id, info in STATION_METADATA.items()
}
    return {"stations": station_names}

# 대여소 상세 정보 제공 API
@app.get("/api/stations/{station_id}")
def get_station_info(station_id: int, dayofweek: int = 0, hour: int = 12):
    station = STATION_METADATA.get(station_id)
    if not station:
        raise HTTPException(status_code=404, detail="존재하지 않는 대여소입니다.")

    # "요일_시간" 문자열 키로 조회
    key = f"{dayofweek}_{hour}"
    rolling_avg = station["station_hour_mean"].get(key, 0.0)

    return {
        "station_id": station_id,
        "district": station["자치구"],
        "rack_count": station["거치대수"],
        "rolling_7d_same_hour_avg": rolling_avg,
    }



# 1. 전달받는 스네이크 케이스 키명에 맞춘 Pydantic 모델
class ForecastRequest(BaseModel):
    station_id: int = Field(..., description="대여소 ID")
    date: str = Field(..., description="예측 날짜 (YYYY-MM-DD)")
    hour: int = Field(..., description="예측 시간 (0~23)")
    is_holiday: int = Field(0, description="휴일 여부")
    temperature: float = Field(..., description="기온(°C)")
    humidity: float = Field(..., description="습도(%)")
    rainfall: float = Field(..., description="강수량(mm)")
    wind_speed: float = Field(..., description="풍속(m/s)")
    rolling_7d_same_hour_avg: float = Field(..., description="시간대별 평균 대여량 (station_hour_mean)")

@app.post("/api/ai/bike/forecast")
def predict_bike_demand(data: ForecastRequest):
    if demand_model is None:
        raise HTTPException(status_code=500, detail="수요 예측 AI 모델 파일이 로드되지 않았습니다.")

    try:
        dt = datetime.strptime(data.date, "%Y-%m-%d")
        month = dt.month
        dayofweek = dt.weekday()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)")

    # -------------------------------------------------------------
    # [추가] 특수일 피처 3종 계산 (공휴일, 명절, 연휴전날)
    # -------------------------------------------------------------
    is_public_holiday, is_major_holiday, is_day_before_holiday = (
        get_special_day_features(data.date)
    )

    # 파생 변수 생성 (학습 스크립트 조건과 일치)
    is_weekend = 1 if dayofweek in [5, 6] else 0
    is_rush_hour = 1 if data.hour in [7, 8, 9, 17, 18, 19] else 0
    is_rain = 1 if data.rainfall > 0 else 0
    is_freezing = 1 if data.temperature < 0 else 0

    # 불쾌지수 계산
    rh = data.humidity / 100.0
    discomfort_index = 1.8 * data.temperature - 0.55 * (1 - rh) * (1.8 * data.temperature - 26) + 32

    # 시간 및 요일 주기성(Sin/Cos) 인코딩
    hour_sin = np.sin(2 * np.pi * data.hour / 24.0)
    hour_cos = np.cos(2 * np.pi * data.hour / 24.0)
    dow_sin = np.sin(2 * np.pi * dayofweek / 7.0)
    dow_cos = np.cos(2 * np.pi * dayofweek / 7.0)

    # 2. 대여소 메타데이터 조회
    station_info = (
        STATION_METADATA.get(data.station_id) 
        or STATION_METADATA.get(str(data.station_id), {"자치구": 1, "거치대수": 15})
    )
    
    raw_district = station_info.get("자치구", 1)
    # district_code = get_district_code(raw_district)
    rack_count = int(station_info.get("거치대수", 15))

    # 3. 모델 피처 입력 데이터프레임 구성
    raw_input = {
        "대여소번호": str(data.station_id),
        "자치구": str(raw_district),
        "거치대수": float(rack_count),
        "기온(°C)": float(data.temperature),
        "강수량(mm)": float(data.rainfall),
        "풍속(m/s)": float(data.wind_speed),
        "습도(%)": float(data.humidity),
        "month": int(month),
        "hour": int(data.hour),
        "dayofweek": int(dayofweek),
        "is_weekend": int(is_weekend),
        "is_public_holiday": int(is_public_holiday),  # 추가
        "is_major_holiday": int(is_major_holiday),  # 추가
        "is_day_before_holiday": int(is_day_before_holiday),  # 추가
        "is_rush_hour": int(is_rush_hour),
        "is_rain": int(is_rain),
        "is_freezing": int(is_freezing),
        "discomfort_index": float(discomfort_index),
        "hour_sin": float(hour_sin),
        "hour_cos": float(hour_cos),
        "dow_sin": float(dow_sin),
        "dow_cos": float(dow_cos),
        "station_hour_mean": float(data.rolling_7d_same_hour_avg),
    }

    try:
        input_df = pd.DataFrame([raw_input])

        # 범주형 타깃 타입 지정
        for col in ["대여소번호", "자치구"]:
            if col in input_df.columns:
                input_df[col] = input_df[col].astype("category")

        # 피처 컬럼 순서 정렬
        if model_features:
            input_df = input_df[model_features]

        # 추론 실행
        if hasattr(demand_model, "predict"):
            raw_pred_log = demand_model.predict(input_df)[0]
        else:
            booster = getattr(demand_model, "_Booster", demand_model)
            if hasattr(demand_model, "booster_"):
                booster = demand_model.booster_
            raw_pred_log = booster.predict(input_df)[0]

        # Log1p 학습 모델 복원 (expm1 적용 및 음수 방지)
        real_pred_demand = np.expm1(raw_pred_log)
        predicted_demand = int(max(0, round(real_pred_demand)))

    except Exception as e:
        print("❌ [AI 추론 500 에러 상세 Traceback]:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"예측 계산 오류: {str(e)}")

    # 4. 혼잡도 판단 및 응답 반환
    capacity_ratio = predicted_demand / rack_count if rack_count > 0 else 0.0

    if capacity_ratio >= 0.8:
        demand_level = "높음"
        message = "해당 시간대 수요가 매우 높습니다. 인근 대여소 재배치를 권장합니다."
    elif capacity_ratio >= 0.5:
        demand_level = "보통"
        message = "해당 시간대 수요가 보통 수준입니다. 현재 대여소 운영을 유지해도 좋습니다."
    else:
        demand_level = "낮음"
        message = "해당 시간대 수요가 낮습니다. 자전거 재배치가 필요하지 않습니다."

    return {
        "predicted_demand": predicted_demand,
        "demand_level": demand_level,
        "message": message,
        "available_bikes": predicted_demand,
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("❌ [422 Validation Error] 요청 데이터 검증 실패:")
    print(exc.errors())  # 터미널에 어떤 필드가 잘못되었는지 정확히 출력됨
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

kr_holidays = holidays.KR()

def get_special_day_features(date_str: str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    dt_date = dt.date()
    
    # 1. 법정 공휴일 여부
    is_public_holiday = 1 if dt_date in kr_holidays else 0
    
    # 2. 명절 (설날, 추석) 여부
    h_name = str(kr_holidays.get(dt_date, ""))
    is_major_holiday = 1 if any(m in h_name for m in ["Lunar New Year", "Chuseok", "설날", "추석"]) else 0
    
    # 3. 연휴 전날 여부 (오늘이 평일이면서 내일이 주말/공휴일인 경우)
    is_weekday = 1 if (dt.weekday() < 5 and is_public_holiday == 0) else 0
    next_dt = dt + timedelta(days=1)
    next_is_weekend = 1 if next_dt.weekday() >= 5 else 0
    next_is_pub = 1 if next_dt.date() in kr_holidays else 0
    
    is_day_before_holiday = 1 if (is_weekday and (next_is_weekend or next_is_pub)) else 0
    
    return is_public_holiday, is_major_holiday, is_day_before_holiday


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """두 위경도 간의 하버사인(Haversine) 직선 거리 계산 (단위: km)"""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def format_distance(dist_km: float) -> str:
    """거리를 m 또는 km 단위 문자열로 변환 (예: 120m, 1.2km)"""
    if dist_km < 1.0:
        return f"{int(dist_km * 1000)}m"
    return f"{dist_km:.1f}km"


def get_station_status(available: int) -> str:
    """자전거 잔여 대수에 따른 상태값 반환 (GOOD / LOW / EMPTY)"""
    if available == 0:
        return "EMPTY"
    elif available <= 3:
        return "LOW"
    return "GOOD"

async def fetch_bike_range(client: httpx.AsyncClient, start: int, end: int) -> list:
    """단일 구간 데이터를 호출하는 비동기 함수"""
    url = f"http://openapi.seoul.go.kr:8088/{SEOUL_API_KEY}/json/bikeList/{start}/{end}/"
    try:
        response = await client.get(url, timeout=5.0)
        res_data = response.json()
        return res_data.get("rentBikeStatus", {}).get("row", [])
    except Exception as e:
        print(f"API 호출 오류 ({start}~{end}): {e}")
        return []

def get_actual_hourly_usage() -> list:
    """JSON 통계 데이터에서 오늘(평일/주말)에 해당하는 시간대별 실제 평균 대여량 추출"""
    is_weekend = datetime.now().weekday() >= 5
    key = "weekend_hourly" if is_weekend else "weekday_hourly"

    # JSON에서 읽어온 실제 시간대별 평균 배열
    counts = STAT_CACHE.get(
        key, [0] * 24
    )  # JSON 로드 실패 시 기본값 0 처리

    return [{"hour": f"{h:02d}시", "count": counts[h]} for h in range(24)]


@app.get("/api/bike/seoul/stations")
async def get_nearby_stations(request: Request):
#     lat: float = Query(37.4979, description="기준 위도 (기본: 강남역)"),
#     lng: float = Query(127.0276, description="기준 경도 (기본: 강남역)"),
#     limit: int = 6,
# ):

    # 모든 쿼리 파라미터를 딕셔너리로 변환
    params = dict(request.query_params)

    # 기본값 설정 및 타입 변환 처리
    lat = float(params.get("lat", 37.4979))
    lng = float(params.get("lng", 127.0276))
    limit = int(params.get("limit", 6))


    # 1000개 단위로 3회 나누어 요청하는 범위 지정 (총 3,000개)
    ranges = [(1, 1000), (1001, 2000), (2001, 3000)]

    async with httpx.AsyncClient() as client:
        # 3개 구간의 HTTP 요청을 동시(병렬) 수행
        tasks = [fetch_bike_range(client, start, end) for start, end in ranges]
        results = await asyncio.gather(*tasks)

    # 병렬 호출 결과 리스트 하나로 합치기
    raw_stations = []
    for station_list in results:
        raw_stations.extend(station_list)

    parsed_stations = []
    for item in raw_stations:
        # 좌표 데이터 누락 방어 코드
        if not item.get("stationLatitude") or not item.get("stationLongitude"):
            continue

        st_lat = float(item["stationLatitude"])
        st_lng = float(item["stationLongitude"])

        dist_km = calculate_distance(lat, lng, st_lat, st_lng)
        available = int(item["parkingBikeTotCnt"])
        total = int(item["rackTotCnt"])

        raw_name = item["stationName"]
        clean_name = (
            raw_name.split(".", 1)[-1].strip() if "." in raw_name else raw_name
        )

        parsed_stations.append(
            {
                "id": item["stationId"],
                "name": clean_name,
                "distance": format_distance(dist_km),
                "available": available,
                "total": total,
                "status": get_station_status(available),
                "_sort_dist": dist_km,
            }
        )

    # 가장 가까운 대여소 순 정렬
    parsed_stations.sort(key=lambda x: x["_sort_dist"])

    # 정렬 임시 필드 제거 및 상위 N개 추출
    result_stations = []
    for st in parsed_stations[:limit]:
        st.pop("_sort_dist", None)
        result_stations.append(st)

    # 1년치 데이터 분석으로 완성된 시간대별 실제 이용량
    hourly_usage = get_actual_hourly_usage()       

    return {"stations": result_stations, "hourlyUsage": hourly_usage}

# 실시간 자전거 api 연동
async def fetch_bike_stations(client: httpx.AsyncClient) -> list:
    """실시간 전체 대여소 수집 (3,000개)"""
    ranges = [(1, 1000), (1001, 2000), (2001, 3000)]
    tasks = [
        client.get(
            f"http://openapi.seoul.go.kr:8088/{SEOUL_API_KEY}/json/bikeList/{s}/{e}/"
        )
        for s, e in ranges
    ]
    responses = await asyncio.gather(*tasks, return_exceptions=True)

    stations = []
    for res in responses:
        if isinstance(res, httpx.Response) and res.status_code == 200:
            data = res.json()
            stations.extend(data.get("rentBikeStatus", {}).get("row", []))
    return stations


@app.get("/api/bike/summary")
async def get_dashboard_summary():
    async with httpx.AsyncClient() as client:
        raw_stations = await fetch_bike_stations(client)

    # 1. 운영 대여소 수
    operating_stations = len(raw_stations)

    # 2. 현재 이용중 건수 = (전체 거치대 총합) - (현재 대여 가능 자전거 총합)
    total_racks = sum(int(st.get("rackTotCnt", 0)) for st in raw_stations)
    total_available = sum(
        int(st.get("parkingBikeTotCnt", 0)) for st in raw_stations
    )
    currently_active = max(0, total_racks - total_available)

    # 3. 평균 이용시간 (CSV 기반)
    avg_use_time = STAT_CACHE["avg_use_time"]

    # 4. 오늘 총 이용건수 (추정치)
    # 현재 이용중인 대수와 CSV 기반 시간대별 누적 비율을 조합하여 역산
    current_hour = datetime.now().hour
    cum_ratio = STAT_CACHE["hourly_ratio"][current_hour]

    # 현재 이용 중인 자전거 수 기반 예상 오늘 총 대여량 역산
    estimated_today_total = (
        round((currently_active * 3) / max(0.01, cum_ratio))
        if cum_ratio > 0
        else 0
    )

    return {
        "operatingStations": operating_stations,  # 운영 대여소 수 (개)
        "currentlyActive": currently_active,  # 현재 이용중 (대)
        "avgUseTime": avg_use_time,  # 평균 이용시간 (분)
        "estimatedTodayTotal": estimated_today_total,  # 오늘 총 이용건수 예상 (건)
    }


