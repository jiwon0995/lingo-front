import type {
  Beer,
  BeerProfile,
  ProfileAxis,
  Question,
  QuizAnswers,
  Recommendation,
} from "@/types";

const AXES: ProfileAxis[] = ["bitter", "body", "sweet", "sour", "aroma"];

/** 프로파일 축의 최소/최대값 (1~5) */
const MIN = 1;
const MAX = 5;

/** 답변이 없는 축의 기본값 (중앙값) */
const NEUTRAL = 3;

/** 태그 일치 1건당 점수 가산치 */
const TAG_BONUS = 0.04;

/** 답변에서 선택된 Choice들을 뽑아냅니다. */
export function getSelectedChoices(questions: Question[], answers: QuizAnswers) {
  return questions.flatMap((question) => {
    const choiceId = answers[question.id];
    if (!choiceId) return [];
    const choice = question.choices.find((c) => c.id === choiceId);
    return choice ? [choice] : [];
  });
}

/**
 * 퀴즈 답변 → 목표 맛 프로파일.
 * 같은 축에 값을 준 선택지들의 평균을 쓰고, 아무도 언급하지 않은 축은 NEUTRAL.
 */
export function buildTargetProfile(
  questions: Question[],
  answers: QuizAnswers,
): BeerProfile {
  const choices = getSelectedChoices(questions, answers);
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const choice of choices) {
    for (const axis of AXES) {
      const value = choice.weights[axis];
      if (value === undefined) continue;
      sums[axis] = (sums[axis] ?? 0) + value;
      counts[axis] = (counts[axis] ?? 0) + 1;
    }
  }

  return AXES.reduce((profile, axis) => {
    const count = counts[axis] ?? 0;
    profile[axis] = count === 0 ? NEUTRAL : sums[axis] / count;
    return profile;
  }, {} as BeerProfile);
}

/** 답변에서 모인 태그 집합 */
export function collectTags(
  questions: Question[],
  answers: QuizAnswers,
): Set<string> {
  return new Set(
    getSelectedChoices(questions, answers).flatMap(
      (choice) => choice.tags ?? [],
    ),
  );
}

/**
 * 목표 프로파일과 맥주의 거리 기반 점수 (0~1).
 * 정규화된 맨해튼 거리를 1에서 뺀 값 + 태그 보너스.
 */
export function scoreBeer(
  target: BeerProfile,
  beer: Beer,
  tags: Set<string> = new Set(),
): number {
  const span = MAX - MIN;
  const totalDistance = AXES.reduce(
    (sum, axis) => sum + Math.abs(target[axis] - beer.profile[axis]) / span,
    0,
  );
  const base = 1 - totalDistance / AXES.length;

  const matchedTags = beer.tags.filter((tag) => tags.has(tag)).length;
  return clamp01(base + matchedTags * TAG_BONUS);
}

/** 결과 카드에 보여줄 추천 사유 */
export function buildReasons(
  target: BeerProfile,
  beer: Beer,
  tags: Set<string> = new Set(),
): string[] {
  const labels: Record<ProfileAxis, string> = {
    bitter: "쓴맛",
    body: "무게감",
    sweet: "단맛",
    sour: "신맛",
    aroma: "향",
  };

  const closest = [...AXES]
    .sort(
      (a, b) =>
        Math.abs(target[a] - beer.profile[a]) -
        Math.abs(target[b] - beer.profile[b]),
    )
    .slice(0, 2)
    .map((axis) => `${labels[axis]}이 원하시는 정도와 잘 맞아요`);

  const matched = beer.tags.filter((tag) => tags.has(tag)).slice(0, 2);
  return [...closest, ...matched.map((tag) => `#${tag}`)];
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
  const tags = collectTags(questions, answers);

  return beers
    .map((beer) => {
      const score = scoreBeer(target, beer, tags);
      return {
        beer,
        score,
        matchPercent: Math.round(score * 100),
        reasons: buildReasons(target, beer, tags),
      };
    })
    .sort((a, b) => b.score - a.score || a.beer.id.localeCompare(b.beer.id))
    .slice(0, limit);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
