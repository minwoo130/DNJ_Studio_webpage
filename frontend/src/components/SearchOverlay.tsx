"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute left-0 top-0 w-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-screen-lg items-center gap-3 px-4 py-4"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-gray-400">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            autoFocus={open}
            placeholder="상품명, #해시태그로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white">
            검색
          </button>
          <button type="button" aria-label="닫기" className="text-2xl leading-none text-gray-400" onClick={onClose}>
            &times;
          </button>
        </form>
      </div>
    </div>
  );
}
