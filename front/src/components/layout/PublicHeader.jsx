import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext"; // 💡 AuthContext 연결
import { ROUTES } from "../../constants/routes";

const NAV_ITEMS = [
  { label: "라이딩 시작", to: ROUTES.RIDING_START },
  { label: "커뮤니티", to: "/community" },
  { label: "장비마켓", to: "/market" },
  { label: "이벤트", to: "/events" },
];

export default function PublicHeader({
  backTo,
  backLabel,
  centerLabel,
  showNav = false,
  showAuthActions = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth(); // 인증 정보 가져오기

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  const displayName = user?.nickname || user?.name || user?.email?.split("@")[0] || "라이더";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {backLabel}
            </button>
          )}
          <Logo />
        </div>

        {centerLabel && (
          <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-300">
            {centerLabel}
          </div>
        )}

        {showNav && (
          <nav className="hidden items-center gap-8 text-sm text-gray-300 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`transition-colors hover:text-white ${active ? "font-semibold text-white" : ""
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {showAuthActions ? (
          <div className="flex items-center gap-4">
            {/* 로그인 여부에 따른 액션 버튼 분기 */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* 대시보드로 바로가기 */}
                <Link
                  to={ROUTES.DASHBOARD}
                  className="flex items-center gap-1 text-sm text-gray-300 transition-colors hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">대시보드</span>
                </Link>

                {/* 간단 프로필 정보 */}
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neon text-xs font-bold text-black">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-medium text-white md:inline">
                    {displayName}
                  </span>
                </div>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="text-gray-400 transition-colors hover:text-white"
                  aria-label="로그아웃"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* 비로그인 상태일 때 */
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="hidden text-sm text-gray-300 transition-colors hover:text-white sm:block"
                >
                  로그인
                </Link>
                <Button as={Link} to={ROUTES.SIGNUP} size="sm">
                  무료 가입
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </header>
  );
}