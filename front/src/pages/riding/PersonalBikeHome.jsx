import { useEffect, useMemo, useState } from "react";
import PublicHeader from "../../components/layout/PublicHeader";
import SearchWeatherBar from "../../components/riding/SearchWeatherBar";
import RouteFilterBar from "../../components/riding/RouteFilterBar";
import FeaturedRouteCard from "../../components/cards/FeaturedRouteCard";
import RouteCard from "../../components/cards/RouteCard";
import StartGuideSection from "../../components/riding/StartGuideSection";
import StartCtaBanner from "../../components/riding/StartCtaBanner";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import routeService from "../../services/routeService";
import { ROUTES } from "../../constants/routes";

export default function PersonalBikeHome() {
  const [routes, setRoutes] = useState(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("전체");
  const [type, setType] = useState("전체");
  const [difficulty, setDifficulty] = useState("전체");

  useEffect(() => {
    routeService.getPersonalRoutes().then(setRoutes);
  }, []);

  const featured = useMemo(() => routes?.find((r) => r.tags?.includes("오늘의 추천")), [routes]);

  const filtered = useMemo(() => {
    if (!routes) return [];
    const keyword = search.trim().toLowerCase();
    return routes
      .filter((r) => r.id !== featured?.id)
      .filter((r) => region === "전체" || r.regionTag === region)
      .filter((r) => type === "전체" || r.bikeType === type)
      .filter((r) => difficulty === "전체" || r.difficulty === difficulty)
      .filter((r) => !keyword || r.name.toLowerCase().includes(keyword) || r.region.toLowerCase().includes(keyword));
  }, [routes, search, region, type, difficulty, featured]);

  if (!routes) return <Loading />;

  return (
    <div className="min-h-screen bg-bg text-white">
      <PublicHeader backTo={ROUTES.HOME} backLabel="홈으로" centerLabel="라이딩 시작하기" />

      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neon">루트 탐색</p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          당신에게 딱 맞는
          <br />
          <span className="text-neon">루트를 찾아보세요</span>
        </h1>
        <p className="mt-4 text-sm text-gray-400">12,800개 이상의 검증된 루트 중에서 지금 바로 라이딩을 시작하세요.</p>

        <SearchWeatherBar value={search} onChange={setSearch} onSubmit={(e) => e.preventDefault()} />

        <div className="mt-8">
          <RouteFilterBar
            region={region}
            onRegionChange={setRegion}
            type={type}
            onTypeChange={setType}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            resultCount={filtered.length}
          />
        </div>

        {featured && (
          <div className="mt-10">
            <p className="mb-4 text-sm font-semibold text-gray-400">오늘의 추천 루트</p>
            <FeaturedRouteCard route={featured} />
          </div>
        )}

        <p className="mb-4 mt-12 text-sm font-semibold text-gray-400">전체 루트 ({filtered.length})</p>
        {filtered.length === 0 ? (
          <EmptyState title="조건에 맞는 루트가 없습니다" description="필터를 조정하거나 다른 키워드로 검색해보세요." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </div>

      <StartGuideSection />
      <StartCtaBanner />
    </div>
  );
}
