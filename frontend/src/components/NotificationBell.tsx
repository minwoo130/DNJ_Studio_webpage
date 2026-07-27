"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const POLL_INTERVAL_MS = 20000;

type Notification = {
  id: number;
  orderId?: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setItems(await res.json());
    } catch {
      // 다음 폴링에서 다시 시도
    }
  }, []);

  useEffect(() => {
    setLoggedIn(Boolean(sessionStorage.getItem("token")));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loggedIn, load]);

  async function markRead(n: Notification) {
    if (n.isRead) return;
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/notifications/${n.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return;
    }
    load();
  }

  if (!loggedIn) return null;
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="알림" className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-gray-100 bg-white shadow-lg">
          <div className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
            {items.length === 0 && <p className="p-4 text-center text-xs text-gray-400">알림이 없습니다.</p>}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`block w-full p-3 text-left text-xs ${n.isRead ? "text-gray-400" : "font-semibold text-gray-800"}`}
              >
                {n.message}
                <div className="mt-1 text-[10px] text-gray-300">{new Date(n.createdAt).toLocaleString("ko-KR")}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
