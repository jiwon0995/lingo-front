/**
 * 질문 데이터 회귀 검사 — `npm run check:questions`
 *
 * 1. 질문 · 선택지 문구가 프로토타입(`docs/prototype.html`) 원문과 같은지
 *    (피그마 디자인이 확정돼 있어서 문구는 바뀌면 안 된다)
 * 2. Q1(company) · Q2(occasion) 의 보조 가중치와 moodTags 가
 *    Q4(style) 의 결과를 뒤집지 않는지 — 모든 답변 조합을 전수 확인
 *
 * 질문 · 선택지 · 가중치 · 맥주 데이터를 고쳤다면 이 스크립트를 돌린다.
 * 자세한 배경은 `docs/question-guide.md` · `docs/scoring-map.md` 참고.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const { QUESTIONS } = await import(join(ROOT, "src/data/questions.ts"));
const { BEERS } = await import(join(ROOT, "src/data/beers.ts"));
const { COMPANY_PHRASE, OCCASION_REASON, TASTE_ADJ } = await import(
  join(ROOT, "src/data/phrases.ts")
);
const { recommend } = await import(join(ROOT, "src/lib/recommend.ts"));

const failures = [];
const ok = (message) => console.log(`✅ ${message}`);
const fail = (message) => {
  failures.push(message);
  console.error(`❌ ${message}`);
};

/* ---------- 1. 프로토타입 원문 대조 ---------- */

const html = readFileSync(join(ROOT, "docs/prototype.html"), "utf8");
const cut = (from, to) => html.slice(html.indexOf(from), html.indexOf(to));
const proto = new Function(
  `${cut("  const Q1 = {", "  const BEER_DB = {")}
   ${cut("  const COMPANY_PHRASE = {", "  /* ---------------- STATE ---")}
   return { Q1, Q2_WHY, Q3_HOW, Q4_STYLE, COMPANY_PHRASE, OCCASION_REASON, TASTE_ADJ };`,
)();

const protoQuestions = [proto.Q1, proto.Q2_WHY, proto.Q3_HOW, proto.Q4_STYLE];

if (QUESTIONS.length !== protoQuestions.length) {
  fail(`질문 개수 ${QUESTIONS.length} ≠ 프로토타입 ${protoQuestions.length}`);
}

protoQuestions.forEach((original, index) => {
  const question = QUESTIONS[index];
  if (!question) return fail(`질문 ${index + 1}번이 없다`);

  for (const field of ["key", "title"]) {
    if (question[field] !== original[field])
      fail(`질문 ${index + 1}번 ${field}: "${question[field]}" ≠ "${original[field]}"`);
  }
  if (question.options.length !== original.options.length)
    fail(`[${original.key}] 선택지 개수 ${question.options.length} ≠ ${original.options.length}`);

  original.options.forEach((originalOption, i) => {
    const option = question.options[i];
    if (!option) return fail(`[${original.key}] 선택지 ${i + 1}번이 없다`);
    for (const field of ["id", "icon", "label", "subtitle"]) {
      if ((option[field] ?? undefined) !== (originalOption[field] ?? undefined))
        fail(
          `[${original.key}/${originalOption.id}] ${field}: ${JSON.stringify(option[field])} ≠ ${JSON.stringify(originalOption[field])}`,
        );
    }
  });
});

for (const [name, mine, original] of [
  ["COMPANY_PHRASE", COMPANY_PHRASE, proto.COMPANY_PHRASE],
  ["OCCASION_REASON", OCCASION_REASON, proto.OCCASION_REASON],
  ["TASTE_ADJ", TASTE_ADJ, proto.TASTE_ADJ],
]) {
  if (JSON.stringify(mine) !== JSON.stringify(original))
    fail(`${name} 이 프로토타입과 다르다`);
}

if (!failures.length)
  ok("문구: 질문 4개 · 순서 · title · id · icon · label · subtitle · 결과 문구 상수가 프로토타입과 동일");

/* ---------- 2. Q4(style) 지배력 전수 확인 ---------- */

const byKey = Object.fromEntries(QUESTIONS.map((q) => [q.key, q]));
const styleQuestion = byKey.style;

if (!styleQuestion) {
  fail('"style" 질문이 없다 — 이 검사는 스타일 질문을 기준으로 한다');
} else {
  // style 을 뺀 나머지 질문의 모든 답변 조합 (미응답 포함)
  const others = QUESTIONS.filter((q) => q.key !== "style");
  const combos = others.reduce(
    (acc, question) =>
      acc.flatMap((answers) =>
        [undefined, ...question.options].map((option) =>
          option ? { ...answers, [question.key]: option.id } : answers,
        ),
      ),
    [{}],
  );

  let flips = 0;
  let minMargin = Infinity;
  let minMarginCase = "";

  for (const answers of combos) {
    for (const style of styleQuestion.options) {
      const full = { ...answers, style: style.id };
      const ranked = recommend(BEERS, QUESTIONS, full, BEERS.length);
      const label = Object.entries(full)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");

      if (ranked[0].beer.styleId !== style.id) {
        flips++;
        if (flips <= 10)
          fail(`${label} → ${ranked[0].beer.id} (기대: ${style.id})`);
        continue;
      }
      const margin = ranked[0].score - ranked[1].score;
      if (margin < minMargin) {
        minMargin = margin;
        minMarginCase = `${label} → ${ranked[0].beer.id} ${ranked[0].score.toFixed(3)} vs ${ranked[1].beer.id} ${ranked[1].score.toFixed(3)}`;
      }
    }
  }

  const total = combos.length * styleQuestion.options.length;
  if (flips) fail(`Q4 뒤집힘 ${flips}/${total}건`);
  else {
    ok(`Q4 지배력: ${total}개 조합 전부 선택한 스타일의 맥주가 1위`);
    console.log(`   최소 여유 ${minMargin.toFixed(3)} — ${minMarginCase}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length}건 실패`);
  process.exit(1);
}
console.log("\n모두 통과");
