import { Bike } from "lucide-react";
import { useChatbot } from "../../context/ChatbotContext";

export default function ChatbotButton() {
  const { isOpen, toggle } = useChatbot();

  if (isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-neon text-black shadow-lg shadow-neon/30 transition-transform hover:scale-105"
      aria-label="PEDALUP AI 챗봇 열기"
    >
      <Bike className="h-6 w-6" />
    </button>
  );
}
