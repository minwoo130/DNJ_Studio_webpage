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
  imageUrl: string;
  detailContent: string;
  detailImages: string[];
  isWeeklyBest: boolean;
  isNewArrival: boolean;
  isSameDayShip: boolean;
  isDelayed: boolean;
  bestOrder: string;
  newOrder: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  price: "",
  originalPrice: "",
  badge: "",
  category: "TOP",
  subTags: [],
  imageUrl: "",
  detailContent: "",
  detailImages: [],
  isWeeklyBest: false,
  isNewArrival: false,
  isSameDayShip: false,
  isDelayed: false,
  bestOrder: "",
  newOrder: "",
};

const SAME_DAY_SHIP_TAG = "당일출발";
const DELAYED_TAG = "입고지연";

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [detailUploading, setDetailUploading] = useState(false);
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
      imageUrl: p.imageUrl ?? "",
      detailContent: p.detailContent ?? "",
      detailImages: p.detailImages ?? [],
      isWeeklyBest: p.isWeeklyBest ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isSameDayShip: p.tags.includes(SAME_DAY_SHIP_TAG),
      isDelayed: p.tags.includes(DELAYED_TAG),
      bestOrder: p.bestOrder != null ? String(p.bestOrder) : "",
      newOrder: p.newOrder != null ? String(p.newOrder) : "",
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

  async function handleDetailImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    setDetailUploading(true);
    setError(null);

    // 순차 업로드: 선택한 순서 그대로 배열 끝에 이어붙여야 화면에 위→아래로 그 순서대로 쌓임
    for (const file of files) {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch(`${API_URL}/api/products/upload`, {
        method: "POST",
        headers: authHeader(),
        body,
      });
      if (!res.ok) {
        setError(`"${file.name}" 업로드에 실패했습니다.`);
        continue;
      }
      const data = await res.json();
      setForm((f) => ({ ...f, detailImages: [...f.detailImages, data.url as string] }));
    }

    setDetailUploading(false);
  }

  function moveDetailImage(index: number, direction: -1 | 1) {
    setForm((f) => {
      const target = index + direction;
      if (target < 0 || target >= f.detailImages.length) return f;
      const next = [...f.detailImages];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, detailImages: next };
    });
  }

  function removeDetailImage(index: number) {
    setForm((f) => ({ ...f, detailImages: f.detailImages.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.price) {
      setError("상품명과 가격은 필수입니다.");
      return;
    }
    if (detailUploading) {
      setError("사진 업로드가 끝난 후 저장해주세요.");
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
          ...(form.isSameDayShip ? [SAME_DAY_SHIP_TAG] : []),
          ...(form.isDelayed ? [DELAYED_TAG] : []),
        ])
      ),
      imageUrl: form.imageUrl || null,
      detailContent: form.detailContent,
      detailImages: form.detailImages,
      isWeeklyBest: form.isWeeklyBest,
      isNewArrival: form.isNewArrival,
      bestOrder: form.isWeeklyBest && form.bestOrder ? Number(form.bestOrder) : null,
      newOrder: form.isNewArrival && form.newOrder ? Number(form.newOrder) : null,
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

  function availableOrders(field: "bestOrder" | "newOrder") {
    const used = new Set(
      (products ?? [])
        .filter((p) => p.id !== form.id)
        .map((p) => p[field])
        .filter((v): v is number => v != null)
    );
    return [1, 2, 3, 4, 5, 6].filter((n) => !used.has(n));
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

        <div className="col-span-2 flex flex-wrap items-center gap-4 sm:col-span-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isWeeklyBest}
              onChange={(e) => setForm((f) => ({ ...f, isWeeklyBest: e.target.checked }))}
            />
            BEST
          </label>
          {form.isWeeklyBest && (
            <select
              value={form.bestOrder}
              onChange={(e) => setForm((f) => ({ ...f, bestOrder: e.target.value }))}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="">순서 선택</option>
              {availableOrders("bestOrder").map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))}
            />
            NEW 5%
          </label>
          {form.isNewArrival && (
            <select
              value={form.newOrder}
              onChange={(e) => setForm((f) => ({ ...f, newOrder: e.target.value }))}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="">순서 선택</option>
              {availableOrders("newOrder").map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isSameDayShip}
              onChange={(e) => setForm((f) => ({ ...f, isSameDayShip: e.target.checked }))}
            />
            당일출발
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.isDelayed}
              onChange={(e) => setForm((f) => ({ ...f, isDelayed: e.target.checked }))}
            />
            입고지연
          </label>
        </div>
        <p className="col-span-2 -mt-2 text-[11px] text-gray-400 sm:col-span-4">
          BEST / NEW 5% 순서는 1~6 중에서 고를 수 있고(왼쪽부터 오름차순 노출), 상품마다 겹치지 않게 자동으로 이미 쓰인 번호는 목록에서 빠집니다. 순서를 정하지 않은 상품은 뒤로 밀려서 6개 안에 못 들 수 있어요.
        </p>

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

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">대표(썸네일) 이미지 — 목록/카드에 노출되는 사진 1장</p>
          <div className="flex items-center gap-3">
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
        </div>

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            상세 이미지 — 여러 장 선택 가능, 등록한 순서 그대로 상세페이지에 위→아래로 표시됩니다
          </p>
          <input type="file" accept="image/*" multiple onChange={handleDetailImagesChange} className="text-xs" />
          {detailUploading && <span className="ml-2 text-xs text-gray-400">사진 업로드 중...</span>}

          {form.detailImages.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {form.detailImages.map((url, index) => (
                <div key={url + index} className="flex items-center gap-3 rounded-md border border-gray-200 p-2">
                  <span className="w-5 shrink-0 text-center text-xs text-gray-400">{index + 1}</span>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImageUrl(url, form.id ?? 0)} alt={`상세 이미지 ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => moveDetailImage(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDetailImage(index, 1)}
                      disabled={index === form.detailImages.length - 1}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDetailImage(index)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-brand-red"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">상세 설명 (텍스트, 필요하면 사진도 자유 배치 가능)</p>
          <RichTextEditor
            value={form.detailContent}
            onChange={(html) => setForm((f) => ({ ...f, detailContent: html }))}
            onUploadingChange={setDetailUploading}
          />
        </div>

        {error && <p className="col-span-2 text-xs text-brand-red sm:col-span-4">{error}</p>}

        <div className="col-span-2 flex items-center gap-2 sm:col-span-4">
          <button
            type="submit"
            disabled={detailUploading}
            className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {form.id ? "수정 저장" : "등록"}
          </button>
          {detailUploading && <span className="text-xs text-gray-400">사진 업로드가 끝나면 저장할 수 있어요...</span>}
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
                {p.isWeeklyBest ? ` · BEST${p.bestOrder != null ? `(${p.bestOrder})` : ""}` : ""}
                {p.isNewArrival ? ` · NEW 5%${p.newOrder != null ? `(${p.newOrder})` : ""}` : ""}
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
