"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import type { Product, ProductCategory } from "@/data/products";

const CATEGORIES: ("ALL" | ProductCategory)[] = ["ALL", "OUTER", "TOP", "BOTTOM", "ACC"];

export default function CategoryProductBrowser({ products }: { products: Product[] }) {
  const [active, setActive] = useState<"ALL" | ProductCategory>("ALL");
  const filtered = active === "ALL" ? products : products.filter((p) => p.category === active);

  return (
    <>
      <div className="mb-6 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              active === c
                ? "border-black bg-black text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ProductGrid products={filtered} />
    </>
  );
}
