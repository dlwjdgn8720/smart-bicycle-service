import api from "../api/axios";
import { DASHBOARD_STATS, ROUTES_MOCK, QUICK_MENU, COMMUNITY_FEED } from "../constants/mockData";

// 향후 FastAPI: GET /api/dashboard
async function getDashboard() {
  try {
    const { data } = await api.get("/dashboard");
    return data;
  } catch {
    return {
      ...DASHBOARD_STATS,
      recommendedRoute: ROUTES_MOCK[1],
      quickMenu: QUICK_MENU,
      communityFeed: COMMUNITY_FEED,
    };
  }
}

const dashboardService = { getDashboard };
export default dashboardService;
