import type { HTMLAttributes } from "react";
import { cn } from "@/lib";

export type ScreenProps = HTMLAttributes<HTMLElement>;

/**
 * 화면 하나를 감싸는 `<section>`.
 *
 * 프로토타입의 `.screen.active` (flex 컬럼 · `flex:1` · `min-height:0`) 와
 * 진입 애니메이션 `.fade-enter` (fadeSlideIn 320ms) 를 함께 얹는다.
 *
 * 프로토타입은 `showScreen()` 이 클래스를 뗐다 붙여 애니메이션을 재생했지만,
 * 여기서는 화면이 바뀔 때 컴포넌트가 새로 마운트되므로 자연히 다시 재생된다.
 */
export function Screen({ className, ...props }: ScreenProps) {
  return (
    <section
      className={cn(
        "fade-enter relative z-[1] flex min-h-0 w-full flex-1 flex-col",
        className,
      )}
      {...props}
    />
  );
}
