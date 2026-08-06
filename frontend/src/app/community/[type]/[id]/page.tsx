"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BOARD_LABELS, isBoardType, isNoticeLikeBoard } from "@/lib/community";
import { resolveImageUrl } from "@/lib/image";
import { maskName } from "@/lib/mask";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Comment = {
  id: number;
  content: string;
  authorName: string;
  authorId: number;
  authorIsAdmin?: boolean;
  createdAt: string;
  isOwner: boolean;
};

type PostDetail = {
  id: number;
  boardType: string;
  title: string;
  content: string;
  authorName: string;
  authorId: number;
  authorIsAdmin?: boolean;
  isPrivate: boolean;
  viewCount: number;
  imageUrls?: string[];
  createdAt: string;
  isOwner: boolean;
  comments: Comment[];
};

export default function CommunityDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const boardType = isBoardType(params.type) ? params.type : null;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") ?? "null");
      setIsAdmin(Boolean(user?.isAdmin));
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const authHeader = useCallback(() => {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const load = useCallback(async () => {
    if (!boardType) return;
    const res = await fetch(`${API_URL}/api/community/${boardType}/${params.id}`, {
      headers: authHeader(),
    });
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (res.status === 403) {
      const data = await res.json();
      setForbidden(data.error);
      setHasPassword(Boolean(data.hasPassword));
      return;
    }
    setForbidden(null);
    setPost(await res.json());
  }, [boardType, params.id, authHeader]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!boardType || !unlockPassword.trim()) return;
    setUnlockError(null);
    const res = await fetch(`${API_URL}/api/community/${boardType}/${params.id}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: unlockPassword }),
    });
    if (!res.ok) {
      const data = await res.json();
      setUnlockError(data.error ?? "비밀번호가 일치하지 않습니다.");
      return;
    }
    setForbidden(null);
    setPost(await res.json());
  }

  async function handleDeletePost() {
    if (!boardType || !confirm("게시글을 삭제할까요?")) return;
    const res = await fetch(`${API_URL}/api/community/${boardType}/${params.id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (res.ok) router.push(`/community/${boardType}`);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const headers = authHeader();
    if (!headers) {
      router.push("/login");
      return;
    }
    const res = await fetch(`${API_URL}/api/community/${boardType}/${params.id}/comments`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      setCommentText("");
      load();
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm("댓글을 삭제할까요?")) return;
    await fetch(`${API_URL}/api/community/${boardType}/${params.id}/comments/${commentId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    load();
  }

  if (!boardType || notFound) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">게시글을 찾을 수 없습니다.</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <Link href={`/community/${boardType}`} className="text-xs text-gray-400 underline underline-offset-2">
          ← {BOARD_LABELS[boardType]} 목록으로
        </Link>

        {forbidden && (
          <div className="mt-10 flex flex-col items-center gap-3 py-16 text-center text-sm text-gray-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gray-300">
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
            </svg>
            {forbidden}

            {hasPassword && (
              <form onSubmit={handleUnlock} className="mt-2 flex gap-2">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
                <button type="submit" className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white">
                  확인
                </button>
              </form>
            )}
            {unlockError && <p className="text-xs text-brand-red">{unlockError}</p>}
          </div>
        )}

        {!forbidden && post && (
          <>
            <div className="mt-4 border-b border-gray-200 pb-4">
              <h1 className="flex items-center gap-1.5 text-lg font-bold">
                {post.isPrivate && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 shrink-0 text-gray-400">
                    <rect x="5" y="11" width="14" height="9" rx="1.5" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
                  </svg>
                )}
                {post.title}
              </h1>
              <p className="mt-2 text-xs text-gray-400">
                {post.authorIsAdmin ? post.authorName : maskName(post.authorName)} ·{" "}
                {new Date(post.createdAt).toLocaleDateString("ko-KR")} · 조회 {post.viewCount}
              </p>
            </div>

            <div className="whitespace-pre-wrap py-8 text-sm leading-relaxed">{post.content}</div>

            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-8">
                {post.imageUrls.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setLightbox(resolveImageUrl(url, 0))}
                    className="relative aspect-square w-24 shrink-0 overflow-hidden rounded bg-gray-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImageUrl(url, 0)} alt={`첨부사진 ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {(post.isOwner || isAdmin) && (
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 text-xs">
                {post.isOwner && (
                  <Link href={`/community/${boardType}/${post.id}/edit`} className="text-gray-400 underline underline-offset-2">
                    수정
                  </Link>
                )}
                <button onClick={handleDeletePost} className="text-gray-400 underline underline-offset-2">
                  삭제
                </button>
              </div>
            )}

            {!isNoticeLikeBoard(boardType) && (
              <div className="mt-8">
                <h2 className="text-sm font-bold">댓글 {post.comments.length}</h2>
                <div className="mt-3 divide-y divide-gray-100">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          {c.authorIsAdmin ? c.authorName : maskName(c.authorName)}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      {(c.isOwner || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="shrink-0 text-[11px] text-gray-400 underline underline-offset-2"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                  {post.comments.length === 0 && (
                    <p className="py-6 text-center text-xs text-gray-400">첫 댓글을 남겨보세요.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                  <button type="submit" className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white">
                    등록
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </section>

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
            alt="첨부사진 확대"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </main>
  );
}
