import { useEffect, useState } from "react";
import { Zap, Sparkles } from "lucide-react";
import FeaturedRouteCard from "../../components/cards/FeaturedRouteCard";
import RouteCard from "../../components/cards/RouteCard";
import Loading from "../../components/common/Loading";
import publicBikeService from "../../services/publicBikeService";

const USAGE_INFO = [
  "1시간 기준 1,000원",
  "4시간 이내 추가요금 없음",
  "반납 후 재대여 가능",
  "앱에서 실시간 대여소 확인",
];

export default function PublicBikeHome() {
  const [routes, setRoutes] = useState(null);

  useEffect(() => {
    publicBikeService.getBikeRoutes().then(setRoutes);
  }, []);

  if (!routes) return <Loading />;

  const [featured, ...rest] = routes;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-5 py-4 text-sm text-gray-400">
        <span className="flex items-center gap-2 font-semibold text-white">
          <Zap className="h-4 w-4 text-bike" />
          따릉이 이용 안내
        </span>
        {USAGE_INFO.map((info) => (
          <span key={info} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            {info}
          </span>
        ))}
      </div>

      {featured && (
        <div className="mb-10">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-bike">
            <Sparkles className="h-4 w-4" />
            AI 추천 · 지금 이 시간 최적 루트
          </p>
          <FeaturedRouteCard route={featured} />
        </div>
      )}

      <p className="mb-4 text-sm font-semibold text-gray-400">전체 따릉이 루트 ({routes.length})</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
