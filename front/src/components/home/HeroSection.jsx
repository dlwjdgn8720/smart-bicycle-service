import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import Button from "../common/Button";
import { HOME_STATS } from "../../constants/mockData";
import { ROUTES } from "../../constants/routes";

export default function HeroSection() {
  return (
    <section className="grid gap-10 px-6 pb-16 pt-14 lg:grid-cols-2 lg:items-center lg:px-16">
      <div>
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-gray-300">
          <span className="h-1.5 w-1.5 rounded-full bg-neon" />
          자전거 플랫폼 No.1
        </span>
        <h1 className="text-5xl font-extrabold leading-[1.1] sm:text-6xl">
          더 멀리,
          <br />
          <span className="text-neon">더 빠르게</span>
        </h1>
        <p className="mt-6 max-w-md text-base text-gray-400">
          전국 5만 명의 라이더와 함께 새로운 루트를 발견하고, 더 나은 라이딩을 경험하세요.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button as={Link} to={ROUTES.RIDING_START} size="lg">
            라이딩 시작하기
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as={Link} to={ROUTES.RIDING_START} variant="outline" size="lg">
            <Compass className="h-4 w-4" />
            루트 탐색
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-8">
          {HOME_STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-neon">
                {stat.value}
                {stat.suffix && <span className="ml-1">{stat.suffix}</span>}
              </p>
              <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-72 overflow-hidden rounded-2xl lg:h-[420px]">
        <img
          src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=75"
          alt="라이딩 중인 자전거"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
