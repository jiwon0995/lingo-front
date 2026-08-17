"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { QUESTIONS } from "@/data";
import { pickAnother, recommend } from "@/lib";
import type {
  Question,
  QuizAnswers,
  RatingSubmitHandler,
  Recommendation,
} from "@/types";

/** 선택지를 고른 뒤 다음 질문으로 넘어가기까지의 지연(ms). 프로토타입과 동일 */
const SELECT_DELAY_MS = 260;

/** 랜딩 화면의 스텝 번호. 질문은 `1..N`, 결과는 `N+1` */
export const LANDING_STEP = 0;

export interface QuizContextValue {
  /* ---- 데이터 ---- */
  questions: Question[];
  /** 질문 개수. 스텝퍼 · "STEP n/N" · 랜딩 안내 문구가 전부 이 값에서 나온다 */
  totalSteps: number;
  /** 결과 화면의 스텝 번호 (= `totalSteps + 1`) */
  resultStep: number;

  /* ---- 상태 ---- */
  step: number;
  answers: QuizAnswers;
  /** 현재 스텝의 질문. 랜딩 · 결과에서는 `undefined` */
  question: Question | undefined;
  /** 지금 화면에 띄운 추천. 결과 화면 전에는 `null` */
  recommendation: Recommendation | null;
  /** "다른 추천"을 누른 횟수. 카드 스왑 · 다이스 스핀 재생 트리거로 쓴다 */
  swapCount: number;

  /* ---- 액션 ---- */
  /** 선택지 선택 → 260ms 뒤 다음 스텝으로 (프로토타입 `onSelectOption`) */
  select: (questionKey: string, optionId: string) => void;
  /** 랜딩 "시작하기" */
  start: () => void;
  /** 랜딩 "아무거나 추천받기" — 질문 없이 랜덤 결과로 */
  quickPick: () => void;
  /** 뒤로가기. 결과에서는 마지막 질문으로, 질문에서는 이전 스텝으로 */
  back: () => void;
  /** 결과 "처음부터 다시하기" — 답변을 지우고 랜딩으로 */
  restart: () => void;
  /** 다이스 FAB — 지금 맥주를 뺀 나머지 중 랜덤으로 갈아끼운다 */
  reroll: () => void;
  /** 별점 제출. 바깥에서 받은 `onSubmitRating` 에 맥락을 붙여 넘긴다 */
  submitRating: (rating: number) => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export interface QuizProviderProps {
  children: ReactNode;
  /** 질문 데이터. 기본값 `QUESTIONS` — 테스트에서 갈아끼운다 */
  questions?: Question[];
  /** 별점 전송 콜백. 없으면 별점은 화면 안에서만 소비된다 */
  onSubmitRating?: RatingSubmitHandler;
}

/**
 * 랜딩 → 퀴즈 → 결과 플로우의 상태를 한 곳에 모은다.
 *
 * 프로토타입의 전역 `state` 객체 + `goToStep()` 이 하던 일과 같다.
 * 스텝 번호의 뜻도 같다 — `0` 랜딩, `1..N` 질문, `N+1` 결과.
 * 다만 N 은 상수가 아니라 `questions.length` 라서 질문을 늘려도 고칠 게 없다.
 */
export function QuizProvider({
  children,
  questions = QUESTIONS,
  onSubmitRating,
}: QuizProviderProps) {
  const totalSteps = questions.length;
  const resultStep = totalSteps + 1;

  const [step, setStep] = useState(LANDING_STEP);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [swapCount, setSwapCount] = useState(0);

  /**
   * 추천 순위 전체를 들고 있는다. 다이스 FAB 가 여기서 다른 후보를 꺼내므로
   * 추천을 다시 돌리지 않는다 — `recommend()` 는 `Math.random()` 을 쓰기 때문에
   * 다시 부르면 순위가 달라진다.
   */
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentBeerId, setCurrentBeerId] = useState<string | null>(null);

  const recommendation =
    recommendations.find(({ beer }) => beer.id === currentBeerId) ?? null;

  /** 선택 → 다음 질문 전환 타이머 (프로토타입의 `setTimeout(..., 260)`) */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingStep = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => clearPendingStep, []);

  /** 추천을 뽑아 결과 화면으로 (프로토타입 `showResult` · `quickRandomRecommendation`) */
  const goToResult = (forAnswers: QuizAnswers) => {
    const ranked = recommend(forAnswers);
    const [top] = ranked;
    if (!top) return;

    setRecommendations(ranked);
    setCurrentBeerId(top.beer.id);
    setSwapCount(0);
    // 프로토타입 `renderBeerResult` 의 `state.style = dbKey` 와 같다 —
    // 화면에 띄운 맥주의 스타일이 곧 "고른 스타일"이 되므로, 결과에서
    // 뒤로가면 마지막 질문에 그 스타일이 선택된 채로 보인다.
    setAnswers({ ...forAnswers, style: top.beer.styleId });
    setStep(resultStep);
  };

  const select = (questionKey: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionKey]: optionId };
    setAnswers(nextAnswers);

    // popSelect 를 보여주고 260ms 뒤에 넘어간다
    clearPendingStep();
    timerRef.current = setTimeout(() => {
      if (step < totalSteps) setStep(step + 1);
      else goToResult(nextAnswers);
    }, SELECT_DELAY_MS);
  };

  const start = () => {
    clearPendingStep();
    setStep(1);
  };

  const quickPick = () => {
    clearPendingStep();
    // 답변이 하나도 없으면 `recommend()` 가 전체를 랜덤 셔플한다
    goToResult({});
  };

  const back = () => {
    clearPendingStep();
    setStep(step === resultStep ? totalSteps : Math.max(LANDING_STEP, step - 1));
  };

  const restart = () => {
    clearPendingStep();
    setAnswers({});
    setRecommendations([]);
    setCurrentBeerId(null);
    setSwapCount(0);
    setStep(LANDING_STEP);
  };

  const reroll = () => {
    if (!recommendation) return;

    const next = pickAnother(
      recommendation.beer.id,
      recommendations.map(({ beer }) => beer),
    );
    if (!next) return;

    setCurrentBeerId(next.id);
    setSwapCount(swapCount + 1);
    setAnswers({ ...answers, style: next.styleId });
  };

  const submitRating = (rating: number) => {
    if (!recommendation) return;

    onSubmitRating?.({
      rating,
      beerId: recommendation.beer.id,
      styleId: recommendation.beer.styleId,
      answers,
      ratedAt: new Date().toISOString(),
    });
  };

  // 값을 메모하지 않는다 — 이 Provider 는 상태가 바뀔 때만 리렌더하고,
  // 그때는 소비자도 어차피 다시 그려야 한다.
  const value: QuizContextValue = {
    questions,
    totalSteps,
    resultStep,
    step,
    answers,
    question: questions[step - 1],
    recommendation,
    swapCount,
    select,
    start,
    quickPick,
    back,
    restart,
    reroll,
    submitRating,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

/** 퀴즈 플로우 상태를 읽는다. `QuizProvider` 안에서만 쓸 수 있다 */
export function useQuiz(): QuizContextValue {
  const value = useContext(QuizContext);
  if (!value) {
    throw new Error("useQuiz 는 QuizProvider 안에서만 쓸 수 있습니다");
  }
  return value;
}
