import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
import polars as pl
import holidays
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

file_path = "../data/bike_final_dataset.csv"
print("1/5. 데이터 로딩 및 한국 공휴일/특수일 데이터 구축 중...")

# 1. 데이터 로드
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

# 2. 한국 공휴일 및 특수일 매핑 테이블 자동 생성 (holidays 라이브러리)
min_date = df["대여일시"].min()
max_date = df["대여일시"].max()
years = list(range(min_date.year, max_date.year + 1))
kr_holidays = holidays.KR(years=years)

all_dates = pd.date_range(
    start=pd.to_datetime(min_date) - pd.Timedelta(days=2),
    end=pd.to_datetime(max_date) + pd.Timedelta(days=2),
)

holiday_records = []
for d in all_dates:
    d_date = d.date()
    d_str = d.strftime("%Y-%m-%d")
    is_pub = d_date in kr_holidays
    h_name = str(kr_holidays.get(d_date, ""))

    # 설날 / 추석 명절 연휴 판별
    is_major = 1 if any(m in h_name for m in ["Lunar New Year", "Chuseok", "설날", "추석"]) else 0

    holiday_records.append({
        "date_str": d_str,
        "is_public_holiday": 1 if is_pub else 0,
        "is_major_holiday": is_major,
    })

h_df = pd.DataFrame(holiday_records)

# 연휴 전날 계산 (오늘이 평일이면서 내일이 주말/공휴일인 경우)
h_df["next_date"] = (pd.to_datetime(h_df["date_str"]) + pd.Timedelta(days=1)).dt.strftime("%Y-%m-%d")
h_df["next_is_weekend"] = (pd.to_datetime(h_df["next_date"]).dt.weekday >= 5).astype(int)

pub_dict = h_df.set_index("date_str")["is_public_holiday"].to_dict()
h_df["next_is_pub"] = h_df["next_date"].map(pub_dict).fillna(0).astype(int)

h_df["is_weekday"] = ((pd.to_datetime(h_df["date_str"]).dt.weekday < 5) & (h_df["is_public_holiday"] == 0)).astype(int)
h_df["is_day_before_holiday"] = (h_df["is_weekday"] & ((h_df["next_is_weekend"] == 1) | (h_df["next_is_pub"] == 1))).astype(int)

holiday_pl = pl.from_pandas(h_df[["date_str", "is_public_holiday", "is_major_holiday", "is_day_before_holiday"]])

# 데이터셋 결합
df = df.with_columns(pl.col("대여일시").dt.strftime("%Y-%m-%d").alias("date_str"))
df = df.join(holiday_pl, on="date_str", how="left")

print("2/5. 고성능 파생 변수 및 다중 타깃 생성 중...")

df = df.with_columns(
    [
        pl.col("대여일시").dt.month().alias("month"),
        pl.col("대여일시").dt.hour().alias("hour"),
        pl.col("대여일시").dt.weekday().alias("dayofweek"),
        (pl.col("대여일시").dt.weekday() >= 5).cast(pl.Int8).alias("is_weekend"),
        (pl.col("대여일시").dt.hour().is_in([7, 8, 9, 17, 18, 19])).cast(pl.Int8).alias("is_rush_hour"),
        (pl.col("강수량(mm)") > 0).cast(pl.Int8).alias("is_rain"),
        (pl.col("기온(°C)") < 0).cast(pl.Int8).alias("is_freezing"),
        (
            1.8 * pl.col("기온(°C)")
            - 0.55 * (1 - pl.col("습도(%)") / 100) * (1.8 * pl.col("기온(°C)") - 26)
            + 32
        ).alias("discomfort_index"),
        (np.sin(2 * np.pi * pl.col("대여일시").dt.hour() / 24)).alias("hour_sin"),
        (np.cos(2 * np.pi * pl.col("대여일시").dt.hour() / 24)).alias("hour_cos"),
        (np.sin(2 * np.pi * pl.col("대여일시").dt.weekday() / 7)).alias("dow_sin"),
        (np.cos(2 * np.pi * pl.col("대여일시").dt.weekday() / 7)).alias("dow_cos"),
        pl.col("이용건수").alias("target_demand"),
        (pl.col("이용건수") / pl.col("거치대수")).alias("target_congestion"),
    ]
)

df = df.with_columns(
    [
        pl.col("이용건수")
        .mean()
        .over(["대여소번호", "dayofweek", "hour"])
        .alias("station_hour_mean"),
    ]
)

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
    "is_public_holiday",
    "is_major_holiday",
    "is_day_before_holiday",
    "is_rush_hour",
    "is_rain",
    "is_freezing",
    "discomfort_index",
    "hour_sin",
    "hour_cos",
    "dow_sin",
    "dow_cos",
    "station_hour_mean",
]

X = df.select(features).to_pandas()
y_demand = df["target_demand"].to_pandas()
y_congestion = df["target_congestion"].to_pandas()

for col in ["대여소번호", "자치구"]:
    X[col] = X[col].astype("category")

split_idx = int(len(X) * 0.8)
X_train, X_val = X.iloc[:split_idx], X.iloc[split_idx:]

y_dem_train, y_dem_val = y_demand.iloc[:split_idx], y_demand.iloc[split_idx:]
y_cong_train, y_cong_val = y_congestion.iloc[:split_idx], y_congestion.iloc[split_idx:]

y_dem_train_log = np.log1p(y_dem_train)
y_dem_val_log = np.log1p(y_dem_val)

print("4/5. [수요] 및 [혼잡도] 모델 교차 학습 진행 중...")

model_demand = lgb.LGBMRegressor(
    n_estimators=1500,
    learning_rate=0.03,
    num_leaves=127,
    max_depth=10,
    min_child_samples=30,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
)
model_demand.fit(
    X_train,
    y_dem_train_log,
    eval_set=[(X_val, y_dem_val_log)],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)],
)

model_congestion = lgb.LGBMRegressor(
    n_estimators=1500,
    learning_rate=0.03,
    num_leaves=127,
    max_depth=10,
    min_child_samples=30,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
)
model_congestion.fit(
    X_train,
    y_cong_train,
    eval_set=[(X_val, y_cong_val)],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)],
)

print("5/5. 최종 검증 및 저장 중...")

pred_demand = np.clip(np.expm1(model_demand.predict(X_val)), 0, None)
r2_dem = r2_score(y_dem_val, pred_demand)
mae_dem = mean_absolute_error(y_dem_val, pred_demand)

pred_congestion = np.clip(model_congestion.predict(X_val), 0, None)
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

multi_model_pack = {
    "demand_model": model_demand,
    "congestion_model": model_congestion,
    "features": features,
}

model_filename = "../models/bike_multi_target_models.pkl"
joblib.dump(multi_model_pack, model_filename)
print(f"두 모델 저장 완료: '{model_filename}'")