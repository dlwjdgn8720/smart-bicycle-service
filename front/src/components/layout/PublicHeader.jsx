import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";

const NAV_ITEMS = [
  { label: "라이딩 시작", to: ROUTES.RIDING_START },
  { label: "커뮤니티", to: "/community" },
  { label: "장비마켓", to: "/market" },
  { label: "이벤트", to: "/events" },
];

export default function PublicHeader({ backTo, backLabel, centerLabel, showNav = false, showAuthActions = true }) {
  const navigate = useNavigate();

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
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} to={item.to} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {showAuthActions ? (
          <div className="flex items-center gap-4">
            <Link to={ROUTES.LOGIN} className="hidden text-sm text-gray-300 hover:text-white sm:block">
              로그인
            </Link>
            <Button as={Link} to={ROUTES.SIGNUP} size="sm">
              무료 가입
            </Button>
          </div>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </header>
  );
}
