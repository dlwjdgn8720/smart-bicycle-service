import { useChatbot } from "../../context/ChatbotContext";
import ChatbotButton from "./ChatbotButton";
import ChatbotPanel from "./ChatbotPanel";

export default function Chatbot() {
  const { isOpen } = useChatbot();
  return (
    <>
      <ChatbotButton />
      {isOpen && <ChatbotPanel />}
    </>
  );
}
