"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CATEGORIES = [
  "코디할인",
  "NEW",
  "BEST",
  "당일출발",
  "OUTER",
  "TOP",
  "BOTTOM",
  "ACC",
];

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 4);
      if (y < 80) {
        setHidden(false);
      } else if (y > lastY.current) {
        setHidden(true); // scrolling down -> hide
      } else if (y < lastY.current) {
        setHidden(false); // scrolling up -> show
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div
        className="sticky top-0 z-30 transition-transform duration-300 ease-in-out"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="bg-black px-4 py-1.5 text-center text-[11px] text-white">
          신규가입 시 3,000원 쿠폰 즉시 지급 · 7만원 이상 구매 시 무료배송
        </div>

        <div
          className={`border-b border-gray-100 bg-white/95 backdrop-blur transition-shadow ${
            scrolled ? "shadow-sm" : ""
          }`}
        >
          <div className="mx-auto grid max-w-screen-lg grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2 sm:py-3">
            <div className="flex items-center justify-self-start">
              <button
                aria-label="메뉴 열기"
                className="flex h-8 w-8 flex-col items-center justify-center gap-1 sm:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <span className="block h-[1.5px] w-5 bg-gray-800" />
                <span className="block h-[1.5px] w-5 bg-gray-800" />
                <span className="block h-[1.5px] w-5 bg-gray-800" />
              </button>

              <nav className="hidden items-center gap-4 text-sm font-medium text-gray-700 sm:flex">
                {CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2)).map((c) => (
                  <button key={c} className="whitespace-nowrap hover:text-black">
                    {c}
                  </button>
                ))}
              </nav>
            </div>

            <a href="/" className="shrink-0 justify-self-center">
              <Image
                src="/logo.png"
                alt="DNJ STUDIO"
                width={563}
                height={387}
                priority
                className="h-9 w-auto sm:h-14"
              />
            </a>

            <div className="flex items-center justify-self-end gap-4">
              <nav className="hidden items-center gap-4 text-sm font-medium text-gray-700 sm:flex">
                {CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2)).map((c) => (
                  <button key={c} className="whitespace-nowrap hover:text-black">
                    {c}
                  </button>
                ))}
                <span className="mx-1 h-3 w-px bg-gray-200" />
                <button aria-label="검색">검색</button>
                <button aria-label="위시리스트">♡</button>
                <button aria-label="장바구니">가방(0)</button>
                <button aria-label="마이페이지">MY</button>
              </nav>
              <button aria-label="장바구니" className="text-sm text-gray-500 sm:hidden">
                가방(0)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 sm:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <Image src="/logo.png" alt="DNJ STUDIO" width={563} height={387} className="h-8 w-auto" />
            <button aria-label="메뉴 닫기" className="text-2xl leading-none" onClick={() => setMenuOpen(false)}>
              &times;
            </button>
          </div>
          <nav className="flex flex-col divide-y divide-gray-100 border-t border-gray-100 text-sm">
            {CATEGORIES.map((c) => (
              <button key={c} className="px-4 py-3 text-left" onClick={() => setMenuOpen(false)}>
                {c}
              </button>
            ))}
          </nav>
          <div className="flex gap-4 border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
            <button>로그인</button>
            <button>회원가입</button>
            <button>MY</button>
            <button>♡ 위시리스트</button>
          </div>
        </div>
      </div>
    </>
  );
}
