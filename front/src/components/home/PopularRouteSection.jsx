import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionTitle from "../common/SectionTitle";
import FeaturedRouteCard from "../cards/FeaturedRouteCard";
import { ROUTES_MOCK } from "../../constants/mockData";
import { ROUTES } from "../../constants/routes";

const REGIONS = ["북한산", "한강", "제주"];

export default function PopularRouteSection() {
  const [region, setRegion] = useState(REGIONS[0]);
  const featured = ROUTES_MOCK.find((r) => r.id === "bukhansan-loop");

  return (
    <section className="px-6 py-20 lg:px-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <SectionTitle
          eyebrow="인기 루트"
          title={
            <>
              지금 가장 핫한
              <br />
              라이딩 코스
            </>
          }
        />
        <Link to={ROUTES.RIDING_START} className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white">
          전체 루트 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              region === r ? "bg-neon text-black" : "bg-card text-gray-400 hover:text-white"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <FeaturedRouteCard route={featured} />
    </section>
  );
}
