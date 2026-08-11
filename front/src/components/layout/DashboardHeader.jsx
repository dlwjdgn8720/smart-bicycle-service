import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const NAV_ITEMS = [
  { label: "대시보드", to: ROUTES.DASHBOARD },
  { label: "루트 탐색", to: ROUTES.RIDING_START },
  { label: "커뮤니티", to: "/community" },
  { label: "장비 마켓", to: "/market" },
];

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo to={ROUTES.DASHBOARD} />
          <nav className="hidden items-center gap-7 text-sm md:flex">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`border-b-2 py-1 ${
                    active ? "border-neon font-semibold text-white" : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative text-gray-400 hover:text-white" aria-label="알림">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-neon" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon text-sm font-bold text-black">
              {user?.nickname?.[0] || "P"}
            </span>
            <span className="hidden text-sm font-medium text-white sm:block">{user?.nickname || "라이더"}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
