import { createContext, useContext, useState, useCallback, useEffect } from "react";
import authService from "../services/authService";
import { axiosGet } from "../api/axios.js"

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가 (초기화 방지용)

  const applySession = useCallback(({ accessToken, user: nextUser }) => {

    localStorage.setItem("pedalup_access_token", accessToken);
    console.log(nextUser);

    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  // [새로고침 대응] 앱 구동 시 토큰으로 유저 정보 복구하는 로직
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("pedalup_access_token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 백엔드의 내 정보 조회 API 호출 (인터셉터가 헤더에 토큰을 알아서 실어 보냅니다)
        const response = await axiosGet("/member/me");
        setUser(response.user); // 유저 정보 복구 ({ email, nickname, role })
        setIsAuthenticated(true);
      } catch (error) {
        console.error("세션 복구 실패:", error);
        // 토큰이 만료되었거나 에러가 나면 청소
        localStorage.removeItem("pedalup_access_token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (credentials) => {
      try {
        const session = await authService.login(credentials);
        applySession(session);
        return session
      } catch (error) {
        throw error
      }
    },
    [applySession]
  );

  const signup = useCallback(
    async (payload) => {
      const session = await authService.signup(payload);
      applySession(session);
      return session;
    },
    [applySession]
  );

  const loginWithGoogle = useCallback(async () => {
    const session = await authService.loginWithGoogle();
    applySession(session);
    return session;
  }, [applySession]);

  const loginWithKakao = useCallback(async () => {
    const session = await authService.loginWithKakao();
    applySession(session);
    return session;
  }, [applySession]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  if (isLoading) {
    return <div>로딩 중...</div>; // 디자인에 맞게 스피너 등으로 대체 가능
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, signup, loginWithGoogle, loginWithKakao, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
