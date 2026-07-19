import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getCategorySubTags, type ProductCategory } from "@/data/products";
import { fetchProducts } from "@/lib/products-api";

const VALID_CATEGORIES: ProductCategory[] = ["OUTER", "TOP", "BOTTOM", "ACC"];

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category.toUpperCase() as ProductCategory;
  if (!VALID_CATEGORIES.includes(category)) notFound();

  const products = await fetchProducts({ category });
  const subTags = getCategorySubTags(category);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="text-center">
          <p className="text-xs font-semibold text-brand-red">CATEGORY</p>
          <h1 className="mt-1 text-xl font-bold">{category}</h1>
        </div>

        {subTags.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {subTags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:border-black hover:text-black"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">
              해당 카테고리의 상품이 아직 없습니다.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
