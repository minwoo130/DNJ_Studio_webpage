import Image from "next/image";
import Header from "@/components/Header";

const NOTICES = [
  "[공지] 2026년 8월 배송 일정 안내",
  "[이벤트] 신규가입 시 3,000원 쿠폰 즉시 지급",
  "[안내] 여름 신상품 입고 지연 관련 공지",
];

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: "NEW" | "SALE" | "1+1" | "추천";
  sold?: string;
};

const WEEKLY_BEST: Product[] = [
  { id: 1, name: "오버핏 울 코트", price: 89000, badge: "추천", sold: "누적 1,200장" },
  { id: 2, name: "크롭 니트 가디건", price: 39000, originalPrice: 52000, badge: "SALE" },
  { id: 3, name: "와이드 슬랙스", price: 35000, sold: "누적 3,000장" },
  { id: 4, name: "베이직 반팔 티셔츠", price: 19000, badge: "1+1" },
  { id: 5, name: "미니멀 크로스백", price: 45000 },
  { id: 6, name: "체크 머플러", price: 22000, badge: "NEW" },
];

const NEW_ARRIVALS: Product[] = [
  { id: 4, name: "베이직 반팔 티셔츠", price: 19000, badge: "NEW" },
  { id: 5, name: "미니멀 크로스백", price: 45000, badge: "NEW" },
  { id: 6, name: "체크 머플러", price: 22000, badge: "NEW" },
  { id: 1, name: "오버핏 울 코트", price: 89000, badge: "NEW" },
  { id: 2, name: "크롭 니트 가디건", price: 39000, originalPrice: 52000, badge: "NEW" },
  { id: 3, name: "와이드 슬랙스", price: 35000, badge: "NEW" },
];

const REVIEWS = [
  { id: 1, name: "김**", rating: 5, text: "핏도 예쁘고 배송도 빨라요! 재구매 의사 100%" },
  { id: 2, name: "이**", rating: 5, text: "생각보다 원단이 좋아서 놀랐어요. 사이즈도 잘 맞아요." },
  { id: 3, name: "박**", rating: 4, text: "색감이 화면이랑 거의 똑같이 나와서 만족합니다." },
];

function mileage(price: number) {
  return Math.round(price * 0.025);
}

function discountRate(price: number, originalPrice?: number) {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const rate = discountRate(p.price, p.originalPrice);
        return (
          <article key={`${p.id}-${p.name}`} className="group">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100">
              <Image
                src={`/products/${p.id}.jpg`}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {p.badge && (
                <span
                  className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[11px] font-bold text-white ${
                    p.badge === "NEW" || p.badge === "추천"
                      ? "bg-brand-orange"
                      : "bg-brand-red"
                  }`}
                >
                  {p.badge}
                </span>
              )}
              <button
                aria-label="위시리스트 추가"
                className="absolute right-2 top-2 text-white drop-shadow"
              >
                ♡
              </button>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="truncate text-sm text-gray-800">{p.name}</p>
              <div className="flex items-baseline gap-1.5">
                {rate && (
                  <span className="text-sm font-bold text-brand-red">{rate}%</span>
                )}
                <span className="text-sm font-bold">{p.price.toLocaleString()}원</span>
                {p.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {p.originalPrice.toLocaleString()}원
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                적립금 {mileage(p.price).toLocaleString()}원 (2.5%)
              </p>
              {p.sold && <p className="text-[11px] text-gray-400">{p.sold}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  moreLabel,
}: {
  title: string;
  subtitle?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {moreLabel && (
        <button className="text-xs text-gray-400 underline underline-offset-2">
          {moreLabel}
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="flex aspect-[4/3] items-end bg-gray-100 px-4 py-6 sm:aspect-[16/6]">
        <div>
          <p className="text-xs font-semibold text-brand-red">NEW ARRIVAL</p>
          <h1 className="mt-1 text-2xl font-bold">2026 여름 신상 입고</h1>
        </div>
      </section>

      <section className="mx-auto max-w-screen-lg px-4 py-6">
        <SectionHeading title="NOTICE" moreLabel="더보기" />
        <ul className="divide-y divide-gray-100 text-sm text-gray-600">
          {NOTICES.map((n) => (
            <li key={n} className="py-2.5">
              {n}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-screen-lg px-4 py-6">
        <SectionHeading title="WEEKLY BEST" subtitle="이번 주 가장 많이 팔린 상품" moreLabel="더보기" />
        <ProductGrid products={WEEKLY_BEST} />
      </section>

      <section className="mx-auto max-w-screen-lg px-4 py-6">
        <SectionHeading title="NEW ARRIVALS" subtitle="새로 들어온 신상품" moreLabel="더보기 (1/1)" />
        <ProductGrid products={NEW_ARRIVALS} />
      </section>

      <section className="mx-auto max-w-screen-lg px-4 py-6">
        <SectionHeading title="REAL REVIEW" moreLabel="실시간 리뷰 모두 보기" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.id} className="rounded-md border border-gray-100 p-3">
              <p className="text-xs text-brand-orange">{"★".repeat(r.rating)}</p>
              <p className="mt-1.5 line-clamp-3 text-sm text-gray-700">{r.text}</p>
              <p className="mt-2 text-xs text-gray-400">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-4 py-8 text-xs leading-relaxed text-gray-400">
        <nav className="mb-4 flex gap-3 text-gray-600">
          <a href="#">Home</a>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">고객센터</a>
        </nav>
        <p className="font-semibold text-gray-600">DNJ STUDIO</p>
        <p className="mt-2">
          상호명: DNJ STUDIO&nbsp;&nbsp;|&nbsp;&nbsp;대표자: 이동화
          <br />
          사업장주소: 서울 노원구 월계동 911-8 301
          <br />
          사업자등록번호: 605-32-32593
          <br />
          대표자 이메일: ldh09069674@gmail.com
        </p>
        <p className="mt-4">&copy; 2026 DNJ studio. All rights reserved.</p>
      </footer>
    </main>
  );
}
