import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function LineChartCard({ data, xKey, yKey, color = "#C6FF00", height = 240, title }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <p className="mb-4 text-sm font-semibold text-white">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#242424" />
          <XAxis dataKey={xKey} stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid #242424", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e5e7eb" }}
          />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
