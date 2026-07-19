import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProductBrowser from "@/components/CategoryProductBrowser";
import { fetchProducts } from "@/lib/products-api";

export default async function BestPage() {
  const products = await fetchProducts({ section: "best" });

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="text-center">
          <p className="text-xs font-semibold text-brand-red">BEST</p>
          <h1 className="mt-1 text-xl font-bold">베스트 상품</h1>
          <p className="mt-2 text-sm text-gray-400">가장 많이 팔린 상품을 모았어요</p>
        </div>
        <div className="mt-8">
          <CategoryProductBrowser products={products} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
