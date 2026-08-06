"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BOARD_LABELS, isBoardType, isForcedPrivateBoard, isNoticeLikeBoard } from "@/lib/community";
import MultiImageUpload from "@/components/MultiImageUpload";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function CommunityWritePage() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const boardType = isBoardType(params.type) ? params.type : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (boardType && isNoticeLikeBoard(boardType)) {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") ?? "null");
        if (!user?.isAdmin) {
          router.push(`/community/${boardType}`);
          return;
        }
      } catch {
        router.push(`/community/${boardType}`);
        return;
      }
    }
    setChecked(true);
  }, [boardType, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!boardType) return;
    setError(null);
    const forcedPrivate = isForcedPrivateBoard(boardType);
    const finalIsPrivate = forcedPrivate || isPrivate;
    const token = sessionStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/community/${boardType}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        isPrivate: finalIsPrivate,
        password: finalIsPrivate ? password : undefined,
        imageUrls,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "등록에 실패했습니다.");
      return;
    }
    const data = await res.json();
    router.push(`/community/${boardType}/${data.id}`);
  }

  if (!boardType || !checked) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">확인 중...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-md px-4 py-10">
        <h1 className="text-xl font-bold">{BOARD_LABELS[boardType]} 글쓰기</h1>

        {boardType === "review" ? (
          <div className="mt-10 py-10 text-center text-sm text-gray-400">
            리뷰는 구매하신 상품의 상세페이지에서 작성할 수 있어요.
            <div className="mt-3">
              <Link
                href="/best"
                className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white"
              >
                상품 보러가기
              </Link>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            required
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <textarea
            required
            rows={10}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          <MultiImageUpload images={imageUrls} onChange={setImageUrls} />

          {!isNoticeLikeBoard(boardType) && isForcedPrivateBoard(boardType) && (
            <div>
              <p className="text-sm text-gray-600">
                {BOARD_LABELS[boardType]}는 개인정보 보호를 위해 항상 비밀글로 등록됩니다.
              </p>
              <input
                type="password"
                required
                placeholder="비밀글 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          )}

          {!isNoticeLikeBoard(boardType) && !isForcedPrivateBoard(boardType) && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                비밀글로 작성 (비밀번호를 입력해야 볼 수 있어요)
              </label>
              {isPrivate && (
                <input
                  type="password"
                  required
                  placeholder="비밀글 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
              )}
            </div>
          )}

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <button type="submit" className="w-full rounded-md bg-black py-3 text-sm font-bold text-white">
            등록
          </button>
        </form>
        )}
      </section>
      <Footer />
    </main>
  );
}
