import { Heart } from "lucide-react";

export default function CommunityCard({ feed }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
        {feed.initial}
      </span>
      <div className="flex-1 text-sm">
        <p className="text-gray-300">
          <span className="font-semibold text-white">{feed.name}</span> {feed.text}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
          <span>{feed.time}</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {feed.likes}
          </span>
        </div>
      </div>
    </div>
  );
}
