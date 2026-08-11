export default function QuickQuestion({ label, onSelect }) {
  return (
    <button
      onClick={() => onSelect(label)}
      className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-gray-300 hover:border-neon hover:text-neon"
    >
      {label}
    </button>
  );
}
