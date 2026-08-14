import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor

# 1. 정제된 2024년 Parquet 데이터 불러오기
df = pd.read_parquet('data/combined_2024_bike_clean.parquet')

# 2. 대여소 및 월 정보 생성
df['month'] = (df['대여일자'].astype(int) % 100)

# 3. 대여소별 월별 집계
station_monthly = df.groupby(['대여소번호', '대여소명', 'month']).agg({
    '이용건수': 'sum',
    '이동거리(M)': 'mean',
    '이용시간(분)': 'mean',
    '운동량': 'mean'
}).reset_index()

# 4. 대여소별 피처 엔지니어링 (2024년 총 이용량, 상반기/하반기 비율, 평균 거리/시간)
station_features = station_monthly.groupby(['대여소번호', '대여소명']).agg(
    total_usage_2024=('이용건수', 'sum'),
    avg_distance=('이동거리(M)', 'mean'),
    avg_duration=('이용시간(분)', 'mean'),
    first_half_usage=('이용건수', lambda x: x[station_monthly.loc[x.index, 'month'] <= 6].sum()),
    second_half_usage=('이용건수', lambda x: x[station_monthly.loc[x.index, 'month'] > 6].sum())
).reset_index()

# 성장 트렌드 비율 계산 (하반기/상반기)
station_features['growth_rate'] = (
    station_features['second_half_usage'] / (station_features['first_half_usage'] + 1)
)

# 5. 2025년 예상 이용건수 예측 모델 학습
# 피처(X) 및 타겟(y) 구성
X = station_features[['total_usage_2024', 'avg_distance', 'avg_duration', 'growth_rate']]
# 2025년 타겟 가상 트렌드 (실제로는 연도별 데이터가 있으면 2023->2024 학습)
# 성장률과 2024년 총 이용량을 기반으로 타겟 설정
y = station_features['total_usage_2024'] * (1 + (station_features['growth_rate'] - 1) * 0.5)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 6. 2025년 이용건수 추론 (Predict)
station_features['predicted_usage_2025'] = model.predict(X)

# 7. Top 10 대여소 추출 및 포맷팅
top10_2025 = (
    station_features.sort_values(by='predicted_usage_2025', ascending=False)
    .head(10)
    .copy()
)

# 프론트엔드 BarChartCard 포맷에 맞게 변환
top10_result = []
for _, row in top10_2025.iterrows():
    top10_result.append({
        "stationName": str(row['대여소명']), # xKey에 지정할 대여소명
        "predictedUsage": int(np.round(row['predicted_usage_2025'])) # yKey에 지정할 예측 이용건수
    })

# 8. 결과를 파일로 저장
joblib.dump(top10_result, 'models/top_stations_2025.pkl')
print("2025년 인기대여소 Top 10 예측 및 저장 완료!")
print(top10_result)