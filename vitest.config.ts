import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * 추천 엔진은 React · Next 에 의존하지 않는 순수 TypeScript라
 * Next 빌드와 무관하게 이 설정만으로 독립 실행된다 — `npm test`.
 */
export default defineConfig({
  resolve: {
    // 소스와 같은 `@/` 경로 별칭 (tsconfig.json 의 paths 와 맞춰둔다)
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // e2e(`e2e/`)는 Playwright 가 따로 돌린다 — 여기서는 순수 로직만 본다
    include: ["src/**/*.test.ts"],
    coverage: {
      // 화면 컴포넌트는 e2e 가 맡으므로 커버리지는 로직·데이터만 잰다
      include: ["src/lib/**", "src/data/**"],
      reporter: ["text", "html"],
    },
  },
});
