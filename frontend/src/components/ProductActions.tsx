"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { emitCartUpdated } from "@/lib/cartEvents";
import { showToast } from "@/lib/toast";
import RelatedProductRow from "@/components/RelatedProductRow";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type PickedItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

export default function ProductActions({
  productId,
  name,
  price,
  colors = [],
  sizes = [],
  relatedProducts = [],
}: {
  productId: number;
  name: string;
  price: number;
  colors?: string[];
  sizes?: string[];
  relatedProducts?: Product[];
}) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [optionError, setOptionError] = useState<string | null>(null);
  const [pickedItems, setPickedItems] = useState<PickedItem[]>([]);

  // 이 페이지에서 "현재 선택 중인" 상품 미리보기 목록이라 상품당 한 줄만 유지한다
  // (같은 상품의 옵션을 다시 고르면 새 줄이 아니라 기존 줄이 갱신됨).
  function upsertPickedItem(item: Omit<PickedItem, "quantity">) {
    setPickedItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...item, quantity: next[idx].quantity };
        return next;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removePickedItem(productId: number) {
    setPickedItems((prev) => prev.filter((p) => p.productId !== productId));
  }

  const pickedTotal = pickedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 색상/사이즈 선택이 완료되면(옵션이 없으면 즉시) 메인 상품도 자동으로 미리보기에 반영하고,
  // 선택을 다시 눌러 해제하는 등 선택이 불완전해지면 미리보기/장바구니 목록에서도 뺀다.
  useEffect(() => {
    const validColor = colors.length === 0 || Boolean(selectedColor);
    const validSize = sizes.length === 0 || Boolean(selectedSize);
    if (!validColor || !validSize) {
      removePickedItem(productId);
      return;
    }
    upsertPickedItem({
      productId,
      name,
      price,
      color: colors.length ? selectedColor : undefined,
      size: sizes.length ? selectedSize : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSize]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((items: { id: number }[]) => setIsWishlisted(items.some((i) => i.id === productId)))
      .catch(() => {});
  }, [productId]);

  function authHeader() {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }

  function validateOptions() {
    if (colors.length > 0 && !selectedColor) {
      setOptionError("색상을 선택해주세요.");
      return false;
    }
    if (sizes.length > 0 && !selectedSize) {
      setOptionError("사이즈를 선택해주세요.");
      return false;
    }
    setOptionError(null);
    return true;
  }

  async function handleWishlist() {
    const headers = authHeader();
    if (!headers) return;

    try {
      if (isWishlisted) {
        await fetch(`${API_URL}/api/wishlist/${productId}`, { method: "DELETE", headers });
        setIsWishlisted(false);
        setMessage("위시리스트에서 제거했습니다.");
      } else {
        await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setIsWishlisted(true);
        setMessage("위시리스트에 담았습니다.");
      }
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    }
  }

  async function handleAddToCart() {
    if (!validateOptions()) return;
    const headers = authHeader();
    if (!headers) return;

    try {
      await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          color: colors.length ? selectedColor : undefined,
          size: sizes.length ? selectedSize : undefined,
        }),
      });
      emitCartUpdated();
      showToast("장바구니에 추가되었습니다.");
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    }
  }

  function handleBuyNow() {
    if (!validateOptions()) return;
    const params = new URLSearchParams({ buyProductId: String(productId), buyQuantity: "1" });
    if (colors.length) params.set("color", selectedColor);
    if (sizes.length) params.set("size", selectedSize);
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div>
      {colors.length > 0 && (
        <div className="mt-6">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">색상</p>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSelectedColor((prev) => (prev === c ? "" : c));
                  setOptionError(null);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selectedColor === c
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-600 hover:border-black"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">사이즈</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSelectedSize((prev) => (prev === s ? "" : s));
                  setOptionError(null);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selectedSize === s
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-600 hover:border-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-1 text-xs text-gray-500">
        <p>배송비 3,000원 (60,000원 이상 구매시 무료)</p>
      </div>

      {optionError && <p className="mt-2 text-xs text-brand-red">{optionError}</p>}

      {relatedProducts.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-bold">연관 상품</h2>
          <div className="divide-y divide-gray-100">
            {relatedProducts.map((rp) => (
              <RelatedProductRow
                key={rp.id}
                product={rp}
                onAdd={(item) => upsertPickedItem({ productId: rp.id, ...item })}
              />
            ))}
          </div>
        </div>
      )}

      {pickedItems.length > 0 && (
        <div className="mt-6 rounded-md border border-gray-100 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">담은 상품</p>
          <div className="divide-y divide-gray-100">
            {pickedItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0 flex-1 truncate">
                  {item.name}
                  {(item.color || item.size) && (
                    <span className="ml-1 text-xs text-gray-400">
                      ({[item.color, item.size].filter(Boolean).join(" / ")})
                    </span>
                  )}
                  {item.quantity > 1 && <span className="ml-1 text-xs text-gray-400">x{item.quantity}</span>}
                </div>
                <span className="shrink-0 font-semibold">{(item.price * item.quantity).toLocaleString()}원</span>
                <button
                  type="button"
                  onClick={() => removePickedItem(item.productId)}
                  aria-label={`${item.name} 삭제`}
                  className="shrink-0 text-gray-400 hover:text-brand-red"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-sm">
            <span className="font-bold">총 금액</span>
            <span className="text-base font-bold">{pickedTotal.toLocaleString()}원</span>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleWishlist}
          className={`flex-1 rounded-md border py-3 text-sm font-semibold transition-colors ${
            isWishlisted ? "border-brand-red text-brand-red" : "border-gray-300 text-gray-700"
          }`}
        >
          {isWishlisted ? "♥ 위시리스트" : "♡ 위시리스트"}
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 rounded-md border border-gray-300 py-3 text-sm font-semibold text-gray-700"
        >
          장바구니 담기
        </button>
      </div>
      <button
        onClick={handleBuyNow}
        className="mt-2 w-full rounded-md bg-black py-3 text-sm font-bold text-white"
      >
        바로구매
      </button>
      {message && <p className="mt-2 text-xs text-gray-400">{message}</p>}
    </div>
  );
}
