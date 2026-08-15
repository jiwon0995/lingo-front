/** 조건부 className 결합 (falsy 값 제거) */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
