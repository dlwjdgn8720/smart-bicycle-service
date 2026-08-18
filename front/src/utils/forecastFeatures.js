const DAY_LABELS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

// 양력 고정일 공휴일만 반영 (설날·추석·부처님오신날 등 음력 공휴일은 별도 계산 로직 필요해 미포함)
const FIXED_HOLIDAYS_MM_DD = new Set([
  "01-01", // 신정
  "03-01", // 삼일절
  "05-05", // 어린이날
  "06-06", // 현충일
  "08-15", // 광복절
  "10-03", // 개천절
  "10-09", // 한글날
  "12-25", // 성탄절
]);

// date: "YYYY-MM-DD" 문자열. ML Feature인 day_of_week / month / is_weekend / is_holiday를
// 사용자가 직접 고르지 않고 날짜에서 자동 파생하기 위한 순수 함수.
export function deriveDateFeatures(date) {
  if (!date) return null;

  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;

  const dayOfWeek = d.getDay(); // 0(일) ~ 6(토)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const mmDd = date.slice(5); // "MM-DD"
  // is_weekend과 is_holiday는 별개 Feature: 주말이어도 공휴일이 아닐 수 있음(위 예시대로 토요일=평일 취급)
  const isHoliday = FIXED_HOLIDAYS_MM_DD.has(mmDd);

  return {
    dayOfWeek,
    dayOfWeekLabel: DAY_LABELS[dayOfWeek],
    month: d.getMonth() + 1,
    isWeekend,
    isHoliday,
    holidayLabel: isHoliday ? "휴일" : "일반일",
  };
}
