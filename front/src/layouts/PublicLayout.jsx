import { Outlet } from "react-router-dom";
import PublicHeader from "../components/layout/PublicHeader";
import Footer from "../components/layout/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <PublicHeader showNav showAuthActions />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
