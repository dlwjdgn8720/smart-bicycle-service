import * as Icons from "lucide-react";
import Badge from "../common/Badge";

export default function FeatureCard({ icon, tag, title, description }) {
  const Icon = Icons[icon] || Icons.Sparkles;
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-white/20">
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-5 w-5 text-neon" />
        </span>
        <Badge variant="gray">{tag}</Badge>
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
