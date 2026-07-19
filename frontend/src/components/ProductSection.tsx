import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/data/products";

export default function ProductSection({
  title,
  subtitle,
  moreLabel,
  moreHref,
  products,
}: {
  title: string;
  subtitle?: string;
  moreLabel?: string;
  moreHref: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {moreLabel && (
          <Link href={moreHref} className="text-xs text-gray-400 underline underline-offset-2">
            {moreLabel}
          </Link>
        )}
      </div>

      <ProductGrid products={products} />

      <div className="mt-6 text-center">
        <Link
          href={moreHref}
          className="inline-block rounded-full border border-gray-300 px-8 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-black hover:text-black"
        >
          더보기
        </Link>
      </div>
    </section>
  );
}
