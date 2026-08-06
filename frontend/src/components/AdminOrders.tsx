"use client";

import { useEffect, useState } from "react";
import { PAYMENT_STATUS_LABEL, paymentStatusBadgeClass } from "@/lib/orderStatus";
import { resolveImageUrl } from "@/lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Order = {
  id: number;
  status: string;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  zipCode?: string;
  address: string;
  addressDetail?: string;
  memo?: string;
  isShipped: boolean;
  courierCompany?: string;
  trackingNumber?: string;
  cancelRequested: boolean;
  cancelRequestedAt?: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  depositorName?: string;
  paidAt?: string;
  member?: { name: string; email?: string; phone?: string; guest?: boolean };
  subtotalAmount?: number;
  discountAmount?: number;
  items: {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
    imageUrl?: string;
  }[];
};

const COURIERS = ["CJ대한통운", "한진택배", "롯데택배", "로젠택배", "우체국택배", "기타"];

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

const DELETE_CONFIRM_TEXT = "삭제하기";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [shipDraft, setShipDraft] = useState<Record<number, { courier: string; tracking: string }>>({});
  const [shipError, setShipError] = useState<Record<number, string>>({});
  const [deleteDraft, setDeleteDraft] = useState<Record<number, string>>({});

  function load() {
    fetch(`${API_URL}/api/admin/orders`, { headers: authHeader() })
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders);
  }

  useEffect(() => {
    load();
  }, []);

  function draftFor(orderId: number) {
    return shipDraft[orderId] ?? { courier: COURIERS[0], tracking: "" };
  }

  async function startShipping(order: Order) {
    const draft = draftFor(order.id);
    if (!draft.tracking.trim()) {
      setShipError((e) => ({ ...e, [order.id]: "운송장번호를 입력해주세요." }));
      return;
    }
    setShipError((e) => ({ ...e, [order.id]: "" }));
    const res = await fetch(`${API_URL}/api/admin/orders/${order.id}/ship`, {
      method: "PATCH",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ isShipped: true, courierCompany: draft.courier, trackingNumber: draft.tracking }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setShipError((e) => ({ ...e, [order.id]: data.error ?? "배송시작 처리에 실패했습니다." }));
      return;
    }
    load();
  }

  async function undoShipping(order: Order) {
    await fetch(`${API_URL}/api/admin/orders/${order.id}/ship`, {
      method: "PATCH",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ isShipped: false }),
    });
    load();
  }

  async function confirmPayment(order: Order) {
    await fetch(`${API_URL}/api/admin/orders/${order.id}/confirm-payment`, {
      method: "PATCH",
      headers: authHeader(),
    });
    load();
  }

  async function rejectOrder(order: Order) {
    if (!confirm("정말 이 주문을 거부하시겠습니까?")) return;
    await fetch(`${API_URL}/api/admin/orders/${order.id}/cancel`, {
      method: "PATCH",
      headers: authHeader(),
    });
    load();
  }

  async function acceptCancelRequest(order: Order) {
    await fetch(`${API_URL}/api/admin/orders/${order.id}/cancel`, {
      method: "PATCH",
      headers: authHeader(),
    });
    load();
  }

  async function declineCancelRequest(order: Order) {
    await fetch(`${API_URL}/api/admin/orders/${order.id}/decline-cancel-request`, {
      method: "PATCH",
      headers: authHeader(),
    });
    load();
  }

  async function deleteOrder(order: Order) {
    if (deleteDraft[order.id] !== DELETE_CONFIRM_TEXT) return;
    await fetch(`${API_URL}/api/admin/orders/${order.id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    setDeleteDraft((d) => {
      const next = { ...d };
      delete next[order.id];
      return next;
    });
    load();
  }

  return (
    <div className="py-6">
      {orders === null && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
      {orders !== null && orders.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">주문 내역이 없습니다.</p>
      )}

      <div className="space-y-3">
        {orders?.map((order) => (
          <div
            key={order.id}
            className={`rounded-lg border bg-white ${
              order.cancelRequested ? "border-brand-red" : "border-gray-200"
            }`}
          >
            {/* 헤더: 주문번호/날짜 + 상태뱃지 */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-bold">
                #{order.id}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {new Date(order.createdAt).toLocaleString("ko-KR")}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-bold ${paymentStatusBadgeClass(order.paymentStatus)}`}
                >
                  {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                    order.isShipped ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {order.isShipped
                    ? `배송중${order.trackingNumber ? ` · ${order.courierCompany ?? ""} ${order.trackingNumber}` : ""}`
                    : "배송전"}
                </span>
                {order.cancelRequested && (
                  <span className="rounded bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white">
                    취소요청
                  </span>
                )}
              </div>
            </div>

            {order.cancelRequested && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-red-50 px-4 py-2.5 text-xs">
                <span className="font-semibold text-brand-red">
                  구매자가 주문취소를 요청했습니다
                  {order.cancelRequestedAt && (
                    <span className="ml-1.5 font-normal text-gray-500">
                      ({new Date(order.cancelRequestedAt).toLocaleString("ko-KR")})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => acceptCancelRequest(order)}
                    className="rounded bg-brand-red px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    취소 수락
                  </button>
                  <button
                    type="button"
                    onClick={() => declineCancelRequest(order)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-bold text-gray-600"
                  >
                    요청 거절
                  </button>
                </div>
              </div>
            )}

            {/* 상품 썸네일 목록 */}
            <div className="divide-y divide-gray-50 px-4">
              {order.items.map((item, i) => (
                <div
                  key={`${item.productId}-${item.color ?? ""}-${item.size ?? ""}-${i}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveImageUrl(item.imageUrl, item.productId)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs text-gray-400">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">× {item.quantity}</span>
                  <span className="w-20 shrink-0 text-right text-sm font-medium">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>

            {/* 주문자/배송지 정보 */}
            <div className="grid grid-cols-1 gap-3 border-t border-gray-100 px-4 py-3 text-xs sm:grid-cols-2">
              <div>
                <p className="font-semibold text-gray-400">주문자</p>
                {order.member ? (
                  <p className="mt-1 text-gray-600">
                    {order.member.name}
                    {order.member.guest ? " (비회원)" : ""}
                    {order.member.phone ? ` · ${order.member.phone}` : ""}
                    {order.member.email && <><br />{order.member.email}</>}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-400">정보 없음</p>
                )}
                {order.depositorName && (
                  <p className="mt-1 text-gray-400">입금자명: {order.depositorName}</p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-400">배송지</p>
                <p className="mt-1 text-gray-600">
                  {order.recipientName} · {order.recipientPhone}
                  <br />
                  {order.zipCode && <span className="text-gray-500">[{order.zipCode}] </span>}
                  {order.address} {order.addressDetail}
                </p>
                {order.memo && <p className="mt-1 text-gray-400">요청사항: {order.memo}</p>}
              </div>
            </div>

            {/* 금액 + 액션 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                {(order.discountAmount ?? 0) > 0 && (
                  <p>
                    상품금액 {(order.subtotalAmount ?? order.totalAmount).toLocaleString()}원 · 쿠폰할인{" "}
                    <span className="text-brand-red">-{(order.discountAmount ?? 0).toLocaleString()}원</span>
                  </p>
                )}
                <p className="text-sm font-bold text-black">{order.totalAmount.toLocaleString()}원</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {order.paymentStatus === "WAITING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => confirmPayment(order)}
                      className="rounded bg-black px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      입금확인
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectOrder(order)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-bold text-gray-600"
                    >
                      주문거부
                    </button>
                  </>
                )}
                {order.isShipped && (
                  <button
                    type="button"
                    onClick={() => undoShipping(order)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-bold text-gray-500"
                  >
                    배송시작 취소
                  </button>
                )}
              </div>
            </div>

            {/* 삭제 (실수 방지를 위해 "삭제하기" 입력 확인) */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 px-4 py-2.5">
              <input
                value={deleteDraft[order.id] ?? ""}
                onChange={(e) => setDeleteDraft((d) => ({ ...d, [order.id]: e.target.value }))}
                placeholder={`"${DELETE_CONFIRM_TEXT}" 입력 후 삭제`}
                className="w-40 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => deleteOrder(order)}
                disabled={deleteDraft[order.id] !== DELETE_CONFIRM_TEXT}
                className="rounded border border-brand-red px-3 py-1.5 text-[11px] font-bold text-brand-red disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                주문 삭제
              </button>
            </div>

            {order.paymentStatus === "PAID" && !order.isShipped && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 bg-gray-50 px-4 py-3">
                <select
                  value={draftFor(order.id).courier}
                  onChange={(e) =>
                    setShipDraft((d) => ({ ...d, [order.id]: { ...draftFor(order.id), courier: e.target.value } }))
                  }
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs"
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  value={draftFor(order.id).tracking}
                  onChange={(e) =>
                    setShipDraft((d) => ({ ...d, [order.id]: { ...draftFor(order.id), tracking: e.target.value } }))
                  }
                  placeholder="운송장번호"
                  className="w-40 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => startShipping(order)}
                  className="rounded bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  배송시작
                </button>
                {shipError[order.id] && (
                  <span className="text-[11px] text-brand-red">{shipError[order.id]}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
