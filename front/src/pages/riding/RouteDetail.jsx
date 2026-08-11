import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Map, TrendingUp, Clock, Zap, Navigation as NavIcon, Award, Shield, Battery, Users, ChevronLeft, Bookmark } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import AreaChartCard from "../../components/charts/AreaChartCard";
import Loading from "../../components/common/Loading";
import routeService from "../../services/routeService";
import { ROUTES_MOCK } from "../../constants/mockData";
import { ROUTES } from "../../constants/routes";

const SAFETY_ICONS = [Shield, Battery, Zap, Users];

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);

  useEffect(() => {
    setRoute(null);
    routeService.getRouteDetail(id).then(setRoute);
  }, [id]);

  if (!route) return <Loading />;

  const otherRoutes = ROUTES_MOCK.filter((r) => r.id !== route.id).slice(0, 2);

  const infoItems = [
    { icon: Map, label: "총 거리", value: route.distance },
    { icon: TrendingUp, label: "누적 고도", value: route.elevationGain || "-" },
    { icon: Clock, label: "예상 시간", value: route.duration },
    { icon: Zap, label: "난이도", value: route.difficulty || route.tags?.[0] || "입문" },
    { icon: NavIcon, label: "라이딩 유형", value: route.bikeType || "따릉이" },
    { icon: Star, label: "평점", value: `${route.rating} / 5.0` },
  ];

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="relative h-[420px] w-full overflow-hidden">
        <img src={route.image} alt={route.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/20" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-200 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            루트 목록
          </button>
          <Logo />
          <Button as={Link} to={ROUTES.SIGNUP} size="sm">
            무료 가입
          </Button>
        </div>

        <div className="absolute bottom-8 left-6">
          <div className="mb-3 flex gap-2">
            <Badge variant="orange">{route.difficulty || "입문"}</Badge>
            <Badge variant="gray">{route.bikeType || "따릉이"}</Badge>
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">{route.name}</h1>
          <p className="mt-2 text-sm text-gray-300">{route.region}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          {route.rating && (
            <div className="mb-8 flex items-center gap-2">
              <div className="flex gap-0.5 text-neon">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-neon" />
                ))}
              </div>
              <span className="font-bold text-white">{route.rating}</span>
              {route.reviewCount && <span className="text-sm text-gray-500">({route.reviewCount.toLocaleString()}개 리뷰)</span>}
            </div>
          )}

          <h2 className="mb-3 text-xl font-bold text-white">루트 소개</h2>
          <p className="mb-10 text-sm leading-relaxed text-gray-400">{route.description}</p>

          <h2 className="mb-4 text-xl font-bold text-white">루트 정보</h2>
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                <item.icon className="mb-2 h-4 w-4 text-neon" />
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="mt-0.5 text-base font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {route.elevationProfile && (
            <>
              <h2 className="mb-4 text-xl font-bold text-white">고도 프로파일</h2>
              <div className="mb-10">
                <AreaChartCard data={route.elevationProfile} xKey="km" yKey="elevation" color="#C6FF00" height={220} />
              </div>
            </>
          )}

          {route.safetyTips && (
            <>
              <h2 className="mb-4 text-xl font-bold text-white">라이딩 안전 수칙</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {route.safetyTips.map((tip, idx) => {
                  const Icon = SAFETY_ICONS[idx % SAFETY_ICONS.length];
                  return (
                    <div key={tip} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-gray-300">
                      <Icon className="h-4 w-4 shrink-0 text-neon" />
                      {tip}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-3">
          <Button as={Link} to={ROUTES.BIKE_SEOUL} className="w-full">
            <NavIcon className="h-4 w-4" />
            라이딩 시작하기
          </Button>
          <Button variant="dark" className="w-full">
            <Bookmark className="h-4 w-4" />
            루트 저장하기
          </Button>

          <div className="space-y-3 rounded-xl border border-border bg-card p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">참여한 라이더</span>
              <span className="font-semibold text-white">{(route.participants || 1200).toLocaleString()}명</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">평균 완주율</span>
              <span className="font-semibold text-white">{route.completionRate || 92}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">추천 시즌</span>
              <span className="font-semibold text-white">{route.season || "사계절"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Award className="h-4 w-4 text-neon" />
              서울의 다른 루트
            </p>
            <div className="space-y-3">
              {otherRoutes.map((r) => (
                <Link key={r.id} to={ROUTES.routeDetail(r.id)} className="flex items-center gap-3 hover:opacity-80">
                  <img src={r.image} alt={r.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="text-sm">
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">
                      {r.distance} · {r.difficulty || r.tags?.[0]}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
