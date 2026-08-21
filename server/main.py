import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from database.connection import Base, engine
# 분리된 라우터들 임포트
from routes.member import member_router
from routes.bike_ai import router as bike_ai_router
from routes.bike_station import router as bike_station_router
from core.ml_loader import load_all_models

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 기동 시 모든 ML 모델 및 데이터 즉시 로드
    load_all_models()
    yield

app = FastAPI(lifespan=lifespan)

# CORS 설정
origins = os.getenv("FRONT_ORIGINS", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 분리된 라우터 등록
# 라우터 내부에서 prefix를 지정해두었으므로 include 시 그대로 등록됩니다. (또는 여기서 prefix를 주어도 됩니다)
app.include_router(member_router, prefix="/api/member")
app.include_router(bike_ai_router)
app.include_router(bike_station_router)

# 글로벌 예외 핸들러
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("❌ [422 Validation Error] 요청 데이터 검증 실패:")
    print(exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )