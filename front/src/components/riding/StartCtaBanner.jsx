import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";

export default function StartCtaBanner() {
  return (
    <section className="px-6 pb-20 lg:px-16">
      <div className="rounded-2xl bg-neon px-6 py-16 text-center text-black">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-black/70">지금 바로 시작하세요</p>
        <h2 className="mx-auto max-w-lg text-3xl font-extrabold leading-tight sm:text-4xl">
          무료로 가입하고
          <br />
          첫 라이딩을 기록하세요
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-black/70">
          신용카드 없이 30초 만에 가입 완료. 프리미엄 기능 30일 무료 체험.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as={Link} to={ROUTES.SIGNUP} variant="black">
            무료 가입하기
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="blackOutline">앱 다운로드</Button>
        </div>
      </div>
    </section>
  );
}
