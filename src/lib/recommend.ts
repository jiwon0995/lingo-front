import type {
  Beer,
  BeerProfile,
  Question,
  QuizAnswers,
  Recommendation,
  ScoreAxis,
} from "@/types";

const AXES: ScoreAxis[] = [
  "sweetness",
  "bitterness",
  "aroma",
  "body",
  "refreshing",
];

/** 프로필 축의 최소/최대값 (0~5) */
const MIN = 0;
const MAX = 5;

/** 아무 선택지도 건드리지 않은 축의 기본값 (중앙값) */
const NEUTRAL = 2.5;

/** 분위기·안주 태그 일치 1건당 점수 가산치 */
const TAG_BONUS = 0.05;

/** 추천 계산에 반영되는 질문인지 — `affectsRecommendation` 이 없으면 true */
function affectsRecommendation(question: Question): boolean {
  return question.affectsRecommendation !== false;
}

/**
 * 답변에서 선택된 Option들을 뽑아냅니다.
 * `affectsRecommendation: false` 인 질문은 답변이 있어도 건너뜁니다.
 */
export function getSelectedOptions(questions: Question[], answers: QuizAnswers) {
  return questions.filter(affectsRecommendation).flatMap((question) => {
    const optionId = answers[question.key];
    if (!optionId) return [];
    const option = question.options.find((o) => o.id === optionId);
    return option ? [option] : [];
  });
}

/**
 * 퀴즈 답변 → 목표 맛 프로필.
 * 중립값에서 시작해 선택지의 scoreEffect 를 더하고 0~5로 자릅니다.
 */
export function buildTargetProfile(
  questions: Question[],
  answers: QuizAnswers,
): BeerProfile {
  const options = getSelectedOptions(questions, answers);

  return AXES.reduce((profile, axis) => {
    const delta = options.reduce(
      (sum, option) => sum + (option.scoreEffect?.[axis] ?? 0),
      0,
    );
    profile[axis] = clamp(NEUTRAL + delta, MIN, MAX);
    return profile;
  }, {} as BeerProfile);
}

/** 답변에서 모인 분위기·안주 태그 */
export function collectTags(questions: Question[], answers: QuizAnswers) {
  const options = getSelectedOptions(questions, answers);
  return {
    moodTags: new Set(options.flatMap((option) => option.moodTags ?? [])),
    foodTags: new Set(options.flatMap((option) => option.foodTags ?? [])),
  };
}

type CollectedTags = ReturnType<typeof collectTags>;

const NO_TAGS: CollectedTags = {
  moodTags: new Set(),
  foodTags: new Set(),
};

/** 맥주 태그가 답변 태그와 몇 건이나 겹치는지 */
function countMatches(beer: Beer, collected: CollectedTags): number {
  return (
    beer.moodTags.filter((tag) => collected.moodTags.has(tag)).length +
    beer.foodTags.filter((tag) => collected.foodTags.has(tag)).length
  );
}

/**
 * 목표 프로필과 맥주의 거리 기반 점수 (0~1).
 * 정규화된 맨해튼 거리를 1에서 뺀 값 + 태그 보너스.
 */
export function scoreBeer(
  target: BeerProfile,
  beer: Beer,
  collected: CollectedTags = NO_TAGS,
): number {
  const span = MAX - MIN;
  const totalDistance = AXES.reduce(
    (sum, axis) => sum + Math.abs(target[axis] - beer.profile[axis]) / span,
    0,
  );
  const base = 1 - totalDistance / AXES.length;

  return clamp(base + countMatches(beer, collected) * TAG_BONUS, 0, 1);
}

/** 결과 카드에 보여줄 추천 사유 */
export function buildReasons(target: BeerProfile, beer: Beer): string[] {
  const labels: Record<ScoreAxis, string> = {
    sweetness: "단맛",
    bitterness: "쓴맛",
    aroma: "향",
    body: "무게감",
    refreshing: "청량감",
  };

  return [...AXES]
    .sort(
      (a, b) =>
        Math.abs(target[a] - beer.profile[a]) -
        Math.abs(target[b] - beer.profile[b]),
    )
    .slice(0, 2)
    .map((axis) => `${labels[axis]}이 원하시는 정도와 잘 맞아요`);
}

/**
 * 추천 목록을 점수 내림차순으로 반환합니다.
 * 순수 함수 — 같은 입력이면 항상 같은 결과.
 */
export function recommend(
  beers: Beer[],
  questions: Question[],
  answers: QuizAnswers,
  limit = 3,
): Recommendation[] {
  const target = buildTargetProfile(questions, answers);
  const collected = collectTags(questions, answers);

  return beers
    .map((beer) => {
      const score = scoreBeer(target, beer, collected);
      return {
        beer,
        score,
        matchPercent: Math.round(score * 100),
        reasons: buildReasons(target, beer),
      };
    })
    .sort((a, b) => b.score - a.score || a.beer.id.localeCompare(b.beer.id))
    .slice(0, limit);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
