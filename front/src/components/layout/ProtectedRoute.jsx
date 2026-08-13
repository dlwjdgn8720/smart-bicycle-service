import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    // 1. 백엔드에서 인증 정보(/api/member/me)를 가져오는 중이라면 대기 화면을 보여줍니다.
    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p>인증 정보를 확인 중입니다...</p>
            </div>
        );
    }

    // 2. 조회가 끝났는데 로그인이 안 되어 있다면 로그인 페이지로 강제 이동시킵니다.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. 로그인된 사용자라면 가려던 페이지를 정상적으로 보여줍니다.
    return <Outlet />;
}
