"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategorySubTags, type ProductCategory } from "@/data/products";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import SearchOverlay from "@/components/SearchOverlay";

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; href: string; items: { label: string; href: string }[] };

function categoryNav(category: ProductCategory): NavItem {
  return {
    type: "dropdown",
    label: category,
    href: `/category/${category}`,
    items: getCategorySubTags(category).map((tag) => ({
      label: `#${tag}`,
      href: `/tag/${encodeURIComponent(tag)}`,
    })),
  };
}

const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "NEW 5%", href: "/new" },
  { type: "link", label: "BEST", href: "/best" },
  { type: "link", label: "당일출발", href: `/tag/${encodeURIComponent("당일출발")}` },
  categoryNav("OUTER"),
  categoryNav("TOP"),
  categoryNav("BOTTOM"),
  categoryNav("ACC"),
  { type: "link", label: "입고지연", href: "/delayed" },
  {
    type: "dropdown",
    label: "Community",
    href: "/community/notice",
    items: [
      { label: "Notice", href: "/community/notice" },
      { label: "Review", href: "/community/review" },
      { label: "QnA", href: "/community/qna" },
      { label: "반품/교환", href: "/community/exchange" },
    ],
  },
];

export default function Header({ overlay = false }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") ?? "null");
      setIsAdmin(Boolean(stored?.isAdmin));
    } catch {
      setIsAdmin(false);
    }
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const navItems: NavItem[] = isAdmin
    ? [...NAV_ITEMS, { type: "link", label: "관리자페이지", href: "/admin" }]
    : NAV_ITEMS;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = overlay && !scrolled;

  return (
    <>
      <div className={`${overlay ? "fixed" : "sticky"} top-0 z-30 w-full`}>
        <div className="bg-black px-4 py-1.5 text-center text-[11px] text-white">
          신규가입 시 3,000원 쿠폰 즉시 지급 · 7만원 이상 구매 시 무료배송
        </div>

        <div
          className={`transition-all duration-300 ${
            transparent
              ? "border-b border-transparent bg-transparent"
              : "border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur"
          }`}
        >
          {/* 로고(맨 왼쪽) + 카테고리 + 아이콘(오른쪽) */}
          <div className="flex w-full items-center px-4 py-3 sm:px-4 sm:py-4">
            <button
              aria-label="메뉴 열기"
              className="flex h-8 w-8 flex-col items-center justify-center gap-1 sm:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  transparent ? "bg-white" : "bg-gray-800"
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  transparent ? "bg-white" : "bg-gray-800"
                }`}
              />
              <span
                className={`block h-[1.5px] w-5 transition-colors ${
                  transparent ? "bg-white" : "bg-gray-800"
                }`}
              />
            </button>

            <a href="/" className="mx-auto shrink-0 sm:mx-0">
              <Image
                src="/logo.png"
                alt="DNJ STUDIO"
                width={563}
                height={387}
                priority
                className={`h-11 w-auto transition-all duration-300 sm:h-16 ${
                  transparent ? "brightness-0 invert drop-shadow-md" : ""
                }`}
              />
            </a>

            <nav
              className={`ml-6 hidden min-w-0 flex-1 items-center gap-4 overflow-visible text-sm font-medium transition-colors sm:flex lg:ml-10 lg:gap-6 ${
                transparent
                  ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
                  : "text-gray-700"
              }`}
            >
              {navItems.map((item) =>
                item.type === "link" ? (
                  <Link key={item.label} href={item.href} className="whitespace-nowrap hover:opacity-70">
                    {item.label}
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link href={item.href} className="whitespace-nowrap hover:opacity-70">
                      {item.label}
                    </Link>
                    {item.items.length > 0 && (
                      <div
                        className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-150 ${
                          openDropdown === item.label
                            ? "pointer-events-auto opacity-100"
                            : "pointer-events-none translate-y-1 opacity-0"
                        }`}
                      >
                        <div className="flex flex-col gap-1 whitespace-nowrap rounded-md border border-gray-100 bg-white px-4 py-3 text-gray-700 shadow-lg">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="rounded px-2 py-1 text-xs hover:bg-gray-50 hover:text-black"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </nav>

            <div className="ml-4 flex shrink-0 items-center">
              <nav
                className={`hidden items-center gap-7 text-sm transition-colors sm:flex lg:gap-8 ${
                  transparent
                    ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
                    : "text-gray-500"
                }`}
              >
                <button onClick={() => setSearchOpen(true)} aria-label="검색">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button onClick={() => setWishlistOpen(true)} aria-label="위시리스트">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
                    <path d="M12 20s-7-4.35-9.5-8.8C.8 7.6 2.3 4 6 4c2 0 3.5 1 4 2.5C10.5 5 12 4 14 4c3.7 0 5.2 3.6 3.5 7.2C19 15.65 12 20 12 20z" />
                  </svg>
                </button>
                <button onClick={() => setCartOpen(true)} aria-label="장바구니" className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
                    <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                  </svg>
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white">
                    0
                  </span>
                </button>
                <Link
                  href={isLoggedIn ? "/mypage" : "/login"}
                  aria-label={isLoggedIn ? "마이페이지" : "로그인"}
                  className="relative"
                >
                  {!isLoggedIn && (
                    <span className="absolute -right-2 top-full mt-2 whitespace-nowrap rounded bg-[#6b4423] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                      <span className="absolute -top-[3px] right-3 h-1.5 w-1.5 rotate-45 bg-[#6b4423]" />
                      +3000 Points
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" strokeLinecap="round" />
                  </svg>
                </Link>
              </nav>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="장바구니"
                className={`relative sm:hidden ${transparent ? "text-white" : "text-gray-600"}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                  <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                </svg>
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white">
                  0
                </span>
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
            <Image src="/logo.png" alt="DNJ STUDIO" width={563} height={387} className="h-10 w-auto" />
            <button aria-label="메뉴 닫기" className="text-2xl leading-none" onClick={() => setMenuOpen(false)}>
              &times;
            </button>
          </div>
          <nav className="flex flex-col divide-y divide-gray-100 border-t border-gray-100 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-3 text-left"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4 border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
            <Link href="/login">로그인</Link>
            <Link href="/signup">회원가입</Link>
            <button>MY</button>
            <button>♡ 위시리스트</button>
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
