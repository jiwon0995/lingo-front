import { describe, expect, it } from "vitest";
import { cn } from "./cn";

/**
 * `cn` 은 화면 곳곳에서 조건부 클래스를 붙이는 데 쓰인다.
 * falsy 를 걸러내지 못하면 `class="... false ..."` 같은 게 DOM 에 새어 나간다.
 */
describe("cn", () => {
  it("주어진 클래스를 공백으로 잇는다", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("falsy 값은 버린다", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("빈 문자열도 버린다 — 공백이 두 번 들어가지 않게", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("전부 falsy 면 빈 문자열", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("인자가 없으면 빈 문자열", () => {
    expect(cn()).toBe("");
  });

  it("조건부 사용 패턴 — 선택됐을 때만 클래스가 붙는다", () => {
    const card = (selected: boolean) => cn("opt-card", selected && "selected");

    expect(card(true)).toBe("opt-card selected");
    expect(card(false)).toBe("opt-card");
  });
});
