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
  createdAt: string;
};

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/admin/users`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setMembers);
  }, []);

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
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
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
