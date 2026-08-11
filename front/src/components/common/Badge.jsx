const VARIANTS = {
  neon: "bg-neon/15 text-neon border-neon/30",
  cyan: "bg-bike/15 text-bike border-bike/30",
  orange: "bg-warn/15 text-warn border-warn/30",
  red: "bg-danger/15 text-danger border-danger/30",
  gray: "bg-white/5 text-gray-300 border-white/10",
  solidNeon: "bg-neon text-black border-transparent",
  solidCyan: "bg-bike text-black border-transparent",
};

export default function Badge({ variant = "gray", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-wide ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
