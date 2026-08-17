import { defineConfig, devices } from "@playwright/test";

/**
 * e2e 설정 — `npm run test:e2e`.
 *
 * 단위 테스트(Vitest)는 `src/**\/*.test.ts` 만 보고, e2e 는 `e2e/` 만 본다.
 * 서버는 Playwright 가 직접 `next dev` 를 띄운다 (이미 떠 있으면 재사용).
 */
// next dev 는 같은 디렉터리에서 두 번 뜨지 않는다 — 기본 포트를 그대로 쓰고
// 이미 떠 있으면 재사용한다 (`reuseExistingServer`).
const PORT = Number(process.env.E2E_PORT ?? 3000);
// 호스트는 localhost 로 고정한다 — next dev 의 HMR 웹소켓이 페이지 origin 을
// 그대로 쓰기 때문에 127.0.0.1 로 열면 핸드셰이크가 실패하고 하이드레이션이 멈춘다.
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      // 프로토타입 기준 화면(390px)에 가장 가까운 모바일 뷰포트.
      // iPhone 12 프리셋은 기본 브라우저가 webkit 이라 chromium 으로 되돌린다.
      name: "mobile-chrome",
      use: { ...devices["iPhone 12"], browserName: "chromium" },
    },
  ],

  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
