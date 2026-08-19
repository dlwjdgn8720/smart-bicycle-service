import os
import pickle
import traceback
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
import holidays
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from database.connection import Base, engine
from routes.member import member_router
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse



# DB 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

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
    # STATION_METADATA2 = joblib.load("models/station_metadata.pkl")

    # # 2. 최댓값 및 대여소 매핑 정보 탐색
    # max_info = {
    #     "station_id": None,
    #     "station_name": None,
    #     "time_key": None,  # 예: "0_18" (월요일 18시)
    #     "max_val": -1.0,
    # }

    # for s_id, s_info in STATION_METADATA2.items():
    #     if not isinstance(s_info, dict):
    #         continue

    #     station_name = s_info.get("대여소명", "알 수 없음")
    #     hour_means = s_info.get("station_hour_mean", {})

    #     if isinstance(hour_means, dict):
    #         for t_key, val in hour_means.items():
    #             if val is not None and float(val) > max_info["max_val"]:
    #                 max_info["max_val"] = float(val)
    #                 max_info["station_id"] = s_id
    #                 max_info["station_name"] = station_name
    #                 max_info["time_key"] = t_key

    # print("🔥 [최고 평균 대여량 대여소 정보]")
    # print(f"- 대여소 ID   : {max_info['station_id']}")
    # print(f"- 대여소명     : {max_info['station_name']}")
    # print(f"- 시간대 키   : {max_info['time_key']}")
    # print(f"- 최고 평균값 : {max_info['max_val']:.2f}건")

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


# DISTRICT_MAP = {
#     "강남구": 1, "강동구": 2, "강북구": 3, "강서구": 4, "관악구": 5,
#     "광진구": 6, "구로구": 7, "금천구": 8, "노원구": 9, "도봉구": 10,
#     "동대문구": 11, "동작구": 12, "마포구": 13, "서대문구": 14, "서초구": 15,
#     "성동구": 16, "성북구": 17, "송파구": 18, "양천구": 19, "영등포구": 20,
#     "용산구": 21, "은평구": 22, "종로구": 23, "중구": 24, "중랑구": 25
# }

# def get_district_code(district_val) -> int:
#     if isinstance(district_val, int):
#         return district_val
#     if isinstance(district_val, str):
#         if district_val.isdigit():
#             return int(district_val)
#         return DISTRICT_MAP.get(district_val, 1)
#     return 1


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