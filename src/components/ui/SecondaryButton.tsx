import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib";

/**
 * 프로토타입에 있는 두 가지 크기.
 * `lg` = 랜딩 "아무거나 추천받기", `md` = 결과 화면 "처음부터 다시하기".
 *
 * 크기를 `className` 으로 덮어쓰지 않고 prop 으로 고르게 한 이유는,
 * Tailwind 는 클래스 문자열 순서가 아니라 스타일시트 순서로 이기기 때문이다 —
 * `py-4` 와 `py-3.5` 를 같이 넘기면 어느 쪽이 이길지 보장되지 않는다.
 */
const SIZES = {
  lg: "py-4 text-[16px]",
  md: "py-3.5 text-[15px]",
} as const;

export interface SecondaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: keyof typeof SIZES;
}

/**
 * 회색 보조 버튼. 프로토타입 `.btn-primary-alt` · `.btn-secondary` 를 합친 것이다 —
 * 두 클래스의 CSS 규칙이 완전히 같아서 하나로 둔다.
 */
export function SecondaryButton({
  size = "lg",
  className,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "btn-secondary text-ink w-full rounded-xl font-medium",
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
