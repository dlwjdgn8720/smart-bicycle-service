import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
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

export const axiosGet = async (path) => {
  // const url = `http://172.30.1.81:9000${path}`; //params
  const res = await api.get(path);
  return res.data;
};

export const axiosPost = async (path, data) => {
  // const url = `http://172.30.1.81:9000${path}`;
  const res = await api.post(path, data);
  return res.data;
};

export const axiosPut = async (path, data) => {
  // const url = `http://172.30.1.81:9000${path}`;
  const res = await api.put(path, data);
  return res.data;
};

export const axiosDelete = async (path, data) => {
  // const url = `http://172.30.1.81:9000${path}`;

  //get, delete -> config 객체에 담아서 전송
  //✨data 속성으로 전달 시 body로 전송
  const res = await api.delete(path, { data: data });
  return res.data;
};

export default api;
