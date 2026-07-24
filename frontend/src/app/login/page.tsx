"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-center text-xl font-bold">로그인</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <input
            type="text"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="font-semibold text-black underline underline-offset-2">
            회원가입
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
