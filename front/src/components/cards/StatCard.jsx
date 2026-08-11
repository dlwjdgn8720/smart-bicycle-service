import * as Icons from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ icon, label, value, unit, trend, valueClassName = "" }) {
  const Icon = icon ? Icons[icon] : null;
  const isDown = typeof trend === "string" && trend.trim().startsWith("-");

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        {Icon && <Icon className="h-4 w-4 text-gray-500" />}
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isDown ? "text-danger" : "text-neon"
            }`}
          >
            {isDown ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className={`text-3xl font-extrabold text-white ${valueClassName}`}>
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-gray-400">{unit}</span>}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
