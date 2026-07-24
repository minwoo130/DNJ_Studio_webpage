"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BOARD_LABELS, isBoardType, type BoardType } from "@/lib/community";
import { resolveImageUrl } from "@/lib/image";
import { maskName } from "@/lib/mask";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type PostListItem = {
  id: number;
  title: string;
  authorName: string;
  authorIsAdmin?: boolean;
  isPrivate: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  productId?: number;
  productName?: string;
  productImageUrl?: string;
};

export default function CommunityListPage() {
  return (
    <Suspense fallback={null}>
      <CommunityListPageInner />
    </Suspense>
  );
}

function CommunityListPageInner() {
  const params = useParams<{ type: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardType = isBoardType(params.type) ? params.type : null;
  const productId = searchParams.get("productId");

  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const limit = 20;

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") ?? "null");
      setIsAdmin(Boolean(user?.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (!boardType) return;
    setPosts(null);
    const productFilter = productId ? `&productId=${productId}` : "";
    fetch(`${API_URL}/api/community/${boardType}?page=${page}${productFilter}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setTotal(data.total);
      });
  }, [boardType, page, productId]);

  if (!boardType) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">존재하지 않는 게시판입니다.</div>
        <Footer />
      </main>
    );
  }

  const canWrite = boardType !== "notice" || isAdmin;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <h1 className="text-xl font-bold">Community</h1>

        <div className="mt-6 flex gap-2 border-b border-gray-100">
          {(Object.keys(BOARD_LABELS) as BoardType[]).map((type) => (
            <button
              key={type}
              onClick={() => router.push(`/community/${type}`)}
              className={`px-4 py-2.5 text-sm font-semibold ${
                type === boardType ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"
              }`}
            >
              {BOARD_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          {canWrite && (
            <Link
              href={`/community/${boardType}/write`}
              className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white"
            >
              글쓰기
            </Link>
          )}
        </div>

        <div className="mt-2 divide-y divide-gray-100 border-t border-gray-200">
          {posts === null && <p className="py-16 text-center text-sm text-gray-400">불러오는 중...</p>}
          {posts !== null && posts.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-400">등록된 게시글이 없습니다.</p>
          )}
          {posts?.map((post) => (
            <Link
              key={post.id}
              href={`/community/${boardType}/${post.id}`}
              className="flex items-center justify-between gap-3 py-4 hover:bg-gray-50"
            >
              {boardType === "review" && post.productId && (
                <div className="relative aspect-square w-11 shrink-0 overflow-hidden rounded bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(post.productImageUrl, post.productId)}
                    alt={post.productName ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {boardType === "review" && post.productName && (
                  <p className="truncate text-xs font-semibold text-gray-500">{post.productName}</p>
                )}
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm font-medium">
                  {post.isPrivate && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-gray-400">
                      <rect x="5" y="11" width="14" height="9" rx="1.5" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
                    </svg>
                  )}
                  {post.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {post.authorIsAdmin ? post.authorName : maskName(post.authorName)} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")} · 조회 {post.viewCount}
                  {post.commentCount > 0 ? ` · 댓글 ${post.commentCount}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded text-xs ${
                  p === page ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
