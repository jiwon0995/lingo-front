/**
 * 추천 엔진 — React · Next 에 의존하지 않는 순수 TypeScript.
 *
 * ## 두 가지를 동시에 만족시킨다
 *
 * 1. **프로토타입 재현** — 맥주가 스타일당 1종인 지금은 `docs/prototype.html` 과
 *    100% 같게 동작한다. 스타일을 고르면 그 스타일 맥주가 1순위, 화면 매칭율은
 *    `beer.match` 하드코딩 값, "다른 추천"은 나머지 중 랜덤.
 * 2. **확장 대비** — 스타일당 3~5종으로 늘어나면 같은 스타일 안에서 Q1 · Q2의
 *    보조 신호(취향 벡터 · 태그)가 순위를 가른다.
 *
 * 두 성질은 `STYLE_BONUS` 하나로 분리돼 있다. 스타일 일치에 유사도 최대치(100)보다
 * 훨씬 큰 가산점을 주므로 **스타일 경계는 절대 넘지 않고**, 같은 스타일 안에서는
 * 가산점이 상수라 유사도 차이만 남는다.
 *
 * 가중치 표는 `docs/scoring-map.md` 참고.
 */
import { BEERS, COMPANY_PHRASE, OCCASION_REASON, QUESTIONS, TASTE_ADJ } from "@/data";
import type {
  Beer,
  Option,
  Question,
  QuizAnswers,
  Recommendation,
  ScoreAxis,
  UserVector,
} from "@/types";

const AXES: ScoreAxis[] = [
  "sweetness",
  "bitterness",
  "aroma",
  "body",
  "refreshing",
];

/** 프로필 축의 값 범위 (0~5) */
const MIN = 0;
const MAX = 5;

/** 아무 선택지도 건드리지 않은 축의 기본값 (중앙값) */
const NEUTRAL = 2.5;

/**
 * 유클리드 거리의 축별 가중치. 지금은 다섯 축을 똑같이 본다.
 * 특정 축(예: 쓴맛)을 더 중요하게 보려면 **여기만** 고치면 된다.
 */
const AXIS_WEIGHT: Record<ScoreAxis, number> = {
  sweetness: 1,
  bitterness: 1,
  aroma: 1,
  body: 1,
  refreshing: 1,
};

/**
 * 분위기 · 안주 태그 일치 1건당 가산점 (0~100 스케일).
 *
 * 프로필 거리 0.1칸 정도의 크기라 비슷한 후보끼리만 갈린다.
 * 스타일 선택을 뒤집을 걱정은 없다 — 그건 `STYLE_BONUS` 가 막는다.
 */
const TAG_BONUS = 1.5;

/**
 * 사용자가 고른 스타일과 같은 `styleId` 일 때 주는 랭킹 가산점.
 *
 * 유사도가 최대 100이므로 이 값(1000)이면 **어떤 유사도 차이로도 뒤집히지 않는다.**
 * 프로토타입의 "고른 스타일 = 결과" 규칙을 데이터가 늘어나도 보장하는 장치다.
 * 같은 스타일 맥주끼리는 이 값이 똑같이 붙으므로 순위에 영향을 주지 않는다.
 */
const STYLE_BONUS = 1000;

/** 스타일을 묻는 질문의 key — 이 답변이 `Beer.styleId` 와 매칭된다 */
const STYLE_KEY = "style";
/** 추천 이유 문장에 쓰는 질문 key */
const COMPANY_KEY = "company";
const OCCASION_KEY = "occasion";

/** 0 이상 1 미만의 난수를 주는 함수. 테스트에서 시드 rng 로 갈아끼운다 */
export type Random = () => number;

export interface RecommendOptions {
  /** 질문 데이터. 기본값은 `QUESTIONS` */
  questions?: Question[];
  /** 난수원. 기본값은 `Math.random` (동점 셔플 · 빈 답변 셔플에 쓰인다) */
  random?: Random;
  /** 스타일 일치 가산점. 기본값 `STYLE_BONUS` */
  styleBonus?: number;
}

/* ------------------------------------------------------------------ *
 * 1. 답변 → 취향 벡터
 * ------------------------------------------------------------------ */

/** 추천 계산에 반영되는 질문인지 — `affectsRecommendation` 이 없으면 true */
function affectsRecommendation(question: Question): boolean {
  return question.affectsRecommendation !== false;
}

/**
 * 답변에서 선택된 Option 들을 뽑아낸다.
 * `affectsRecommendation: false` 인 질문(Q3 유입 경로)은 답변이 있어도 건너뛴다.
 */
export function getSelectedOptions(
  answers: QuizAnswers,
  questions: Question[] = QUESTIONS,
): Option[] {
  return questions.filter(affectsRecommendation).flatMap((question) => {
    const optionId = answers[question.key];
    if (!optionId) return [];
    const option = question.options.find((o) => o.id === optionId);
    return option ? [option] : [];
  });
}

/**
 * 답변 → 취향 벡터.
 *
 * 중립값(2.5)에서 시작해 고른 선택지들의 `scoreEffect` 를 모두 더하고 0~5로 자른다.
 * `moodTags` · `foodTags` 는 선택지들이 가리킨 태그를 모은 집합이다.
 * Q3(유입 경로)처럼 `affectsRecommendation: false` 인 질문의 답변은 전부 빠진다.
 */
export function buildUserVector(
  answers: QuizAnswers,
  questions: Question[] = QUESTIONS,
): UserVector {
  const options = getSelectedOptions(answers, questions);

  const vector = AXES.reduce((acc, axis) => {
    const delta = options.reduce(
      (sum, option) => sum + (option.scoreEffect?.[axis] ?? 0),
      0,
    );
    acc[axis] = clamp(NEUTRAL + delta, MIN, MAX);
    return acc;
  }, {} as UserVector);

  vector.moodTags = new Set(options.flatMap((option) => option.moodTags ?? []));
  vector.foodTags = new Set(options.flatMap((option) => option.foodTags ?? []));
  vector.hasSignal = options.length > 0;

  return vector;
}

/* ------------------------------------------------------------------ *
 * 2. 취향 벡터 × 맥주 → 유사도 점수
 * ------------------------------------------------------------------ */

/** 맥주 태그가 취향 벡터의 태그와 몇 건이나 겹치는지 */
function countTagMatches(vector: UserVector, beer: Beer): number {
  return (
    beer.moodTags.filter((tag) => vector.moodTags.has(tag)).length +
    beer.foodTags.filter((tag) => vector.foodTags.has(tag)).length
  );
}

/**
 * 취향 벡터와 맥주 프로필의 유사도를 0~100으로 반환한다.
 *
 * ```
 * 거리   = √( Σ wᵢ·((벡터ᵢ − 프로필ᵢ)/5)² / Σ wᵢ )   → 0~1
 * 점수   = (1 − 거리) × 100 + 태그 일치 수 × 1.5     → 0~100
 * ```
 *
 * 축별 차이가 작을수록 높다. **내부 랭킹용 값이고 화면에 표시하는 매칭율이 아니다** —
 * 매칭율은 `Recommendation.matchPercent`(= `beer.match`).
 */
export function scoreBeer(vector: UserVector, beer: Beer): number {
  const span = MAX - MIN;

  const { weighted, total } = AXES.reduce(
    (acc, axis) => {
      const diff = (vector[axis] - beer.profile[axis]) / span;
      const weight = AXIS_WEIGHT[axis];
      acc.weighted += weight * diff * diff;
      acc.total += weight;
      return acc;
    },
    { weighted: 0, total: 0 },
  );

  const distance = Math.sqrt(weighted / total);
  const similarity = (1 - distance) * 100;

  return clamp(similarity + countTagMatches(vector, beer) * TAG_BONUS, 0, 100);
}

/* ------------------------------------------------------------------ *
 * 3. 추천 목록
 * ------------------------------------------------------------------ */

/**
 * 맥주 전체를 추천 순위대로 정렬해 반환한다.
 *
 * - 스타일 질문에 답했다면 그 `styleId` 맥주가 **반드시** 1순위다 (`styleBonus`).
 * - 동점이면 랜덤 — 미리 셔플한 뒤 안정 정렬해서 같은 점수끼리 순서가 섞인다.
 * - 추천에 반영되는 답변이 하나도 없으면("아무거나 추천받기") 전체를 랜덤 셔플한다.
 *
 * 반환값의 `matchPercent` 는 계산값이 아니라 `beer.match` 다.
 */
export function recommend(
  answers: QuizAnswers,
  beers: Beer[] = BEERS,
  options: RecommendOptions = {},
): Recommendation[] {
  const {
    questions = QUESTIONS,
    random = Math.random,
    styleBonus = STYLE_BONUS,
  } = options;

  const vector = buildUserVector(answers, questions);
  const styleId = answers[STYLE_KEY];

  const candidates = shuffle(beers, random).map((beer) => ({
    beer,
    score: scoreBeer(vector, beer),
    matchPercent: beer.match,
    reason: buildReason(answers, beer.styleId),
  }));

  // 답변이 없으면 순위를 매길 근거가 없다 — 셔플된 순서 그대로 돌려준다
  if (!vector.hasSignal) return candidates;

  const rankOf = (candidate: Recommendation) =>
    candidate.score + (styleId && candidate.beer.styleId === styleId ? styleBonus : 0);

  // Array.prototype.sort 는 안정 정렬이라 동점끼리는 셔플된 순서가 유지된다
  return candidates.sort((a, b) => rankOf(b) - rankOf(a));
}

/* ------------------------------------------------------------------ *
 * 4. 다른 추천
 * ------------------------------------------------------------------ */

export interface PickAnotherOptions {
  /**
   * 후보 중 무엇을 고를지.
   * - `"random"` (기본) — 프로토타입 `showAnotherRecommendation` 과 같은 랜덤
   * - `"ranked"` — 넘겨받은 배열 순서대로 다음 것. `recommend()` 결과를 그대로
   *   넘기면 "랭킹 순서대로 보여주기"가 된다.
   */
  strategy?: "random" | "ranked";
  /** 난수원. 기본값은 `Math.random` */
  random?: Random;
}

/**
 * 지금 보고 있는 맥주를 뺀 나머지 중 하나를 고른다.
 *
 * 기본 동작은 프로토타입의 `showAnotherRecommendation` 과 같은 **랜덤**이다
 * (2순위를 순서대로 보여주는 게 아니다). 나중에 랭킹 순서로 바꾸려면
 * `{ strategy: "ranked" }` 만 넘기면 된다.
 *
 * 뺄 것을 빼고 나면 후보가 없을 때는 `undefined`.
 */
export function pickAnother(
  currentBeerId: string,
  beers: Beer[] = BEERS,
  options: PickAnotherOptions = {},
): Beer | undefined {
  const { strategy = "random", random = Math.random } = options;

  const others = beers.filter((beer) => beer.id !== currentBeerId);
  if (others.length === 0) return undefined;

  if (strategy === "ranked") return others[0];
  return others[Math.floor(random() * others.length)];
}

/* ------------------------------------------------------------------ *
 * 5. 추천 이유 문장
 * ------------------------------------------------------------------ */

/**
 * 결과 화면의 "추천 이유" 문장. 프로토타입 `buildReason(styleId)` 과 출력이 같다.
 *
 * 프로토타입은 **화면에 띄운 맥주**의 스타일로 문장을 만든다
 * (`renderBeerResult` 가 `state.style = dbKey` 를 먼저 넣는다). 그래서 "다른 추천"으로
 * 맥주를 바꾸면 문장의 맛 수식어도 같이 바뀐다. `styleId` 인자가 그 자리다 —
 * 생략하면 사용자가 고른 `answers.style` 을 쓴다.
 */
export function buildReason(
  answers: QuizAnswers,
  styleId: string = answers[STYLE_KEY],
): string {
  const tasteAdj = TASTE_ADJ[styleId] ?? "";
  const companyPhrase = COMPANY_PHRASE[answers[COMPANY_KEY]];
  const occasionPhrase = OCCASION_REASON[answers[OCCASION_KEY]];

  if (!companyPhrase) {
    return `질문 없이 골라드리는 오늘의 심플 추천이에요! ${tasteAdj} 맥주, 부담 없이 즐겨보세요.`;
  }

  const sentence = `${companyPhrase} ${tasteAdj} 맥주를 좋아하는 당신을 위해 골랐어요.`;
  return occasionPhrase
    ? `${sentence} ${occasionPhrase}에도 잘 어울려요.`
    : sentence;
}

/* ------------------------------------------------------------------ *
 * 유틸
 * ------------------------------------------------------------------ */

/** 원본을 건드리지 않는 Fisher-Yates 셔플 */
function shuffle<T>(items: T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
