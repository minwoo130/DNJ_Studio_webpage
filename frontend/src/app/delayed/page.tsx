import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/products-api";

export default async function DelayedPage() {
  const products = await fetchProducts({ tag: "입고지연" });

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="text-center">
          <p className="text-xs font-semibold text-brand-red">NOTICE</p>
          <h1 className="mt-1 text-xl font-bold">입고지연 안내</h1>
          <p className="mt-2 text-sm text-gray-400">
            아래 상품은 입고가 지연되고 있어요. 배송 일정은 상품 상세 페이지에서 다시 안내드릴게요.
          </p>
        </div>
        <div className="mt-8">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">
              현재 입고지연 상품이 없습니다.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
