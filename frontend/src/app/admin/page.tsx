"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminInventory from "@/components/AdminInventory";
import AdminMembers from "@/components/AdminMembers";
import AdminOrders from "@/components/AdminOrders";

type Tab = "inventory" | "members" | "orders";

export default function AdminPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("inventory");

  useEffect(() => {
    let isAdmin = false;
    try {
      isAdmin = Boolean(JSON.parse(sessionStorage.getItem("user") ?? "null")?.isAdmin);
    } catch {
      isAdmin = false;
    }
    if (!isAdmin) {
      router.push("/");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="py-24 text-center text-sm text-gray-400">확인 중...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-screen-lg px-4 py-10">
        <h1 className="text-xl font-bold">관리자 페이지</h1>

        <div className="mt-6 flex gap-2 border-b border-gray-100">
          <button
            onClick={() => setTab("inventory")}
            className={`px-4 py-2.5 text-sm font-semibold ${
              tab === "inventory"
                ? "border-b-2 border-black text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            품목 등록
          </button>
          <button
            onClick={() => setTab("members")}
            className={`px-4 py-2.5 text-sm font-semibold ${
              tab === "members"
                ? "border-b-2 border-black text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            회원관리
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2.5 text-sm font-semibold ${
              tab === "orders"
                ? "border-b-2 border-black text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            판매관리
          </button>
        </div>

        {tab === "inventory" && <AdminInventory />}

        {tab === "members" && <AdminMembers />}

        {tab === "orders" && <AdminOrders />}
      </section>

      <Footer />
    </main>
  );
}
