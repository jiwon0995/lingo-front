"use client";

import { useReplayAnimation } from "@/hooks";

export interface DiceFabProps {
  /**
   * 지금까지 누른 횟수. 값이 바뀔 때마다 다이스가 한 바퀴 돈다
   * (프로토타입 `showAnotherRecommendation` 의 `dice-spin` 재적용).
   */
  spinCount: number;
  onClick: () => void;
}

/**
 * "다른 추천 보기" 플로팅 버튼.
 *
 * 프로토타입 `#btn-another` 그대로다 — 위치(`.dice-fab`)와 모양(`.dice-btn`) 은
 * globals.css 에 있다. 결과 화면에서만 렌더하므로 `.is-hidden` 은 옮기지 않았다.
 */
export function DiceFab({ spinCount, onClick }: DiceFabProps) {
  const ref = useReplayAnimation<HTMLButtonElement>("dice-spin", spinCount);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="다른 추천 보기"
      className="dice-btn dice-fab flex size-[68px] flex-col items-center justify-center rounded-[24px]"
    >
      <span className="text-2xl leading-none">🎲</span>
      <span className="dice-btn-label mt-1 text-[12px] leading-none font-medium tracking-tight">
        랜덤 추천
      </span>
    </button>
  );
}
