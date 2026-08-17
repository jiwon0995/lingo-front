import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 짙은 남색 기본 버튼. 프로토타입 `.btn-primary` (랜딩 "시작하기") 그대로다.
 * 배경 · 눌림 효과는 `globals.css` 의 `.btn-primary` 가 맡는다.
 */
export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "btn-primary w-full rounded-xl py-4 text-[16px] font-medium text-white",
        className,
      )}
      {...props}
    />
  );
}
