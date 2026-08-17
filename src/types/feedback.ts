import type { QuizAnswers } from "./question";

/**
 * 별점 한 건.
 *
 * 결과 화면이 모은 별점에, 그 별점이 무엇을 향한 것인지(맥주 · 답변 맥락)를
 * 함께 담는다. 전송 수단(fetch · Server Action · 로깅)은 이 타입이 정하지 않는다 —
 * 구현체는 `RatingSubmitHandler` 로 바깥에서 주입한다.
 */
export interface RatingSubmission {
  /** 사용자가 고른 별 개수 (1~5) */
  rating: number;
  /** 별점을 받은 맥주 (`Beer.id`) */
  beerId: string;
  /** 그 맥주의 스타일 (`Beer.styleId`) */
  styleId: string;
  /**
   * 그 추천을 만든 답변.
   * "아무거나 추천받기" 로 왔다면 사용자가 실제로 답한 질문은 없다.
   */
  answers: QuizAnswers;
  /** 별점을 누른 시각 (ISO 8601) */
  ratedAt: string;
}

/**
 * 별점을 바깥으로 넘기는 콜백.
 *
 * 지금은 아무도 넘기지 않아 별점이 화면 안에서만 소비된다 —
 * 즉 이 인터페이스가 생겨도 **화면 동작은 그대로다.**
 * 나중에 API 가 생기면 `<BeerFinderApp onSubmitRating={...} />` 한 줄만 붙이면 된다.
 */
export type RatingSubmitHandler = (
  submission: RatingSubmission,
) => void | Promise<void>;
