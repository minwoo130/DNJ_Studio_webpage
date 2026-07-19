"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/image";
import { maskName } from "@/lib/mask";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const POLL_INTERVAL_MS = 20000;

type Review = {
  id: number;
  title: string;
  content?: string;
  authorName: string;
  authorIsAdmin?: boolean;
  rating?: number;
  productId?: number;
  productName?: string;
  productImageUrl?: string;
  imageUrl?: string;
  createdAt: string;
};

export default function RealReview() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch(`${API_URL}/api/community/review?limit=10`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setReviews(data.posts);
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (reviews === null) {
    return <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>;
  }

  if (reviews.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">아직 등록된 후기가 없습니다.</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {reviews.map((r) => {
        const photo = r.imageUrl
          ? resolveImageUrl(r.imageUrl, r.productId ?? 0)
          : r.productId
            ? resolveImageUrl(r.productImageUrl, r.productId)
            : "/logo.png";

        return (
          <Link
            key={r.id}
            href={r.productId ? `/products/${r.productId}` : `/community/review/${r.id}`}
            className="w-40 shrink-0 rounded-md border border-gray-100 transition-shadow hover:shadow-md sm:w-48"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-t-md bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={r.productName ?? r.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-3">
              {r.rating !== undefined && (
                <p className="text-xs text-brand-orange">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
              )}
              {r.productName && (
                <p className="mt-1 truncate text-xs font-semibold text-gray-500">{r.productName}</p>
              )}
              <p className="mt-1 line-clamp-2 text-sm text-gray-700">{r.content ?? r.title}</p>
              <p className="mt-1.5 text-xs text-gray-400">
                {r.authorIsAdmin ? r.authorName : maskName(r.authorName)} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
