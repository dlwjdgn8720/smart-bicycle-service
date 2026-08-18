import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, TrendingUp, Users, X } from "lucide-react";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import publicBikeService from "../../services/publicBikeService";
import { FORECAST_STATIONS } from "../../constants/mockData";
import { deriveDateFeatures } from "../../utils/forecastFeatures";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);
const todayISODate = () => new Date().toISOString().slice(0, 10);

const fieldLabel = "mb-2 block text-xs text-gray-400";
const fieldInput =
  "w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40";

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
  const [date, setDate] = useState(todayISODate());
  const [hour, setHour] = useState(new Date().getHours());
  const [temperature, setTemperature] = useState(20);
  const [humidity, setHumidity] = useState(50);
  const [rainfall, setRainfall] = useState(0);
  const [windSpeed, setWindSpeed] = useState(2.0);
  const [recentHourlyRentals, setRecentHourlyRentals] = useState(FORECAST_STATIONS[0].recentHourlyRentals);
  const [prevDaySameHourRentals, setPrevDaySameHourRentals] = useState(
    Math.round(FORECAST_STATIONS[0].recentHourlyRentals * 1.1),
  );
  const [rolling7dSameHourAvg, setRolling7dSameHourAvg] = useState(
    Math.round(FORECAST_STATIONS[0].recentHourlyRentals * 1.05),
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultOpen, setResultOpen] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null); // 백엔드 미연동 시 확인용 요청 payload
  const [errorMessage, setErrorMessage] = useState("");

  const station = FORECAST_STATIONS.find((s) => s.id === stationId);
  const dateFeatures = useMemo(() => deriveDateFeatures(date), [date]);

  const handleStationChange = (e) => {
    const next = FORECAST_STATIONS.find((s) => s.id === Number(e.target.value));
    setStationId(next.id);
    setRecentHourlyRentals(next.recentHourlyRentals);
    setPrevDaySameHourRentals(Math.round(next.recentHourlyRentals * 1.1));
    setRolling7dSameHourAvg(Math.round(next.recentHourlyRentals * 1.05));
    setResult(null);
    setPendingRequest(null);
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
      recentHourlyRentals,
      prevDaySameHourRentals,
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

  const levelStyle = LEVEL_STYLES[result?.demand_level] ?? LEVEL_STYLES.보통;
  const availableForBar = result?.available_bikes ?? result?.predicted_demand ?? 0;
  const barPct = station ? Math.min(100, Math.round((availableForBar / station.rackCount) * 100)) : 0;

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
                    {station.name} · {date} {String(hour).padStart(2, "0")}:00
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
                    {result.demand_level} · {availableForBar}/{station.rackCount}대
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
          {FORECAST_STATIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <ReadOnlyField label="지역" value={station.district} />
          <ReadOnlyField label="대여소 정원" value={`${station.rackCount}대`} />
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
              value={recentHourlyRentals}
              onChange={(e) => setRecentHourlyRentals(Number(e.target.value))}
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>전일 동일 시간대 대여량</label>
            <input
              type="number"
              value={prevDaySameHourRentals}
              onChange={(e) => setPrevDaySameHourRentals(Number(e.target.value))}
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
              ["대여소", station.name],
              ["지역", station.district],
              ["날짜", date],
              ["시간", `${String(hour).padStart(2, "0")}:00`],
              ["요일", dateFeatures?.dayOfWeekLabel ?? "-"],
              ["휴일 여부", dateFeatures?.holidayLabel ?? "-"],
              ["기온", `${temperature}℃`],
              ["습도", `${humidity}%`],
              ["강수량", `${rainfall}mm`],
              ["풍속", `${windSpeed}m/s`],
              ["최근 1시간 대여량", `${recentHourlyRentals}건`],
              ["전일 동일 시간대 대여량", `${prevDaySameHourRentals}건`],
              ["최근 7일 동일 시간대 평균", `${rolling7dSameHourAvg}건`],
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
