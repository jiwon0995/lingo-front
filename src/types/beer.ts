/** 맥주 스타일 (프로토타입 데이터 기준, 필요 시 확장) */
export type BeerStyle =
  | "lager"
  | "pilsner"
  | "wheat"
  | "pale-ale"
  | "ipa"
  | "stout"
  | "sour";

/**
 * 맛 프로파일. 모든 축은 1~5 정수.
 * 추천 엔진이 퀴즈 답변으로 만든 target 프로파일과 거리 비교하는 데 사용.
 */
export interface BeerProfile {
  /** 쓴맛 */
  bitter: number;
  /** 바디감 (가벼움 → 묵직함) */
  body: number;
  /** 단맛 */
  sweet: number;
  /** 신맛 */
  sour: number;
  /** 향 강도 */
  aroma: number;
}

/** 프로파일에서 사용하는 축 이름 */
export type ProfileAxis = keyof BeerProfile;

export interface Beer {
  id: string;
  /** 한글 표기명 */
  name: string;
  /** 원어 표기명 */
  nameEn: string;
  brewery: string;
  /** 원산지 (예: "독일") */
  country: string;
  style: BeerStyle;
  /** 도수 (%) */
  abv: number;
  /** 쓴맛 지수 */
  ibu: number;
  profile: BeerProfile;
  /** 퀴즈 선택지 태그와 매칭되는 키워드 */
  tags: string[];
  /** 결과 카드용 한 줄 설명 */
  description: string;
  /** 결과 카드 이미지 (미정 시 undefined) */
  imageUrl?: string;
}
