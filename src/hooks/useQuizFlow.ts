"use client";

import { useCallback, useMemo, useState } from "react";
import { QUESTIONS } from "@/data";
import type { QuestionId, QuizAnswers } from "@/types";

/**
 * 랜딩 → 4단계 퀴즈 → 결과 플로우의 진행 상태.
 * 화면 구현은 다음 단계에서 이 훅을 붙여 쓰면 됩니다.
 */
export function useQuizFlow(questions = QUESTIONS) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const question = questions[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === questions.length - 1;
  const isComplete = useMemo(
    () => questions.every((q) => answers[q.id] !== undefined),
    [questions, answers],
  );

  const select = useCallback((questionId: QuestionId, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
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
