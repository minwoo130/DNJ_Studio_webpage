"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type Me = {
  user: {
    name: string;
    phone: string | null;
    zip_code: string | null;
    address: string | null;
    address_detail: string | null;
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [addressMode, setAddressMode] = useState<"default" | "manual">("default");

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [memo, setMemo] = useState("");
  const [agreeOrder, setAgreeOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function authHeader() {
    const token = sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  useEffect(() => {
    const headers = authHeader();
    if (!headers) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch(`${API_URL}/api/cart`, { headers }).then((res) => res.json()),
      fetch(`${API_URL}/api/auth/me`, { headers }).then((res) => res.json()),
    ]).then(([cartData, meData]: [typeof cart, Me]) => {
      setCart(cartData);
      setMe(meData);
      setRecipientName(meData.user.name ?? "");
      setRecipientPhone(meData.user.phone ?? "");
      if (meData.user.address) {
        setZipCode(meData.user.zip_code ?? "");
        setAddress(meData.user.address ?? "");
        setAddressDetail(meData.user.address_detail ?? "");
      } else {
        setAddressMode("manual");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddressModeChange(mode: "default" | "manual") {
    setAddressMode(mode);
    if (mode === "default" && me?.user.address) {
      setZipCode(me.user.zip_code ?? "");
      setAddress(me.user.address ?? "");
      setAddressDetail(me.user.address_detail ?? "");
    } else if (mode === "manual") {
      setZipCode("");
      setAddress("");
      setAddressDetail("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreeOrder) {
      setError("주문 내용 확인 및 배송정보 제공 동의가 필요합니다.");
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !address.trim()) {
      setError("수령인, 연락처, 주소는 필수입니다.");
      return;
    }

    const headers = authHeader();
    if (!headers) return;

    setSubmitting(true);
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName,
        recipientPhone,
        zipCode: zipCode || undefined,
        address,
        addressDetail: addressDetail || undefined,
        memo: memo || undefined,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "주문에 실패했습니다.");
      return;
    }
    router.push("/mypage#orders");
  }

  if (!cart || !me) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">불러오는 중...</div>
        <Footer />
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">장바구니가 비어 있습니다.</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-screen-sm px-4 py-10">
        <h1 className="text-xl font-bold">주문서 작성</h1>

        <div className="mt-6">
          <h2 className="text-sm font-bold">주문 상품</h2>
          <div className="mt-2 divide-y divide-gray-100 rounded-md border border-gray-100">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3">
                <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(item.imageUrl, item.productId)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.quantity}개 · {item.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold">총 결제금액</span>
            <span className="text-lg font-bold">{cart.total.toLocaleString()}원</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <h2 className="text-sm font-bold">배송지 정보</h2>

          {me.user.address && (
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={addressMode === "default"}
                  onChange={() => handleAddressModeChange("default")}
                />
                기본 배송지 사용
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={addressMode === "manual"}
                  onChange={() => handleAddressModeChange("manual")}
                />
                직접 입력
              </label>
            </div>
          )}

          <input
            type="text"
            required
            placeholder="수령인"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="tel"
            required
            placeholder="연락처"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="text"
            placeholder="우편번호 (선택)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-28 rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="text"
            required
            placeholder="주소"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="text"
            placeholder="상세주소 (선택)"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <textarea
            rows={2}
            placeholder="배송 요청사항 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={agreeOrder}
              onChange={(e) => setAgreeOrder(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              [필수] 주문 내용을 확인했으며, 배송을 위해 택배사에 배송정보(수령인/연락처/주소)가
              제공됨에 동의합니다.{" "}
              <Link href="/policy/privacy" target="_blank" className="underline underline-offset-2">
                개인정보처리방침
              </Link>
            </span>
          </label>

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-black py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? "주문 처리 중..." : "주문하기"}
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
