"use client";

import { useCallback, useMemo, useState } from "react";
import type { Question, QuizAnswers } from "@/types";

/**
 * 랜딩 → 퀴즈 → 결과 플로우의 진행 상태.
 * 질문 데이터는 Phase 2에서 만들어 인자로 넘긴다.
 */
export function useQuizFlow(questions: Question[]) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const question = questions[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === questions.length - 1;
  const isComplete = useMemo(
    () => questions.every((q) => answers[q.key] !== undefined),
    [questions, answers],
  );

  const select = useCallback((questionKey: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: optionId }));
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setStepIndex(0);
    setAnswers({});
  }, []);

  return {
    question,
    stepIndex,
    step: stepIndex + 1,
    totalSteps: questions.length,
    answers,
    isFirst,
    isLast,
    isComplete,
    select,
    next,
    prev,
    reset,
  };
}
