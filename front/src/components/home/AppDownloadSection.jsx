import { Apple, PlayCircle } from "lucide-react";

export default function AppDownloadSection() {
  return (
    <section className="bg-neon px-6 py-20 text-black lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-black/70">지금 바로 시작하세요</p>
          <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            PEDALUP
            <br />
            앱 다운로드
          </h2>
          <p className="mt-4 max-w-sm text-sm text-black/70">
            iOS와 Android에서 무료로 설치하세요. 가입 후 30일은 프리미엄 기능을 무료로 사용할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-3 rounded-lg bg-black px-6 py-3 text-white">
            <Apple className="h-5 w-5" />
            <span className="text-left">
              <span className="block text-[10px] text-gray-400">iOS 14.0 이상</span>
              <span className="block text-sm font-bold">App Store</span>
            </span>
          </button>
          <button className="flex items-center gap-3 rounded-lg bg-black px-6 py-3 text-white">
            <PlayCircle className="h-5 w-5" />
            <span className="text-left">
              <span className="block text-[10px] text-gray-400">Android 8.0 이상</span>
              <span className="block text-sm font-bold">Google Play</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
