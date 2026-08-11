import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Navigation, Zap, Users, Sparkles } from "lucide-react";
import PublicHeader from "../../components/layout/PublicHeader";
import Badge from "../../components/common/Badge";
import { ROUTES } from "../../constants/routes";

const OPTIONS = [
  {
    id: "personal",
    icon: Navigation,
    iconTone: "bg-neon/10 text-neon",
    label: "PERSONAL BIKE",
    title: "개인 자전거",
    description: "내 자전거로 전국 12,800개 루트를 탐색하세요. AI가 실력과 지형에 맞는 코스를 추천합니다.",
    features: [
      { icon: MapPin, text: "전국 12,800개 검증 루트" },
      { icon: Navigation, text: "GPS 실시간 내비게이션" },
      { icon: Zap, text: "라이딩 기록 자동 저장" },
    ],
    to: ROUTES.PERSONAL_ROUTES,
  },
  {
    id: "public",
    icon: Users,
    iconTone: "bg-bike/10 text-bike",
    badge: "AI 분석",
    label: "SEOUL PUBLIC BIKE",
    title: "따릉이",
    description: "서울 2,692개 대여소 실시간 현황을 확인하고, AI 수요 분석으로 빈 자전거를 스마트하게 찾으세요.",
    features: [
      { icon: MapPin, text: "실시간 대여소 현황·잔여 대수" },
      { icon: Sparkles, text: "AI 수요 예측 & 혼잡도 분석" },
      { icon: Users, text: "이용 패턴 · 인기 구간 인사이트" },
    ],
    to: ROUTES.BIKE_SEOUL,
  },
];

export default function RidingStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-white">
      <PublicHeader centerLabel="라이딩 시작하기" showAuthActions={false} />

      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="mb-4 text-sm font-bold uppercase tracking-wide text-neon">자전거 선택</p>
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          어떤 자전거로
          <br />
          <span className="text-neon">달리실 건가요?</span>
        </h1>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => navigate(option.to)}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 text-left transition-colors hover:border-white/20"
              >
                <div className="mb-8 flex items-start justify-between">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${option.iconTone}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex items-center gap-2">
                    {option.badge && <Badge variant="cyan">{option.badge}</Badge>}
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-400 group-hover:border-white/30 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{option.label}</p>
                <h2 className="mb-3 text-2xl font-extrabold text-white">{option.title}</h2>
                <p className="mb-6 text-sm leading-relaxed text-gray-400">{option.description}</p>

                <ul className="mt-auto space-y-2.5">
                  {option.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm text-gray-300">
                      <feature.icon className="h-4 w-4 text-gray-500" />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-gray-500">언제든지 다른 유형으로 전환할 수 있습니다</p>
      </div>
    </div>
  );
}
