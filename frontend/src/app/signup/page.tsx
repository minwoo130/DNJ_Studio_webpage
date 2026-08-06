"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const REGIONS = [
  "서울", "경기", "인천", "강원", "대전", "세종", "충북", "충남",
  "대구", "경북", "부산", "울산", "경남", "광주", "전북", "전남", "제주",
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allRequiredAgreed = agreeTerms && agreePrivacy && agreeAge;
  const allAgreed = allRequiredAgreed && agreeMarketing;

  function toggleAll(checked: boolean) {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeAge(checked);
    setAgreeMarketing(checked);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!allRequiredAgreed) {
      setError("이용약관, 개인정보 수집·이용, 만 14세 이상 확인에 모두 동의해야 가입할 수 있습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone || undefined,
          region,
          zipCode: zipCode || undefined,
          address,
          addressDetail: addressDetail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
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
        <h1 className="text-center text-xl font-bold">회원가입</h1>
        <p className="mt-2 text-center text-xs text-brand-red">
          지금 가입하면 3,000원 웰컴 쿠폰 즉시 지급 (90일 유효)
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <input
            type="text"
            required
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="비밀번호 (8자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <input
            type="tel"
            placeholder="휴대폰번호 (선택)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
          <div>
            <label className="mb-1 block text-xs text-gray-400">배송받을 지역</label>
            <select
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="" disabled>
                지역 선택
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">기본 배송지 (마이페이지에서 수정 가능)</label>
            <div className="space-y-2">
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
            </div>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <label className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(e) => toggleAll(e.target.checked)}
              />
              전체 동의
            </label>
            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                  [필수] 이용약관 동의
                </span>
                <Link href="/policy/terms" target="_blank" className="text-gray-400 underline underline-offset-2">
                  보기
                </Link>
              </label>
              <label className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                  [필수] 개인정보 수집 및 이용 동의
                </span>
                <Link href="/policy/privacy" target="_blank" className="text-gray-400 underline underline-offset-2">
                  보기
                </Link>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={agreeAge} onChange={(e) => setAgreeAge(e.target.checked)} />
                [필수] 만 14세 이상입니다
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                />
                [선택] 이벤트·쿠폰·신상품 안내 등 마케팅 정보 수신 동의
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          이미 회원이신가요?{" "}
          <Link href="/login" className="font-semibold text-black underline underline-offset-2">
            로그인
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
