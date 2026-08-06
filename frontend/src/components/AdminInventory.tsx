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
  summary: string;
  badge: string;
  category: ProductCategory;
  subTags: string[];
  imageUrls: string[];
  detailContent: string;
  detailImages: string[];
  isWeeklyBest: boolean;
  isNewArrival: boolean;
  isSameDayShip: boolean;
  isDelayed: boolean;
  bestOrder: string;
  newOrder: string;
  colors: string[];
  sizes: string[];
  heroSlot: "" | "new_arrival" | "best_item";
  relatedProductIds: number[];
};

const emptyForm: FormState = {
  id: null,
  name: "",
  price: "",
  originalPrice: "",
  summary: "",
  badge: "",
  category: "TOP",
  subTags: [],
  imageUrls: [],
  detailContent: "",
  detailImages: [],
  isWeeklyBest: false,
  isNewArrival: false,
  isSameDayShip: false,
  isDelayed: false,
  bestOrder: "",
  newOrder: "",
  colors: [],
  sizes: [],
  heroSlot: "",
  relatedProductIds: [],
};

const SAME_DAY_SHIP_TAG = "당일출발";
const DELAYED_TAG = "입고지연";
const MAX_THUMBNAIL_IMAGES = 3;

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function OptionListEditor({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value || values.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  }

  return (
    <div className="col-span-2 sm:col-span-2">
      <p className="mb-1.5 text-xs font-semibold text-gray-500">{label} (설정하지 않으면 상세페이지에 노출되지 않습니다)</p>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-black"
        >
          추가
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`${v} 삭제`}
                className="text-gray-400 hover:text-brand-red"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProductPicker({
  allProducts,
  excludeId,
  selectedIds,
  onChange,
}: {
  allProducts: Product[];
  excludeId: number | null;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const candidates = allProducts.filter((p) => p.id !== excludeId && !selectedIds.includes(p.id));
  const selectedProducts = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  function add() {
    const id = Number(draft);
    if (!id || selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setDraft("");
  }

  return (
    <div className="col-span-2 sm:col-span-4">
      <p className="mb-1.5 text-xs font-semibold text-gray-500">
        연관 상품 — 서로의 상세페이지에 함께 노출됩니다 (바로구매 버튼 아래)
      </p>
      <div className="flex gap-1.5">
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">상품 선택...</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-black"
        >
          추가
        </button>
      </div>
      {selectedProducts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedProducts.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600"
            >
              {p.name}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== p.id))}
                aria-label={`${p.name} 삭제`}
                className="text-gray-400 hover:text-brand-red"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
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
      summary: p.summary ?? "",
      badge: p.badge ?? "",
      category: p.category,
      subTags: p.tags.filter((t) => subOptions.includes(t)),
      imageUrls: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [],
      detailContent: p.detailContent ?? "",
      detailImages: p.detailImages ?? [],
      isWeeklyBest: p.isWeeklyBest ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isSameDayShip: p.tags.includes(SAME_DAY_SHIP_TAG),
      isDelayed: p.tags.includes(DELAYED_TAG),
      bestOrder: p.bestOrder != null ? String(p.bestOrder) : "",
      newOrder: p.newOrder != null ? String(p.newOrder) : "",
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      heroSlot: p.heroSlot ?? "",
      relatedProductIds: p.relatedProductIds ?? [],
    });
    setError(null);
  }

  async function handleThumbnailImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const remaining = MAX_THUMBNAIL_IMAGES - form.imageUrls.length;
    if (remaining <= 0) {
      setError(`대표 이미지는 최대 ${MAX_THUMBNAIL_IMAGES}장까지 등록할 수 있습니다.`);
      return;
    }

    setUploading(true);
    setError(null);

    for (const file of files.slice(0, remaining)) {
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
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, data.url as string] }));
    }

    setUploading(false);
  }

  function moveThumbnailImage(index: number, direction: -1 | 1) {
    setForm((f) => {
      const target = index + direction;
      if (target < 0 || target >= f.imageUrls.length) return f;
      const next = [...f.imageUrls];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, imageUrls: next };
    });
  }

  function removeThumbnailImage(index: number) {
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));
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
      summary: form.summary.trim() || null,
      badge: form.badge || null,
      category: form.category,
      tags: Array.from(
        new Set([
          ...form.subTags,
          ...(form.isSameDayShip ? [SAME_DAY_SHIP_TAG] : []),
          ...(form.isDelayed ? [DELAYED_TAG] : []),
        ])
      ),
      imageUrls: form.imageUrls,
      detailContent: form.detailContent,
      detailImages: form.detailImages,
      isWeeklyBest: form.isWeeklyBest,
      isNewArrival: form.isNewArrival,
      bestOrder: form.isWeeklyBest && form.bestOrder ? Number(form.bestOrder) : null,
      newOrder: form.isNewArrival && form.newOrder ? Number(form.newOrder) : null,
      colors: form.colors,
      sizes: form.sizes,
      heroSlot: form.heroSlot || null,
      relatedProductIds: form.relatedProductIds,
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

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            메인페이지 히어로 배너 연결 — 슬롯당 상품 1개만 연결되며, 새로 지정하면 기존 연결은 자동 해제됩니다
          </p>
          <select
            value={form.heroSlot}
            onChange={(e) => setForm((f) => ({ ...f, heroSlot: e.target.value as FormState["heroSlot"] }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">연결 안함</option>
            <option value="new_arrival">2026 S/S NEW ARRIVAL 배너에 연결</option>
            <option value="best_item">2026 S/S BEST ITEM 배너에 연결</option>
          </select>
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

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            한줄 소개 — 상세페이지 가격 아래에 노출됩니다 (선택)
          </p>
          <textarea
            rows={2}
            placeholder="예: 부드러운 촉감의 캐시미어 혼방 코트"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <OptionListEditor
          label="색상 옵션"
          placeholder="예: 블랙"
          values={form.colors}
          onChange={(colors) => setForm((f) => ({ ...f, colors }))}
        />
        <OptionListEditor
          label="사이즈 옵션"
          placeholder="예: L"
          values={form.sizes}
          onChange={(sizes) => setForm((f) => ({ ...f, sizes }))}
        />

        <RelatedProductPicker
          allProducts={products ?? []}
          excludeId={form.id}
          selectedIds={form.relatedProductIds}
          onChange={(relatedProductIds) => setForm((f) => ({ ...f, relatedProductIds }))}
        />

        <div className="col-span-2 sm:col-span-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            대표(썸네일) 이미지 — 목록/카드에 노출되는 사진, 최대 {MAX_THUMBNAIL_IMAGES}장 (2장 이상이면 카드에서 2초 간격으로 자동 전환됩니다)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={form.imageUrls.length >= MAX_THUMBNAIL_IMAGES}
              onChange={handleThumbnailImagesChange}
              className="text-xs disabled:opacity-40"
            />
            {uploading && <span className="text-xs text-gray-400">업로드 중...</span>}
          </div>

          {form.imageUrls.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {form.imageUrls.map((url, index) => (
                <div key={url + index} className="flex items-center gap-3 rounded-md border border-gray-200 p-2">
                  <span className="w-5 shrink-0 text-center text-xs text-gray-400">{index + 1}</span>
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(url, form.id ?? 0)}
                      alt={`대표 이미지 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => moveThumbnailImage(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveThumbnailImage(index, 1)}
                      disabled={index === form.imageUrls.length - 1}
                      className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeThumbnailImage(index)}
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
                src={resolveImageUrl(p.imageUrls?.[0] ?? p.imageUrl, p.id)}
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
