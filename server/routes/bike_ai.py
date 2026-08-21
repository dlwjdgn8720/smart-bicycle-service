import traceback
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core import ml_loader
from utils.helpers import get_special_day_features

router = APIRouter(prefix="/api", tags=["Bike AI"])

class ForecastRequest(BaseModel):
    station_id: int = Field(..., description="대여소 ID")
    date: str = Field(..., description="예측 날짜 (YYYY-MM-DD)")
    hour: int = Field(..., description="예측 시간 (0~23)")
    is_holiday: int = Field(0, description="휴일 여부")
    temperature: float = Field(..., description="기온(°C)")
    humidity: float = Field(..., description="습도(%)")
    rainfall: float = Field(..., description="강수량(mm)")
    wind_speed: float = Field(..., description="풍속(m/s)")
    rolling_7d_same_hour_avg: float = Field(..., description="시간대별 평균 대여량")

@router.get("/bike-trends")
def get_bike_trends():
    if ml_loader.trend_model is None:
        raise HTTPException(status_code=500, detail="트렌드 예측 모델이 로드되지 않았습니다.")

    result = []
    future_months = list(range(1, 13))
    future_X = []

    for m in future_months:
        sin_val = np.sin(2 * np.pi * m / 12)
        cos_val = np.cos(2 * np.pi * m / 12)
        dist = ml_loader.avg_features["distance"][m] * 1.02
        time = ml_loader.avg_features["time"][m] * 1.02
        future_X.append([sin_val, cos_val, dist, time])

    predictions = ml_loader.trend_model.predict(future_X)

    for m, pred in zip(future_months, predictions):
        result.append({
            "month": f"25년 {m}월(AI)",
            "usage": int(pred),
            "isPredicted": True,
        })
    return {"data": result}

@router.post("/forecast")
def predict_bike_demand(data: ForecastRequest):
    if ml_loader.demand_model is None:
        raise HTTPException(status_code=500, detail="수요 예측 모델이 로드되지 않았습니다.")

    try:
        dt = datetime.strptime(data.date, "%Y-%m-%d")
        month = dt.month
        dayofweek = dt.weekday()
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다.")

    is_public_holiday, is_major_holiday, is_day_before_holiday = get_special_day_features(data.date)

    is_weekend = 1 if dayofweek in [5, 6] else 0
    is_rush_hour = 1 if data.hour in [7, 8, 9, 17, 18, 19] else 0
    is_rain = 1 if data.rainfall > 0 else 0
    is_freezing = 1 if data.temperature < 0 else 0

    rh = data.humidity / 100.0
    discomfort_index = 1.8 * data.temperature - 0.55 * (1 - rh) * (1.8 * data.temperature - 26) + 32

    station_info = ml_loader.STATION_METADATA.get(data.station_id) or ml_loader.STATION_METADATA.get(str(data.station_id), {"자치구": 1, "거치대수": 15})
    raw_district = station_info.get("자치구", 1)
    rack_count = int(station_info.get("거치대수", 15))

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
        "is_public_holiday": int(is_public_holiday),
        "is_major_holiday": int(is_major_holiday),
        "is_day_before_holiday": int(is_day_before_holiday),
        "is_rush_hour": int(is_rush_hour),
        "is_rain": int(is_rain),
        "is_freezing": int(is_freezing),
        "discomfort_index": float(discomfort_index),
        "hour_sin": float(np.sin(2 * np.pi * data.hour / 24.0)),
        "hour_cos": float(np.cos(2 * np.pi * data.hour / 24.0)),
        "dow_sin": float(np.sin(2 * np.pi * dayofweek / 7.0)),
        "dow_cos": float(np.cos(2 * np.pi * dayofweek / 7.0)),
        "station_hour_mean": float(data.rolling_7d_same_hour_avg),
    }

    try:
        input_df = pd.DataFrame([raw_input])
        for col in ["대여소번호", "자치구"]:
            if col in input_df.columns:
                input_df[col] = input_df[col].astype("category")

        if ml_loader.model_features:
            input_df = input_df[ml_loader.model_features]

        if hasattr(ml_loader.demand_model, "predict"):
            raw_pred_log = ml_loader.demand_model.predict(input_df)[0]
        else:
            booster = getattr(ml_loader.demand_model, "_Booster", ml_loader.demand_model)
            if hasattr(ml_loader.demand_model, "booster_"):
                booster = ml_loader.demand_model.booster_
            raw_pred_log = booster.predict(input_df)[0]

        real_pred_demand = np.expm1(raw_pred_log)
        predicted_demand = int(max(0, round(real_pred_demand)))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"예측 계산 오류: {str(e)}")

    capacity_ratio = predicted_demand / rack_count if rack_count > 0 else 0.0
    if capacity_ratio >= 0.8:
        demand_level, message = "높음", "수요가 매우 높습니다. 재배치를 권장합니다."
    elif capacity_ratio >= 0.5:
        demand_level, message = "보통", "수요가 보통 수준입니다."
    else:
        demand_level, message = "낮음", "수요가 낮습니다. 재배치가 필요하지 않습니다."

    return {
        "predicted_demand": predicted_demand,
        "demand_level": demand_level,
        "message": message,
        "available_bikes": predicted_demand,
    }