import type { Beer } from "./beer";

export interface Recommendation {
  beer: Beer;
  /** 0~1, 높을수록 잘 맞음 */
  score: number;
  /** 결과 카드에 표시할 % (0~100 정수) */
  matchPercent: number;
  /** "쓴맛이 적당해요" 같은 추천 사유 */
  reasons: string[];
}
