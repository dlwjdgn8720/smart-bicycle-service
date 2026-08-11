import { Bike } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`}>
      <Bike className="h-6 w-6 text-neon" strokeWidth={2.5} />
      <span className="text-lg font-extrabold tracking-tight text-white">PEDALUP</span>
    </Link>
  );
}
