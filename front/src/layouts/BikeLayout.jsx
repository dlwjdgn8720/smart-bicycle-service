import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import StatCard from "../components/cards/StatCard";
import publicBikeService from "../services/publicBikeService";
import { ROUTES } from "../constants/routes";
import { axiosGet } from "../api/axios";

const TABS = [
  { label: "따릉이 루트", to: ROUTES.BIKE_SEOUL, end: true },
  { label: "대여소 현황", to: ROUTES.BIKE_STATIONS },
  { label: "AI 분석", to: ROUTES.BIKE_ANALYSIS },
  { label: "AI 수요예측", to: ROUTES.BIKE_FORECAST },
];

const STAT_ICONS = ["Bike", "MapPin", "Activity", "Clock"];

export default function BikeLayout() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const summaryStations = async () => {
      try {
        const response = await axiosGet("/bike/summary")

        console.log(response);


        // 백엔드 객체 응답 데이터를 StatCard 배열 구조로 매핑
        const formattedStats = [
          {
            label: "오늘 총 이용",
            value: response.estimatedTodayTotal?.toLocaleString() || "0",
            unit: "건",
            trend: "+8.4%",
          },
          {
            label: "운영 대여소",
            value: response.operatingStations?.toLocaleString() || "0",
            unit: "개소",
            trend: "+2.1%",
          },
          {
            label: "현재 이용 중",
            value: response.currentlyActive?.toLocaleString() || "0",
            unit: "대",
            trend: "+12.3%",
          },
          {
            label: "평균 이용 시간",
            value: String(response.avgUseTime || 0),
            unit: "분",
            trend: "-1.8%",
          },
        ];

        setStats(formattedStats);
      } catch (error) {
        console.error("Bike Layout API 요청 실패:", error);
      }
    };
    summaryStations()
    //publicBikeService.getSummary().then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white">
      <PublicHeader
        backTo={ROUTES.RIDING_START}
        backLabel="자전거 선택"
        centerLabel={
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-bike" />
            따릉이
          </span>
        }
      />

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-bike/30 bg-bike/10 px-3 py-1 text-xs font-semibold text-bike">
            <span className="h-1.5 w-1.5 rounded-full bg-bike" />
            실시간 · 서울시 공공자전거
          </span>
          <span className="text-xs text-white-700">
            업데이트: {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            따릉이로
            <br />
            <span className="text-bike">서울을 달리세요</span>
          </h1>
          <p className="max-w-xs text-sm text-gray-400">
            서울 시내 단거리 루트와 실시간 대여소 현황, AI 이용 분석 데이터를 한 곳에서 확인하세요.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(stats || []).map((stat, idx) => (
            <StatCard key={stat.label} icon={STAT_ICONS[idx]} {...stat} />
          ))}
        </div>

        <nav className="flex gap-2 border-b border-border">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${isActive ? "border-bike text-bike" : "border-transparent text-gray-500 hover:text-gray-300"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </div>
    </div>
  );
}
