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
1. 목표 프로필 = clamp(2.5 + Σ 선택지 scoreEffect, 0, 5)
2. 거리        = Σ |목표 − 맥주 profile| / 5        (축마다, 0~5 범위를 0~1로 정규화)
3. 점수        = 1 − 거리 / 5 + (분위기·안주 태그 일치 수 × 0.01)
4. 점수 내림차순 정렬 → 1위가 추천 맥주
```

읽는 요령:

- **거리 1칸 = 점수 0.04.** 목표에서 한 축이 1만큼 어긋나면 점수가 0.04 깎인다.
- **태그 1건 = 점수 0.01.** 거리 0.25칸어치. 태그는 동점을 가르기만 한다.
- `affectsRecommendation: false` 인 질문(`source`)은 1번 단계에서 통째로 빠진다.

---

## Q4 `style` — 주 신호 (±2~3)

손님이 직접 고른 맛 방향이라 결과를 결정한다. 선택지 `id` 는 맥주의 `styleId` 와
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

답변에서 모인 `moodTags` 와 맥주의 `moodTags` 가 겹치면 1건당 **+0.01**.

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

## 보조 신호가 Q4를 못 뒤집는 이유

프로토타입에서는 스타일 선택이 곧 결과였다. 그 동작이 유지돼야 하므로
**Q1 · Q2가 아무리 조합돼도 Q4에서 고른 스타일의 맥주가 1위**여야 한다.
지켜지는 근거는 세 가지다.

1. **크기 차이** — Q4는 ±2~3, Q1 · Q2는 ±1. 한 답변이 밀 수 있는 거리는 1칸(0.04)이다.
2. **태그는 동점용** — 태그 보너스는 1건당 0.01(거리 0.25칸)이라 거리 차이를 못 이긴다.
   [`recommend.ts`](../src/lib/recommend.ts) 의 `TAG_BONUS` 를 키우면 이 성질이 깨진다.
3. **목표를 이웃 밖으로 밀어둠** — 보조 신호가 ±1 밀어도 목표가 다른 맥주 쪽으로
   넘어가지 않는 자리에 Q4 목표를 잡았다.

현재 데이터에서 남는 여유(1위와 2위의 점수 차, 모든 Q1 × Q2 조합 중 최솟값):

| 선택한 스타일 | 최소 여유 | 가장 아슬아슬한 조합 |
|---|---:|---|
| `clean-lager` | 0.070 | 혼자 + 기념일 → 레몬 고제와 경합 |
| `hop-forward` | 0.080 | 연인 + 음식 → 바이젠과 경합 |
| `wheat-yeast` | **0.030** | 혼자 + 기념일 → 배럴 스트롱과 경합 |
| `sour-funky` | 0.060 | 친구 + 음식 → 골든 라거와 경합 |
| `dark-malty` | **0.030** | 연인 + 기념일 → 디저트 스타우트와 경합 |
| `barrel-strong` | 0.040 | 친구 + 힐링 → 카카오 스타우트와 경합 |
| `dessert-specialty` | 0.070 | 혼자 + 기념일 → 배럴 스트롱과 경합 |

여유 0.030은 **거리 0.75칸**이다. 보조 가중치를 ±2로 키우거나 태그 보너스를 올리면
바로 뒤집힌다. 값을 건드렸으면 반드시:

```bash
npm run check:questions
```

모든 답변 조합(현재 1,050가지)에서 1위가 유지되는지 확인한다.

---

## 결과가 이상할 때

| 증상 | 볼 곳 |
|---|---|
| 스타일을 골랐는데 다른 맥주가 나온다 | 위 [여유 표](#보조-신호가-q4를-못-뒤집는-이유) → 해당 스타일의 Q4 가중치를 키우거나, 겹치는 맥주와 **다른 축**에 값을 준다 |
| 특정 맥주만 계속 나온다 | 그 맥주의 `profile` 이 중립값(2.5) 근처인지 확인 — 가운데 있는 맥주는 어느 목표에서도 가깝다 |
| 동행 · 방문 이유를 바꿔도 결과가 안 바뀐다 | 정상이다. 보조 신호는 비슷한 후보끼리 갈릴 때만 드러난다 |
| 맥주를 새로 넣었더니 엉뚱하게 나온다 | 새 맥주의 `profile` 이 기존 맥주와 겹치는지 확인 → `npm run check:questions` |
| 유입 경로가 결과를 바꾼다 | 버그다. `source` 질문의 `affectsRecommendation: false` 가 지워졌는지 확인 |
