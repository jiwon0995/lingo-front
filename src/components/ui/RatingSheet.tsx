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

  /**
   * 닫기 콜백은 호출부에서 인라인 함수로 넘어와 매 렌더 새로 만들어진다.
   * 아래 포커스 효과가 그때마다 다시 돌지 않도록 ref 에 담아 쓴다.
   */
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /**
   * 열리면 시트로 포커스를 옮기고 ESC 로 닫을 수 있게 한다.
   * 닫힐 때는 원래 포커스가 있던 곳(결과 화면의 버튼)으로 되돌린다.
   * `preventScroll` 을 주는 이유는 포커스 때문에 화면이 튀지 않게 하려는 것이다 —
   * 프로토타입의 열림/닫힘 모습은 그대로다.
   */
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

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
      aria-modal="true"
      aria-label="추천 만족도"
      aria-hidden={!open}
      // 닫혀 있어도 DOM 에 남아 있으므로(슬라이드 재생용) 그동안 Tab 이
      // 시트 안으로 들어가지 않도록 막는다. 화면에는 아무 변화가 없다.
      inert={!open}
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
      <div
        ref={sheetRef}
        // 열릴 때 포커스를 받기 위한 것 — Tab 순서에는 들어가지 않는다
        tabIndex={-1}
        className="rating-sheet max-w-shell relative w-full rounded-t-[24px] bg-white px-6 pt-[30px] pb-[34px] shadow-[0_-16px_40px_-20px_rgba(18,33,61,0.35)] focus:outline-none"
      >
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
          // 별을 고르면 이 화면으로 바뀐다 — 바뀐 사실을 소리로도 알린다
          <div
            role="status"
            className="flex flex-col items-center pt-[10px] pb-[6px] text-center"
          >
            <div
              aria-hidden="true"
              className="rating-thanks-icon mb-[10px] text-[40px]"
            >
              🙌
            </div>
            <p className="text-ink text-[16px] font-medium">
              소중한 의견 감사해요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
