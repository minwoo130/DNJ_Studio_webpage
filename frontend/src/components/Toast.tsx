"use client";

import { useEffect, useState } from "react";
import { onToast, type ToastDetail } from "@/lib/toast";

export default function Toast() {
  const [toasts, setToasts] = useState<ToastDetail[]>([]);

  useEffect(() => {
    return onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 2200);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-toast-in rounded-full bg-black/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
