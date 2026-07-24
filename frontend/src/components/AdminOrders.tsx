"use client";

import { useEffect, useState } from "react";

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
  createdAt: string;
  member?: { name: string; email?: string; phone?: string; guest?: boolean };
  items: { productId: number; name: string; quantity: number; price: number }[];
};

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  function load() {
    fetch(`${API_URL}/api/admin/orders`, { headers: authHeader() })
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleShipped(order: Order) {
    await fetch(`${API_URL}/api/admin/orders/${order.id}/ship`, {
      method: "PATCH",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ isShipped: !order.isShipped }),
    });
    load();
  }

  return (
    <div className="py-6">
      {orders === null && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
      {orders !== null && orders.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">주문 내역이 없습니다.</p>
      )}

      <div className="divide-y divide-gray-100 border-t border-gray-200">
        {orders?.map((order) => (
          <div key={order.id} className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
              <span>
                주문번호 #{order.id} · {new Date(order.createdAt).toLocaleString("ko-KR")}
              </span>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={order.isShipped}
                  onChange={() => toggleShipped(order)}
                />
                택배배송 완료
              </label>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-3 rounded-md border border-gray-100 p-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">회원정보</p>
                {order.member ? (
                  <p className="mt-1">
                    {order.member.name}
                    {order.member.guest ? " (비회원)" : ""}
                    <br />
                    {order.member.email && <span className="text-gray-500">{order.member.email}</span>}
                    {order.member.phone && <span className="text-gray-500"> · {order.member.phone}</span>}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-400">정보 없음</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">배송지정보</p>
                <p className="mt-1">
                  {order.recipientName} · {order.recipientPhone}
                  <br />
                  {order.zipCode && <span className="text-gray-500">[{order.zipCode}] </span>}
                  {order.address} {order.addressDetail}
                  {order.memo && (
                    <>
                      <br />
                      <span className="text-gray-400">요청사항: {order.memo}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-bold">{order.totalAmount.toLocaleString()}원</div>
          </div>
        ))}
      </div>
    </div>
  );
}
