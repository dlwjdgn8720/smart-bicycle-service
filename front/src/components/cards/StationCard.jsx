import Badge from "../common/Badge";

const STATUS_MAP = {
  GOOD: { label: "충분", badge: "neon", bar: "bg-neon" },
  LOW: { label: "부족", badge: "orange", bar: "bg-warn" },
  EMPTY: { label: "없음", badge: "red", bar: "bg-danger" },
};

export default function StationCard({ station }) {
  const status = STATUS_MAP[station.status];
  const ratio = station.total ? Math.min(100, (station.available / station.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <Badge variant={status.badge}>{status.label}</Badge>
        <span className="text-xs text-gray-500">{station.distance}</span>
      </div>
      <p className="text-3xl font-extrabold text-white">
        {station.available}
        <span className="text-base font-semibold text-gray-500">/{station.total}</span>
      </p>
      <p className="mt-1 mb-4 text-sm text-gray-400">{station.name}</p>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${status.bar}`} style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
