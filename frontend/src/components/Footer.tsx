import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { label: "이용약관", href: "/policy/terms" },
  { label: "개인정보처리방침", href: "/policy/privacy" },
  { label: "배송정책", href: "/policy/shipping" },
  { label: "교환/반품", href: "/policy/returns" },
  { label: "환불정책", href: "/policy/refund" },
];

const BUSINESS_INFO = [
  "DNJ STUDIO",
  "대표자: 이동화",
  "사업장주소: 서울 노원구 월계동 911-8 301",
  "사업자등록번호: 605-32-32593",
  "이메일: ldh09069674@gmail.com",
];

export default function Footer() {
  return (
    <footer className="bg-black px-4 py-8 text-gray-400 sm:px-8">
      <div className="mx-auto max-w-screen-lg">
        <div className="flex flex-col items-center justify-between gap-5 border-b border-gray-800 pb-6 sm:flex-row">
          <Image
            src="/logo.png"
            alt="DNJ STUDIO"
            width={563}
            height={387}
            className="h-12 w-auto brightness-0 invert"
          />

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] tracking-[0.1em] text-gray-300">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-300 transition-colors hover:border-white hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-5 text-center sm:flex-row sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-[12px] leading-relaxed text-gray-400 sm:justify-start">
            {BUSINESS_INFO.map((item, i) => (
              <span key={item} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-gray-700">·</span>}
                {item}
              </span>
            ))}
          </div>
          <p className="shrink-0 text-[11px] tracking-wide text-gray-500">
            &copy; 2026 DNJ Studio.
          </p>
        </div>
      </div>
    </footer>
  );
}
