import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BestPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10 text-center">
        <p className="text-xs font-semibold text-brand-red">BEST</p>
        <h1 className="mt-1 text-xl font-bold">베스트 상품</h1>
        <p className="mt-4 text-sm text-gray-400">
          상품 목록은 백엔드 연동 후 노출됩니다. (준비중)
        </p>
      </section>
      <Footer />
    </main>
  );
}
