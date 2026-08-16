import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BEERS, QUESTIONS, getBeerByStyle, getQuestionByKey } from "@/data";
import type { Beer, QuizAnswers } from "@/types";
import {
  buildReason,
  buildUserVector,
  pickAnother,
  recommend,
  scoreBeer,
} from "./recommend";

/* ------------------------------------------------------------------ *
 * 테스트 도구
 * ------------------------------------------------------------------ */

/** 시드 난수 (mulberry32) — 랜덤이 끼는 경로를 재현 가능하게 만든다 */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const optionIds = (key: string) =>
  getQuestionByKey(key)?.options.map((option) => option.id) ?? [];

const COMPANY_IDS = optionIds("company");
const OCCASION_IDS = optionIds("occasion");
const SOURCE_IDS = optionIds("source");
const STYLE_IDS = optionIds("style");

/** 각 스타일이 내놓아야 할 1순위 맥주 이름 (프로토타입 BEER_DB 그대로) */
const EXPECTED_TOP: Record<string, string> = {
  "clean-lager": "골든 라거",
  "hop-forward": "트로피컬 IPA",
  "wheat-yeast": "바나나 클로브 바이젠",
  "sour-funky": "레몬 고제",
  "dark-malty": "카카오 스타우트",
  "barrel-strong": "오크 배럴 스트롱 에일",
  "dessert-specialty": "디저트 페이스트리 스타우트",
};

/** 프로토타입 HTML에서 `buildReason` 을 그대로 꺼내 실행 가능한 함수로 만든다 */
function loadPrototypeBuildReason() {
  const html = readFileSync("docs/prototype.html", "utf8");
  const cut = (from: string, to: string) =>
    html.slice(html.indexOf(from), html.indexOf(to));

  const factory = new Function(
    "state",
    `${cut("  const COMPANY_PHRASE = {", "  /* ---------------- STATE ---")}
     ${cut("  function buildReason(styleId){", "  function renderBeerResult(dbKey){")}
     return buildReason;`,
  ) as (state: { company?: string; occasion?: string }) => (
    styleId: string,
  ) => string;

  return (answers: QuizAnswers, styleId: string) =>
    factory({ company: answers.company, occasion: answers.occasion })(styleId);
}

/* ------------------------------------------------------------------ *
 * 프로토타입 동작 재현
 * ------------------------------------------------------------------ */

describe("프로토타입 재현 — 스타일 선택이 곧 결과", () => {
  it('style="clean-lager" 이면 1순위가 골든 라거', () => {
    expect(recommend({ style: "clean-lager" })[0].beer.name).toBe("골든 라거");
  });

  it('style="hop-forward" 이면 1순위가 트로피컬 IPA', () => {
    expect(recommend({ style: "hop-forward" })[0].beer.name).toBe(
      "트로피컬 IPA",
    );
  });

  it('style="dark-malty" 이면 1순위가 카카오 스타우트', () => {
    expect(recommend({ style: "dark-malty" })[0].beer.name).toBe(
      "카카오 스타우트",
    );
  });

  it("7개 스타일 전부 1:1로 맞는다", () => {
    expect(STYLE_IDS).toHaveLength(7);

    for (const styleId of STYLE_IDS) {
      const top = recommend({ style: styleId })[0];
      expect(top.beer.name).toBe(EXPECTED_TOP[styleId]);
      expect(top.beer.styleId).toBe(styleId);
    }
  });

  it("스타일 선택지 id와 맥주 styleId가 1:1로 대응한다", () => {
    for (const styleId of STYLE_IDS) {
      expect(getBeerByStyle(styleId)?.name).toBe(EXPECTED_TOP[styleId]);
    }
  });

  it("Q1 · Q2를 어떻게 바꿔도 1순위가 뒤집히지 않는다", () => {
    const companies = [undefined, ...COMPANY_IDS];
    const occasions = [undefined, ...OCCASION_IDS];
    let checked = 0;

    for (const styleId of STYLE_IDS) {
      for (const company of companies) {
        for (const occasion of occasions) {
          const answers: QuizAnswers = { style: styleId };
          if (company) answers.company = company;
          if (occasion) answers.occasion = occasion;

          const top = recommend(answers)[0];
          expect(
            top.beer.styleId,
            `${JSON.stringify(answers)} → ${top.beer.id}`,
          ).toBe(styleId);
          checked++;
        }
      }
    }

    expect(checked).toBe(STYLE_IDS.length * companies.length * occasions.length);
  });

  it("Q3(유입 경로)만 바꾸면 결과가 전혀 바뀌지 않는다", () => {
    const base: QuizAnswers = {
      company: "partner",
      occasion: "celebration",
      style: "wheat-yeast",
    };
    const fingerprint = (answers: QuizAnswers) =>
      recommend(answers, BEERS, { random: seeded(7) }).map(
        (r) => `${r.beer.id}:${r.score.toFixed(6)}:${r.matchPercent}:${r.reason}`,
      );

    const expected = fingerprint(base);

    for (const source of SOURCE_IDS) {
      expect(fingerprint({ ...base, source })).toEqual(expected);
    }
  });

  it("Q3 답변은 취향 벡터에도 태그에도 들어가지 않는다", () => {
    const withoutSource = buildUserVector({ company: "alone" });
    const withSource = buildUserVector({ company: "alone", source: "sns" });

    expect(withSource).toEqual(withoutSource);
    expect(buildUserVector({ source: "revisit" }).hasSignal).toBe(false);
  });
});

describe("프로토타입 재현 — 매칭율은 하드코딩 값", () => {
  it("matchPercent 는 계산 점수가 아니라 beer.match 다", () => {
    for (const styleId of STYLE_IDS) {
      const top = recommend({ style: styleId })[0];
      expect(top.matchPercent).toBe(top.beer.match);
    }
  });

  it("골든 라거 95% · 트로피컬 IPA 93% · 카카오 스타우트 96%", () => {
    expect(recommend({ style: "clean-lager" })[0].matchPercent).toBe(95);
    expect(recommend({ style: "hop-forward" })[0].matchPercent).toBe(93);
    expect(recommend({ style: "dark-malty" })[0].matchPercent).toBe(96);
  });
});

describe("buildReason — 프로토타입 문장 그대로", () => {
  it("company 없음 (아무거나 추천받기 경로)", () => {
    expect(buildReason({ style: "dark-malty" })).toBe(
      "질문 없이 골라드리는 오늘의 심플 추천이에요! 고소하고 진한 맥주, 부담 없이 즐겨보세요.",
    );
  });

  it("company 없음 + occasion 있음 — 여전히 심플 추천 문장", () => {
    expect(buildReason({ occasion: "chill", style: "clean-lager" })).toBe(
      "질문 없이 골라드리는 오늘의 심플 추천이에요! 깔끔하고 청량한 맥주, 부담 없이 즐겨보세요.",
    );
  });

  it("company 있음 + occasion 없음", () => {
    expect(buildReason({ company: "alone", style: "clean-lager" })).toBe(
      "혼자서 깔끔하고 청량한 맥주를 좋아하는 당신을 위해 골랐어요.",
    );
  });

  it("company 있음 + occasion 있음", () => {
    expect(
      buildReason({
        company: "partner",
        occasion: "celebration",
        style: "hop-forward",
      }),
    ).toBe(
      "연인과 함께 쌉쌀하고 시트러스 향 가득한 맥주를 좋아하는 당신을 위해 골랐어요. 특별한 기념일에도 잘 어울려요.",
    );
  });

  it("company × occasion × style 모든 조합이 프로토타입 출력과 일치한다", () => {
    const prototypeBuildReason = loadPrototypeBuildReason();
    let checked = 0;

    for (const company of [undefined, ...COMPANY_IDS]) {
      for (const occasion of [undefined, ...OCCASION_IDS]) {
        for (const styleId of STYLE_IDS) {
          const answers: QuizAnswers = { style: styleId };
          if (company) answers.company = company;
          if (occasion) answers.occasion = occasion;

          expect(buildReason(answers), JSON.stringify(answers)).toBe(
            prototypeBuildReason(answers, styleId),
          );
          checked++;
        }
      }
    }

    expect(checked).toBe(6 * 5 * 7);
  });

  it("다른 추천으로 맥주가 바뀌면 맛 수식어도 바뀐다 (프로토타입 동작)", () => {
    const answers: QuizAnswers = { company: "family", style: "clean-lager" };

    expect(buildReason(answers, "dark-malty")).toBe(
      "가족과 함께 고소하고 진한 맥주를 좋아하는 당신을 위해 골랐어요.",
    );
    expect(recommend(answers)[0].reason).toBe(
      "가족과 함께 깔끔하고 청량한 맥주를 좋아하는 당신을 위해 골랐어요.",
    );
  });
});

describe("pickAnother — 현재 맥주를 뺀 나머지 중 랜덤", () => {
  it("현재 맥주를 절대 반환하지 않는다", () => {
    for (const beer of BEERS) {
      for (let i = 0; i < 200; i++) {
        const another = pickAnother(beer.id, BEERS);
        expect(another).toBeDefined();
        expect(another!.id).not.toBe(beer.id);
      }
    }
  });

  it("나머지 전부가 뽑힐 수 있다 (2순위 고정이 아니다)", () => {
    const seen = new Set<string>();
    const random = seeded(3);

    for (let i = 0; i < 300; i++) {
      seen.add(pickAnother("clean-lager", BEERS, { random })!.id);
    }

    expect(seen.size).toBe(BEERS.length - 1);
    expect(seen.has("clean-lager")).toBe(false);
  });

  it('strategy "ranked" 면 넘겨받은 순서대로 다음 맥주', () => {
    const ranked = recommend({ style: "dark-malty" }).map((r) => r.beer);

    expect(pickAnother(ranked[0].id, ranked, { strategy: "ranked" })?.id).toBe(
      ranked[1].id,
    );
  });

  it("후보가 없으면 undefined", () => {
    expect(pickAnother(BEERS[0].id, [BEERS[0]])).toBeUndefined();
  });
});

describe("빈 답변 — 아무거나 추천받기", () => {
  it("에러 없이 전체 맥주를 돌려준다", () => {
    const result = recommend({});

    expect(result).toHaveLength(BEERS.length);
    expect(new Set(result.map((r) => r.beer.id)).size).toBe(BEERS.length);
    expect(result.every((r) => r.matchPercent === r.beer.match)).toBe(true);
  });

  it("1순위가 시드마다 달라진다 (랜덤)", () => {
    const firsts = new Set(
      Array.from(
        { length: 30 },
        (_, seed) => recommend({}, BEERS, { random: seeded(seed) })[0].beer.id,
      ),
    );

    expect(firsts.size).toBeGreaterThan(1);
  });

  it("Q3만 답한 경우도 랜덤 경로로 간다", () => {
    const firsts = new Set(
      Array.from(
        { length: 30 },
        (_, seed) =>
          recommend({ source: "sns" }, BEERS, { random: seeded(seed) })[0].beer
            .id,
      ),
    );

    expect(firsts.size).toBeGreaterThan(1);
  });

  it("추천 이유는 심플 추천 문장", () => {
    for (const { beer, reason } of recommend({})) {
      expect(reason).toBe(buildReason({}, beer.styleId));
      expect(reason.startsWith("질문 없이 골라드리는")).toBe(true);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 스코어링 · 확장성
 * ------------------------------------------------------------------ */

describe("buildUserVector · scoreBeer", () => {
  it("선택지 scoreEffect 를 중립값 2.5에 더한다", () => {
    // clean-lager: sweetness −2, bitterness −1, aroma −2, body −2, refreshing +3
    // alone: aroma +1
    const vector = buildUserVector({ style: "clean-lager", company: "alone" });

    expect(vector.sweetness).toBe(0.5);
    expect(vector.bitterness).toBe(1.5);
    expect(vector.aroma).toBe(1.5);
    expect(vector.body).toBe(0.5);
    expect(vector.refreshing).toBe(5); // 2.5 + 3 → 5로 clamp
    expect([...vector.moodTags]).toEqual(["chill"]);
    expect(vector.hasSignal).toBe(true);
  });

  it("답변이 없으면 모든 축이 중립값", () => {
    const vector = buildUserVector({});

    expect(vector.sweetness).toBe(2.5);
    expect(vector.refreshing).toBe(2.5);
    expect(vector.hasSignal).toBe(false);
  });

  it("프로필이 완전히 같으면 100점", () => {
    const beer = BEERS[0];
    const vector = buildUserVector({});
    Object.assign(vector, beer.profile);

    expect(scoreBeer(vector, beer)).toBe(100);
  });

  it("점수는 항상 0~100 사이", () => {
    for (const styleId of STYLE_IDS) {
      const vector = buildUserVector({ style: styleId });
      for (const beer of BEERS) {
        const score = scoreBeer(vector, beer);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("축 차이가 작을수록 점수가 높다", () => {
    const vector = buildUserVector({ style: "dark-malty" });
    const stout = BEERS.find((b) => b.id === "dark-malty")!;
    const lager = BEERS.find((b) => b.id === "clean-lager")!;

    expect(scoreBeer(vector, stout)).toBeGreaterThan(scoreBeer(vector, lager));
  });

  it("태그가 겹치면 보너스가 붙는다", () => {
    const beer = BEERS.find((b) => b.id === "clean-lager")!; // moodTags: chill…
    const withTag = buildUserVector({});
    Object.assign(withTag, beer.profile);
    const withoutTag = { ...withTag, moodTags: new Set<string>() };

    withTag.moodTags = new Set(["chill"]);

    expect(scoreBeer(withTag, beer)).toBeGreaterThanOrEqual(
      scoreBeer(withoutTag, beer),
    );
  });
});

describe("확장성 — 같은 스타일 안에서 Q1 · Q2가 순위를 가른다", () => {
  /** clean-lager 스타일에 body 만 다른 가짜 맥주 2종 */
  const fake = (id: string, body: number, moodTags: string[]): Beer => ({
    ...BEERS[0],
    id,
    styleId: "clean-lager",
    name: id,
    profile: { sweetness: 1, bitterness: 1, aroma: 1, body, refreshing: 5 },
    moodTags,
    foodTags: [],
  });

  const light = fake("lager-light", 0, ["chill"]);
  const full = fake("lager-full", 2, ["meal"]);
  const catalog = [...BEERS.filter((b) => b.styleId !== "clean-lager"), light, full];

  it("같은 스타일 맥주가 2종이어도 1 · 2순위를 그 스타일이 차지한다", () => {
    const top2 = recommend({ style: "clean-lager" }, catalog).slice(0, 2);

    expect(top2.map((r) => r.beer.styleId)).toEqual([
      "clean-lager",
      "clean-lager",
    ]);
  });

  it("occasion=chill 이면 가벼운 쪽이, occasion=meal 이면 묵직한 쪽이 위로", () => {
    const chill = recommend(
      { style: "clean-lager", occasion: "chill" },
      catalog,
    );
    const meal = recommend({ style: "clean-lager", occasion: "meal" }, catalog);

    expect(chill[0].beer.id).toBe("lager-light");
    expect(meal[0].beer.id).toBe("lager-full");
  });

  it("company 가 달라도 스타일 경계는 넘지 않는다", () => {
    for (const company of COMPANY_IDS) {
      for (const occasion of OCCASION_IDS) {
        const top = recommend(
          { style: "clean-lager", company, occasion },
          catalog,
        )[0];
        expect(top.beer.styleId).toBe("clean-lager");
      }
    }
  });

  it("프로필이 같으면 분위기 태그가 순위를 가른다", () => {
    const twinA = fake("twin-a", 1, ["chill"]);
    const twinB = fake("twin-b", 1, ["celebration"]);
    const twins = [twinA, twinB];

    expect(
      recommend({ style: "clean-lager", company: "alone" }, twins)[0].beer.id,
    ).toBe("twin-a"); // alone → chill
    expect(
      recommend({ style: "clean-lager", company: "partner" }, twins)[0].beer.id,
    ).toBe("twin-b"); // partner → celebration
  });

  it("동점이면 순서가 랜덤으로 섞인다", () => {
    const twins = [fake("twin-a", 1, []), fake("twin-b", 1, [])];
    const firsts = new Set(
      Array.from(
        { length: 30 },
        (_, seed) =>
          recommend({ style: "clean-lager" }, twins, { random: seeded(seed) })[0]
            .beer.id,
      ),
    );

    expect(firsts.size).toBe(2);
  });
});

describe("질문 데이터 계약", () => {
  it("style 질문의 선택지 id가 전부 맥주 styleId 로 존재한다", () => {
    const styleIds = new Set(BEERS.map((beer) => beer.styleId));
    for (const id of STYLE_IDS) expect(styleIds.has(id)).toBe(true);
  });

  it("source 질문만 추천에서 빠진다", () => {
    const excluded = QUESTIONS.filter(
      (q) => q.affectsRecommendation === false,
    ).map((q) => q.key);

    expect(excluded).toEqual(["source"]);
  });
});
