import api from "../api/axios";
import { CHATBOT_MOCK_ANSWERS } from "../constants/mockData";

function pickMockAnswer(message) {
  const text = message.toLowerCase();
  if (text.includes("루트") || text.includes("추천")) return CHATBOT_MOCK_ANSWERS.루트;
  if (text.includes("따릉이")) return CHATBOT_MOCK_ANSWERS.따릉이;
  if (text.includes("요금") || text.includes("가격")) return CHATBOT_MOCK_ANSWERS.요금;
  if (text.includes("앱") || text.includes("다운로드")) return CHATBOT_MOCK_ANSWERS.앱;
  return CHATBOT_MOCK_ANSWERS.기본;
}

// 향후 FastAPI: POST /api/chat  { message } -> { answer }
async function sendMessage(message) {
  try {
    const { data } = await api.post("/chat", { message });
    return data.answer;
  } catch {
    return pickMockAnswer(message);
  }
}

const chatbotService = { sendMessage };
export default chatbotService;
