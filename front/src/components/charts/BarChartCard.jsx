import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export default function BarChartCard({
  data,
  xKey,
  yKey,
  color = "#38BDF8",
  highlightColor,
  layout = "vertical",
  height = 260,
  title,
}) {
  const isHorizontal = layout === "horizontal";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <p className="mb-4 text-sm font-semibold text-white">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#242424" horizontal={!isHorizontal} vertical={isHorizontal} />
          {isHorizontal ? (
            <>
              <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey={xKey}
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
            </>
          )}
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#171717", border: "1px solid #242424", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e5e7eb" }}
          />
          <Bar dataKey={yKey} radius={4} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={index} fill={index === 0 && highlightColor ? highlightColor : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
