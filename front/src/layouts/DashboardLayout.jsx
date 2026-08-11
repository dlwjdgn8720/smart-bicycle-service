import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/layout/DashboardHeader";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
