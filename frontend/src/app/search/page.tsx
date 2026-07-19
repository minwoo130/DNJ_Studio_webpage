"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/data/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const res = await fetch(`${API_URL}/api/products?q=${encodeURIComponent(q)}`);
    setProducts(res.ok ? await res.json() : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    runSearch(query);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-2">
          <input
            type="text"
            autoFocus
            placeholder="상품명, #해시태그로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-bold text-white"
          >
            검색
          </button>
        </form>

        <div className="mt-8">
          {loading && <p className="py-10 text-center text-sm text-gray-400">검색 중...</p>}
          {!loading && searched && products.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">검색 결과가 없습니다.</p>
          )}
          {!loading && products.length > 0 && <ProductGrid products={products} />}
        </div>
      </section>
      <Footer />
    </main>
  );
}
