import api from "../api/axios";
import { axiosPost } from "../api/axios.js";

const MOCK_USER = {
  id: "mock-user-1",
  nickname: "김민준",
  handle: "@minzun_rides",
  email: "minjun@example.com",
};

// 향후 FastAPI: POST /api/auth/login
async function login(form) {
  try {
    console.log("form:::", form);
    const data = await axiosPost("/member/login", form);
    return {
      accessToken: data.accessToken,
      isLogin: data.isLogin,
      user: {
        nickname: data.nickname,
      },
    };
  } catch {
    //return { accessToken: "mock-access-token", user: MOCK_USER };
  }
}

// 향후 FastAPI: POST /api/auth/signup
async function signup(payload) {
  try {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  } catch {
    return {
      accessToken: "mock-access-token",
      user: { ...MOCK_USER, nickname: payload.nickname || MOCK_USER.nickname },
    };
  }
}

// 향후 FastAPI OAuth 연동 지점 — 현재는 UI 전용
async function loginWithGoogle() {
  return login({ email: "google-user@example.com", password: "oauth" });
}

async function loginWithKakao() {
  return login({ email: "kakao-user@example.com", password: "oauth" });
}

function logout() {
  localStorage.removeItem("pedalup_access_token");
}

const authService = { login, signup, loginWithGoogle, loginWithKakao, logout };
export default authService;
