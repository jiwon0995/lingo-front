# 맥주 데이터 스키마 가이드

> 맥주를 추가하거나 실제 링고 매장 데이터로 교체하는 사람을 위한 문서.
>
> - 타입: [`src/types/beer.ts`](../src/types/beer.ts) · [`src/types/question.ts`](../src/types/question.ts)
> - 데이터: [`src/data/beers.ts`](../src/data/beers.ts)
> - 원본: [`docs/prototype.html`](./prototype.html) 의 `BEER_DB`

---

## 구조 한눈에

프로토타입은 스타일 key를 가진 **객체**였다.

```js
BEER_DB["clean-lager"]        // 스타일 하나 = 맥주 하나
```

스타일당 맥주가 하나뿐이라는 가정이 구조에 박혀 있어서, 같은 라거를 두 종
넣는 순간 깨진다. 그래서 **배열**로 바꾸고 원래 key를 `id` · `styleId` 로 옮겼다.

```ts
BEERS                          // Beer[]
getBeersByStyle("clean-lager") // 스타일에 속한 전부
getBeerByStyle("clean-lager")  // 대표 한 종 (프로토타입 BEER_DB[key] 자리)
```

`id` 는 맥주 한 종을 가리키고 `styleId` 는 그 맥주가 속한 스타일 카테고리를
가리킨다. 지금은 7종 × 7스타일이라 둘이 같지만, 라거를 하나 더 넣으면
`id: "summer-lager"` / `styleId: "clean-lager"` 처럼 갈라진다.

---

## 필드

### 화면에 보이는 값 (프로토타입 원문 그대로)

| 필드 | 타입 | 뜻 |
|---|---|---|
| `id` | `string` | 맥주 식별자. 프로토타입의 객체 key를 그대로 썼다. 공유 URL에 들어갈 값이라 한 번 정하면 바꾸지 않는다 |
| `styleId` | `string` | 스타일 카테고리. 퀴즈의 스타일 선택지 id와 이어진다 |
| `name` | `string` | 맥주 이름 |
| `emoji` | `string` | 대표 이모지 |
| `tagline` | `string` | 카드 상단 한 줄 카피 |
| `taste` | `string` | 맛 설명 한 문장 |
| `perfectFor` | `string` | 어떤 순간에 어울리는지 한 문장 |
| `tags` | `string[]` | 특징 키워드 3개 (예: `["청량함", "가벼움", "부드러운 목넘김"]`) |
| `pairing` | `string[]` | 어울리는 안주 3개 |
| `abv` | `string` | 도수. `"4.8%"` 처럼 **% 포함 문자열**. 표시 전용이라 숫자 비교·정렬에 못 쓴다 |
| `ibu` | `number` | 쓴맛 지수 |
| `match` | `number` | 결과 카드에 표시할 매칭율. 프로토타입에서 맥주마다 하드코딩된 값 |
| `photo` | `string` | 대표 사진 URL |
| `garnish` | `string` | 잔 위에 얹는 가니시 이모지 |

### 데이터만 보존 (현재 화면 미사용)

| 필드 | 타입 | 뜻 |
|---|---|---|
| `color` | `string` | 잔 그래픽 본체 색 |
| `colorLight` | `string` | 잔 그래픽 밝은 쪽 색 |
| `foam` | `string` | 거품 색 |

프로토타입의 CSS 잔 일러스트에 쓰이던 값이다. 지금 화면은 `photo` 를 쓰지만,
나중에 잔 그래픽을 되살릴 수 있으니 지우지 않는다.

### 추천 전용 (화면 미노출)

| 필드 | 타입 | 뜻 |
|---|---|---|
| `profile` | `BeerProfile` | 맛 프로필 5축, 각 0~5 정수 |
| `moodTags` | `string[]` | 분위기 태그 |
| `foodTags` | `string[]` | 안주 태그 |

프로토타입에 없던 필드다. 프로토타입은 스타일 선택지와 맥주가 1:1이라
추천 로직이 사실상 없었고, 이 세 필드가 다중 기준 스코어링의 입력이 된다.

> `moodTags` · `foodTags` 는 유니언이 아니라 `string[]` 이다. 매장 메뉴가
> 늘면서 태그도 같이 늘 텐데, 그때마다 타입 파일을 고치지 않아도 되게 했다.
> 대신 어휘집을 [`src/types/beer.ts`](../src/types/beer.ts) 의
> `MOOD_TAGS` · `FOOD_TAGS` 상수로 두었으니 새 값을 만들기 전에 먼저 본다.

---

## profile 점수 매기는 법

5개 축, **0~5 정수**. 소수점은 쓰지 않는다.

| 점수 | 뜻 |
|---|---|
| 0 | 거의 없음 |
| 1 | 희미하게 |
| 2 | 약함 |
| 3 | 보통 |
| 4 | 강함 |
| 5 | 매우 강함 |

| 축 | 뜻 | 0에 가까움 | 5에 가까움 |
|---|---|---|---|
| `sweetness` | 몰트·과일·부재료의 잔당감 | 드라이한 라거 | 디저트 스타우트 |
| `bitterness` | 홉·로스팅 몰트의 쌉쌀함 | 사워·밀맥주 | IPA |
| `aroma` | 코로 느껴지는 향의 **세기** | 라이트 라거 | 배럴에이지드 |
| `body` | 입안의 묵직함·질감 | 고제 | 스트롱 에일 |
| `refreshing` | 탄산·드라이함·목넘김의 시원함 | 배럴에이지드 | 라거 |

### 매길 때 지키는 것

1. **`taste` 와 `tags` 를 근거로 매긴다.** 현재 7종도 전부 그렇게 매겼다.
   `tags` 에 `"쌉쌀함"` 이 있는데 `bitterness: 1` 이면 둘 중 하나가 틀린 것이다.
2. **`aroma` 는 취향이 아니라 세기다.** 향이 좋다/나쁘다가 아니라 얼마나
   세게 올라오는지를 적는다. 향이 얌전한 라거는 좋은 맥주여도 2다.
3. **IBU를 그대로 옮기지 않는다.** 카카오 스타우트(IBU 32)와
   트로피컬 IPA(IBU 55)는 체감 쓴맛의 성격이 다르다. 혀로 느끼는 값을 적는다.
   실제로 카카오 스타우트는 `bitterness: 3`, 트로피컬 IPA는 `4` 다.
4. **`refreshing` 과 `body` 는 대체로 반대로 간다.** 둘 다 4~5인 조합은
   드무니, 그렇게 나왔다면 다시 확인한다.
5. **같은 `styleId` 안에 여러 종을 넣을 땐 최소 한 축을 2점 이상 벌린다.**
   다 비슷하게 매기면 추천이 다시 스타일 단위로 뭉개진다.

### 현재 7종의 값

| id | 이름 | 단맛 | 쓴맛 | 향 | 바디 | 청량 |
|---|---|---|---|---|---|---|
| `clean-lager` | 골든 라거 | 2 | 1 | 2 | 1 | 5 |
| `hop-forward` | 트로피컬 IPA | 2 | 4 | 5 | 3 | 3 |
| `wheat-yeast` | 바나나 클로브 바이젠 | 3 | 1 | 4 | 3 | 3 |
| `sour-funky` | 레몬 고제 | 3 | 1 | 3 | 1 | 5 |
| `dark-malty` | 카카오 스타우트 | 3 | 3 | 4 | 5 | 1 |
| `barrel-strong` | 오크 배럴 스트롱 에일 | 3 | 2 | 5 | 5 | 0 |
| `dessert-specialty` | 디저트 페이스트리 스타우트 | 5 | 2 | 4 | 4 | 0 |

---

## 태그 어휘

### moodTags

프로토타입 Q2(방문 이유)의 선택지 id와 같은 값을 쓴다. 퀴즈 답변과
맥주를 바로 맞대볼 수 있게 하려는 것이니, 새 분위기를 추가할 땐
질문 선택지도 같이 늘려야 의미가 있다.

| 값 | 뜻 |
|---|---|
| `celebration` | 기념일 · 축하 |
| `meal` | 맛있는 음식과 함께 |
| `chill` | 가볍게 힐링 |
| `gathering` | 오랜만의 모임 |

### foodTags

`pairing` 을 굵게 묶은 것이다. `pairing` 은 사람이 읽는 문구,
`foodTags` 는 매칭용 분류다.

| 값 | 뜻 | 예 |
|---|---|---|
| `fried` | 튀김·구이 등 기름진 안주 | 감자튀김, 치킨윙, 바비큐 립 |
| `spicy` | 매콤한 음식 | 타코, 매운 안주 |
| `dessert` | 디저트·초콜릿 | 티라미수, 초콜릿 케이크 |
| `seafood` | 해산물 | 훈제 연어, 세비체 |
| `light` | 가벼운 안주 | 치즈, 샐러드, 견과류 |

---

## 맥주를 추가하는 방법

**[`src/data/beers.ts`](../src/data/beers.ts) 의 `BEERS` 배열에 항목 하나를 넣으면 끝이다.**
타입·헬퍼·추천 엔진·화면 중 어느 것도 건드릴 필요가 없다.

```ts
{
  id: "summer-lager",
  styleId: "clean-lager",   // 기존 스타일에 합류
  name: "여름 라거",
  emoji: "🌊",
  tags: ["청량함", "라이트", "저도수"],
  taste: "...",
  tagline: "...",
  perfectFor: "...",
  pairing: ["감자튀김", "샐러드", "치킨윙"],
  abv: "4.2%",
  ibu: 10,
  match: 93,
  color: "#F0C34A", colorLight: "#F8DE8E", foam: "#FFFBEE",
  garnish: "🌊",
  photo: "https://...",
  profile: { sweetness: 1, bitterness: 1, aroma: 1, body: 1, refreshing: 5 },
  moodTags: ["chill", "gathering"],
  foodTags: ["fried", "light"],
}
```

- `getBeersByStyle("clean-lager")` 가 자동으로 2종을 반환한다.
- 새 스타일을 만들면 `styleId` 에 새 값을 쓰면 되고, `getStyleIds()` 에
  자동으로 잡힌다. 다만 그 스타일을 퀴즈에서 고를 수 있게 하려면
  질문 데이터에 선택지를 추가해야 한다 (Phase 2).
- 필드를 빠뜨리면 `Beer` 타입이 컴파일 에러로 잡아준다.

### 추가 후 확인

```bash
npx tsc --noEmit
```

---

## 실제 매장 데이터로 교체할 때

현재 7종은 **프로토타입의 가상 데이터**다. 실제 링고 라인업으로 바꿀 때:

1. **`id` 를 신중히 정한다.** 공유 링크·통계에 들어갈 값이라 나중에 바꾸면
   기존 링크가 깨진다. 메뉴판 이름이 바뀌어도 `id` 는 유지한다.

2. **`match` 는 지금 하드코딩이다.** 프로토타입이 맥주마다 고정 숫자
   (90~96)를 들고 있어서 그대로 옮겼다. 실제로 계산된 매칭율을 쓰려면
   [`src/lib/recommend.ts`](../src/lib/recommend.ts) 의 `Recommendation.matchPercent`
   를 쓰고, `Beer.match` 는 표시용 기본값으로만 남긴다. **두 값이 화면에
   섞여 나오지 않게 어느 쪽을 쓸지 먼저 정한다.**

3. **`abv` 는 문자열이라 숫자 비교가 안 된다.** "도수 낮은 순 정렬" 같은
   기능이 필요해지면 `abvValue: number` 를 따로 추가하는 편이 낫다.
   `abv` 를 숫자로 바꾸면 `"4.8%"` 표시 로직이 전부 영향을 받는다.

4. **`photo` 를 실사진으로 바꾸려면 도메인 등록이 필요하다.**
   현재 URL은 전부 `images.pexels.com` 이고, `next.config.ts` 의
   `images.remotePatterns` 에 **아직 아무 호스트도 등록돼 있지 않다**
   (2026-08-16 기준). `next/image` 로 렌더링할 계획이면 실제 이미지 호스트를
   먼저 등록해야 한다.

5. **`profile` 은 반드시 다시 매긴다.** 이름과 스타일이 같아도 양조장이
   다르면 맛이 다르다. 실제로 마셔보고 위 기준으로 매기는 게 원칙이고,
   임시로 옮겨야 한다면 `taste` 문장과 어긋나지 않는지만이라도 확인한다.

6. **`color` · `colorLight` · `foam` 은 지우지 말 것.** 지금 화면에서
   안 쓰인다고 비워두면 나중에 잔 그래픽을 되살릴 때 7종을 다시 채워야 한다.

---

## Question / Option 타입

질문 **데이터는 Phase 2**에서 넣고, 여기서는 타입만 정의돼 있다
([`src/types/question.ts`](../src/types/question.ts)).

```ts
interface Option {
  id: string;
  icon: string;
  label: string;
  subtitle?: string;
  scoreEffect?: ScoreEffect;   // 맛 프로필 가중치
  moodTags?: string[];         // Beer.moodTags 와 매칭
  foodTags?: string[];         // Beer.foodTags 와 매칭
}

interface Question {
  key: string;                 // 답변을 담는 키
  title: string;
  options: Option[];
  affectsRecommendation?: boolean;
}
```

- **`affectsRecommendation: false`** 면 답변은 수집하되 추천 계산에서는
  제외한다. 프로토타입 Q3 "저희 매장은 어떻게 알고 오셨나요?"처럼
  통계용 설문 문항이 여기 해당한다. **생략하면 `true` 로 취급한다.**
- **`scoreEffect`** 는 절대값이 아니라 중립(2.5)에서의 증감이며 `-2 ~ +2`
  범위를 쓴다. 예: 쌉쌀·시트러스 → `{ bitterness: 2, aroma: 2, refreshing: 1 }`.
- 한 선택지가 건드리는 축은 **3개 이하**로 둔다. 다 건드리면 축끼리 상쇄돼서
  어떤 답을 해도 결과가 비슷해진다.
- `scoreEffect` 없이 `moodTags` · `foodTags` 만 단 선택지도 유효하다
  (맛이 아니라 상황만 좁히는 질문).
