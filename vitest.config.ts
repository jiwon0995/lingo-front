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
    include: ["src/**/*.test.ts"],
  },
});
