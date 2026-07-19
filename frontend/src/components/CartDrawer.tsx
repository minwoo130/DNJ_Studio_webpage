"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [needsLogin, setNeedsLogin] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsLogin(true);
      setItems([]);
      return;
    }
    setNeedsLogin(false);
    const res = await fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setItems([]);
      return;
    }
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function updateQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function removeItem(productId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold">장바구니</h2>
          <button aria-label="닫기" className="text-2xl leading-none" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {needsLogin && (
            <div className="py-16 text-center text-sm text-gray-400">
              로그인 후 이용할 수 있어요.
              <div className="mt-3">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="rounded-md bg-black px-4 py-2 text-xs font-bold text-white"
                >
                  로그인하러 가기
                </Link>
              </div>
            </div>
          )}

          {!needsLogin && items !== null && items.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-400">장바구니가 비어 있습니다.</p>
          )}

          {!needsLogin &&
            items?.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 border-b border-gray-50 py-4">
                <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(item.imageUrl, item.productId)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">{item.name}</p>
                  <p className="mt-1 text-sm font-bold">{item.price.toLocaleString()}원</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-6 w-6 rounded border border-gray-300 text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-6 w-6 rounded border border-gray-300 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label="삭제"
                  className="text-[11px] text-gray-400 underline underline-offset-2"
                >
                  삭제
                </button>
              </div>
            ))}
        </div>

        {!needsLogin && items && items.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">총 결제금액</span>
              <span className="text-lg font-bold">{total.toLocaleString()}원</span>
            </div>
            <Link
              href="/mypage#cart"
              onClick={onClose}
              className="mt-3 block w-full rounded-md bg-black py-3 text-center text-sm font-bold text-white"
            >
              마이페이지에서 주문하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
