import type { Question } from "@/types";

/** 랜딩 → 4단계 퀴즈 → 결과 플로우의 질문 정의 (임시 카피) */
export const QUESTIONS: Question[] = [
  {
    id: "flavor",
    step: 1,
    title: "어떤 맛이 끌리세요?",
    subtitle: "오늘 기분에 가장 가까운 걸 골라주세요",
    choices: [
      {
        id: "clean",
        label: "깔끔하고 청량한",
        emoji: "💧",
        weights: { bitter: 2, sweet: 1, sour: 1 },
        tags: ["청량", "깔끔함"],
      },
      {
        id: "sweet",
        label: "달콤하고 부드러운",
        emoji: "🍯",
        weights: { bitter: 1, sweet: 4, sour: 2 },
        tags: ["달콤", "부드러움"],
      },
      {
        id: "bitter",
        label: "쌉싸름하고 진한",
        emoji: "🌿",
        weights: { bitter: 5, sweet: 2, aroma: 4 },
        tags: ["강한홉", "커피향"],
      },
      {
        id: "sour",
        label: "새콤하고 상큼한",
        emoji: "🍋",
        weights: { bitter: 1, sweet: 3, sour: 5 },
        tags: ["체리", "감귤향"],
      },
    ],
  },
  {
    id: "body",
    step: 2,
    title: "무게감은 어느 쪽이 좋으세요?",
    choices: [
      {
        id: "light",
        label: "물처럼 가볍게",
        emoji: "🪶",
        weights: { body: 1 },
        tags: ["가벼움"],
      },
      {
        id: "medium",
        label: "적당하게",
        emoji: "⚖️",
        weights: { body: 3 },
        tags: [],
      },
      {
        id: "heavy",
        label: "묵직하게",
        emoji: "🪨",
        weights: { body: 5 },
        tags: ["묵직함"],
      },
    ],
  },
  {
    id: "occasion",
    step: 3,
    title: "오늘 어떤 자리인가요?",
    choices: [
      {
        id: "meal",
        label: "밥이랑 같이",
        emoji: "🍗",
        weights: { body: 2, aroma: 2 },
        tags: ["식사와함께", "치맥"],
      },
      {
        id: "alone",
        label: "혼자 조용히",
        emoji: "🌙",
        weights: { body: 4, aroma: 4 },
        tags: ["혼술", "분위기"],
      },
      {
        id: "party",
        label: "여럿이 신나게",
        emoji: "🎉",
        weights: { body: 2, aroma: 2 },
        tags: ["청량", "치맥"],
      },
    ],
  },
  {
    id: "adventure",
    step: 4,
    title: "새로운 맥주, 얼마나 도전해볼까요?",
    choices: [
      {
        id: "safe",
        label: "익숙한 게 좋아요",
        emoji: "🛟",
        weights: { bitter: 2, aroma: 2 },
        tags: ["입문용"],
      },
      {
        id: "curious",
        label: "조금은 새롭게",
        emoji: "🧭",
        weights: { aroma: 4 },
        tags: ["적당한도전"],
      },
      {
        id: "bold",
        label: "확 새로운 걸로",
        emoji: "🚀",
        weights: { bitter: 4, aroma: 5 },
        tags: ["도전적"],
      },
    ],
  },
];

/** 퀴즈 총 단계 수 (프로그레스 바용) */
export const TOTAL_STEPS = QUESTIONS.length;
