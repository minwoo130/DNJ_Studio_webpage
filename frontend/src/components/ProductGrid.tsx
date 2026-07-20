"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function mileage(price: number) {
  return Math.round(price * 0.025);
}

function discountRate(price: number, originalPrice?: number) {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((items: { id: number }[]) => setWishlisted(new Set(items.map((i) => i.id))))
      .catch(() => {});
  }, []);

  async function toggleWishlist(e: React.MouseEvent, productId: number) {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const isWishlisted = wishlisted.has(productId);
    const next = new Set(wishlisted);
    if (isWishlisted) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    setWishlisted(next);

    await fetch(`${API_URL}/api/wishlist${isWishlisted ? `/${productId}` : ""}`, {
      method: isWishlisted ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isWishlisted ? {} : { "Content-Type": "application/json" }),
      },
      body: isWishlisted ? undefined : JSON.stringify({ productId }),
    });
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {products.map((p) => {
        const rate = discountRate(p.price, p.originalPrice);
        const isWishlisted = wishlisted.has(p.id);
        return (
          <Link key={p.id} href={`/products/${p.id}`} className="group block">
            <article>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(p.imageUrl, p.id)}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {p.badge && (
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-bold text-white sm:text-sm ${
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
                  onClick={(e) => toggleWishlist(e, p.id)}
                  className={`absolute right-2 top-2 text-lg drop-shadow sm:text-xl ${
                    isWishlisted ? "text-brand-red" : "text-white"
                  }`}
                >
                  {isWishlisted ? "♥" : "♡"}
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <p className="truncate text-sm text-gray-800 sm:text-base">{p.name}</p>
                <div className="flex items-baseline gap-2">
                  {rate && (
                    <span className="text-base font-bold text-brand-red sm:text-lg">{rate}%</span>
                  )}
                  <span className="text-base font-bold sm:text-lg">{p.price.toLocaleString()}원</span>
                  {p.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {p.originalPrice.toLocaleString()}원
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  적립금 {mileage(p.price).toLocaleString()}원 (2.5%)
                </p>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
