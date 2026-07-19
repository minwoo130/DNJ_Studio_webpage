"use client";

import { useState } from "react";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const MAX_IMAGES = 5;

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function MultiImageUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (images.length >= MAX_IMAGES) {
      setError(`사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.`);
      return;
    }

    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`${API_URL}/api/community/upload`, {
      method: "POST",
      headers: authHeader(),
      body,
    });
    setUploading(false);
    if (!res.ok) {
      setError("이미지 업로드에 실패했습니다.");
      return;
    }
    const data = await res.json();
    onChange([...images, data.url]);
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImageUrl(url, 0)} alt={`첨부사진 ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              aria-label="삭제"
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      {images.length < MAX_IMAGES && (
        <div className="mt-2 flex items-center gap-2">
          <input type="file" accept="image/*" onChange={handleAdd} className="text-xs" />
          <span className="text-xs text-gray-400">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>
      )}
      {uploading && <p className="mt-1 text-xs text-gray-400">업로드 중...</p>}
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
}
