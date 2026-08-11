import { Bot } from "lucide-react";

export default function ChatMessage({ message }) {
  const isBot = message.role === "bot";

  if (!isBot) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl bg-neon px-4 py-3 text-sm font-medium text-black">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon">
        <Bot className="h-4 w-4" />
      </span>
      <div>
        <div className="max-w-[85%] rounded-2xl bg-card px-4 py-3 text-sm leading-relaxed text-gray-200">
          {message.text}
        </div>
        {message.time && <p className="mt-1.5 text-xs text-gray-600">{message.time}</p>}
      </div>
    </div>
  );
}
