"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Me = {
  user: {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    birth_date: string | null;
    region: string | null;
    zip_code: string | null;
    address: string | null;
    address_detail: string | null;
    created_at: string;
  };
  coupons: {
    id: number;
    amount: number;
    reason: string;
    is_used: boolean;
    expires_at: string | null;
  }[];
};

type CartItem = {
  productId: number;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  category: string;
  quantity: number;
  imageUrl?: string;
};

type WishlistItem = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  category: string;
  imageUrl?: string;
};

type Order = {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
};

export default function MyPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeader = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const load = useCallback(async () => {
    const headers = authHeader();
    if (!headers) {
      router.push("/login");
      return;
    }

    const [meRes, cartRes, wishlistRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/api/auth/me`, { headers }),
      fetch(`${API_URL}/api/cart`, { headers }),
      fetch(`${API_URL}/api/wishlist`, { headers }),
      fetch(`${API_URL}/api/orders`, { headers }),
    ]);

    if (meRes.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    setMe(await meRes.json());
    setCart(await cartRes.json());
    setWishlist(await wishlistRes.json());
    setOrders(await ordersRes.json());
    setLoading(false);
  }, [authHeader, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateQuantity(productId: number, quantity: number) {
    const headers = authHeader();
    if (!headers) return;
    if (quantity < 1) return;

    setError(null);
    const res = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) {
      setError("수량 변경에 실패했습니다.");
      return;
    }
    load();
  }

  async function removeItem(productId: number) {
    const headers = authHeader();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      setError("삭제에 실패했습니다.");
      return;
    }
    load();
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  async function removeWishlistItem(productId: number) {
    const headers = authHeader();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      setError("삭제에 실패했습니다.");
      return;
    }
    load();
  }

  if (loading || !me || !cart || !wishlist || !orders) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">불러오는 중...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="flex items-end justify-between">
          <h1 className="text-xl font-bold">{me.user.name}님, 안녕하세요</h1>
          <button onClick={handleLogout} className="text-xs text-gray-400 underline underline-offset-2">
            로그아웃
          </button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          <div className="rounded-md border border-gray-100 py-5 text-center">
            <p className="text-lg font-bold">
              {cart.items.reduce((sum, i) => sum + i.quantity, 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">장바구니</p>
          </div>
          <div className="rounded-md border border-gray-100 py-5 text-center">
            <p className="text-lg font-bold">{wishlist.length}</p>
            <p className="mt-1 text-xs text-gray-400">위시리스트</p>
          </div>
          <div className="rounded-md border border-gray-100 py-5 text-center">
            <p className="text-lg font-bold">
              {me.coupons.filter((c) => !c.is_used).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-gray-400">보유 쿠폰</p>
          </div>
          <div className="rounded-md border border-gray-100 py-5 text-center">
            <p className="text-lg font-bold">{orders.length}</p>
            <p className="mt-1 text-xs text-gray-400">주문내역</p>
          </div>
        </div>

        {/* 장바구니 */}
        <div id="cart" className="mt-12 scroll-mt-24">
          <h2 className="text-lg font-bold tracking-tight">장바구니</h2>
          {error && <p className="mt-2 text-xs text-brand-red">{error}</p>}

          {cart.items.length === 0 ? (
            <p className="mt-4 py-10 text-center text-sm text-gray-400">
              장바구니가 비어 있습니다.{" "}
              <Link href="/best" className="underline underline-offset-2">
                상품 보러가기
              </Link>
            </p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 py-4">
                  <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                    <Link href={`/products/${item.productId}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImageUrl(item.imageUrl, item.productId)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.productId}`} className="text-sm font-medium">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold">{item.price.toLocaleString()}원</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-7 w-7 rounded border border-gray-300 text-sm"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-7 w-7 rounded border border-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="삭제"
                    className="text-xs text-gray-400 underline underline-offset-2"
                  >
                    삭제
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between py-4">
                <span className="text-sm font-semibold">총 결제금액</span>
                <span className="text-lg font-bold">{cart.total.toLocaleString()}원</span>
              </div>
              <div className="pb-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-md bg-black py-3 text-sm font-bold text-white"
                >
                  주문하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 위시리스트 */}
        <div id="wishlist" className="mt-12 scroll-mt-24">
          <h2 className="text-lg font-bold tracking-tight">위시리스트</h2>
          {wishlist.length === 0 ? (
            <p className="mt-4 py-10 text-center text-sm text-gray-400">
              위시리스트가 비어 있습니다.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                    <Link href={`/products/${item.id}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveImageUrl(item.imageUrl, item.id)}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.id}`} className="text-sm font-medium">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold">{item.price.toLocaleString()}원</p>
                  </div>
                  <button
                    onClick={() => removeWishlistItem(item.id)}
                    aria-label="삭제"
                    className="text-xs text-gray-400 underline underline-offset-2"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 보유 쿠폰 */}
        <div className="mt-12">
          <h2 className="text-lg font-bold tracking-tight">보유 쿠폰</h2>
          {me.coupons.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">보유한 쿠폰이 없습니다.</p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {me.coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{c.amount.toLocaleString()}원 할인쿠폰</p>
                    {c.expires_at && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        ~{new Date(c.expires_at).toLocaleDateString("ko-KR")}까지
                      </p>
                    )}
                  </div>
                  <span className={`text-xs ${c.is_used ? "text-gray-300" : "text-brand-red"}`}>
                    {c.is_used ? "사용완료" : "사용가능"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 회원정보 */}
        <div className="mt-12">
          <h2 className="text-lg font-bold tracking-tight">회원정보</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-4">
              <dt className="w-20 text-gray-400">이메일</dt>
              <dd>{me.user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 text-gray-400">휴대폰</dt>
              <dd>{me.user.phone ?? "-"}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 text-gray-400">생년월일</dt>
              <dd>{me.user.birth_date ? me.user.birth_date.slice(0, 10) : "-"}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 text-gray-400">배송지역</dt>
              <dd>{me.user.region ?? "-"}</dd>
            </div>
          </dl>
        </div>

        {/* 주문내역 */}
        <div className="mt-12">
          <h2 className="text-lg font-bold tracking-tight">주문내역</h2>
          {orders.length === 0 ? (
            <p className="mt-4 py-10 text-center text-sm text-gray-400">주문 내역이 없습니다.</p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="py-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(order.createdAt).toLocaleDateString("ko-KR")} 주문</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Link href={`/products/${item.productId}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveImageUrl(item.imageUrl, item.productId)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </Link>
                        </div>
                        <div className="flex-1 text-sm">
                          <Link href={`/products/${item.productId}`} className="font-medium">
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.quantity}개 · {item.price.toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
