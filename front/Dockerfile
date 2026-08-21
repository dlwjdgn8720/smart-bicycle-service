# ---------------------------------------------
# 1단계: 빌드 스테이지 (Node.js 환경)
# ---------------------------------------------
FROM node:20-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 파일 복사 (package.json, package-lock.json)
COPY package*.json ./

# 의존성 패키지 설치
RUN npm install

# 소스 코드 전체 복사
COPY . .

# 프론트엔드 빌드 (Vite는 기본적으로 dist 폴더에 빌드 결과물을 생성합니다)
RUN npm run build

# ---------------------------------------------
# 2단계: 프로덕션 스테이지 (Nginx 환경)
# ---------------------------------------------
FROM nginx:alpine

# 타임존 설정 (옵션)
ENV TZ=Asia/Seoul

# 빌드 스테이지에서 생성된 정적 파일들을 Nginx의 웹 루트 폴더로 복사
# ⚠️ 주의: React(CRA)를 사용하신다면 /app/dist 대신 /app/build 로 변경하세요.
COPY --from=build /app/dist /usr/share/nginx/html

# 빌드된 결과물을 Nginx로 복사하는 부분 근처에 아래 줄을 추가합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트 노출
EXPOSE 80

# Nginx 서버 실행
CMD ["nginx", "-g", "daemon off;"]

