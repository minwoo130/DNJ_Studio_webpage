"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Member = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  birthDate?: string;
  region?: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
};

function authHeader() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [query, setQuery] = useState("");

  function load() {
    fetch(`${API_URL}/api/admin/users`, { headers: authHeader() })
      .then((res) => (res.ok ? res.json() : []))
      .then(setMembers);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleWithdraw(m: Member) {
    if (!confirm(`${m.name}(${m.email}) 회원을 강제 탈퇴 처리할까요?\n로그인이 즉시 차단됩니다.`)) return;
    const res = await fetch(`${API_URL}/api/admin/users/${m.id}/withdraw`, {
      method: "PATCH",
      headers: authHeader(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "탈퇴 처리에 실패했습니다.");
      return;
    }
    load();
  }

  async function handleGrantCoupon(m: Member) {
    const amountStr = prompt(`${m.name}(${m.email})님에게 지급할 쿠폰 금액을 입력하세요. (원)`);
    if (amountStr === null) return;
    const amount = Number(amountStr.replace(/[^0-9]/g, ""));
    if (!Number.isInteger(amount) || amount <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }
    const reason = prompt("지급 사유를 입력하세요.", "관리자 지급") ?? "관리자 지급";

    const res = await fetch(`${API_URL}/api/admin/users/${m.id}/coupons`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "쿠폰 지급에 실패했습니다.");
      return;
    }
    alert(`${m.name}님에게 ${amount.toLocaleString()}원 쿠폰을 지급했습니다.`);
  }

  const filtered = members?.filter(
    (m) =>
      !query.trim() ||
      m.email.toLowerCase().includes(query.trim().toLowerCase()) ||
      m.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="py-6">
      <input
        type="text"
        placeholder="이메일 또는 이름으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
      />

      <div className="mt-4 overflow-x-auto">
        {members === null && <p className="py-10 text-center text-sm text-gray-400">불러오는 중...</p>}
        {members !== null && (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-400">
                <th className="py-2 pr-3 font-medium">ID</th>
                <th className="py-2 pr-3 font-medium">이메일</th>
                <th className="py-2 pr-3 font-medium">이름</th>
                <th className="py-2 pr-3 font-medium">휴대폰</th>
                <th className="py-2 pr-3 font-medium">배송지역</th>
                <th className="py-2 pr-3 font-medium">가입일</th>
                <th className="py-2 pr-3 font-medium">권한</th>
                <th className="py-2 pr-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 pr-3 text-gray-500">{m.id}</td>
                  <td className="py-2.5 pr-3">{m.email}</td>
                  <td className="py-2.5 pr-3">{m.name}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{m.phone ?? "-"}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{m.region ?? "-"}</td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="py-2.5 pr-3">
                    {m.isAdmin ? (
                      <span className="rounded bg-black px-2 py-0.5 text-[11px] font-bold text-white">관리자</span>
                    ) : (
                      <span className="text-xs text-gray-400">일반회원</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGrantCoupon(m)}
                        className="text-xs text-gray-500 underline underline-offset-2"
                      >
                        쿠폰 지급
                      </button>
                      {!m.isAdmin && (
                        <button
                          onClick={() => handleWithdraw(m)}
                          className="text-xs text-brand-red underline underline-offset-2"
                        >
                          강제 탈퇴
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
