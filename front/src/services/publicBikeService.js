import api from "../api/axios";
import {
  BIKE_HERO_STATS,
  STATIONS_MOCK,
  HOURLY_USAGE,
  MONTHLY_USAGE,
  TOP_STATIONS,
  AGE_DISTRIBUTION,
  AI_INSIGHTS,
  ROUTES_MOCK,
  FORECAST_STATIONS,
} from "../constants/mockData";

// 향후 FastAPI: GET /api/bike/seoul/summary
async function getSummary() {
  try {
    const { data } = await api.get("/bike/seoul/summary");
    return data;
  } catch {
    return BIKE_HERO_STATS;
  }
}

// 향후 FastAPI: GET /api/bike/seoul/routes
async function getBikeRoutes() {
  try {
    const { data } = await api.get("/bike/seoul/routes");
    return data;
  } catch {
    return ROUTES_MOCK.filter((r) => r.bikeType === "따릉이");
  }
}

// 향후 FastAPI: GET /api/bike/seoul/stations
async function getStations() {
  try {
    const { data } = await api.get("/bike/seoul/stations");
    return data;
  } catch {
    return { stations: STATIONS_MOCK, hourlyUsage: HOURLY_USAGE };
  }
}

// 향후 FastAPI: GET /api/ai/bike/analysis
async function getAnalysis() {
  try {
    const { data } = await api.get("/ai/bike/analysis");
    return data;
  } catch {
    return {
      monthlyUsage: MONTHLY_USAGE,
      topStations: TOP_STATIONS,
      ageDistribution: AGE_DISTRIBUTION,
      insights: AI_INSIGHTS,
    };
  }
}

// FastAPI ML 예측 엔드포인트 (아직 백엔드 미구현 — UI/Request 스키마만 준비된 상태).
// day_of_week/month/is_weekend은 date에서 서버 측 preprocessing으로 파생하도록 하고
// 여기서는 보내지 않는다(학습·추론 preprocessing 일치를 위해 파생 로직을 한 곳에만 둠).
// 백엔드 연동 전까지는 입력값 기반 임시 예측치(mockForecast)를 대신 반환한다.
async function getForecast({
  stationId,
  date,
  hour,
  isHoliday,
  temperature,
  humidity,
  rainfall,
  windSpeed,
  recentHourlyRentals,
  prevDaySameHourRentals,
  rolling7dSameHourAvg,
}) {
  try {
    const { data } = await api.post("/ai/bike/forecast", {
      station_id: stationId,
      date,
      hour,
      is_holiday: isHoliday ? 1 : 0,
      temperature,
      humidity,
      rainfall,
      wind_speed: windSpeed,
      recent_1h_rental_count: recentHourlyRentals,
      prev_day_same_hour_rental_count: prevDaySameHourRentals,
      rolling_7d_same_hour_avg: rolling7dSameHourAvg,
    });
    return data;
  } catch {
    return mockForecast({
      stationId,
      isHoliday,
      temperature,
      rainfall,
      windSpeed,
      recentHourlyRentals,
      prevDaySameHourRentals,
      rolling7dSameHourAvg,
    });
  }
}

// 실제 ML 모델이 붙기 전까지 대여소 정원 대비 예상 수요를 간단히 추정하는 임시 로직.
function mockForecast({
  stationId,
  isHoliday,
  temperature,
  rainfall,
  windSpeed,
  recentHourlyRentals,
  prevDaySameHourRentals,
  rolling7dSameHourAvg,
}) {
  const station =
    FORECAST_STATIONS.find((s) => s.id === stationId) ?? FORECAST_STATIONS[0];

  let weatherFactor = 1;
  if (rainfall > 0) weatherFactor *= 0.6;
  if (temperature < 5 || temperature > 33) weatherFactor *= 0.8;
  if (windSpeed > 8) weatherFactor *= 0.9;
  if (isHoliday) weatherFactor *= 1.15;

  const baseDemand =
    recentHourlyRentals * 0.4 +
    prevDaySameHourRentals * 0.3 +
    rolling7dSameHourAvg * 0.3;
  const predicted_demand = Math.max(0, Math.round(baseDemand * weatherFactor));
  const capacityRatio =
    station.rackCount > 0 ? predicted_demand / station.rackCount : 0;

  const demand_level =
    capacityRatio >= 0.8 ? "높음" : capacityRatio >= 0.5 ? "보통" : "낮음";
  const shortage_risk = capacityRatio >= 0.8;
  const message =
    demand_level === "높음"
      ? "해당 시간대 수요가 매우 높습니다. 인근 대여소 재배치를 권장합니다."
      : demand_level === "보통"
        ? "해당 시간대 수요가 보통 수준입니다. 현재 대여소 운영을 유지해도 좋습니다."
        : "해당 시간대 수요가 낮습니다. 자전거 재배치가 필요하지 않습니다.";

  return { predicted_demand, demand_level, shortage_risk, message };
}

const publicBikeService = {
  getSummary,
  getBikeRoutes,
  getStations,
  getAnalysis,
  getForecast,
};
export default publicBikeService;
