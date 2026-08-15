import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "링고 — 오늘의 맥주 추천",
  description: "4개의 질문으로 오늘 나에게 잘 맞는 맥주를 찾아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#d92b2b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* Pretendard: 프로토타입과 동일한 CDN <link> 방식 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css"
        />
        <style>{`:root { --font-pretendard: "Pretendard", "Pretendard Variable"; }`}</style>
      </head>
      <body className="min-h-dvh">
        {/* 모바일 우선 셸: 최대 390px 중앙 정렬 */}
        <div className="mx-auto flex min-h-dvh w-full max-w-shell flex-col bg-surface">
          {children}
        </div>
      </body>
    </html>
  );
}
