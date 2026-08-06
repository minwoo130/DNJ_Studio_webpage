import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Toast from "@/components/Toast";
import FloatingSocial from "@/components/FloatingSocial";
import "./globals.css";

const logoFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "DNJ STUDIO",
  description: "DNJ STUDIO 의류 쇼핑몰",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className={`${logoFont.variable} font-pretendard antialiased`}>
        {children}
        <FloatingSocial />
        <Toast />
      </body>
    </html>
  );
}
