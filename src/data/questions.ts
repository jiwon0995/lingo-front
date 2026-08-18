import type { Question } from "@/types";

/**
 * 퀴즈 질문 데이터.
 *
 * 질문 제목 · 선택지 라벨 · 이모지는 프로토타입(`docs/prototype.html`)의
 * `Q1` · `Q2_WHY` · `Q3_HOW` · `Q4_STYLE` 원문 그대로다.
 *
 * 단 하나 달라진 점: 프로토타입에서 한 화면이던 스타일 질문(`Q4_STYLE`)을
 * **두 화면으로 쪼갰다.**
 *
 * | 화면 | key | 선택지 문구 | 추천 반영 |
 * |---|---|---|---|
 * | 질문 4 | `styleFamily` | `Q4_STYLE` 의 **서브타이틀** (라거 · 라들러 …) | ✗ (수집만) |
 * | 질문 5 | `style` | `Q4_STYLE` 의 **라벨** (깔끔 · 청량 …) | ✓ (주 신호) |
 *
 * 두 화면은 아이콘 · 선택지 id · 제목까지 같고, 문구만 원문의 서브타이틀 ·
 * 라벨로 나뉜다. 추천을 결정하는 건 질문 5(`style`) 하나다 —
 * 질문 4는 `affectsRecommendation: false` 라 답변만 쌓인다.
 *
 * 프로토타입에 없던 필드는 화면에 보이지 않는 추천 전용 값뿐이다 —
 * `scoreEffect` · `moodTags` · `affectsRecommendation`.
 *
 * 질문을 추가·수정할 때는 이 배열만 고치면 된다. 스텝퍼 · 진행 표시 · 뒤로가기는
 * `questions.length` 로 계산하므로 총 개수가 어디에도 박혀 있지 않다 —
 * 자세한 규칙은 `docs/question-guide.md`, 가중치 표는 `docs/scoring-map.md` 참고.
 */
export const QUESTIONS: Question[] = [
  {
    key: "company",
    title: "오늘은 누구와 함께 하시나요?",
    options: [
      {
        id: "alone",
        icon: "👤",
        label: "혼자",
        // 혼자 천천히 향을 음미하는 자리
        scoreEffect: { aroma: 1 },
        moodTags: ["chill"],
      },
      {
        id: "partner",
        icon: "❤️",
        label: "연인",
        scoreEffect: { sweetness: 1 },
        moodTags: ["celebration"],
      },
      {
        id: "friends",
        icon: "👯",
        label: "친구",
        scoreEffect: { refreshing: 1 },
        moodTags: ["gathering"],
      },
      {
        id: "family",
        icon: "👨‍👩‍👧",
        label: "가족",
        // 부담 없이 편하게 마시는 자리
        scoreEffect: { bitterness: -1 },
        moodTags: ["meal"],
      },
      {
        id: "colleagues",
        icon: "💼",
        label: "동료",
        scoreEffect: { refreshing: 1 },
        moodTags: ["gathering"],
      },
    ],
  },
  {
    key: "occasion",
    title: "오늘 방문한 이유가 궁금해요",
    options: [
      {
        id: "celebration",
        icon: "🎉",
        label: "기념일 · 축하",
        // 특별한 날일수록 묵직한 한 잔 쪽으로
        scoreEffect: { body: 1 },
        moodTags: ["celebration"],
      },
      {
        id: "meal",
        icon: "🍽️",
        label: "맛있는 음식과 함께",
        scoreEffect: { body: 1 },
        moodTags: ["meal"],
      },
      {
        id: "chill",
        icon: "😌",
        label: "가볍게 힐링",
        scoreEffect: { refreshing: 1 },
        moodTags: ["chill"],
      },
      {
        id: "gathering",
        icon: "👋",
        label: "오랜만의 모임",
        scoreEffect: { refreshing: 1 },
        moodTags: ["gathering"],
      },
    ],
  },
  {
    /**
     * 유입 경로는 취향과 무관해서 추천 계산에서 빼고 답변만 모은다.
     * 화면에는 다른 질문과 똑같이 노출된다.
     */
    key: "source",
    title: "저희 매장은 어떻게 알고 오셨나요?",
    affectsRecommendation: false,
    options: [
      { id: "sns", icon: "📱", label: "SNS(인스타·블로그)" },
      { id: "referral", icon: "👥", label: "지인 추천" },
      { id: "walkby", icon: "🚶", label: "지나가다 발견" },
      { id: "revisit", icon: "🔁", label: "재방문(단골)" },
    ],
  },
  {
    /**
     * 스타일 질문의 첫 화면 — 프로토타입 `Q4_STYLE` 의 **서브타이틀**(맥주 종류)로
     * 먼저 묻는다. 다음 화면(`style`)이 같은 스타일을 맛 표현으로 다시 물어
     * 추천을 결정하므로, 이 답변은 매장 통계용으로 모으기만 한다.
     *
     * 선택지 id는 `style` · `Beer.styleId` 와 같은 값이라 두 답변을 그대로
     * 맞대 보면 "종류로 고른 것과 맛으로 고른 것이 갈렸는지"를 집계할 수 있다.
     */
    key: "styleFamily",
    title: "어떤 스타일의 맥주가 끌리시나요?",
    affectsRecommendation: false,
    options: [
      { id: "clean-lager", icon: "🧊", label: "라거 · 라들러 · 첫잔 추천" },
      { id: "hop-forward", icon: "🍊", label: "페일에일 · IPA" },
      { id: "wheat-yeast", icon: "🍌", label: "밀맥주 · 벨지안" },
      { id: "sour-funky", icon: "🍋", label: "고제 · 람빅 · 사워" },
      { id: "dark-malty", icon: "☕", label: "스타우트 · 포터" },
      { id: "barrel-strong", icon: "🥃", label: "배럴에이지드 · 스트롱에일" },
      { id: "dessert-specialty", icon: "🍰", label: "이색 부재료 맥주" },
    ],
  },
  {
    /**
     * 추천의 주 신호. 프로토타입 `Q4_STYLE` 의 **라벨**(맛 표현)로 묻는
     * 스타일 질문의 두 번째 화면이다. 선택지 id는 `BEERS` 의 `styleId` 와
     * 같은 값이라 스타일당 맥주가 1종인 동안에는 이 질문이 사실상 결과를 결정한다.
     *
     * `scoreEffect` 는 각 스타일 대표 맥주의 `profile` 을 향하되, Q1·Q2가 ±1씩
     * 밀어도 이웃 맥주 쪽으로 목표가 넘어가지 않도록 조금 더 바깥으로 잡았다.
     * 값을 바꿨다면 `npm run check:questions` 로 이 성질을 확인한다.
     */
    key: "style",
    title: "어떤 스타일의 맥주가 끌리시나요?",
    options: [
      {
        id: "clean-lager",
        icon: "🧊",
        label: "깔끔 · 청량",
        scoreEffect: {
          refreshing: 3,
          body: -2,
          bitterness: -1,
          sweetness: -2,
          aroma: -2,
        },
      },
      {
        id: "hop-forward",
        icon: "🍊",
        label: "쌉쌀 · 시트러스",
        scoreEffect: { bitterness: 3, aroma: 2, refreshing: 1 },
      },
      {
        id: "wheat-yeast",
        icon: "🍌",
        label: "향긋 · 부드러운",
        scoreEffect: { aroma: 2, sweetness: 1, body: 1, bitterness: -2 },
      },
      {
        id: "sour-funky",
        icon: "🍋",
        label: "새콤달콤 · 상큼",
        scoreEffect: {
          refreshing: 3,
          sweetness: 2,
          aroma: 1,
          bitterness: -2,
          body: -2,
        },
      },
      {
        id: "dark-malty",
        icon: "☕",
        label: "고소 · 진한 흑맥주",
        scoreEffect: { body: 3, bitterness: 1, sweetness: 1, refreshing: -2 },
      },
      {
        id: "barrel-strong",
        icon: "🥃",
        label: "묵직한 한 잔",
        scoreEffect: { body: 3, aroma: 3, refreshing: -3, bitterness: -1 },
      },
      {
        id: "dessert-specialty",
        icon: "🍰",
        label: "디저트 · 스페셜티",
        scoreEffect: { sweetness: 3, aroma: 1, body: 1, refreshing: -3 },
      },
    ],
  },
];

/** key로 질문 하나를 찾는다. 없으면 undefined */
export function getQuestionByKey(key: string): Question | undefined {
  return QUESTIONS.find((question) => question.key === key);
}

/** 추천 계산에 반영되는 질문만 (`affectsRecommendation: false` 제외) */
export function getScoringQuestions(): Question[] {
  return QUESTIONS.filter(
    (question) => question.affectsRecommendation !== false,
  );
}
