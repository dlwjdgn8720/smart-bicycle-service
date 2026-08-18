export const HOME_STATS = [
  { label: "활성 라이더", value: "50,000+" },
  { label: "등록 루트", value: "12,800+" },
  { label: "앱 평점", value: "4.9", suffix: "★" },
];

export const FEATURES = [
  {
    icon: "Map",
    tag: "AI 추천",
    title: "스마트 루트 탐색",
    description:
      "AI가 실력, 선호 지형, 현재 날씨를 분석해 최적의 루트를 추천합니다.",
  },
  {
    icon: "Users",
    tag: "소셜",
    title: "라이더 커뮤니티",
    description:
      "지역 라이더들과 단체 라이딩을 기획하고, 실시간으로 소통하세요.",
  },
  {
    icon: "Activity",
    tag: "실시간",
    title: "라이딩 트래킹",
    description:
      "GPS 기반 속도·거리·고도 데이터를 자동 기록하고 통계로 분석해보세요.",
  },
  {
    icon: "Trophy",
    tag: "게이미피케이션",
    title: "챌린지 & 리워드",
    description: "매달 새로운 챌린지에 도전하고 포인트와 뱃지를 획득하세요.",
  },
];

export const ROUTES_MOCK = [
  {
    id: "bukhansan-loop",
    name: "북한산 순환 코스",
    region: "서울 · 은평구",
    regionTag: "서울",
    difficulty: "고급",
    bikeType: "MTB",
    distance: "42km",
    duration: "3h 20m",
    rating: 4.9,
    reviewCount: 1284,
    image:
      "https://images.unsplash.com/photo-1633707167699-cdd893b84441?w=1200&q=70",
    tags: ["고급", "MTB"],
    departure: "북한산 국립공원 입구",
    destination: "북한산 국립공원 입구",
    availableBike: 8,
    returnSpace: 12,
    elevationGain: "1,240m",
    maxElevation: "1,240m",
    completionRate: 78,
    participants: 3082,
    season: "봄 · 가을",
    description:
      "북한산 국립공원을 순환하는 험준한 산악 코스. 가파른 오르막과 시원한 내리막이 반복되는 스릴 만점의 루트.",
    safetyTips: [
      "헬멧과 보호대를 반드시 착용하세요",
      "출발 전 GPS와 배터리를 확인하세요",
      "날씨 변화에 대비한 레이어를 준비하세요",
      "초행길은 혼자보다 그룹 라이딩을 추천해요",
    ],
    elevationProfile: [
      { km: 0, elevation: 80 },
      { km: 8, elevation: 420 },
      { km: 16, elevation: 980 },
      { km: 21, elevation: 1240 },
      { km: 28, elevation: 1100 },
      { km: 35, elevation: 650 },
      { km: 42, elevation: 90 },
    ],
  },
  {
    id: "hangang-yeouinaru-hapjeong",
    name: "여의나루-합정 한강 코스",
    region: "서울 · 영등포 · 마포",
    difficulty: "입문",
    bikeType: "따릉이",
    distance: "8.2km",
    duration: "35분",
    rating: 4.8,
    reviewCount: 2840,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=70",
    tags: ["AI 추천", "입문"],
    free: true,
    departure: { name: "여의나루역 1번출구", available: 14, total: 20 },
    destination: { name: "합정역 6번출구", available: 2, total: 20 },
    availableBike: 14,
    returnSpace: 2,
    description:
      "한강변 자전거도로를 따라 달리는 서울 대표 따릉이 코스. 평탄한 지형으로 누구나 편하게 즐길 수 있습니다.",
  },
  {
    id: "ttukseom-jamsil",
    name: "뚝섬-잠실 한강 코스",
    region: "서울 · 성동 · 송파",
    difficulty: "입문",
    bikeType: "따릉이",
    distance: "12.4km",
    duration: "55분",
    rating: 4.7,
    free: true,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=70",
    tags: ["입문"],
    departure: { name: "뚝섬유원지역 1번출구", available: 8, total: 15 },
    destination: { name: "잠실역 5번출구", available: 11, total: 15 },
  },
  {
    id: "banpo-ichon",
    name: "반포-이촌 한강 코스",
    region: "서울 · 서초 · 용산",
    difficulty: "입문",
    bikeType: "따릉이",
    distance: "6.8km",
    duration: "28분",
    rating: 4.6,
    free: true,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=70",
    tags: ["입문"],
    departure: { name: "반포한강공원 동측", available: 0, total: 12 },
    destination: { name: "이촌한강공원 앞", available: 9, total: 12 },
  },
  {
    id: "seongsu-cafe",
    name: "성수 카페거리 순환",
    region: "서울 · 성동",
    difficulty: "입문",
    bikeType: "따릉이",
    distance: "5.2km",
    duration: "25분",
    rating: 4.5,
    free: true,
    image:
      "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=70",
    tags: ["입문"],
    departure: { name: "성수역 4번출구", available: 12, total: 15 },
    destination: { name: "성수역 4번출구", available: 12, total: 15 },
  },
  {
    id: "namsan-loop",
    name: "남산 순환 코스",
    region: "서울 · 중구",
    difficulty: "중급",
    bikeType: "따릉이",
    distance: "4.8km",
    duration: "30분",
    rating: 4.7,
    free: true,
    image:
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=1200&q=70",
    tags: ["중급"],
    departure: { name: "회현역 5번출구", available: 7, total: 10 },
    destination: { name: "회현역 5번출구", available: 7, total: 10 },
  },
  {
    id: "hangang-full",
    name: "한강 종주 라이딩",
    region: "서울 · 전 구간",
    regionTag: "서울",
    difficulty: "중급",
    bikeType: "로드",
    distance: "132km",
    duration: "6h 45m",
    elevationGain: "380m",
    rating: 4.8,
    reviewCount: 3412,
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=70",
    tags: ["오늘의 추천", "중급"],
    description:
      "서울 전 구간을 가로지르는 한강 자전거 전용도로. 평탄한 지형으로 초보자도 도전 가능한 서울 대표 라이딩 코스입니다.",
  },
  {
    id: "jeju-ring-road",
    name: "제주 환상 자전거길",
    region: "제주 · 전도",
    regionTag: "제주",
    difficulty: "도전",
    bikeType: "투어링",
    distance: "234km",
    duration: "2박 3일",
    elevationGain: "2,850m",
    rating: 5,
    reviewCount: 892,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=70",
    tags: ["도전", "투어링"],
  },
  {
    id: "namsan-circuit",
    name: "남산 순환 코스",
    region: "서울 · 중구",
    regionTag: "서울",
    difficulty: "입문",
    bikeType: "도심",
    distance: "8km",
    duration: "45분",
    elevationGain: "240m",
    rating: 4.6,
    reviewCount: 2150,
    image:
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=1200&q=70",
    tags: ["입문", "도심"],
  },
  {
    id: "busan-galmaetgil",
    name: "부산 갈맷길 해안 코스",
    region: "부산 · 해운대 ~ 송정",
    regionTag: "부산",
    difficulty: "중급",
    bikeType: "로드",
    distance: "55km",
    duration: "4h 10m",
    elevationGain: "680m",
    rating: 4.7,
    reviewCount: 976,
    image:
      "https://images.unsplash.com/photo-1744802093072-dad02dd5b79d?w=1200&q=70",
    tags: ["중급", "로드"],
  },
  {
    id: "gyeongin-arabetgil",
    name: "경인 아라뱃길",
    region: "인천 · 김포 ~ 인천",
    regionTag: "인천",
    difficulty: "입문",
    bikeType: "로드",
    distance: "26km",
    duration: "1h 40m",
    elevationGain: "120m",
    rating: 4.5,
    reviewCount: 1834,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=70",
    tags: ["입문", "로드"],
  },
  {
    id: "chuncheon-uiamho",
    name: "춘천 의암호 순환",
    region: "강원 · 춘천시",
    regionTag: "강원",
    difficulty: "중급",
    bikeType: "그래벨",
    distance: "35km",
    duration: "2h 20m",
    elevationGain: "420m",
    rating: 4.8,
    reviewCount: 854,
    image:
      "https://images.unsplash.com/photo-1767820524140-6b94b57789b5?w=1200&q=70",
    tags: ["중급", "그래벨"],
  },
  {
    id: "jirisan-dulegil",
    name: "지리산 둘레길 라이딩",
    region: "전남 · 구례 ~ 하동",
    regionTag: "전남",
    difficulty: "고급",
    bikeType: "그래벨",
    distance: "110km",
    duration: "8h 30m",
    elevationGain: "2,100m",
    rating: 4.9,
    reviewCount: 421,
    image:
      "https://images.unsplash.com/photo-1758998076258-9900be6a51f0?w=1200&q=70",
    tags: ["고급", "그래벨"],
  },
];

export const REVIEWS = [
  {
    name: "김민준",
    handle: "@minjun_rides",
    rating: 5,
    likes: 214,
    text: "루트 추천 기능이 정말 뛰어나요. 매번 새로운 코스를 찾아주는 재미가 있어서 라이딩이 더 즐거워졌어요.",
  },
  {
    name: "박서연",
    handle: "@seoyeon.cycling",
    rating: 5,
    likes: 87,
    text: "커뮤니티를 통해 지역 라이더들을 만났는데 지금은 함께 달리는 절친이 됐어요. 최고의 앱입니다.",
  },
  {
    name: "이재혁",
    handle: "@jaehyuk_mtb",
    rating: 5,
    likes: 341,
    text: "트래킹 데이터 분석이 정말해서 제 라이딩 실력이 눈에 띄게 향상됐어요. 데이터 덕후에겐 강추!",
  },
];

export const COMMUNITY_STATS = [
  { label: "추천 단체 라이딩", value: "200+" },
  { label: "지역 라이딩 클럽", value: "83개" },
  { label: "챌린지 완주율", value: "98%" },
  { label: "전국 광역시도 지원", value: "전국" },
];

export const BIKE_HERO_STATS = [
  { label: "오늘 총 이용", value: "142,800", unit: "건", trend: "+8.4%" },
  { label: "운영 대여소", value: "2,692", unit: "개소", trend: "+2.1%" },
  { label: "현재 이용 중", value: "4,318", unit: "대", trend: "+12.3%" },
  { label: "평균 이용 시간", value: "17.4", unit: "분", trend: "-1.8%" },
];

export const STATIONS_MOCK = [
  {
    id: 1,
    name: "여의나루역 1번출구",
    distance: "120m",
    available: 14,
    total: 20,
    status: "GOOD",
  },
  {
    id: 2,
    name: "여의도공원 북측",
    distance: "340m",
    available: 3,
    total: 15,
    status: "LOW",
  },
  {
    id: 3,
    name: "국회의사당역 앞",
    distance: "580m",
    available: 0,
    total: 18,
    status: "EMPTY",
  },
  {
    id: 4,
    name: "마포대교 남단",
    distance: "820m",
    available: 8,
    total: 12,
    status: "GOOD",
  },
  {
    id: 5,
    name: "합정역 6번출구",
    distance: "1.1km",
    available: 2,
    total: 20,
    status: "LOW",
  },
  {
    id: 6,
    name: "당인리문화창작소",
    distance: "1.4km",
    available: 6,
    total: 10,
    status: "GOOD",
  },
];

export const HOURLY_USAGE = [
  { hour: "0시", count: 1200 },
  { hour: "1시", count: 800 },
  { hour: "2시", count: 500 },
  { hour: "3시", count: 400 },
  { hour: "4시", count: 600 },
  { hour: "5시", count: 1500 },
  { hour: "6시", count: 4000 },
  { hour: "7시", count: 12000 },
  { hour: "8시", count: 24500 },
  { hour: "9시", count: 16000 },
  { hour: "10시", count: 10000 },
  { hour: "11시", count: 9500 },
  { hour: "12시", count: 13500 },
  { hour: "13시", count: 10500 },
  { hour: "14시", count: 9800 },
  { hour: "15시", count: 10200 },
  { hour: "16시", count: 12500 },
  { hour: "17시", count: 21000 },
  { hour: "18시", count: 29500 },
  { hour: "19시", count: 24000 },
  { hour: "20시", count: 16000 },
  { hour: "21시", count: 11000 },
  { hour: "22시", count: 7000 },
  { hour: "23시", count: 3000 },
];

export const MONTHLY_USAGE = [
  { month: "1월", count: 1500000 },
  { month: "2월", count: 1700000 },
  { month: "3월", count: 2600000 },
  { month: "4월", count: 3800000 },
  { month: "5월", count: 4200000 },
  { month: "6월", count: 3600000 },
  { month: "7월", count: 3000000 },
  { month: "8월", count: 2800000 },
  { month: "9월", count: 3900000 },
  { month: "10월", count: 4300000 },
  { month: "11월", count: 3100000 },
  { month: "12월", count: 1600000 },
];

export const TOP_STATIONS = [
  { name: "여의나루역 1번출구", count: 4600 },
  { name: "뚝섬유원지", count: 3900 },
  { name: "합정역 6번출구", count: 3700 },
  { name: "홍대입구역 9번출구", count: 3400 },
  { name: "반포한강공원", count: 3200 },
  { name: "이태원역 4번출구", count: 3000 },
];

export const AGE_DISTRIBUTION = [
  { age: "10대", percent: 8 },
  { age: "20대", percent: 34.1 },
  { age: "30대", percent: 28.4 },
  { age: "40대", percent: 18 },
  { age: "50대", percent: 9 },
  { age: "60대+", percent: 2.5 },
];

export const AI_INSIGHTS = [
  {
    tag: "패턴",
    icon: "TrendingUp",
    title: "퇴근 시간 수요가 출근보다 23% 높음",
    description:
      "17~19시 이용량이 7~9시 대비 평균 23.4% 높습니다. 귀가 시 자전거 이용 선호도가 뚜렷하게 증가하는 추세입니다.",
    metricLabel: "퇴근 vs 출근",
    metricValue: "+23.4%",
    tone: "up",
  },
  {
    tag: "날씨",
    icon: "CloudRain",
    title: "강수 시 이용률 67% 급감",
    description:
      "비 오는 날 이용량이 맑은 날 대비 67% 감소합니다. 날씨 예보 연동 실시간 재고 분산 전략이 필요합니다.",
    metricLabel: "비 vs 맑음",
    metricValue: "-67%",
    tone: "down",
  },
  {
    tag: "이용자",
    icon: "Users",
    title: "20~30대가 전체 이용의 62% 점유",
    description:
      "핵심 이용층은 20대(34.1%)와 30대(28.4%)입니다. 40~50대 유입 확대를 위한 생활형 루트 콘텐츠 강화가 효과적입니다.",
    metricLabel: "20~30대 비중",
    metricValue: "62%",
    tone: "neutral",
  },
  {
    tag: "패턴",
    icon: "Zap",
    title: "평균 이동 거리 2.8km, 10분 미만 68%",
    description:
      "전체 대여의 68%가 10분 미만 단거리 이용입니다. 지하철역 반경 500m 내 대여소 밀도 확충이 핵심 과제입니다.",
    metricLabel: "평균 이동 거리",
    metricValue: "2.8km",
    tone: "neutral",
  },
  {
    tag: "경로",
    icon: "MapPin",
    title: "여의나루-합정 구간 반복 이용률 1위",
    description:
      "동일 구간 재이용률이 78%에 달하는 여의나루-합정 코스. 한강변 인기 코스 우선 정비 및 실시간 알림 강화를 권장합니다.",
    metricLabel: "재이용률",
    metricValue: "78%",
    tone: "up",
  },
  {
    tag: "예측",
    icon: "Sparkles",
    title: "봄 성수기 수요 조기 포화 예측",
    description:
      "4~5월 한강변 대여소는 오후 4시부터 재고 소진율 92%에 도달. AI 모델은 2주 전부터 해당 구간 집중 보충을 권장합니다.",
    metricLabel: "성수기 소진율",
    metricValue: "92%",
    tone: "up",
  },
];

export const DASHBOARD_STATS = {
  user: {
    name: "김민준",
    handle: "@minzun_rides",
    level: "중급 라이더",
    joinedDays: 142,
    streak: 7,
  },
  totals: [
    { label: "총 라이딩", value: "214", unit: "회", icon: "Map" },
    { label: "누적 거리", value: "3,842", unit: "km", icon: "TrendingUp" },
    { label: "총 라이딩 시간", value: "186", unit: "h", icon: "Clock" },
    { label: "연속 라이딩", value: "7", unit: "일", icon: "Flame" },
  ],
  activity: {
    badges: 12,
    challenges: 8,
    followers: 34,
    savedRoutes: 27,
  },
};

export const QUICK_MENU = [
  { icon: "Map", label: "루트 탐색", path: "/riding/start" },
  { icon: "Bike", label: "따릉이", path: "/bike/seoul" },
  { icon: "Users", label: "커뮤니티", path: "/community" },
  { icon: "Trophy", label: "챌린지", path: "/challenges" },
];

export const COMMUNITY_FEED = [
  {
    name: "박서연",
    initial: "박",
    text: "님이 북한산 루트 완주 인증",
    time: "5분 전",
    likes: 24,
  },
  {
    name: "이재혁",
    initial: "이",
    text: "님이 제주 환상길 D-7 모집 중",
    time: "22분 전",
    likes: 41,
  },
  {
    name: "최지현",
    initial: "최",
    text: "님이 한강 종주 신기록 달성",
    time: "1시간 전",
    likes: 87,
  },
];

export const CHATBOT_QUICK_QUESTIONS = [
  "루트 추천해줘",
  "따릉이 정보",
  "요금이 궁금해",
  "앱 다운로드",
];

export const CHATBOT_MOCK_ANSWERS = {
  기본: "안녕하세요! 페달업 AI 도우미입니다 🚴 루트 추천, 따릉이 정보, 라이딩 팁 등 무엇이든 물어보세요.",
  루트: "지금 시간대에는 '여의나루-합정 한강 코스'(8.2km, 난이도 입문)를 추천해요. AI 분석 결과 혼잡도가 낮고 평탄한 지형이라 편하게 즐기실 수 있어요.",
  따릉이:
    "서울시 따릉이는 현재 2,692개 대여소에서 운영 중이며, 실시간 대여 가능 현황은 '따릉이 대여소 현황' 탭에서 확인하실 수 있어요.",
  요금: "따릉이는 1시간 기준 1,000원이며, 4시간 이내 추가요금이 없어요. 반납 후 재대여도 가능합니다.",
  앱: "PEDALUP 앱은 iOS 14.0 이상, Android 8.0 이상에서 무료로 다운로드할 수 있어요. 가입 후 30일간 프리미엄 기능도 무료로 사용해보세요!",
};

export const FORECAST_STATIONS = [
  {
    id: 1,
    name: "여의나루역 1번출구",
    district: "영등포구 여의동",
    rackCount: 20,
    recentHourlyRentals: 28,
  },
  {
    id: 2,
    name: "합정역 6번출구",
    district: "마포구 합정동",
    rackCount: 20,
    recentHourlyRentals: 24,
  },
  {
    id: 3,
    name: "홍대입구역 9번출구",
    district: "마포구 서교동",
    rackCount: 18,
    recentHourlyRentals: 35,
  },
  {
    id: 4,
    name: "뚝섬유원지",
    district: "광진구 자양동",
    rackCount: 16,
    recentHourlyRentals: 20,
  },
  {
    id: 5,
    name: "반포한강공원",
    district: "서초구 반포동",
    rackCount: 20,
    recentHourlyRentals: 18,
  },
  {
    id: 6,
    name: "이태원역 4번출구",
    district: "용산구 이태원동",
    rackCount: 14,
    recentHourlyRentals: 12,
  },
];
