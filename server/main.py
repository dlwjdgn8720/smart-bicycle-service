import os
import pickle
import traceback
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
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
try:
    with open(FORECAST_MODEL_PATH, "rb") as f:
        forecast_model = pickle.load(f)
    print("수요 예측 모델 로드 성공")
except Exception as e:
    print(f"수요 예측 모델 로드 실패: {e}")
    forecast_model = None

# Top 10 데이터 로드
try:
    top_stations_data = joblib.load("models/top_stations_2025.pkl")
except Exception as e:
    print(f"Top 10 데이터 로드 실패: {e}")
    top_stations_data = []

# 대여소 메타데이터
STATION_METADATA = {
    101: {"district": 1, "rack_count": 15},
    102: {"district": 1, "rack_count": 20},
    103: {"district": 2, "rack_count": 10},
    104: {"district": 2, "rack_count": 12},
}


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
    recent_1h_rental_count: float = Field(..., description="최근 1시간 대여량 (lag_1h)")
    prev_day_same_hour_rental_count: float = Field(..., description="전일 동일 시간대 대여량 (lag_24h)")
    rolling_7d_same_hour_avg: float = Field(..., description="최근 7일 동일 시간대 평균 (station_hour_mean)")

# 2. 엔드포인트 내 변수 참조 수정
@app.post("/api/ai/bike/forecast")
def predict_bike_demand(data: ForecastRequest):
    if forecast_model is None:
        raise HTTPException(status_code=500, detail="수요 예측 AI 모델 파일이 로드되지 않았습니다.")

    try:
        dt = datetime.strptime(data.date, "%Y-%m-%d")
        month = dt.month
        dayofweek = dt.weekday()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)")

    is_weekend = 1 if dayofweek in [5, 6] else 0
    is_rush_hour = 1 if data.hour in [8, 9, 18, 19] else 0
    is_rain = 1 if data.rainfall > 0 else 0

    rh = data.humidity / 100.0
    discomfort_index = 1.8 * data.temperature - 0.55 * (1 - rh) * (1.8 * data.temperature - 26) + 32

    station_info = STATION_METADATA.get(data.station_id, {"district": 1, "rack_count": 15})

    # 피처 데이터프레임 생성 (기본 숫자형)
    input_df = pd.DataFrame([{
        "대여소번호": int(data.station_id),
        "자치구": int(station_info["district"]),
        "거치대수": int(station_info["rack_count"]),
        "기온(°C)": float(data.temperature),
        "강수량(mm)": float(data.rainfall),
        "풍속(m/s)": float(data.wind_speed),
        "습도(%)": float(data.humidity),
        "month": int(month),
        "hour": int(data.hour),
        "dayofweek": int(dayofweek),
        "is_weekend": int(is_weekend),
        "is_rush_hour": int(is_rush_hour),
        "is_rain": int(is_rain),
        "discomfort_index": float(discomfort_index),
        "lag_1h": float(data.recent_1h_rental_count),
        "lag_24h": float(data.prev_day_same_hour_rental_count),
        "station_hour_mean": float(data.rolling_7d_same_hour_avg),
    }])

    try:
        # 1. 모델 객체 및 Booster 추출
        target_model = forecast_model
        if isinstance(forecast_model, dict):
            target_model = forecast_model.get("model", list(forecast_model.values())[0])

        booster = target_model.booster_ if hasattr(target_model, "booster_") else target_model

        # 2. 모델의 피처 순서와 동일하게 input_df 컬럼 재정렬
        expected_features = booster.feature_name()
        input_df = input_df.reindex(columns=expected_features)

        # 3. 모델에 저장된 범주형(pandas_categorical) 자동 맞춤
        pandas_cat = getattr(booster, "pandas_categorical", None)
        if pandas_cat is not None:
            # 모델이 기억하는 범주형 컬럼 수(len(pandas_cat))만큼 순서대로 category 타입 변환
            cat_count = len(pandas_cat)
            candidate_cats = ["대여소번호", "자치구", "month", "hour", "dayofweek", "is_weekend", "is_rush_hour", "is_rain"]
            
            applied = 0
            for col in candidate_cats:
                if col in input_df.columns and applied < cat_count:
                    input_df[col] = input_df[col].astype("category")
                    applied += 1

        # 4. 추론 실행
        raw_pred = target_model.predict(input_df)[0]
        predicted_demand = int(max(0, round(raw_pred)))

    except Exception as e:
        print("❌ [AI 추론 500 에러 상세 Traceback]:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"예측 계산 오류: {str(e)}")

    rack_count = station_info["rack_count"]
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