/**
 * 추천 스코어링용 맛 프로필. 모든 축은 0~5 정수.
 * 화면에는 보이지 않고 추천 계산에만 쓰인다.
 */
export interface BeerProfile {
  /** 단맛 */
  sweetness: number;
  /** 쓴맛 */
  bitterness: number;
  /** 향 강도 */
  aroma: number;
  /** 바디감(묵직함) */
  body: number;
  /** 청량감 */
  refreshing: number;
}

/** 프로필 축 이름 */
export type ScoreAxis = keyof BeerProfile;

/**
 * 분위기 태그로 쓰는 값들. 프로토타입 Q2(occasion)의 선택지 id와 같다.
 * `Beer.moodTags` 는 확장을 막지 않으려고 `string[]` 이며, 이 상수는
 * 새 데이터를 채울 때 참고하는 어휘집이다.
 */
export const MOOD_TAGS = [
  "celebration",
  "meal",
  "chill",
  "gathering",
] as const;

/** 안주 태그 어휘집. `Beer.foodTags` 에 넣을 값들 */
export const FOOD_TAGS = [
  "fried",
  "spicy",
  "dessert",
  "seafood",
  "light",
] as const;

export interface Beer {
  /** 프로토타입 BEER_DB의 객체 key (예: "clean-lager") */
  id: string;
  /** 스타일 카테고리. 초기에는 id와 동일하고, 한 스타일에 여러 종이 생기면 갈라진다 */
  styleId: string;

  name: string;
  /** 대표 이모지 */
  emoji: string;
  /** 카드 상단 한 줄 카피 */
  tagline: string;
  /** 맛 설명 문장 */
  taste: string;
  /** 어떤 순간에 어울리는지 */
  perfectFor: string;
  /** 특징 키워드 */
  tags: string[];
  /** 어울리는 안주 */
  pairing: string[];
  /** 도수. 표시용 문자열 (예: "4.8%") */
  abv: string;
  /** 쓴맛 지수 */
  ibu: number;
  /** 결과 카드에 표시할 매칭율 (프로토타입의 하드코딩 값) */
  match: number;
  /** 대표 사진 URL. 교체하기 쉽게 단일 필드로 둔다 */
  photo: string;
  /** 잔 위에 얹는 가니시 이모지 */
  garnish: string;

  /** 잔 그래픽 본체 색 (현재 화면 미사용, 데이터 보존) */
  color: string;
  /** 잔 그래픽 밝은 쪽 색 (현재 화면 미사용, 데이터 보존) */
  colorLight: string;
  /** 거품 색 (현재 화면 미사용, 데이터 보존) */
  foam: string;

  /** 추천 스코어링용 맛 프로필 (0~5). 화면 미노출 */
  profile: BeerProfile;
  /** 분위기 태그. 어휘는 `MOOD_TAGS` 참고 */
  moodTags: string[];
  /** 안주 태그. 어휘는 `FOOD_TAGS` 참고 */
  foodTags: string[];
}
