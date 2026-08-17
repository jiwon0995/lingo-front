"use client";

import { useEffect, useRef } from "react";
import { QuizProvider, useQuiz } from "@/context";
import { useConfetti } from "@/hooks";
import type { RatingSubmitHandler } from "@/types";
import { AppHeader } from "./ui";
import { LandingScreen } from "./screens/landing";
import { QuizScreen } from "./screens/quiz";
import { ResultOverlays, ResultScreen } from "./screens/result";

/** 결과에 처음 들어올 때 뿌리는 조각 수 (프로토타입 `launchConfetti(26)`) */
const RESULT_CONFETTI = 26;
/** "다른 추천"을 눌렀을 때의 미니 컨페티 (프로토타입 `launchConfetti(14)`) */
const REROLL_CONFETTI = 14;

export interface BeerFinderAppProps {
  /**
   * 별점 전송 콜백. 넘기지 않으면 별점은 화면 안에서만 소비된다 —
   * 즉 이 prop 의 유무로 화면이 달라지지 않는다.
   */
  onSubmitRating?: RatingSubmitHandler;
}

/**
 * 랜딩 → 퀴즈 → 결과 플로우의 진입점.
 *
 * 상태는 전부 `QuizProvider` 가 들고 있고, 이 파일은 "지금 어떤 화면인지"만 보고
 * 그린다. 스텝 번호의 뜻은 프로토타입과 같다 — `0` 랜딩, `1..N` 질문, `N+1` 결과.
 */
export function BeerFinderApp({ onSubmitRating }: BeerFinderAppProps) {
  return (
    <QuizProvider onSubmitRating={onSubmitRating}>
      <BeerFinderShell />
    </QuizProvider>
  );
}

function BeerFinderShell() {
  const { step, resultStep, question, swapCount } = useQuiz();

  /** 컨페티 조각이 떨어질 가로 범위 — 프로토타입의 `#app` rect 와 같다 */
  const shellRef = useRef<HTMLDivElement>(null);
  const launchConfetti = useConfetti(shellRef);

  const onResult = step === resultStep;

  // 결과에 들어올 때 한 번
  useEffect(() => {
    if (!onResult) return;
    launchConfetti(RESULT_CONFETTI);
  }, [onResult, launchConfetti]);

  // "다른 추천"을 누를 때마다 (첫 진입은 swapCount 가 0이라 건너뛴다)
  useEffect(() => {
    if (swapCount === 0) return;
    launchConfetti(REROLL_CONFETTI);
  }, [swapCount, launchConfetti]);

  return (
    <div
      ref={shellRef}
      className="max-w-shell relative mx-auto flex min-h-dvh w-full flex-col overflow-x-hidden bg-white"
    >
      <AppHeader />

      {step === 0 && <LandingScreen />}

      {/* key 로 스텝마다 새로 마운트해 fade-enter 를 다시 재생한다
          (프로토타입은 goToStep 마다 showScreen 이 클래스를 뗐다 붙였다) */}
      {question && <QuizScreen key={step} />}

      {onResult && <ResultScreen />}

      {/* 다이스 FAB · 별점 시트는 화면(`<Screen>`) 밖에 둔다 — 자세한 이유는
          ResultOverlays 주석 참고 (transform 이 fixed 의 기준을 바꾼다) */}
      {onResult && <ResultOverlays />}
    </div>
  );
}
