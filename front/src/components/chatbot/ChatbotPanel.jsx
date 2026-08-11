import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Home, X, Send } from "lucide-react";
import { useChatbot } from "../../context/ChatbotContext";
import ChatMessage from "./ChatMessage";
import QuickQuestion from "./QuickQuestion";
import { CHATBOT_QUICK_QUESTIONS } from "../../constants/mockData";
import { ROUTES } from "../../constants/routes";

export default function ChatbotPanel() {
  const { close, messages, sendMessage, isSending } = useChatbot();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    sendMessage(value);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-bg-deep shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon">
            <Bike className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">PEDALUP AI</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-neon" />
              온라인 · 즉시 응답
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.HOME}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/10 text-neon hover:bg-neon/20"
            aria-label="홈으로"
          >
            <Home className="h-4 w-4" />
          </Link>
          <button
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-white"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isSending && <p className="text-xs text-gray-500">답변을 입력 중입니다...</p>}
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {CHATBOT_QUICK_QUESTIONS.map((question) => (
            <QuickQuestion key={question} label={question} onSelect={handleSend} />
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon text-black hover:bg-neon-dark"
            aria-label="전송"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
