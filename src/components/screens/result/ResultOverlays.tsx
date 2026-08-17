"use client";

import { useEffect, useState } from "react";
import { DiceFab, RatingSheet } from "@/components/ui";
import { useQuiz } from "@/context";

/** 결과 진입 후 별점 시트가 뜨기까지 (프로토타입 `scheduleRatingPrompt`) */
const RATING_DELAY_MS = 1400;

/**
 * 결과 화면 위에 뜨는 것들 — 다이스 FAB 와 별점 바텀시트.
 *
 * 둘 다 `position: fixed` 라서 **결과 화면(`<Screen>`) 안에 두면 안 된다.**
 * `.fade-enter` 는 `animation-fill-mode: both` 라 애니메이션이 끝나도
 * `transform: translateY(0)` 이 남고, transform 이 걸린 요소는 자손 fixed 의
 * 기준 박스가 되기 때문이다 (뷰포트가 아니라 그 섹션에 붙어버린다).
 * 프로토타입도 같은 이유로 이 둘을 `.screen` 밖 `#app` 바로 아래에 뒀다.
 *
 * 별점 시트는 결과에 들어올 때 한 번만 예약된다 — 다이스로 맥주를 바꿔도
 * 다시 뜨지 않는다 (프로토타입과 동일).
 */
export function ResultOverlays() {
  const { swapCount, reroll, submitRating } = useQuiz();
  const [ratingOpen, setRatingOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRatingOpen(true), RATING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <DiceFab spinCount={swapCount} onClick={reroll} />
      <RatingSheet
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onRate={submitRating}
      />
    </>
  );
}
