/**
 * 결과 화면의 "추천 이유" 문장을 만드는 문구 조각.
 *
 * 프로토타입(`docs/prototype.html`)의 `COMPANY_PHRASE` · `OCCASION_REASON` ·
 * `TASTE_ADJ` 를 문구 수정 없이 그대로 옮긴 것이다. 프로토타입의
 * `buildReason()` 이 이 세 개를 이어 붙여 문장을 만든다.
 *
 * key는 각각 Q1(company) · Q2(occasion) 선택지 id와 스타일 id다.
 * 선택지를 추가하면 여기에도 같은 key를 넣어야 문장이 완성된다 —
 * 없으면 해당 조각만 빠진다.
 */

/** Q1(company) 선택지 id → "혼자서" 같은 동행 표현 */
export const COMPANY_PHRASE: Record<string, string> = {
  alone: "혼자서",
  partner: "연인과 함께",
  friends: "친구들과 함께",
  family: "가족과 함께",
  colleagues: "동료들과 함께",
};

/** Q2(occasion) 선택지 id → "특별한 기념일" 같은 방문 이유 표현 */
export const OCCASION_REASON: Record<string, string> = {
  celebration: "특별한 기념일",
  meal: "맛있는 음식과 함께하는 시간",
  chill: "가볍게 힐링하는 시간",
  gathering: "오랜만에 모이는 자리",
};

/** 스타일 id → "깔끔하고 청량한" 같은 맛 수식어 */
export const TASTE_ADJ: Record<string, string> = {
  "clean-lager": "깔끔하고 청량한",
  "hop-forward": "쌉쌀하고 시트러스 향 가득한",
  "wheat-yeast": "향긋하고 부드러운",
  "sour-funky": "새콤달콤하고 상큼한",
  "dark-malty": "고소하고 진한",
  "barrel-strong": "묵직하고 깊은",
  "dessert-specialty": "달콤하고 특별한",
};
