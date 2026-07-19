import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products-api";

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const products = await fetchProducts({ tag });

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="text-center">
          <p className="text-xs font-semibold text-brand-red">#{tag}</p>
          <h1 className="mt-1 text-xl font-bold">&quot;{tag}&quot; 태그 상품</h1>
        </div>
        <div className="mt-8">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">
              해당 태그의 상품이 아직 없습니다.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
