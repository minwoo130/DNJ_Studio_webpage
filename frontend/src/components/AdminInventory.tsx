"use client";

import { useEffect, useState } from "react";
import type { Product, ProductBadge, ProductCategory } from "@/data/products";
import { getCategorySubTags } from "@/data/products";
import { resolveImageUrl } from "@/lib/image";
import RichTextEditor from "@/components/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const CATEGORIES: ProductCategory[] = ["OUTER", "TOP", "BOTTOM", "ACC"];
const BADGES: ProductBadge[] = ["NEW", "SALE", "1+1", "추천"];

type FormState = {
  id: number | null;
  name: string;
  price: string;
  originalPrice: string;
  badge: string;
  category: ProductCategory;
  subTags: string[];
  tags: string;
  imageUrl: string;
  detailContent: string;
  isWeeklyBest: boolean;
  isNewArrival: boolean;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  price: "",
  originalPrice: "",
  badge: "",
  category: "TOP",
  subTags: [],
  tags: "",
  imageUrl: "",
  detailContent: "",
  isWeeklyBest: false,
  isNewArrival: false,
};

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then(setProducts);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: Product) {
    const subOptions = getCategorySubTags(p.category);
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      badge: p.badge ?? "",
      category: p.category,
      subTags: p.tags.filter((t) => subOptions.includes(t)),
      tags: p.tags.filter((t) => !subOptions.includes(t)).join(", "),
      imageUrl: p.imageUrl ?? "",
      detailContent: p.detailContent ?? "",
      isWeeklyBest: p.isWeeklyBest ?? false,
      isNewArrival: p.isNewArrival ?? false,
    });
    setError(null);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("image", file);
    const res = await fetch(`${API_URL}/api/products/upload`, {
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
    setForm((f) => ({ ...f, imageUrl: data.url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.price) {
      setError("상품명과 가격은 필수입니다.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      badge: form.badge || null,
      category: form.category,
      tags: Array.from(
        new Set([
          ...form.subTags,
          ...form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ])
      ),
      imageUrl: form.imageUrl || null,
      detailContent: form.detailContent,
      isWeeklyBest: form.isWeeklyBest,
      isNewArrival: form.isNewArrival,
    };

    const url = form.id ? `${API_URL}/api/products/${form.id}` : `${API_URL}/api/products`;
    const res = await fetch(url, {
      method: form.id ? "PUT" : "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "저장에 실패했습니다.");
      return;
    }

    setForm(emptyForm);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("상품을 삭제할까요?")) return;
    await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE", headers: authHeader() });
    load();
  }

  return (
    <div className="py-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-md border border-gray-100 p-4 sm:grid-cols-4">
        <h3 className="col-span-2 text-sm font-bold sm:col-span-4">
          {form.id ? `상품 수정 (#${form.id})` : "새 상품 등록"}
        </h3>

        <input
          placeholder="상품명"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={form.category}
          onChange={(e) => {
            const category = e.target.value as ProductCategory;
            setForm((f) => ({
              ...f,
              category,
              subTags: f.subTags.filter((t) => getCategorySubTags(category).includes(t)),
            }));
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={form.badge}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">배지 없음</option>
          {BADGES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {getCategorySubTags(form.category).length > 0 && (
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-1.5 text-xs font-semibold text-gray-500">세부 카테고리 (선택, 여러 개 가능)</p>
            <div className="flex flex-wrap gap-1.5">
              {getCategorySubTags(form.category).map((t) => {
                const active = form.subTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        subTags: active ? f.subTags.filter((x) => x !== t) : [...f.subTags, t],
                      }))
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      active ? "border-black bg-black text-white" : "border-gray-300 text-gray-500 hover:border-black"
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="col-span-2 flex items-center gap-4 sm:col-span-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isWeeklyBest}
              onChange={(e) => setForm((f) => ({ ...f, isWeeklyBest: e.target.checked }))}
            />
            WEEKLY BEST 노출
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))}
            />
            NEW ARRIVALS 노출
          </label>
        </div>

        <input
          type="number"
          placeholder="판매가"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="정가(할인 전, 선택)"
          value={form.originalPrice}
          onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="추가 태그 (쉼표로 구분, 예: 입고지연)"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="col-span-2 flex items-center gap-3 sm:col-span-4">
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs" />
          {uploading && <span className="text-xs text-gray-400">업로드 중...</span>}
          {form.imageUrl && (
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(form.imageUrl, form.id ?? 0)}
                alt="미리보기"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">상세페이지 (텍스트 + 사진 자유 배치)</p>
          <RichTextEditor
            value={form.detailContent}
            onChange={(html) => setForm((f) => ({ ...f, detailContent: html }))}
          />
        </div>

        {error && <p className="col-span-2 text-xs text-brand-red sm:col-span-4">{error}</p>}

        <div className="col-span-2 flex gap-2 sm:col-span-4">
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white">
            {form.id ? "수정 저장" : "등록"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-md border border-gray-300 px-4 py-2 text-xs text-gray-500"
            >
              취소
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 divide-y divide-gray-100 border-t border-gray-200">
        {products === null && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
        {products?.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-3">
            <div className="relative aspect-[3/4] w-11 shrink-0 overflow-hidden rounded bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(p.imageUrl, p.id)}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-gray-400">
                {p.category} · {p.price.toLocaleString()}원{p.badge ? ` · ${p.badge}` : ""}
              </p>
            </div>
            <button onClick={() => startEdit(p)} className="text-xs text-gray-400 underline underline-offset-2">
              수정
            </button>
            <button onClick={() => handleDelete(p.id)} className="text-xs text-gray-400 underline underline-offset-2">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
