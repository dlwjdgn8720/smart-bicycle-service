import joblib
import lightgbm as lgb
import numpy as np
import polars as pl
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

file_path = "data/bike_final_dataset.csv"
print("1/5. 데이터 로딩 및 메모리 최적화 중...")

# 1. 데이터 로드 및 스키마 안전 처리
df = (
    pl.read_csv(
        file_path,
        schema_overrides={
            "대여소번호": pl.Utf8,
            "자치구": pl.Utf8,
            "거치대수": pl.Float32,
            "이용건수": pl.Float32,
            "기온(°C)": pl.Float32,
            "강수량(mm)": pl.Float32,
            "풍속(m/s)": pl.Float32,
            "습도(%)": pl.Float32,
        },
        infer_schema_length=10000,
    )
    .with_columns(
        [
            pl.col("대여일시").str.to_datetime("%Y-%m-%d %H:%M:%S"),
            pl.col("대여소번호").cast(pl.Categorical),
            pl.col("자치구").cast(pl.Categorical),
        ]
    )
    .sort(["대여소번호", "대여일시"])
)

print("2/5. 파생 변수 및 다중 타깃(수요, 혼잡도) 생성 중...")

# 2. 기초 파생 변수 및 y값(수요, 혼잡도) 설정
df = df.with_columns(
    [
        pl.col("대여일시").dt.month().alias("month"),
        pl.col("대여일시").dt.hour().alias("hour"),
        pl.col("대여일시").dt.weekday().alias("dayofweek"),
        (pl.col("대여일시").dt.weekday() >= 5).cast(pl.Int8).alias("is_weekend"),
        (pl.col("대여일시").dt.hour().is_in([7, 8, 9, 17, 18, 19]))
        .cast(pl.Int8)
        .alias("is_rush_hour"),
        (pl.col("강수량(mm)") > 0).cast(pl.Int8).alias("is_rain"),
        (
            1.8 * pl.col("기온(°C)")
            - 0.55
            * (1 - pl.col("습도(%)") / 100)
            * (1.8 * pl.col("기온(°C)") - 26)
            + 32
        ).alias("discomfort_index"),
        # y값 1: 수요 (이용건수)
        pl.col("이용건수").alias("target_demand"),
        # y값 2: 혼잡도 (이용건수 / 거치대수)
        (pl.col("이용건수") / pl.col("거치대수")).alias("target_congestion"),
    ]
)

# 시계열 지연 피처 및 동시간대 평균
df = df.with_columns(
    [
        pl.col("이용건수").shift(1).over("대여소번호").alias("lag_1h"),
        pl.col("이용건수").shift(24).over("대여소번호").alias("lag_24h"),
        pl.col("이용건수")
        .mean()
        .over(["대여소번호", "dayofweek", "hour"])
        .alias("station_hour_mean"),
    ]
)

# Shift로 생긴 결측치 제거
df = df.drop_nulls(subset=["lag_1h", "lag_24h"])

print("3/5. Feature/Target 분리 및 Dataset 생성 중...")

features = [
    "대여소번호",
    "자치구",
    "거치대수",
    "기온(°C)",
    "강수량(mm)",
    "풍속(m/s)",
    "습도(%)",
    "month",
    "hour",
    "dayofweek",
    "is_weekend",
    "is_rush_hour",
    "is_rain",
    "discomfort_index",
    "lag_1h",
    "lag_24h",
    "station_hour_mean",
]

X = df.select(features).to_pandas()
y_demand = df["target_demand"].to_pandas()
y_congestion = df["target_congestion"].to_pandas()

for col in ["대여소번호", "자치구"]:
    X[col] = X[col].astype("category")

# 데이터 분할 (80% 학습 / 20% 검증)
split_idx = int(len(X) * 0.8)
X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]

y_dem_train, y_dem_val = y_demand.iloc[:split_idx], y_demand.iloc[split_idx:]
y_cong_train, y_cong_val = (
    y_congestion.iloc[:split_idx],
    y_congestion.iloc[split_idx:],
)

print("4/5. [수요] 및 [혼잡도] 모델 2종 교차 학습 진행 중...")

# 1) 수요(이용건수) 예측 전용 모델
model_demand = lgb.LGBMRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    num_leaves=63,
    random_state=42,
    n_jobs=-1,
    subsample=0.8,
    colsample_bytree=0.8,
)
model_demand.fit(
    X_train,
    y_dem_train,
    eval_set=[(X_val, y_dem_val)],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)],
)

# 2) 혼잡도(비율) 예측 전용 모델
model_congestion = lgb.LGBMRegressor(
    n_estimators=1000,
    learning_rate=0.05,
    num_leaves=63,
    random_state=42,
    n_jobs=-1,
    subsample=0.8,
    colsample_bytree=0.8,
)
model_congestion.fit(
    X_train,
    y_cong_train,
    eval_set=[(X_val, y_cong_val)],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)],
)

print("5/5. 최종 검증 및 통합 pkl 모델 파일 저장 중...")

# 검증 - 수요
pred_demand = model_demand.predict(X_val)
r2_dem = r2_score(y_dem_val, pred_demand)
mae_dem = mean_absolute_error(y_dem_val, pred_demand)

# 검증 - 혼잡도
pred_congestion = model_congestion.predict(X_val)
r2_cong = r2_score(y_cong_val, pred_congestion)
rmse_cong = np.sqrt(mean_squared_error(y_cong_val, pred_congestion))
mae_cong = mean_absolute_error(y_cong_val, pred_congestion)

print("\n==========================================")
print("[1] 수요(이용건수) 예측 모델 성능")
print(f"R2 Score : {r2_dem:.4f}")
print(f"MAE      : {mae_dem:.2f} 건")
print("------------------------------------------")
print("[2] 혼잡도(비율) 예측 모델 성능")
print(f"R2 Score : {r2_cong:.4f}")
print(f"RMSE     : {rmse_cong:.4f}")
print(f"MAE      : {mae_cong:.4f}")
print("==========================================")

# 딕셔너리로 두 모델을 묶어서 단일 pkl 저장을 진행
multi_model_pack = {
    "demand_model": model_demand,
    "congestion_model": model_congestion,
    "features": features,
}

model_filename = "models/bike_multi_target_models.pkl"
joblib.dump(multi_model_pack, model_filename)
print(f"두 모델 저장 완료: '{model_filename}'")