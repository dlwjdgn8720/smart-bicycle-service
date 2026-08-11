import { SlidersHorizontal } from "lucide-react";

const REGIONS = ["전체", "서울", "경기", "인천", "강원", "부산", "제주", "전남"];
const TYPES = ["전체", "로드", "MTB", "그래벨", "투어링", "도심"];
const DIFFICULTIES = ["전체", "입문", "중급", "고급", "도전"];

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold ${
        active ? "border border-neon text-neon" : "border border-transparent text-gray-500 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <Chip key={option} label={option} active={value === option} onClick={() => onChange(option)} />
      ))}
    </div>
  );
}

function Divider() {
  return <span className="mx-2 h-4 w-px shrink-0 bg-border" />;
}

export default function RouteFilterBar({
  region,
  onRegionChange,
  type,
  onTypeChange,
  difficulty,
  onDifficultyChange,
  resultCount,
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap border-y border-border py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="flex shrink-0 items-center gap-1.5 pr-3 text-xs font-semibold text-gray-500">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        필터
      </span>
      <ChipGroup options={REGIONS} value={region} onChange={onRegionChange} />
      <Divider />
      <ChipGroup options={TYPES} value={type} onChange={onTypeChange} />
      <Divider />
      <ChipGroup options={DIFFICULTIES} value={difficulty} onChange={onDifficultyChange} />
      <span className="ml-auto shrink-0 pl-3 text-xs text-gray-500">{resultCount}개 루트</span>
    </div>
  );
}
