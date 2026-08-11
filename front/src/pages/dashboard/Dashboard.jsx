import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Navigation, Flame, Trophy, Target, Users, Star } from "lucide-react";
import Button from "../../components/common/Button";
import StatCard from "../../components/cards/StatCard";
import CommunityCard from "../../components/cards/CommunityCard";
import Badge from "../../components/common/Badge";
import Loading from "../../components/common/Loading";
import dashboardService from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";

const ACTIVITY_TABS = ["전체 현황", "최근 라이딩", "챌린지"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(ACTIVITY_TABS[0]);

  useEffect(() => {
    dashboardService.getDashboard().then(setData);
  }, []);

  if (!data) return <Loading />;

  const displayName = user?.nickname || data.user.name;

  const activityStats = [
    { icon: Trophy, label: "획득 뱃지", value: data.activity.badges, tone: "text-warn" },
    { icon: Target, label: "달성 챌린지", value: data.activity.challenges, tone: "text-neon" },
    { icon: Users, label: "팔로잉 라이더", value: data.activity.followers, tone: "text-bike" },
    { icon: Star, label: "저장 루트", value: data.activity.savedRoutes, tone: "text-warn" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border-l-4 border-neon bg-card p-8">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neon">로그인 성공</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            다시 오셨군요,
            <br />
            <span className="text-neon">{displayName}님!</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Badge variant="neon">{data.user.level}</Badge>
            <span>{user?.handle || data.user.handle}</span>
            <span>· 가입 {data.user.joinedDays}일째</span>
          </div>
        </div>
        <div className="text-center">
          <Button as={Link} to={ROUTES.BIKE_SEOUL} size="lg">
            <Navigation className="h-4 w-4" />
            라이딩 시작하기
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-warn">
            <Flame className="h-3.5 w-3.5" />
            {data.user.streak}일 연속 라이딩 중!
          </p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.totals.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="mb-4 text-sm font-semibold text-neon">오늘의 AI 추천 루트</p>
          <Link
            to={ROUTES.routeDetail(data.recommendedRoute.id)}
            className="mb-8 block overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative h-52">
              <img src={data.recommendedRoute.image} alt={data.recommendedRoute.name} className="h-full w-full object-cover" />
              <Badge variant="cyan" className="absolute left-4 top-4">
                AI 추천
              </Badge>
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <h3 className="text-lg font-bold text-white">{data.recommendedRoute.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {data.recommendedRoute.distance} · {data.recommendedRoute.duration}
                </p>
              </div>
              <Button size="sm">출발</Button>
            </div>
          </Link>

          <div className="mb-4 flex gap-2 border-b border-border">
            {ACTIVITY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${
                  activeTab === tab ? "border-neon text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {activityStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <stat.icon className={`mb-2 h-4 w-4 ${stat.tone}`} />
                <p className="text-xl font-extrabold text-white">{stat.value}개</p>
                <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">빠른 메뉴</p>
            <div className="grid grid-cols-2 gap-3">
              {data.quickMenu.map((menu) => {
                const Icon = Icons[menu.icon];
                return (
                  <Link
                    key={menu.label}
                    to={menu.path}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-5 text-center hover:border-white/20"
                  >
                    <Icon className="h-5 w-5 text-neon" />
                    <span className="text-xs font-semibold text-gray-300">{menu.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-2 text-sm font-semibold text-white">커뮤니티 소식</p>
            <div className="divide-y divide-border">
              {data.communityFeed.map((feed, idx) => (
                <CommunityCard key={idx} feed={feed} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
