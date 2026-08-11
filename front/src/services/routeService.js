import api from "../api/axios";
import { ROUTES_MOCK } from "../constants/mockData";

// 향후 FastAPI: GET /api/routes
async function getRoutes() {
  try {
    const { data } = await api.get("/routes");
    return data;
  } catch {
    return ROUTES_MOCK;
  }
}

// 향후 FastAPI: GET /api/routes/{id}
async function getRouteDetail(id) {
  try {
    const { data } = await api.get(`/routes/${id}`);
    return data;
  } catch {
    return ROUTES_MOCK.find((r) => r.id === id) || ROUTES_MOCK[0];
  }
}

// 향후 FastAPI: GET /api/routes?type=personal — 개인 자전거 루트만 (따릉이 제외)
async function getPersonalRoutes() {
  try {
    const { data } = await api.get("/routes", { params: { type: "personal" } });
    return data;
  } catch {
    return ROUTES_MOCK.filter((r) => r.bikeType !== "따릉이");
  }
}

const routeService = { getRoutes, getRouteDetail, getPersonalRoutes };
export default routeService;
