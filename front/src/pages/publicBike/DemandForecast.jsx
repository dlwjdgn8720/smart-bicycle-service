import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, TrendingUp, Users, X } from "lucide-react";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import publicBikeService from "../../services/publicBikeService";
import { FORECAST_STATIONS } from "../../constants/mockData";
import { deriveDateFeatures } from "../../utils/forecastFeatures";
import { axiosGet } from "../../api/axios";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);
const todayISODate = () => new Date().toISOString().slice(0, 10);

const fieldLabel = "mb-2 block text-xs text-gray-400";
const fieldInput =
  "w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40 [&::-webkit-calendar-picker-indicator]:invert";

const LEVEL_STYLES = {
  높음: { text: "text-danger", bar: "bg-danger", border: "border-danger/30", chip: "border-danger/30 bg-danger/10 text-danger" },
  보통: { text: "text-warn", bar: "bg-warn", border: "border-warn/30", chip: "border-warn/30 bg-warn/10 text-warn" },
  낮음: { text: "text-neon", bar: "bg-neon", border: "border-neon/30", chip: "border-neon/30 bg-neon/10 text-neon" },
};

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-black/20 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DemandForecast() {
  const [stationId, setStationId] = useState(FORECAST_STATIONS[0].id);
  // 백엔드 API에서 불러온 대여소 상세 메타 정보 저장
  const [stationDetail, setStationDetail] = useState(null);
  const [date, setDate] = useState(todayISODate());
  const [hour, setHour] = useState(new Date().getHours());
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(50);
  const [rainfall, setRainfall] = useState(0);
  const [windSpeed, setWindSpeed] = useState(2.0);

  // lag_1h, lag_24h 제거 후 평균 패턴 피처만 유지
  const [rolling7dSameHourAvg, setRolling7dSameHourAvg] = useState(
    Math.round(FORECAST_STATIONS[0].recentHourlyRentals * 1.05),
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null); // 백엔드 미연동 시 확인용 요청 payload
  const [stationInfo, setStationInfo] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const mockStation = FORECAST_STATIONS.find((s) => s.id === stationId);
  const dateFeatures = useMemo(() => deriveDateFeatures(date), [date]);

  // =========================================================================
  // 대여소 변경 및 진입 시 FastAPI 백엔드 API (/api/stations/{station_id}) 연동
  // =========================================================================
  useEffect(() => {
    const fetchStationInfo = async () => {
      try {
        const stationInfoRes = await axiosGet('/stations_info');
        console.log(stationInfoRes);

        if (stationInfoRes && stationInfoRes.stations) {
          const stationArray = Object.entries(stationInfoRes.stations).map(([id, name]) => ({
            id: Number(id), // key값 (숫자로 변환)
            name: name      // value값
          })).sort((a, b) => a.name.localeCompare(b.name, 'ko'));

          setStationInfo(stationArray);
        }

        // FastAPI /api/stations/{station_id} 호출
        const data = await axiosGet(`/stations/${stationId}`);
        console.log('data:::', data);

        setStationDetail(data);
        // API 응답 데이터로 과거 이용 패턴 자동 매핑
        setRolling7dSameHourAvg(data.rolling_7d_same_hour_avg ?? 0);
      } catch (err) {
        console.warn("대여소 정보 백엔드 조회 실패, Fallback 데이터 사용:", err);

        // API 조회 실패 시 mockData 또는 기본값 fallback
        const fallbackStation = FORECAST_STATIONS.find((s) => s.id === stationId);
        if (fallbackStation) {
          setStationDetail({
            station_id: fallbackStation.id,
            district: fallbackStation.district,
            rack_count: fallbackStation.rackCount,
            rolling_7d_same_hour_avg: Math.round((fallbackStation.recentHourlyRentals ?? 0) * 1.05),
          });
          setRolling7dSameHourAvg(Math.round((fallbackStation.recentHourlyRentals ?? 0) * 1.05));
        }
      }
    };

    // 결과 상태 초기화 및 대여소 상세 데이터 로드
    setResult(null);
    setPendingRequest(null);
    fetchStationInfo();
  }, [stationId]);

  const handleStationChange = (e) => {
    setStationId(Number(e.target.value));
  };

  const handleRun = async () => {
    const payload = {
      stationId,
      date,
      hour,
      isHoliday: dateFeatures?.isHoliday ?? false,
      temperature,
      humidity,
      rainfall,
      windSpeed,
      rolling7dSameHourAvg,
    };

    setLoading(true);
    setResult(null);
    setErrorMessage("");
    setPendingRequest(null);
    try {
      const data = await publicBikeService.getForecast(payload);
      setResult(data);
      setResultOpen(true);
    } catch {
      setPendingRequest(payload);
      setErrorMessage("FastAPI 예측 API(POST /api/ai/bike/forecast)가 아직 연동되지 않았습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 대여소 이름 (mockData에서 가져오거나 fallback)
  const currentStationName = mockStation ? mockStation.name : `${stationId}번 대여소`;
  // 대여소 정원 수 (API 메타데이터 우선 적용)
  const currentRackCount = stationDetail?.rack_count ?? mockStation?.rackCount ?? 15;
  // 자치구/지역 (API 메타데이터 우선 적용)
  const currentDistrict = stationDetail?.district ?? mockStation?.district ?? "-";

  const levelStyle = LEVEL_STYLES[result?.demand_level] ?? LEVEL_STYLES.보통;
  const availableForBar = result?.available_bikes ?? result?.predicted_demand ?? 0;
  const barPct = currentRackCount ? Math.min(100, Math.round((availableForBar / currentRackCount) * 100)) : 0;

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-bike">AI 예측</p>
      <h2 className="mb-6 text-2xl font-extrabold text-white">수요·혼잡도 예측</h2>

      {!loading && result && (
        <div className={`mb-8 overflow-hidden rounded-xl border bg-card ${levelStyle.border}`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`h-5 w-5 ${levelStyle.text}`} />
              <p className="text-sm font-semibold text-white">예측 완료</p>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${levelStyle.chip}`}>
                {result.predicted_demand}건 · {result.demand_level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setResultOpen((v) => !v)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label={resultOpen ? "결과 접기" : "결과 펼치기"}
              >
                {resultOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="결과 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {resultOpen && (
            <div className="border-t border-border px-6 pb-6 pt-5">
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-black/20 p-5">
                  <p className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                    예측 대여 수요
                  </p>
                  <p className={`text-4xl font-extrabold ${levelStyle.text}`}>
                    {result.predicted_demand}
                    <span className="ml-1 text-lg font-semibold text-gray-400">건</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {currentStationName} · {date} {String(hour).padStart(2, "0")}:00
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-black/20 p-5">
                  <p className="mb-3 flex items-center justify-end gap-2 text-xs text-gray-400">
                    <Users className="h-4 w-4" />
                    혼잡도
                  </p>
                  <p className={`text-right text-4xl font-extrabold ${levelStyle.text}`}>
                    {barPct}
                    <span className="ml-1 text-lg font-semibold text-gray-400">%</span>
                  </p>
                  <p className="mb-2 mt-2 text-right text-xs text-gray-500">
                    {result.demand_level} · {availableForBar}/{currentRackCount}대
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${levelStyle.bar}`} style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              </div>

              {result.message && (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-black/20 p-4 text-sm text-gray-300">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${levelStyle.text}`} />
                  {result.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="mb-8 rounded-xl border border-warn/30 bg-warn/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-warn">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
          <p className="mb-3 text-xs text-gray-400">
            아래는 백엔드 연동 시 <code>POST /api/ai/bike/forecast</code>로 전송될 요청 데이터입니다.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-gray-300">
            {JSON.stringify(pendingRequest, null, 2)}
          </pre>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {/* A. 대여소 */}
        <label className={fieldLabel}>대여소</label>
        <select value={stationId} onChange={handleStationChange} className={`${fieldInput} mb-3`}>
          {stationInfo.length > 0 ? (
            stationInfo.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))
          ) : (
            FORECAST_STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))
          )}
        </select>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <ReadOnlyField label="지역" value={currentDistrict} />
          <ReadOnlyField label="대여소 정원" value={`${currentRackCount}대`} />
        </div>

        {/* B. 예측 시점 */}
        <p className="mb-4 text-sm font-semibold text-white">예측 시점</p>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>예측 날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldInput} />
          </div>
          <div>
            <label className={fieldLabel}>예측 시간</label>
            <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className={fieldInput}>
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <ReadOnlyField label="요일" value={dateFeatures?.dayOfWeekLabel ?? "-"} />
          <ReadOnlyField label="휴일 여부" value={dateFeatures?.holidayLabel ?? "-"} />
        </div>

        {/* C. 예상 기상 조건 */}
        <p className="mb-4 text-sm font-semibold text-white">예상 기상 조건</p>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className={fieldLabel}>기온 (℃)</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>습도 (%)</label>
            <input
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>강수량 (mm)</label>
            <input
              type="number"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>풍속 (m/s)</label>
            <input
              type="number"
              step="0.1"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
        </div>

        {/* D. 과거 이용 패턴 */}
        <p className="mb-4 text-sm font-semibold text-white">과거 이용 패턴</p>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={fieldLabel}>최근 1시간 대여량</label>
            <input
              type="number"
              disabled='True'
              // value={recentHourlyRentals}
              // onChange={(e) => setRecentHourlyRentals(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>전일 동일 시간대 대여량</label>
            <input
              type="number"
              disabled='True'
              // value={prevDaySameHourRentals}
              // onChange={(e) => setPrevDaySameHourRentals(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>최근 7일 동일 시간대 평균</label>
            <input
              type="number"
              value={rolling7dSameHourAvg}
              onChange={(e) => setRolling7dSameHourAvg(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
        </div>

        {/* 예측에 사용되는 데이터 요약 */}
        <div className="mb-6 rounded-lg border border-border bg-black/20 p-4">
          <p className="mb-3 text-sm font-semibold text-white">예측에 사용되는 데이터</p>
          <dl className="space-y-2 text-sm">
            {[
              ["대여소", currentStationName],
              ["지역", currentDistrict],
              ["날짜", date],
              ["시간", `${String(hour).padStart(2, "0")}:00`],
              ["요일", dateFeatures?.dayOfWeekLabel ?? "-"],
              ["휴일 여부", dateFeatures?.holidayLabel ?? "-"],
              ["기온", `${temperature}℃`],
              ["습도", `${humidity}%`],
              ["강수량", `${rainfall}mm`],
              ["풍속", `${windSpeed}m/s`],
              ["시간대별 평균 대여량", `${rolling7dSameHourAvg}건`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-gray-400">{k}</dt>
                <dd className="text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Button variant="cyan" size="lg" className="w-full" onClick={handleRun} disabled={loading}>
          <Sparkles className="h-4 w-4" />
          수요예측 실행
        </Button>
      </div>

      {loading && <Loading label="AI가 수요를 예측하는 중..." />}
    </div>
  );
}