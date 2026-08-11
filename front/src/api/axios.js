import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 10000,
});

// 향후 FastAPI JWT 인증 연동 지점 — localStorage에 저장된 accessToken을 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pedalup_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
