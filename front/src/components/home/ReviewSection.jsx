import { Star } from "lucide-react";
import SectionTitle from "../common/SectionTitle";
import { REVIEWS } from "../../constants/mockData";

export default function ReviewSection() {
  return (
    <section className="px-6 py-20 lg:px-16">
      <SectionTitle eyebrow="라이더 리뷰" title="라이더들의 진짜 이야기" align="center" className="mx-auto mb-12" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {REVIEWS.map((review) => (
          <div key={review.handle} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex gap-0.5 text-neon">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-neon" />
              ))}
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-300">“{review.text}”</p>
            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-white">{review.name}</p>
                <p className="text-gray-500">{review.handle}</p>
              </div>
              <p className="text-gray-500">누적 좋아요 {review.likes}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
