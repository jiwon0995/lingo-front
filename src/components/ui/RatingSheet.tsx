"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib";

/** 별 개수 */
const STAR_COUNT = 5;
/** 별을 고른 뒤 감사 화면으로 바뀌기까지 (프로토타입 `selectRating`) */
const THANKS_DELAY_MS = 260;
/** 별을 고른 뒤 시트가 스스로 닫히기까지 */
const AUTO_CLOSE_MS = 1600;

export interface RatingSheetProps {
  open: boolean;
  onClose: () => void;
  /** 별을 고른 순간 한 번 호출된다 */
  onRate: (rating: number) => void;
}

/**
 * 별점 바텀시트.
 *
 * 프로토타입 `#rating-modal` 의 마크업 · 문구 · 타이밍 그대로다.
 * 열림/닫힘은 `.open` 클래스가 만든다 (오버레이 fade 220ms + 시트 slide 300ms) —
 * 그래서 닫혀 있어도 DOM 에 남아 있어야 슬라이드가 재생된다.
 *
 * 언제 열지는 이 컴포넌트가 정하지 않는다. 결과 화면이 `open` 으로 지시한다.
 */
export function RatingSheet({ open, onClose, onRate }: RatingSheetProps) {
  const [rating, setRating] = useState(0);
  const [thanks, setThanks] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /**
   * 프로토타입 `resetRatingUI` — 열릴 때마다 별과 감사 화면을 되돌린다.
   * prop 변화에 맞춰 state 를 되돌리는 일은 effect 가 아니라 렌더 중에 한다
   * (React 권장 패턴: "Adjusting state when a prop changes").
   */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRating(0);
      setThanks(false);
    }
  }

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleRate = (value: number) => {
    if (rating > 0) return; // 이미 고른 뒤에는 감사 화면으로 넘어가는 중이다

    setRating(value);
    onRate(value);

    timersRef.current.push(
      setTimeout(() => setThanks(true), THANKS_DELAY_MS),
      setTimeout(onClose, AUTO_CLOSE_MS),
    );
  };

  return (
    <div
      role="dialog"
      aria-label="추천 만족도"
      aria-hidden={!open}
      onClick={(event) => {
        // 시트 바깥(딤 영역)을 눌렀을 때만 닫는다
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "rating-overlay fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(18,33,61,0.45)]",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        open && "open",
      )}
    >
      <div className="rating-sheet max-w-shell relative w-full rounded-t-[24px] bg-white px-6 pt-[30px] pb-[34px] shadow-[0_-16px_40px_-20px_rgba(18,33,61,0.35)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rating-close text-ink absolute top-4 right-4 flex size-8 items-center justify-center rounded-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {!thanks && (
          <div>
            <p className="text-ink mb-2 text-[12px] font-medium tracking-[0.03em]">
              피드백을 남겨주세요
            </p>
            <h3 className="text-ink mb-6 text-[19px] leading-[1.4] font-medium">
              이 맥주 추천이
              <br />
              얼마나 마음에 드시나요?
            </h3>
            <div className="mb-[4px] flex justify-center gap-[10px]">
              {Array.from({ length: STAR_COUNT }, (_, index) => index + 1).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRate(value)}
                    aria-label={`별 ${value}개`}
                    className={cn(
                      "rating-star text-[34px] leading-none",
                      value <= rating && "filled",
                    )}
                  >
                    ★
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {thanks && (
          <div className="flex flex-col items-center pt-[10px] pb-[6px] text-center">
            <div className="rating-thanks-icon mb-[10px] text-[40px]">🙌</div>
            <p className="text-ink text-[16px] font-medium">
              소중한 의견 감사해요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
