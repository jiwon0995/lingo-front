import type { ScoreAxis } from "./beer";

/**
 * 선택지가 목표 프로필에 주는 가중치.
 * 값은 "해당 축을 얼마나 밀어 올릴지"를 뜻하는 상대값이다.
 * 예: 쌉쌀·시트러스 → { bitterness: 2, aroma: 2, refreshing: 1 }
 */
export type ScoreEffect = Partial<Record<ScoreAxis, number>>;

export interface Option {
  id: string;
  /** 선택지 아이콘 (이모지) */
  icon: string;
  label: string;
  /** 선택지 보조 설명 */
  subtitle?: string;
  /** 이 선택지가 맛 프로필에 주는 가중치. 없으면 프로필에 영향을 주지 않는다 */
  scoreEffect?: ScoreEffect;
  /** 이 선택지가 가리키는 분위기. `Beer.moodTags` 와 매칭된다 */
  moodTags?: string[];
  /** 이 선택지가 가리키는 안주. `Beer.foodTags` 와 매칭된다 */
  foodTags?: string[];
}

export interface Question {
  /** 답변을 담는 키 (예: "company", "style") */
  key: string;
  title: string;
  options: Option[];
  /**
   * 이 질문이 추천 계산에 반영되는지.
   * `false` 면 답변만 수집하고 추천에서는 제외한다 (예: "어떻게 알고 오셨나요").
   * 생략하면 `true` 로 취급한다.
   */
  affectsRecommendation?: boolean;
}

/** questionKey → 선택한 optionId */
export type QuizAnswers = Record<string, string>;
