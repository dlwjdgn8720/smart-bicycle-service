import { useEffect, useState } from "react";
import AreaChartCard from "../../components/charts/AreaChartCard";
import BarChartCard from "../../components/charts/BarChartCard";
import InsightCard from "../../components/cards/InsightCard";
import Loading from "../../components/common/Loading";
import publicBikeService from "../../services/publicBikeService";
import { axiosGet } from "../../api/axios.js"

export default function AIAnalysis() {
  const [data, setData] = useState(null);
  const [predictData, setPredictData] = useState([]);
  const [topStations, setTopStations] = useState([]);

  // useEffect(() => {
  //   publicBikeService.getAnalysis().then(setData);
  // }, []);

  // 2. 전체 페이지의 로딩 상태를 관리합니다.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 3. Promise.all을 사용하여 두 API를 동시에 병렬로 호출합니다.
        const [trendsResponse, stationsResponse] = await Promise.all([
          axiosGet("/bike-trends"),
          axiosGet("/top-stations")
        ]);

        // 4. 각각의 상태에 데이터를 저장합니다. 
        // (API 응답 구조에 따라 .data 객체 접근 방식이 다를 수 있으니 콘솔로 확인하세요)
        setPredictData(trendsResponse.data || trendsResponse);
        setTopStations(stationsResponse.data || stationsResponse);

      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false); // 성공하든 실패하든 로딩 상태 종료
      }
    }
    fetchAllData()
  }, []);

  // 방어 코드: data가 없거나 배열이 아니거나 비어있을 때
  // if (!data || !Array.isArray(data) || data.length === 0) {
  //   return (
  //     <div className="rounded-xl border border-border bg-card p-6 flex h-[320px] items-center justify-center text-xs text-gray-500">
  //       {title && <p className="mb-4 text-sm font-semibold text-white">{title}</p>}
  //       대여소 예측 데이터를 불러오는 중입니다...
  //     </div>
  //   );
  // }

  // 로딩 중일 때 표시
  if (isLoading) return <Loading />;

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-bike">연간 트렌드</p>
      <h2 className="mb-6 text-2xl font-extrabold text-white">2025년 월별 이용 예측(AI)</h2>
      <AreaChartCard
        data={predictData}
        xKey="month"
        yKey="usage"
        color="#38BDF8"
        yTickFormatter={(v) => `${Math.round(v / 10000)}만`}
        height={300}
      />

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold text-bike">대여소 순위</p>
          <h2 className="mb-4 text-2xl font-extrabold text-white">2025년 예상 인기대여소 Top 10(AI)</h2>
          <BarChartCard data={topStations}
            xKey="stationName"
            yKey="predictedUsage"
            color="#38BDF8"          // 일반 바 색상 (스카이블루)
            highlightColor="#F59E0B" // 1위 대여소 강조 색상 (골드)
            layout="horizontal"      // 대여소 이름이 길기 때문에 가로형 바 차트 선택
            height={400}             // 10개 대여소를 보여주기 위한 넉넉한 높이
          // title="2025년 예상 인기대여소 Top 10"
          />
        </div>
        {/* <div>
          <p className="mb-1 text-sm font-semibold text-bike">이용자 분석</p>
          <h2 className="mb-4 text-2xl font-extrabold text-white">연령대별 이용 비율</h2>
          <BarChartCard data={data.ageDistribution} xKey="age" yKey="percent" color="#1E3A4F" highlightColor="#38BDF8" />
        </div> */}
      </div>

      {/* <div className="mt-10">
        <p className="mb-1 text-sm font-semibold text-bike">AI 인사이트</p>
        <h2 className="mb-6 text-2xl font-extrabold text-white">핵심 분석 결과</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.insights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
          ))}
        </div>
      </div> */}

      <p className="mt-8 text-center text-xs text-gray-300" style={{ fontSize: 15 }} >
        본 분석은 서울 열린데이터 광장 공공자전거 이용 정보(2024년)를 기반으로 교육·시연 목적으로 재구성한 데이터입니다.
      </p>
    </div>
  );
}