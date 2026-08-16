import type { Question } from "@/types";

/**
 * 퀴즈 질문 데이터.
 *
 * 질문 제목 · 선택지 라벨 · 이모지 · 서브타이틀은 프로토타입
 * (`docs/prototype.html`)의 `Q1` · `Q2_WHY` · `Q3_HOW` · `Q4_STYLE` 원문
 * 그대로다. 피그마 디자인(프레임 2~5)과 일치하므로 **문구는 고치지 않는다.**
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
     * 추천의 주 신호. 선택지 id는 `BEERS` 의 `styleId` 와 같은 값이라
     * 스타일당 맥주가 1종인 동안에는 이 질문이 사실상 결과를 결정한다.
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
        subtitle: "라거 · 라들러 · 첫잔 추천",
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
        subtitle: "페일에일 · IPA",
        scoreEffect: { bitterness: 3, aroma: 2, refreshing: 1 },
      },
      {
        id: "wheat-yeast",
        icon: "🍌",
        label: "향긋 · 부드러운",
        subtitle: "밀맥주 · 벨지안",
        scoreEffect: { aroma: 2, sweetness: 1, body: 1, bitterness: -2 },
      },
      {
        id: "sour-funky",
        icon: "🍋",
        label: "새콤달콤 · 상큼",
        subtitle: "고제 · 람빅 · 사워",
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
        subtitle: "스타우트 · 포터",
        scoreEffect: { body: 3, bitterness: 1, sweetness: 1, refreshing: -2 },
      },
      {
        id: "barrel-strong",
        icon: "🥃",
        label: "묵직한 한 잔",
        subtitle: "배럴에이지드 · 스트롱에일",
        scoreEffect: { body: 3, aroma: 3, refreshing: -3, bitterness: -1 },
      },
      {
        id: "dessert-specialty",
        icon: "🍰",
        label: "디저트 · 스페셜티",
        subtitle: "이색 부재료 맥주",
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
