const ITEMS = [
  "그래블", "도심 라이딩", "투어링", "트레일링", "크리티컬매스",
  "단체 라이딩", "로드 사이클링", "MTB", "그래블", "도심 라이딩", "투어링", "트레일링",
];

export default function ServiceNavigationTicker() {
  return (
    <div className="overflow-hidden bg-neon py-3">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, idx) => (
          <span key={idx} className="text-sm font-bold uppercase tracking-wide text-black">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
