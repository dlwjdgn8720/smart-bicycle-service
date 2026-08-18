import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import Chatbot from "./components/chatbot/Chatbot";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import BikeLayout from "./layouts/BikeLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import RidingStart from "./pages/riding/RidingStart";
import PersonalBikeHome from "./pages/riding/PersonalBikeHome";
import RouteDetail from "./pages/riding/RouteDetail";
import PublicBikeHome from "./pages/publicBike/PublicBikeHome";
import StationStatus from "./pages/publicBike/StationStatus";
import AIAnalysis from "./pages/publicBike/AIAnalysis";
import DemandForecast from "./pages/publicBike/DemandForecast";
import Dashboard from "./pages/dashboard/Dashboard";

import { ROUTES } from "./constants/routes";

export default function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path={ROUTES.HOME} element={<Home />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.SIGNUP} element={<Signup />} />
            </Route>

            {/* <Route element={<ProtectedRoute />}> */}
            <Route path={ROUTES.RIDING_START} element={<RidingStart />} />
            <Route path={ROUTES.PERSONAL_ROUTES} element={<PersonalBikeHome />} />
            <Route path={ROUTES.ROUTE_DETAIL} element={<RouteDetail />} />

            <Route element={<BikeLayout />}>
              <Route path={ROUTES.BIKE_SEOUL} element={<PublicBikeHome />} />
              <Route path={ROUTES.BIKE_STATIONS} element={<StationStatus />} />
              <Route path={ROUTES.BIKE_ANALYSIS} element={<AIAnalysis />} />
              <Route path={ROUTES.BIKE_FORECAST} element={<DemandForecast />} />
            </Route>

            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            </Route>
            {/* </Route> */}
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </ChatbotProvider>
    </AuthProvider>
  );
}
