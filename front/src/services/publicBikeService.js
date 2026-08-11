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

const publicBikeService = { getSummary, getBikeRoutes, getStations, getAnalysis };
export default publicBikeService;
