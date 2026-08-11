import { Smartphone, SlidersHorizontal, Navigation, Zap } from "lucide-react";
import SectionTitle from "../common/SectionTitle";

const STEPS = [
  {
    number: "01",
    icon: Smartphone,
    title: "앱 설치 & 회원가입",
    description: "iOS · Android 앱을 무료로 설치하고, 30초 만에 회원가입을 완료하세요.",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "내 실력과 스타일 설정",
    description: "라이딩 유형, 실력 수준, 선호 거리를 설정하면 AI가 맞춤 루트를 추천합니다.",
  },
  {
    number: "03",
    icon: Navigation,
    title: "루트 선택 & 내비게이션",
    description: "추천 루트를 저장하고, 실시간 내비게이션으로 안전하게 라이딩을 시작하세요.",
  },
  {
    number: "04",
    icon: Zap,
    title: "기록 & 공유",
    description: "GPS 데이터가 자동 저장됩니다. 완주 후 커뮤니티에 인증하고 뱃지를 받으세요.",
  },
];

export default function StartGuideSection() {
  return (
    <section className="px-6 py-20 lg:px-16">
      <SectionTitle
        eyebrow="시작 가이드"
        title={
          <>
            처음이어도 괜찮아요
            <br />
            <span className="text-neon">4단계로 시작하세요</span>
          </>
        }
        align="center"
        className="mx-auto mb-14"
      />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number}>
            <p className="mb-4 text-3xl font-extrabold text-neon">{step.number}</p>
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-card text-gray-400">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
