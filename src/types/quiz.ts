import type { BeerProfile } from "./beer";

/** 4단계 퀴즈의 질문 식별자 */
export type QuestionId = "flavor" | "body" | "occasion" | "adventure";

export interface Choice {
  id: string;
  label: string;
  /** 선택지 보조 설명 */
  sublabel?: string;
  emoji?: string;
  /** 이 선택지가 target 프로파일에 기여하는 값 (1~5) */
  weights: Partial<BeerProfile>;
  /** Beer.tags 와 매칭되는 키워드 */
  tags?: string[];
}

export interface Question {
  id: QuestionId;
  /** 1부터 시작하는 단계 번호 */
  step: number;
  title: string;
  subtitle?: string;
  choices: Choice[];
}

/** questionId → 선택한 choiceId */
export type QuizAnswers = Partial<Record<QuestionId, string>>;
