import { Search, Wind, ThermometerSun } from "lucide-react";
import Button from "../common/Button";

export default function SearchWeatherBar({ value, onChange, onSubmit }) {
  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="flex max-w-xl gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="루트 이름, 지역으로 검색..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
        </div>
        <Button type="submit">
          <Search className="h-4 w-4" />
          검색
        </Button>
      </form>

      <div className="mt-4 inline-flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-2.5 text-xs text-gray-400">
        <span className="font-semibold text-gray-300">오늘의 라이딩 날씨</span>
        <span className="flex items-center gap-1">
          <ThermometerSun className="h-3.5 w-3.5" />
          23°C
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3.5 w-3.5" />
          북서 3m/s
        </span>
        <span className="rounded-md bg-neon/15 px-2 py-0.5 font-bold text-neon">최적</span>
      </div>
    </div>
  );
}
