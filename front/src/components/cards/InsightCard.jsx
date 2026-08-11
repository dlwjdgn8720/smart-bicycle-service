import * as Icons from "lucide-react";
import Badge from "../common/Badge";

const TONE_COLOR = {
  up: "text-neon",
  down: "text-danger",
  neutral: "text-bike",
};

export default function InsightCard({ tag, icon, title, description, metricLabel, metricValue, tone = "neutral" }) {
  const Icon = Icons[icon] || Icons.Sparkles;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="cyan">{tag}</Badge>
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <h3 className="mb-2 text-base font-bold leading-snug text-white">{title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-gray-500">{description}</p>
      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-gray-500">{metricLabel}</span>
        <span className={`text-lg font-extrabold ${TONE_COLOR[tone]}`}>{metricValue}</span>
      </div>
    </div>
  );
}
