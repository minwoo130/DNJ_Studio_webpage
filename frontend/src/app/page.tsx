import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import RealReview from "@/components/RealReview";
import { fetchProducts } from "@/lib/products-api";
import { fetchNotices } from "@/lib/community-api";

function SectionHeading({
  title,
  subtitle,
  moreLabel,
  moreHref,
}: {
  title: string;
  subtitle?: string;
  moreLabel?: string;
  moreHref?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {moreLabel && (moreHref ? (
        <Link href={moreHref} className="text-xs text-gray-400 underline underline-offset-2">
          {moreLabel}
        </Link>
      ) : (
        <button className="text-xs text-gray-400 underline underline-offset-2">{moreLabel}</button>
      ))}
    </div>
  );
}

export default async function Home() {
  const [WEEKLY_BEST, NEW_ARRIVALS, NOTICES] = await Promise.all([
    fetchProducts({ section: "best", limit: 6 }),
    fetchProducts({ section: "new", limit: 6 }),
    fetchNotices(5),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Header overlay />

      <HeroBanner />

      <section className="mx-auto max-w-screen-lg px-4 pb-10 pt-20 sm:pb-14 sm:pt-28">
        <SectionHeading title="NOTICE" moreLabel="더보기" moreHref="/community/notice" />
        <ul className="divide-y divide-gray-100 text-sm text-gray-600">
          {NOTICES.length === 0 && <li className="py-2.5 text-gray-400">등록된 공지가 없습니다.</li>}
          {NOTICES.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-3 py-2.5">
              <Link href={`/community/notice/${n.id}`} className="truncate hover:text-black">
                {n.title}
              </Link>
              <span className="shrink-0 text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ProductSection
        title="WEEKLY BEST"
        subtitle="이번 주 가장 많이 팔린 상품"
        moreLabel="더보기"
        moreHref="/best"
        products={WEEKLY_BEST}
      />

      <ProductSection
        title="NEW ARRIVALS"
        subtitle="새로 들어온 신상품"
        moreLabel="더보기"
        moreHref="/new"
        products={NEW_ARRIVALS}
      />

      <section className="mx-auto max-w-screen-lg px-4 py-10 sm:py-14">
        <SectionHeading title="REAL REVIEW" moreLabel="구매후기 모두보기" moreHref="/community/review" />
        <RealReview />
      </section>

      <Footer />
    </main>
  );
}
