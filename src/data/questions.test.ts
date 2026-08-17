import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";

/**
 * 질문 문구 고정 테스트.
 *
 * 질문 제목 · 선택지 라벨 · 이모지 · 서브타이틀은 프로토타입
 * (`docs/prototype.html`) 원문이자 확정된 피그마 디자인이라 **임의로 바뀌면 안 된다.**
 * 여기서 스냅샷으로 못박아 두면 누가 문구를 건드리는 순간 테스트가 깨진다.
 *
 * 의도적으로 문구를 바꿀 때는 스냅샷을 갱신하면 된다:
 *
 * ```
 * npx vitest run -u
 * ```
 *
 * 스냅샷에는 **화면에 보이는 값만** 담는다. `scoreEffect` · `moodTags` 같은
 * 추천 전용 값은 튜닝 대상이라 여기서 잠그지 않는다 —
 * 그쪽 회귀 검사는 `npm run check:questions` 와 `recommend.test.ts` 가 맡는다.
 */
describe("질문 문구", () => {
  it("질문 제목 · 선택지 라벨 · 이모지 · 서브타이틀이 그대로다", () => {
    const copy = QUESTIONS.map((question) => ({
      key: question.key,
      title: question.title,
      options: question.options.map((option) => ({
        id: option.id,
        icon: option.icon,
        label: option.label,
        // subtitle 이 없는 선택지는 없다는 사실까지 스냅샷에 남긴다
        subtitle: option.subtitle ?? null,
      })),
    }));

    expect(copy).toMatchSnapshot();
  });

  it("질문 개수와 선택지 개수가 그대로다", () => {
    const shape = QUESTIONS.map(
      (question) => `${question.key}: ${question.options.length}개`,
    );

    expect(shape).toMatchSnapshot();
  });
});
