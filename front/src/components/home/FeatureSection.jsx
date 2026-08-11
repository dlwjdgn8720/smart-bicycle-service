import SectionTitle from "../common/SectionTitle";
import FeatureCard from "../cards/FeatureCard";
import { FEATURES } from "../../constants/mockData";

export default function FeatureSection() {
  return (
    <section className="px-6 py-20 lg:px-16">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionTitle
          eyebrow="플랫폼 기능"
          title={
            <>
              라이딩을 더 스마트하게,
              <br />
              더 즐겁게
            </>
          }
        />
        <p className="max-w-xs text-sm text-gray-500">
          최신 기술과 커뮤니티의 힘으로 당신의 라이딩 경험을 한 단계 끌어올립니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
