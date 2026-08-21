import joblib
import pickle
import json
import lightgbm as lgb
from datetime import datetime

# 전역 변수 초기화
trend_model = None
avg_features = None
raw_2024 = None

demand_model = None
model_features = []
STATION_METADATA = {}
top_stations_data = []

STAT_CACHE = {
    "avg_use_time": 24,
    "hourly_ratio": [],
    "weekday_hourly": [],
    "weekend_hourly": []
}

def load_all_models():
    """앱 시작 시 모든 모델 및 데이터를 로드합니다."""
    global trend_model, avg_features, raw_2024
    global demand_model, model_features, STATION_METADATA, top_stations_data
    global STAT_CACHE

    # 1. 경량 JSON 통계 파일 로드
    try:
        with open("data/bike_stats_2025.json", "r", encoding="utf-8") as f:
            STAT_CACHE = json.load(f)
        print("✅ 경량 통계 파일 로드 완료")
    except Exception as e:
        print(f"⚠️ 통계 파일 로드 실패 (기본값 사용): {e}")

    # 2. 트렌드 모델 로드
    try:
        trend_assets = joblib.load("models/bike_model.pkl")
        trend_model = trend_assets["model"]
        avg_features = trend_assets["avg_features"]
        raw_2024 = trend_assets["raw_2024"]
        print("✅ 트렌드 모델 로드 성공")
    except Exception as e:
        print(f"⚠️ 트렌드 모델 로드 실패: {e}")

    # 3. 수요 예측 모델 로드
    try:
        lgb.LGBMRegressor.silent = False  
        with open("models/bike_multi_target_models.pkl", "rb") as f:
            forecast_model = pickle.load(f)

        if isinstance(forecast_model, dict):
            demand_model = forecast_model.get("demand_model")
            model_features = forecast_model.get("features", [])
        else:
            demand_model = forecast_model

        if demand_model is not None:
            target_booster = getattr(demand_model, "_Booster", demand_model)
            try:
                m_str = target_booster.model_to_string()
            except Exception:
                m_str = getattr(target_booster, "_handle", None)

            if isinstance(m_str, str):
                fresh_booster = lgb.Booster(model_str=m_str)
                if hasattr(demand_model, "_Booster"):
                    demand_model._Booster = fresh_booster
                else:
                    demand_model = fresh_booster
        print("✅ 수요 예측 모델 로드 성공")
    except Exception as e:
        print(f"⚠️ 수요 예측 모델 로드 실패: {e}")

    # 4. 대여소 메타데이터 로드
    try:
        STATION_METADATA = joblib.load("models/station_metadata.pkl")
        print("✅ 대여소 메타데이터 로드 성공")
    except Exception as e:
        print(f"⚠️ 대여소 메타데이터 로드 실패 (기본값 사용): {e}")
        STATION_METADATA = {
            101: {"자치구": 1, "거치대수": 15, "lag_1h": 12, "lag_24h": 15, "station_hour_mean": 11},
            102: {"자치구": 1, "거치대수": 20, "lag_1h": 28, "lag_24h": 31, "station_hour_mean": 29},
        }   

    # 5. Top 10 데이터 로드
    try:
        top_stations_data = joblib.load("models/top_stations_2025.pkl")
        print("✅ Top 10 데이터 로드 성공")
    except Exception as e:
        print(f"⚠️ Top 10 데이터 로드 실패: {e}")

def get_actual_hourly_usage() -> list:
    """통계 데이터에서 오늘(평일/주말) 시간대별 실제 평균 대여량 추출"""
    is_weekend = datetime.now().weekday() >= 5
    key = "weekend_hourly" if is_weekend else "weekday_hourly"
    counts = STAT_CACHE.get(key, [0] * 24)
    return [{"hour": f"{h:02d}시", "count": counts[h]} for h in range(24)]