import type { Beer, BeerProfile } from "./beer";

/**
 * 답변에서 뽑아낸 취향 벡터.
 *
 * 다섯 축은 `BeerProfile` 과 같은 0~5 스케일이라 맥주 `profile` 과 바로 비교된다.
 * `moodTags` · `foodTags` 는 고른 선택지들이 가리킨 태그 집합이다.
 */
export interface UserVector extends BeerProfile {
  moodTags: Set<string>;
  foodTags: Set<string>;
  /**
   * 추천에 반영되는 답변이 하나라도 있었는지.
   * `false` 면 "아무거나 추천받기" 경로로 보고 전체를 랜덤으로 돌린다.
   * (`affectsRecommendation: false` 인 Q3만 답한 경우도 `false`)
   */
  hasSignal: boolean;
}

export interface Recommendation {
  beer: Beer;
  /**
   * 취향 벡터와의 유사도 0~100. **내부 랭킹 전용**이다.
   * 화면에 보여주는 매칭율은 `matchPercent` 를 쓴다.
   */
  score: number;
  /**
   * 결과 카드에 표시할 매칭율 — 프로토타입과 같게 `beer.match` 를 그대로 쓴다.
   * 계산된 `score` 가 아니다.
   */
  matchPercent: number;
  /** 결과 화면의 "추천 이유" 문장 (프로토타입 `buildReason` 과 동일) */
  reason: string;
}
