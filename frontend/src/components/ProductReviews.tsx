"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resolveImageUrl } from "@/lib/image";
import { maskName } from "@/lib/mask";
import MultiImageUpload from "@/components/MultiImageUpload";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Review = {
  id: number;
  title: string;
  content?: string;
  authorName: string;
  authorIsAdmin?: boolean;
  rating?: number;
  imageUrls?: string[];
  createdAt: string;
};

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n}점`}
          className={`text-xl leading-none ${n <= value ? "text-brand-orange" : "text-gray-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: number }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/community/review?productId=${productId}&limit=50`);
    if (!res.ok) return;
    const data = await res.json();
    setReviews(data.posts);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let admin = false;
    try {
      admin = Boolean(JSON.parse(sessionStorage.getItem("user") ?? "null")?.isAdmin);
    } catch {
      admin = false;
    }
    setIsAdmin(admin);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setCheckedAccess(true);
      return;
    }
    if (admin) {
      setCanWrite(true);
      setCheckedAccess(true);
      return;
    }
    fetch(`${API_URL}/api/orders/purchased/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { purchased: false }))
      .then((data) => setCanWrite(Boolean(data.purchased)))
      .finally(() => setCheckedAccess(true));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!content.trim()) return;

    const res = await fetch(`${API_URL}/api/community/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: content.trim().slice(0, 60),
        content: content.trim(),
        rating,
        productId,
        imageUrls,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "리뷰 등록에 실패했습니다.");
      return;
    }
    setContent("");
    setRating(5);
    setImageUrls([]);
    load();
  }

  return (
    <section className="mt-4">
      <h2 className="text-sm font-bold">상품 리뷰 {reviews ? `(${reviews.length})` : ""}</h2>

      {checkedAccess && canWrite && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-md border border-gray-100 p-3">
          <StarInput value={rating} onChange={setRating} />
          <textarea
            rows={3}
            placeholder="이 상품에 대한 후기를 남겨주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <MultiImageUpload images={imageUrls} onChange={setImageUrls} />
          {error && <p className="text-xs text-brand-red">{error}</p>}
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white">
            리뷰 등록
          </button>
        </form>
      )}

      {checkedAccess && !canWrite && (
        <p className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-center text-xs text-gray-400">
          이 상품을 구매한 회원만 리뷰를 작성할 수 있어요.
        </p>
      )}

      <div className="mt-4 divide-y divide-gray-100">
        {reviews === null && <p className="py-8 text-center text-xs text-gray-400">불러오는 중...</p>}
        {reviews?.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">아직 등록된 리뷰가 없습니다.</p>
        )}
        {reviews?.map((r) => (
          <div key={r.id} className="py-3">
            {r.rating !== undefined && (
              <p className="text-xs text-brand-orange">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>
            )}
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{r.content ?? r.title}</p>
            {r.imageUrls && r.imageUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {r.imageUrls.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setLightbox(resolveImageUrl(url, productId))}
                    className="relative aspect-square w-16 shrink-0 overflow-hidden rounded bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImageUrl(url, productId)} alt="리뷰 사진" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-xs text-gray-400">
              {r.authorIsAdmin ? r.authorName : maskName(r.authorName)} ·{" "}
              {new Date(r.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>
        ))}
      </div>

      <Link
        href={`/community/review?productId=${productId}`}
        className="mt-3 block text-center text-xs text-gray-400 underline underline-offset-2"
      >
        리뷰 게시판에서 보기
      </Link>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="닫기"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 text-3xl leading-none text-white"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="리뷰 사진 확대"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
