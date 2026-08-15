import type { HTMLAttributes } from "react";
import { cn } from "@/lib";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 결과 카드 등장 시 cardSwap 애니메이션 적용 */
  animated?: boolean;
}

export function Card({ animated = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-surface p-5 shadow-sm",
        animated && "animate-card-swap",
        className,
      )}
      {...props}
    />
  );
}
