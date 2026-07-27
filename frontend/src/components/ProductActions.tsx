"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function ProductActions({ productId }: { productId: number }) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    const headers = authHeader();
    if (!headers) return;

    try {
      await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setMessage("장바구니에 담았습니다.");
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    }
  }

  function handleBuyNow() {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    router.push(`/checkout?buyProductId=${productId}&buyQuantity=1`);
  }

  return (
    <div>
      <div className="mt-8 flex gap-2">
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
