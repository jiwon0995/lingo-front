# 스코어 가중치 매핑

> 추천 결과가 이상할 때 **이 표부터 본다.** 어떤 선택지가 어떤 축을 얼마나 미는지가
> 전부 적혀 있다.
>
> - 가중치 데이터: [`src/data/questions.ts`](../src/data/questions.ts)
> - 계산: [`src/lib/recommend.ts`](../src/lib/recommend.ts)
> - 맥주 프로필: [`src/data/beers.ts`](../src/data/beers.ts) · [`docs/beer-schema.md`](./beer-schema.md)
> - 질문 편집 방법: [`docs/question-guide.md`](./question-guide.md)

---

## 계산 한눈에

축은 다섯 개다 — `sweetness` · `bitterness` · `aroma` · `body` · `refreshing` (각 0~5).

```
1. 취향 벡터 = clamp(2.5 + Σ 선택지 scoreEffect, 0, 5)
2. 거리      = √( Σ wᵢ·((벡터ᵢ − 프로필ᵢ)/5)² / Σ wᵢ )   가중 유클리드, 0~1
3. 유사도    = (1 − 거리) × 100 + 태그 일치 수 × 1.5      0~100
4. 랭킹 점수 = 유사도 + (styleId 일치면 +1000)
5. 랭킹 점수 내림차순 정렬 → 1위가 추천 맥주 (동점이면 랜덤)
```

읽는 요령:

- **축 하나가 1칸 어긋나면 유사도 약 9점**이 깎인다 (다른 축이 같을 때).
  유클리드라서 여러 축이 조금씩 어긋난 것보다 한 축이 크게 어긋난 쪽을 더 벌한다.
- **태그 1건 = 1.5점.** 비슷한 후보끼리만 갈리는 크기다.
- **스타일 일치 = +1000점.** 유사도 최대치(100)보다 훨씬 커서 **스타일 경계는 절대
  넘지 않는다.** 프로토타입의 "고른 스타일 = 결과" 규칙을 떠받치는 장치다
  ([아래](#보조-신호가-q5를-못-뒤집는-이유)). 같은 스타일 맥주끼리는 똑같이 붙으므로
  그 안에서는 유사도 · 태그만 남는다.
- 축별 가중치 `wᵢ` 는 지금 전부 1이다. 특정 축을 더 보려면
  [`recommend.ts`](../src/lib/recommend.ts) 의 `AXIS_WEIGHT` 만 고친다.
- `affectsRecommendation: false` 인 질문(`source` · `styleFamily`)은 1번 단계에서
  통째로 빠진다. `styleFamily` 는 스타일을 종류로 한 번 더 묻는 화면이라 답변만 모은다.
- **화면의 매칭율은 이 점수가 아니다.** 결과 카드에는 `beer.match` (골든 라거 95% 등)를
  그대로 쓴다. 계산 점수는 순위 결정에만 쓴다.

---

## Q5 `style` — 주 신호 (±2~3)

손님이 직접 고른 맛 방향이라 결과를 결정한다. 바로 앞 화면인 Q4(`styleFamily`)는
같은 스타일을 종류 이름으로 묻지만 점수에는 관여하지 않는다. 선택지 `id` 는 맥주의 `styleId` 와
같은 값이고, 가중치는 그 스타일 대표 맥주의 `profile` 을 향하도록 잡았다.

| 선택지 | sweetness | bitterness | aroma | body | refreshing |
|---|---:|---:|---:|---:|---:|
| 🧊 `clean-lager` 깔끔 · 청량 | **−2** | −1 | **−2** | −2 | **+3** |
| 🍊 `hop-forward` 쌉쌀 · 시트러스 | · | **+3** | +2 | · | +1 |
| 🍌 `wheat-yeast` 향긋 · 부드러운 | +1 | −2 | **+2** | +1 | · |
| 🍋 `sour-funky` 새콤달콤 · 상큼 | +2 | −2 | +1 | −2 | **+3** |
| ☕ `dark-malty` 고소 · 진한 흑맥주 | +1 | +1 | · | **+3** | −2 |
| 🥃 `barrel-strong` 묵직한 한 잔 | · | −1 | **+3** | **+3** | −3 |
| 🍰 `dessert-specialty` 디저트 · 스페셜티 | **+3** | · | +1 | +1 | −3 |

`·` 는 값을 주지 않은 축(중립값 2.5 그대로).

### 목표 프로필과 대상 맥주

Q1 · Q2를 답하지 않았을 때 각 선택지가 만드는 목표값이다. 대상 맥주가 가장 가깝다.

| 선택지 | 목표 (sweet / bitter / aroma / body / fresh) | 대상 맥주 profile |
|---|---|---|
| `clean-lager` | 0.5 / 1.5 / 0.5 / 0.5 / 5 | 골든 라거 2 / 1 / 2 / 1 / 5 |
| `hop-forward` | 2.5 / 5 / 4.5 / 2.5 / 3.5 | 트로피컬 IPA 2 / 4 / 5 / 3 / 3 |
| `wheat-yeast` | 3.5 / 0.5 / 4.5 / 3.5 / 2.5 | 바나나 클로브 바이젠 3 / 1 / 4 / 3 / 3 |
| `sour-funky` | 4.5 / 0.5 / 3.5 / 0.5 / 5 | 레몬 고제 3 / 1 / 3 / 1 / 5 |
| `dark-malty` | 3.5 / 3.5 / 2.5 / 5 / 0.5 | 카카오 스타우트 3 / 3 / 4 / 5 / 1 |
| `barrel-strong` | 2.5 / 1.5 / 5 / 5 / 0 | 오크 배럴 스트롱 에일 3 / 2 / 5 / 5 / 0 |
| `dessert-specialty` | 5 / 2.5 / 3.5 / 3.5 / 0 | 디저트 페이스트리 스타우트 5 / 2 / 4 / 4 / 0 |

목표를 맥주 프로필에 딱 맞추지 않고 **조금 더 바깥으로** 민 축이 있다
(예: `clean-lager` 의 sweetness 0.5 vs 맥주 2). Q1 · Q2가 ±1씩 밀어도 이웃 맥주
쪽으로 목표가 넘어가지 않게 하려는 여유다. 자세한 건 아래 [여유](#보조-신호가-q4를-못-뒤집는-이유).

---

## Q1 `company` — 보조 신호 (±1) + 분위기 태그

| 선택지 | scoreEffect | moodTags | 왜 |
|---|---|---|---|
| 👤 `alone` 혼자 | `aroma +1` | `chill` | 혼자 천천히 향을 음미하는 자리 |
| ❤️ `partner` 연인 | `sweetness +1` | `celebration` | 분위기 있는 자리, 부드럽고 달콤한 쪽 |
| 👯 `friends` 친구 | `refreshing +1` | `gathering` | 여럿이 시원하게 |
| 👨‍👩‍👧 `family` 가족 | `bitterness −1` | `meal` | 부담 없이 편하게 마시는 자리 |
| 💼 `colleagues` 동료 | `refreshing +1` | `gathering` | 무난하게 여럿이 |

## Q2 `occasion` — 보조 신호 (±1) + 분위기 태그

| 선택지 | scoreEffect | moodTags | 왜 |
|---|---|---|---|
| 🎉 `celebration` 기념일 · 축하 | `body +1` | `celebration` | 특별한 날일수록 묵직한 한 잔 |
| 🍽️ `meal` 맛있는 음식과 함께 | `body +1` | `meal` | 음식에 밀리지 않는 무게감 |
| 😌 `chill` 가볍게 힐링 | `refreshing +1` | `chill` | 가볍고 청량하게 |
| 👋 `gathering` 오랜만의 모임 | `refreshing +1` | `gathering` | 여러 잔 이어가는 자리 |

## Q3 `source` — 가중치 없음

`affectsRecommendation: false`. 네 선택지(`sns` · `referral` · `walkby` · `revisit`)
모두 `scoreEffect` · `moodTags` 가 없고 추천 계산에서 통째로 빠진다.
답변은 매장 운영 데이터로 `answers.source` 에 남는다.

---

## 분위기 태그 매칭

답변에서 모인 `moodTags` 와 맥주의 `moodTags` 가 겹치면 1건당 **+1.5점**.

| 맥주 | moodTags |
|---|---|
| 골든 라거 `clean-lager` | chill · meal · gathering |
| 트로피컬 IPA `hop-forward` | celebration · gathering |
| 바나나 클로브 바이젠 `wheat-yeast` | chill · meal |
| 레몬 고제 `sour-funky` | chill · celebration |
| 카카오 스타우트 `dark-malty` | chill · meal |
| 오크 배럴 스트롱 에일 `barrel-strong` | chill · celebration |
| 디저트 페이스트리 스타우트 `dessert-specialty` | celebration · gathering |

안주 태그(`foodTags`)는 맥주에만 있고 선택지에는 아직 없어서 지금은 늘 0건이다.

---

## 보조 신호가 Q5를 못 뒤집는 이유

프로토타입에서는 스타일 선택이 곧 결과였다. 그 동작이 유지돼야 하므로
**Q1 · Q2가 아무리 조합돼도 Q5에서 고른 스타일의 맥주가 1위**여야 한다.

이건 가중치를 잘 조율해서가 아니라 **구조로** 보장된다 —
`STYLE_BONUS`(+1000)가 유사도 최대치(100)보다 크므로, 어떤 유사도 차이도
스타일 경계를 넘지 못한다. 보조 가중치를 아무리 키워도 이 성질은 안 깨진다.

그렇다고 프로필 가중치가 아무래도 좋은 건 아니다. **스타일당 맥주가 여러 종이 되면
가산점이 똑같이 붙어 상쇄되고, 그 안의 순위는 유사도 · 태그가 정한다.**
그래서 "스타일 가산점을 빼도 제 맥주가 1위인가"를 계속 지켜본다 —
지금은 모든 조합에서 그렇다. 1위와 2위의 유사도 차(모든 Q1 × Q2 조합 중 최솟값):

| 선택한 스타일 | 최소 여유 | 가장 아슬아슬한 조합 |
|---|---:|---|
| `clean-lager` | 9.8 | 혼자 + 기념일 → 레몬 고제와 경합 |
| `hop-forward` | 14.4 | 연인 + 음식 → 카카오 스타우트와 경합 |
| `wheat-yeast` | 5.2 | 연인 + 기념일 → 디저트 스타우트와 경합 |
| `sour-funky` | 5.3 | 혼자 + 음식 → 바이젠과 경합 |
| `dark-malty` | **0.4** | 연인 + (방문 이유 없음) → 디저트 스타우트와 경합 |
| `barrel-strong` | **2.5** | 친구 + 힐링 → 카카오 스타우트와 경합 |
| `dessert-specialty` | 8.2 | 친구 + 힐링 → 카카오 스타우트와 경합 |

여유 0.4점은 태그 1건(1.5점)보다도 작다. 값을 건드렸으면 반드시:

```bash
npm run check:questions   # 문구 대조 + 1,050개 답변 조합 전수 확인
npm test                  # 추천 엔진 회귀 검사 (src/lib/recommend.test.ts)
```

`check:questions` 는 두 가지를 따로 찍는다 — 실제 추천 1위(가산점 포함, **실패 조건**)와
유사도만의 1위(가산점 제외, **참고용 경고**). 두 번째가 어긋나기 시작하면 스타일이
늘어났을 때 순위가 흔들린다는 신호다.

---

## 결과가 이상할 때

| 증상 | 볼 곳 |
|---|---|
| 스타일을 골랐는데 **다른 스타일** 맥주가 나온다 | 버그다. `recommend()` 의 `styleBonus` 가 0으로 넘어갔거나, 선택지 `id` 와 맥주 `styleId` 가 어긋났는지 확인 |
| 스타일 안에서 엉뚱한 맥주가 나온다 (스타일당 여러 종) | 위 [여유 표](#보조-신호가-q4를-못-뒤집는-이유) → 겹치는 맥주와 **다른 축**에 값을 주거나 `moodTags` 로 갈라준다 |
| 특정 맥주만 계속 나온다 | 그 맥주의 `profile` 이 중립값(2.5) 근처인지 확인 — 가운데 있는 맥주는 어느 목표에서도 가깝다 |
| 동행 · 방문 이유를 바꿔도 결과가 안 바뀐다 | 정상이다. 보조 신호는 비슷한 후보끼리 갈릴 때만 드러난다 |
| 맥주를 새로 넣었더니 엉뚱하게 나온다 | 새 맥주의 `profile` 이 기존 맥주와 겹치는지 확인 → `npm run check:questions` |
| 유입 경로가 결과를 바꾼다 | 버그다. `source` 질문의 `affectsRecommendation: false` 가 지워졌는지 확인 |
