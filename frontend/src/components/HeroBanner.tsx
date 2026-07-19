"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  href?: string;
  eyebrow: string;
  title: string;
  cta?: string;
  slotLabels: [string, string, string];
};

// TODO: photo slots are empty placeholders — drop real photography into
// frontend/public/banners/ and wire each slot to an <Image> once files exist.
const SLIDES: Slide[] = [
  {
    id: "seasonal",
    href: "/seasonal",
    eyebrow: "NEW ARRIVAL",
    title: "2026 여름 신상 입고",
    cta: "계절상품 보러가기",
    slotLabels: ["사진 1", "사진 2", "사진 3"],
  },
  {
    id: "best",
    href: "/best",
    eyebrow: "BEST",
    title: "가장 많이 팔린 상품",
    cta: "베스트 상품 보러가기",
    slotLabels: ["사진 4", "사진 5", "사진 6"],
  },
  {
    id: "mood",
    eyebrow: "DNJ STUDIO",
    title: "MENS WEAR ONLINE STORE",
    slotLabels: ["사진 7", "사진 8", "사진 9"],
  },
];

const INTERVAL_MS = 2000;

function PhotoSlot({ label }: { label: string }) {
  return (
    <div className="relative h-full w-1/3 overflow-hidden border-r border-white/10 bg-gradient-to-br from-gray-700 to-gray-900 last:border-r-0">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium tracking-wide text-white/40">{label}</span>
      </div>
    </div>
  );
}

export default function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active]);

  function goPrev() {
    setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }

  function goNext() {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {SLIDES.map((slide, index) => {
        const content = (
          <>
            <div className="flex h-full w-full">
              {slide.slotLabels.map((label, i) => (
                <PhotoSlot key={i} label={label} />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute bottom-16 left-5 text-white sm:bottom-20 sm:left-12">
              <p className="text-xs font-semibold tracking-widest sm:text-sm">{slide.eyebrow}</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-4xl">{slide.title}</h1>
              {slide.cta && (
                <p className="mt-2 text-xs underline underline-offset-4 sm:text-sm">{slide.cta}</p>
              )}
            </div>
          </>
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {slide.href ? (
              <Link href={slide.href} className="absolute inset-0 block">
                {content}
              </Link>
            ) : (
              <div className="absolute inset-0">{content}</div>
            )}
          </div>
        );
      })}

      <button
        aria-label="이전 배너"
        onClick={goPrev}
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:left-6 sm:h-12 sm:w-12"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 sm:h-6 sm:w-6">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        aria-label="다음 배너"
        onClick={goNext}
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/45 sm:right-6 sm:h-12 sm:w-12"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 sm:h-6 sm:w-6">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`${index + 1}번째 배너로 이동`}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
