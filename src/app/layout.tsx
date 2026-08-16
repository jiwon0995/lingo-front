import type { Metadata, Viewport } from "next";
import { APP_TITLE } from "@/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "간단한 질문 4개에 답하면 딱 맞는 맥주를 추천해드려요.",
};

/**
 * 프로토타입의 viewport meta 와 동일하게 맞춘다.
 * 확대 금지(maximum-scale=1, user-scalable=no)는 접근성 관점에선 권장되지
 * 않지만, 프로토타입 재현이 우선이라 그대로 둔다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — 프로토타입과 동일한 CDN <link> 방식 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
