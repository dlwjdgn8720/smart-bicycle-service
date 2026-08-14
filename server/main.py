from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import engine, Base
from routes.member import member_router
import numpy as np
import pandas as pd
import joblib
import os

# DB의 테이블 확인 및 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 미들웨어 추가
origins = os.getenv(
    "FRONT_ORIGINS",
    "http://localhost:5173"
    )

# React CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(member_router, prefix="/api/member") #/api/member

# 서버 스타트업 시 모델 로드
saved_assets = joblib.load('models/bike_model.pkl')
model = saved_assets['model']
avg_features = saved_assets['avg_features']
raw_2024 = saved_assets['raw_2024']

@app.get("/api/bike-trends")
def get_bike_trends():
    result = []
    
    # 1. 2024년 실제 데이터 포맷팅
    # for item in raw_2024:
    #     result.append({
    #         "month": f"24년 {int(item['month'])}월",
    #         "usage": int(item['이용건수']),
    #         "isPredicted": False
    #     })
        
    # 2. 2025년 1월 ~ 12월 AI 미래 예측 데이터 생성
    future_months = list(range(1, 13)) # 2025년 1~12월
    
    future_X = []
    for m in future_months:
        sin_val = np.sin(2 * np.pi * m / 12)
        cos_val = np.cos(2 * np.pi * m / 12)
        # 과거 해당 월의 평균 이동거리 및 이용시간 반영 (약간의 트렌드 증가율 +2% 적용)
        dist = avg_features['distance'][m] * 1.02
        time = avg_features['time'][m] * 1.02
        future_X.append([sin_val, cos_val, dist, time])
        
    # 모델 추론
    predictions = model.predict(future_X)
    
    # 3. 2025년 예측값 결과 리스트에 추가
    for m, pred in zip(future_months, predictions):
        result.append({
            "month": f"25년 {m}월(AI)",
            "usage": int(pred),
            "isPredicted": True
        })
        
    return {"data": result}

# 스타트업 시 Top 10 예측 데이터 로드
top_stations_data = joblib.load('models/top_stations_2025.pkl')

@app.get("/api/top-stations")
def get_top_stations():
    """
    2025년 인기대여소 Top 10 예측 데이터 반환 API
    """
    return {"data": top_stations_data}