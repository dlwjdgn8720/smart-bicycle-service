#!/bin/bash
set -e

# 1. DB 컨테이너 연결 대기 (Python 스크립트로 DB 헬스체크)
echo "🔄 Waiting for Database connection..."
python -c "
import time
import sys
from database.connection import engine

max_retries = 30
for i in range(max_retries):
    try:
        connection = engine.connect()
        connection.close()
        print('✅ Database connection successful!')
        sys.exit(0)
    except Exception as e:
        print(f'⏳ Waiting for DB... ({i+1}/{max_retries})')
        time.sleep(2)
sys.exit(1)
"

# 2. DB 마이그레이션 (Alembic을 사용하는 경우 주석 해제)
# echo "🔄 Running DB Migrations..."
# alembic upgrade head

# 3. FastAPI 서버 실행 (환경변수 WORKERS 지정 가능, 기본값 4)
WORKERS=${WORKERS:-4}
PORT=${PORT:-8000}

echo "🚀 Starting FastAPI server on port $PORT with $WORKERS workers..."

# 운영 환경 (Gunicorn + UvicornWorker 조합 권장)
exec gunicorn main:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -

# 단일 Uvicorn만 사용할 경우 아래 명령어로 대체 가능:
# exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers $WORKERS