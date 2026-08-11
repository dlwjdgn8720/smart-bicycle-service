import { AtSign, MessageCircle, Share2 } from "lucide-react";
import Logo from "../common/Logo";

const COLUMNS = [
  { title: "서비스", links: ["루트 탐색", "라이딩 트래킹", "따릉이 연동", "이벤트"] },
  { title: "커뮤니티", links: ["단체 라이딩", "라이더 매칭", "챌린지", "클럽 만들기"] },
  { title: "고객 지원", links: ["자주 묻는 질문", "이용약관", "개인정보처리방침", "문의하기"] },
  { title: "회사", links: ["페달업 소개", "블로그", "채용", "Press Kit"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-gray-500">
              더 많은 사람들이 자전거를 통해 더 건강하고, 더 지속가능한 삶을 살 수 있도록 돕습니다.
            </p>
            <div className="mt-5 flex items-center gap-3 text-gray-500">
              <AtSign className="h-4 w-4 hover:text-white" />
              <MessageCircle className="h-4 w-4 hover:text-white" />
              <Share2 className="h-4 w-4 hover:text-white" />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {col.links.map((link) => (
                  <li key={link} className="hover:text-gray-300">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-xs text-gray-600">
          © 2025 PEDALUP Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
