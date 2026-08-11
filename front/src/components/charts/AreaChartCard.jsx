import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AreaChartCard({
  data,
  xKey,
  yKey,
  color = "#38BDF8",
  height = 280,
  yTickFormatter,
  title,
  subtitle,
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <p className="mb-1 text-sm font-semibold text-white">{title}</p>}
      {subtitle && <p className="mb-4 text-xs text-gray-500">{subtitle}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#242424" />
          <XAxis dataKey={xKey} stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yTickFormatter}
            width={48}
          />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid #242424", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e5e7eb" }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${color.replace("#", "")})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
