const TAG_VARIANTS = {
  입문: "cyan",
  중급: "neon",
  고급: "orange",
  도전: "red",
  "AI 추천": "solidCyan",
  "오늘의 추천": "solidNeon",
};

export function tagBadgeVariant(tag) {
  return TAG_VARIANTS[tag] || "gray";
}
