"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type OrderDetail = {
  id: number;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  paymentStatus: string;
  depositDeadline?: string;
  depositorName?: string;
};

type BankInfo = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export default function OrderCompletePage() {
  return (
    <Suspense fallback={null}>
      <OrderComplete />
    </Suspense>
  );
}

function OrderComplete() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestPhone = searchParams.get("phone");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [bank, setBank] = useState<BankInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGuestView, setIsGuestView] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token && !guestPhone) {
      router.push("/login");
      return;
    }
    setIsGuestView(!token);

    const orderUrl = token
      ? `${API_URL}/api/orders/${id}`
      : `${API_URL}/api/orders/${id}?phone=${encodeURIComponent(guestPhone!)}`;

    Promise.all([
      fetch(orderUrl, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined).then((res) =>
        res.ok ? res.json() : null
      ),
      fetch(`${API_URL}/api/orders/bank-info`).then((res) => res.json()),
    ])
      .then(([o, b]) => {
        if (!o) {
          setError("주문 정보를 찾을 수 없습니다.");
          return;
        }
        setOrder(o);
        setBank(b);
      })
      .catch(() => setError("주문 정보를 불러오지 못했습니다."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">{error}</div>
        <Footer />
      </main>
    );
  }

  if (!order || !bank) {
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
      <section className="mx-auto max-w-screen-sm px-4 py-16 text-center">
        <h1 className="text-xl font-bold">주문이 접수되었습니다</h1>
        <p className="mt-2 text-sm text-gray-500">주문번호 #{order.id}</p>

        <div className="mt-8 space-y-2 rounded-md border border-gray-100 p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">입금은행</span>
            <span className="font-semibold">{bank.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">계좌번호</span>
            <span className="font-semibold">{bank.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">예금주</span>
            <span className="font-semibold">{bank.accountHolder}</span>
          </div>
          {(order.discountAmount ?? 0) > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">상품금액</span>
                <span>{(order.subtotalAmount ?? order.totalAmount).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-brand-red">
                <span>쿠폰 할인</span>
                <span>-{(order.discountAmount ?? 0).toLocaleString()}원</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">입금금액</span>
            <span className="font-bold">{order.totalAmount.toLocaleString()}원</span>
          </div>
          {order.depositDeadline && (
            <div className="flex justify-between">
              <span className="text-gray-400">입금기한</span>
              <span>{new Date(order.depositDeadline).toLocaleString("ko-KR")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">상태</span>
            <span className="rounded bg-yellow-50 px-2 py-0.5 text-xs font-bold text-yellow-700">입금대기</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-brand-red">반드시 주문자명과 동일하게 입금해주세요.</p>

        <a
          href={isGuestView ? "/" : "/mypage#orders"}
          className="mt-8 inline-block rounded-md bg-black px-6 py-3 text-sm font-bold text-white"
        >
          {isGuestView ? "쇼핑 계속하기" : "주문내역 보기"}
        </a>
      </section>
      <Footer />
    </main>
  );
}
