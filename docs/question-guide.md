# 질문 데이터 가이드

> 퀴즈 질문을 추가 · 수정 · 삭제하는 사람을 위한 문서.
>
> - 타입: [`src/types/question.ts`](../src/types/question.ts)
> - 데이터: [`src/data/questions.ts`](../src/data/questions.ts) · [`src/data/phrases.ts`](../src/data/phrases.ts)
> - 가중치 표: [`docs/scoring-map.md`](./scoring-map.md)
> - 원본: [`docs/prototype.html`](./prototype.html) 의 `Q1` · `Q2_WHY` · `Q3_HOW` · `Q4_STYLE`
>   (`Q4_STYLE` 만 두 화면으로 쪼개져 있다 — 아래 [스타일 질문](#스타일-질문은-두-화면이다) 참고)

---

## 먼저: 지금 있는 문구는 건드리지 않는다

질문 5개의 **제목 · 선택지 라벨 · 이모지는 피그마 디자인(프레임 2~5) 확정본**이고
프로토타입과 한 글자도 다르지 않다. 더 자연스러운 표현이 떠올라도 고치지 않는다.
문구를 바꿔야 한다면 디자인부터 바꾸고 오는 게 순서다.

화면 개수만 원본과 다르다 — 스타일 질문이 두 화면이라 5개다. 문구 자체는
원본의 라벨 · 서브타이틀을 그대로 나눠 쓴다.

프로토타입에 없던 필드는 **화면에 보이지 않는 추천 전용 값**뿐이다.

| 필드 | 뜻 |
|---|---|
| `scoreEffect` | 이 선택지가 목표 맛 프로필을 어느 축으로 얼마나 미는지 |
| `moodTags` | 이 선택지가 가리키는 분위기. 맥주의 `moodTags` 와 매칭돼 동점을 가른다 |
| `foodTags` | 안주 태그. 지금은 어느 선택지도 쓰지 않는다 |
| `affectsRecommendation` | `false` 면 답변만 수집하고 추천 계산에서 뺀다 |

문구가 원본과 같은지는 스크립트가 지켜준다 — 아래 [검사](#고쳤으면-검사한다) 참고.

---

## 질문 추가 · 수정 · 삭제

**[`src/data/questions.ts`](../src/data/questions.ts) 의 `QUESTIONS` 배열만 고치면 된다.**
화면 개수는 어디에도 박혀 있지 않다.

```ts
export const QUESTIONS: Question[] = [
  { key: "company", title: "오늘은 누구와 함께 하시나요?", options: [...] },
  // 여기에 항목을 하나 넣으면 질문이 6개가 된다
];
```

배열 하나로 따라오는 것들:

| 화면 요소 | 계산 근거 |
|---|---|
| 질문 순서 | 배열 순서 (`company` → `occasion` → `source` → `styleFamily` → `style`) |
| 스텝퍼 점 개수 | `questions.length` — [`useQuizFlow`](../src/hooks/useQuizFlow.ts) 의 `totalSteps` |
| "질문 2 / 5" 진행 표시 | `step` / `totalSteps` |
| 마지막 질문에서 결과로 넘어가는 시점 | `isLast` (`stepIndex === questions.length - 1`) |
| 뒤로가기 활성화 | `isFirst` |

랜딩 문구의 "간단한 질문 5개에 답하면…" · "질문 0 / 5" 도 **숫자를 쓰지 말고**
`QUESTIONS.length` 로 만든다. [`layout.tsx`](../src/app/layout.tsx) 의 메타 설명도
같은 값을 쓴다.

```tsx
`간단한 질문 ${QUESTIONS.length}개에 답하면 딱 맞는 맥주를 추천해드려요.`
```

### 새 질문을 넣을 때 챙길 것

1. `key` 는 답변 객체(`QuizAnswers`)의 키가 된다. 중복되면 답이 덮어써진다.
2. 선택지 `id` 는 공유 URL · 매장 통계에 남을 값이라 한 번 정하면 바꾸지 않는다.
3. 추천에 영향을 줄 질문이면 `scoreEffect` 를, 아니면 `affectsRecommendation: false` 를 넣는다.
4. 결과 문장에 쓸 표현이 필요하면 [`src/data/phrases.ts`](../src/data/phrases.ts) 에 같은 `id` 로 한 줄 추가한다.
5. `npm run check:questions` 를 돌린다.

### 질문을 뺄 때

배열에서 지우면 끝이지만, 지운 질문의 `key` 를 참조하는 곳이 남아 있으면 안 된다.
`company` · `occasion` 은 결과 문장([`phrases.ts`](../src/data/phrases.ts)),
`style` 은 맥주의 `styleId` 와 이어져 있다.

---

## 스타일 질문은 두 화면이다

프로토타입에서 한 화면이던 `Q4_STYLE` 을 앱에서는 둘로 쪼갰다. 선택지 문구만
원본의 서브타이틀 · 라벨로 나눠 갖고, 제목 · 아이콘 · 선택지 id는 두 화면이 같다.

| 화면 | key | 선택지 문구 | 추천 반영 |
|---|---|---|---|
| 질문 4 | `styleFamily` | 원본 **서브타이틀** — "라거 · 라들러 · 첫잔 추천" | ✗ (수집만) |
| 질문 5 | `style` | 원본 **라벨** — "깔끔 · 청량" | ✓ (주 신호) |

- **추천을 정하는 건 질문 5(`style`) 하나다.** 질문 4는
  `affectsRecommendation: false` 라 `scoreEffect` 없이 답변만 쌓인다.
- 두 화면의 선택지 id가 같아서(`clean-lager` …) `answers.styleFamily` 와
  `answers.style` 을 그대로 맞대 보면 **종류로 고른 것과 맛으로 고른 것이
  갈렸는지** 집계할 수 있다.
- 제목이 연달아 같으므로 화면 전환을 제목으로 판별하면 안 된다 —
  e2e는 `STEP n/5` 표시로 확인한다([`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts)).

---

## 추천에 영향을 주지 않는 설문형 질문

유입 경로(`source`)처럼 **매장 운영 데이터로 모으기만 하는 질문**은
`affectsRecommendation: false` 를 준다.

```ts
{
  key: "source",
  title: "저희 매장은 어떻게 알고 오셨나요?",
  affectsRecommendation: false,
  options: [
    { id: "sns", icon: "📱", label: "SNS(인스타·블로그)" },
    // scoreEffect · moodTags 없이 문구만
  ],
}
```

- 화면에는 다른 질문과 **똑같이 노출**되고 스텝 수에도 포함된다.
- [`recommend()`](../src/lib/recommend.ts) 가 `getSelectedOptions()` 단계에서 건너뛰므로
  선택지에 `scoreEffect` 를 실수로 넣어도 반영되지 않는다.
- 답변은 `answers.source` 에 그대로 남아 있어 나중에 그대로 집계하면 된다.

---

## scoreEffect 정하는 법

목표 프로필은 **중립값 2.5**(0~5 축의 한가운데)에서 시작해 선택한 선택지들의
`scoreEffect` 를 더한 값이다. 그 목표에서 거리가 가장 가까운 맥주가 추천된다.

```
목표 = clamp(2.5 + Σ scoreEffect, 0, 5)   // 축: sweetness · bitterness · aroma · body · refreshing
```

### 1. 주 신호(Q5 style)는 크게

스타일 질문은 손님이 **직접 고른 맛 방향**이라 추천을 결정해야 한다.
대상 맥주의 `profile` 을 보고 **중립값 2.5에서 그 값 쪽으로 확실히 넘어가도록**
±2~3을 준다. 두 화면의 라벨(맛 표현 · 종류)이 이미 맛 방향을 설명하니 그대로 옮기면 된다.

```ts
// 🧊 깔끔 · 청량 (질문 5) — 라거 · 라들러 · 첫잔 추천 (질문 4)
scoreEffect: { refreshing: 3, body: -2, bitterness: -1, sweetness: -2, aroma: -2 }
```

### 2. 보조 신호(Q1 · Q2)는 ±1

동행 · 방문 이유는 **비슷한 후보 중에서 고르는 용도**다. ±1을 넘기지 않는다.
값이 커지면 손님이 고른 맛 방향을 상황이 덮어버린다.

### 3. 겹치는 맥주끼리 갈라주는 축을 골라라

두 맥주가 가까울수록 (예: 골든 라거와 레몬 고제는 `refreshing` 5로 같다)
**둘이 다른 축**에 값을 줘야 갈린다. 목표값이 두 맥주 사이에 끼면(예: 2와 3
사이의 2.5) 그 축은 아무 구실도 못 한다.

### 4. 넣고 나서 확인

`npm run check:questions` 가 모든 답변 조합을 돌려 **보조 신호가 Q5의 결과를
뒤집지 않는지** 검사한다. 자세한 값과 여유는 [`docs/scoring-map.md`](./scoring-map.md) 에 있다.

고른 스타일이 1위인 것 자체는 `recommend()` 의 `STYLE_BONUS` 가 구조적으로 보장하므로
가중치를 잘못 잡아도 이 검사는 통과한다. 대신 스크립트가 **스타일 가산점을 뺀 유사도
랭킹**을 같이 찍어주니 그 경고를 본다 — 스타일당 맥주가 여러 종이 되면 그쪽이 순위를
정한다.

---

## 고쳤으면 검사한다

```bash
npm run check:questions
```

- 질문 문구가 프로토타입 원문과 같은지 (개수 · 순서 · `title` · `id` · `icon` · `label` · `subtitle` · 결과 문구 상수)
  — 스타일 질문은 원본 한 화면을 `styleFamily` · `style` 두 화면으로 펼쳐서 대조한다
- 모든 답변 조합에서 Q5(style)에서 고른 스타일의 맥주가 1위인지
- (참고용) 스타일 가산점 없이 유사도만으로도 그 맥주가 1위인지

```bash
npm test
```

- 추천 엔진 회귀 검사 — [`src/lib/recommend.test.ts`](../src/lib/recommend.test.ts).
  `buildReason` 출력은 `docs/prototype.html` 의 원본 함수를 꺼내 직접 대조한다.

문구를 **디자인과 함께 정식으로** 바꾼 경우에만 프로토타입 원문 대조가 실패하는 게
정상이다. 이때는 `docs/prototype.html` 이 더 이상 기준이 아니므로
검사 스크립트의 1번 항목을 걷어내고 새 기준을 적는다.
