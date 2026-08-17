"use client";

import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@/data";
import { recommend } from "@/lib";
import type { QuizAnswers, Recommendation } from "@/types";
import { AppHeader } from "./ui";
import { LandingScreen } from "./screens/landing";
import { QuizScreen } from "./screens/quiz";
import { ResultScreen } from "./screens/result";

/** 선택지를 고른 뒤 다음 질문으로 넘어가기까지의 지연(ms). 프로토타입과 동일 */
const SELECT_DELAY_MS = 260;

/**
 * 랜딩 → 퀴즈 → 결과 플로우의 진입점.
 *
 * 프로토타입의 `state.step` · `goToStep()` · `showScreen()` 을 그대로 옮겼다.
 * 단계 번호의 뜻도 같다 — `0` 랜딩, `1..N` 질문, `N+1` 결과. 다만 N 은 상수가
 * 아니라 `QUESTIONS.length` 라서, 질문을 늘려도 이 파일은 고칠 게 없다.
 */
export function BeerFinderApp() {
  const questions = QUESTIONS;
  const totalSteps = questions.length;
  const resultStep = totalSteps + 1;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );

  /**
   * 선택 → 다음 질문 전환 타이머.
   * 추천은 `Math.random()` 을 쓰므로 렌더 중이 아니라 전환 시점에 한 번만 뽑아
   * state 에 담는다 — 안 그러면 리렌더마다 결과가 바뀐다.
   */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingStep = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => clearPendingStep, []);

  /** 프로토타입 `goToStep()`. 마지막 질문을 넘어서면 결과를 뽑는다 */
  const goToStep = (next: number, forAnswers: QuizAnswers = answers) => {
    if (next < resultStep) {
      setStep(Math.max(0, next));
      return;
    }

    const [top] = recommend(forAnswers);
    if (!top) return;
    setRecommendation(top);
    setStep(resultStep);
  };

  const handleSelect = (questionKey: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionKey]: optionId };
    setAnswers(nextAnswers);

    // 프로토타입과 같이 popSelect 를 보여주고 260ms 뒤에 넘어간다
    clearPendingStep();
    timerRef.current = setTimeout(
      () => goToStep(step + 1, nextAnswers),
      SELECT_DELAY_MS,
    );
  };

  /** "아무거나 추천받기" — 답변 없이 추천을 돌리면 전체가 랜덤이다 */
  const handleQuickPick = () => {
    clearPendingStep();
    setAnswers({});
    goToStep(resultStep, {});
  };

  const handleRestart = () => {
    clearPendingStep();
    setAnswers({});
    setRecommendation(null);
    setStep(0);
  };

  const question = questions[step - 1];

  return (
    <div className="max-w-shell relative mx-auto flex min-h-dvh w-full flex-col overflow-x-hidden bg-white">
      <AppHeader />

      {step === 0 && (
        <LandingScreen
          totalQuestions={totalSteps}
          onStart={() => goToStep(1)}
          onQuickPick={handleQuickPick}
        />
      )}

      {question && (
        // key 로 스텝마다 새로 마운트해 fade-enter 를 다시 재생한다
        // (프로토타입은 goToStep 마다 showScreen 이 클래스를 뗐다 붙였다)
        <QuizScreen
          key={step}
          question={question}
          step={step}
          totalSteps={totalSteps}
          selectedOptionId={answers[question.key]}
          onSelect={handleSelect}
          onBack={() => goToStep(step - 1)}
        />
      )}

      {step === resultStep && recommendation && (
        <ResultScreen
          recommendation={recommendation}
          onBack={() => setStep(totalSteps)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
