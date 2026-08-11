import { Loader2 } from "lucide-react";

export default function Loading({ label = "불러오는 중..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin text-neon" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
