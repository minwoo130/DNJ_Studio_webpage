"use client";

const LINKS = [
  {
    name: "인스타그램",
    href: "https://www.instagram.com/dnj_studio_/",
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    name: "카카오톡 채널",
    href: "http://pf.kakao.com/_uryfX",
    className: "bg-[#FEE500]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 4.5c-5.06 0-9.17 3.28-9.17 7.32 0 2.6 1.7 4.89 4.28 6.2-.19.7-.68 2.47-.78 2.86-.12.48.18.48.38.35.16-.1 2.44-1.65 3.43-2.32.6.09 1.22.13 1.86.13 5.06 0 9.17-3.28 9.17-7.32S17.06 4.5 12 4.5z"
          fill="#391B1B"
        />
      </svg>
    ),
  },
];

export default function FloatingSocial() {
  return (
    <div className="fixed bottom-6 right-4 z-30 flex flex-col gap-3 sm:right-6">
      {LINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.name}
          title={link.name}
          className={`group relative flex h-11 w-11 items-center justify-center rounded-full shadow-lg shadow-black/10 ring-1 ring-black/5 transition-transform duration-200 hover:scale-110 ${link.className}`}
        >
          {link.icon}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            {link.name}
          </span>
        </a>
      ))}
    </div>
  );
}
