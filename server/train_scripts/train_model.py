import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
# from xgboost import XGBRegressor # XGBoost 사용 시 대체 가능

# 1. 전달받은 2024년 월별 데이터 생성
data = {
    '대여일자': [202401, 202402, 202403, 202404, 202405, 202406, 202407, 202408, 202409, 202410, 202411, 202412],
    '이용건수': [1983097, 2031459, 3151034, 4599767, 4788873, 4857815, 3723042, 3998034, 4250588, 4686560, 3498968, 2277772],
    '이동거리(M)': [42200.77, 45915.67, 72895.10, 113545.97, 116053.49, 113672.54, 80308.73, 82824.24, 99225.23, 104361.53, 72753.00, 45856.08],
    '이용시간(분)': [3597.40, 417.77, 639.79, 969.67, 986.86, 971.39, 713.81, 777.90, 872.49, 938.69, 671.61, 436.41],
    '운동량': [1134.70, 1228.75, 1936.90, 3000.68, 3073.31, 3019.84, 2141.89, 2206.97, 2624.57, 2762.65, 1939.82, 1233.77]
}

df = pd.DataFrame(data)

# 2. 피처 엔지니어링: 월(Month) 추출 및 주기적 특성(Sin/Cos) 반영
df['month'] = df['대여일자'] % 100

# 12개월의 순환 주기성을 모델에 전달하기 위한 Sin/Cos 변환
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

# 3. Feature(X)와 Target(y) 설정
X = df[['month_sin', 'month_cos', '이동거리(M)', '이용시간(분)']]
y = df['이용건수']

# 4. 모델 학습 (월별 예측에는 Random Forest 또는 XGBoost 사용)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 5. 모델 및 2024년 평균 피처값 저장 (2025년 예측 시 참조용)
model_data = {
    'model': model,
    'avg_features': {
        'distance': df.groupby('month')['이동거리(M)'].mean().to_dict(),
        'time': df.groupby('month')['이용시간(분)'].mean().to_dict()
    },
    'raw_2024': df[['month', '이용건수']].to_dict(orient='records')
}

joblib.dump(model_data, 'models/bike_model.pkl')
print("모델 학습 및 bike_model.pkl 저장 완료!")