import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "데이터가 없습니다", description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
      <Icon className="h-8 w-8 text-gray-500" />
      <p className="text-sm font-semibold text-gray-300">{title}</p>
      {description && <p className="max-w-xs text-xs text-gray-500">{description}</p>}
    </div>
  );
}
