import { COMMUNITY_STATS } from "../../constants/mockData";

export default function CommunitySection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-16">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=60"
          alt="단체 라이딩"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
      </div>

      <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-neon">커뮤니티</p>
          <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            혼자보다
            <br />
            <span className="text-neon">함께 달릴 때</span>
            <br />
            더 멀리 갑니다
          </h2>
          <p className="mt-5 max-w-md text-sm text-gray-400">
            매주 전국에서 200개 이상의 단체 라이딩이 열립니다. 지금 바로 가까운 라이더를 찾아보세요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {COMMUNITY_STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur">
              <p className="text-3xl font-extrabold text-neon">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
