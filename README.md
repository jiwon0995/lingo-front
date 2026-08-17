# 맥주 파인더

매장 방문 손님이 질문 4개에 답하면 취향에 맞는 맥주 한 종을 추천해 주는
모바일 웹앱. 태블릿·휴대폰 세로 화면(셸 최대 너비 390px)을 기준으로 만들었다.

**이 저장소는 프로토타입 재현 프로젝트다.** 화면 · 문구 · 애니메이션의 기준은
[`docs/prototype.html`](docs/prototype.html)(단일 HTML 프로토타입)과 피그마
디자인이고, 코드는 그것을 Next.js App Router 구조로 옮긴 결과물이다.
그래서 "더 나은 표현"이 떠올라도 화면 문구는 임의로 고치지 않는다 —
자세한 이유는 [수정하는 방법](#수정하는-방법)의 마지막 항목에 적었다.

현재 맥주 7종 × 스타일 7종, 질문 4개(그중 3개가 추천에 반영)로 동작한다.

---

## 기술 스택

| | |
|---|---|
| 프레임워크 | Next.js 16.2 (App Router · Turbopack) |
| 언어 | TypeScript 5 |
| UI | React 19 |
| 스타일 | Tailwind CSS v4 (PostCSS) |
| 단위 테스트 | Vitest |
| E2E | Playwright |

런타임 의존성은 `next` · `react` · `react-dom` **세 개뿐이다.** 색 애니메이션 ·
컨페티 · 스텝퍼는 모두 직접 구현했으므로 UI 라이브러리를 새로 붙일 때는
정말 필요한지 먼저 따져 본다.

---

## 로컬 실행

Node.js 20 이상이 필요하다.

```bash
npm install
```

개발 서버 — http://localhost:3000

```bash
npm run dev
```

프로덕션 빌드 · 실행

```bash
npm run build
npm start
```

### 검사 명령

| 명령 | 하는 일 |
|---|---|
| `npm test` | 단위 테스트 (Vitest, 1회 실행) |
| `npm run test:watch` | 단위 테스트 watch 모드 |
| `npm run test:coverage` | 커버리지 리포트 → `coverage/` |
| `npm run test:e2e` | Playwright E2E (랜딩 → 결과 → 리롤 스모크) |
| `npm run lint` | ESLint |
| `npm run check:questions` | 질문 `scoreEffect` 가 의도한 맥주를 가리키는지 검증 |

`check:questions` 는 **`questions.ts` 의 가중치를 건드렸다면 반드시 돌린다.**
각 스타일 선택지가 여전히 자기 스타일의 맥주를 1순위로 뽑는지 확인해 준다.

---

## 폴더 구조

```
src/
├── app/                     App Router 라우트
│   ├── layout.tsx           루트 레이아웃 · 메타데이터
│   ├── page.tsx             단일 라우트 — <BeerFinderApp /> 를 띄운다
│   └── globals.css          Tailwind 진입점 · CSS 변수 · 프로토타입 애니메이션
│
├── components/
│   ├── BeerFinderApp.tsx    앱 전체 조립 (QuizProvider + 화면 전환)
│   ├── screens/             화면 단위 — 각 폴더가 프로토타입의 한 프레임
│   │   ├── landing/         랜딩 (시작하기 · 아무거나 추천받기)
│   │   ├── quiz/            질문 화면 (스텝퍼 · 선택지)
│   │   └── result/          결과 카드 · 사진 · 오버레이
│   └── ui/                  화면에 종속되지 않는 조각 (Button · Card · Stepper …)
│
├── context/
│   └── QuizContext.tsx      단계 · 답변 · 결과를 들고 있는 상태 컨테이너
│
├── data/                    ★ 내용을 고칠 때 여는 곳
│   ├── questions.ts         질문 · 선택지 · 추천 가중치(scoreEffect)
│   ├── beers.ts             맥주 목록 · 맛 프로필 · 사진 URL
│   └── phrases.ts           결과 "추천 이유" 문장 조각
│
├── lib/
│   ├── recommend.ts         추천 계산 (취향 벡터 → 거리 → 순위)
│   └── cn.ts                조건부 className 유틸
│
├── hooks/                   useConfetti · useReplayAnimation
├── config/
│   └── app.ts               브랜드명 · 앱 타이틀 · 셸 너비
└── types/                   Beer · Question · Result · Feedback 타입

docs/                        아래 "문서" 절 참고
e2e/                         Playwright 스펙
scripts/check-questions.mjs  가중치 검증 스크립트
```

라우트가 하나뿐인 이유는 프로토타입이 단일 화면 안에서 프레임을 갈아끼우는
구조였고, 그 동작(뒤로가기 · 애니메이션 연결)을 그대로 살리는 편이 URL을
쪼개는 것보다 정확했기 때문이다.

---

## 수정하는 방법

**이 절이 이 README의 핵심이다.** 대부분의 변경은 파일 하나만 고치면 끝난다.

### 질문을 추가 · 수정하려면 → [`src/data/questions.ts`](src/data/questions.ts)

`QUESTIONS` 배열 **하나만** 고친다. 다음은 전부 자동으로 따라온다.

- 스텝퍼 점 개수와 진행 표시 (`questions.length` 로 계산)
- 랜딩의 "질문 4개에 답하면 …" 문구와 `질문 0 / 4` 표시
- 뒤로가기 · 다음 단계 이동 로직
- 결과 화면으로 넘어가는 시점

즉 **질문 개수가 코드 어디에도 박혀 있지 않다.** 질문을 5개로 늘려도 고칠 파일은
`questions.ts` 뿐이다.

주의할 점 두 가지:

1. Q1(`company`) · Q2(`occasion`) 의 선택지를 추가하면
   [`src/data/phrases.ts`](src/data/phrases.ts) 에 같은 `id` 를 넣어야 결과의
   "추천 이유" 문장이 완성된다. 빼먹으면 그 조각만 빠진 문장이 나온다.
2. 추천에 반영하지 않을 질문은 `affectsRecommendation: false` 를 준다
   (지금 Q3 `source` 가 그렇다 — 유입 경로는 취향과 무관하므로).

자세한 규칙: [`docs/question-guide.md`](docs/question-guide.md)

### 맥주를 추가하려면 → [`src/data/beers.ts`](src/data/beers.ts)

`BEERS` 배열에 항목 하나를 넣는다. `id` 는 맥주 한 종, `styleId` 는 그 맥주가
속한 스타일 카테고리다. 같은 스타일에 여러 종을 넣어도 구조가 버틴다
(대표 한 종은 `match` 가 가장 높은 것으로 고른다).

필수 필드와 각 필드의 의미: [`docs/beer-schema.md`](docs/beer-schema.md)

### 추천 가중치를 조정하려면 → [`src/data/questions.ts`](src/data/questions.ts) 의 `scoreEffect`

계산 로직(`src/lib/recommend.ts`)은 건드리지 않는다. 어떤 선택지가 어떤 축을
얼마나 미는지는 전부 `scoreEffect` 에 있다. 축은 5개 —
`sweetness` · `bitterness` · `aroma` · `body` · `refreshing`.

**추천 결과가 이상하면 [`docs/scoring-map.md`](docs/scoring-map.md) 를 먼저 본다.**
어떤 선택지가 어떤 축을 얼마나 미는지 표로 전부 적혀 있다.

고친 뒤에는:

```bash
npm run check:questions
```

### 브랜드명을 바꾸려면 → [`src/config/app.ts`](src/config/app.ts)

`BRAND_NAME`(헤더 표기) · `APP_TITLE`(문서 타이틀 겸 랜딩 헤드라인) ·
`SHELL_MAX_WIDTH`(모바일 셸 너비) 세 값이 있다. 프로젝트명은 "링고"지만 화면
표기는 프로토타입을 따라 "맥주 파인더"다 — 매장명이 확정되면 이 파일만 고친다.

`SHELL_MAX_WIDTH` 를 바꿀 때는 `globals.css` 의 `--container-shell` 도 같은 값으로
맞춰야 한다.

### ⚠️ 화면 문구는 임의로 고치지 않는다

질문 제목 · 선택지 라벨 · 이모지 · 서브타이틀 · 결과 화면 문장은 **피그마
디자인 확정본이고 프로토타입과 한 글자도 다르지 않다.** 더 자연스러운 표현이
떠올라도 고치지 않는다. 문구를 바꿔야 한다면 디자인을 먼저 바꾸고 오는 것이
순서다.

예외는 화면에 보이지 않는 추천 전용 값뿐이다 —
`scoreEffect` · `moodTags` · `foodTags` · `profile` · `affectsRecommendation`.

---

## 문서

| 문서 | 용도 |
|---|---|
| [`docs/beer-schema.md`](docs/beer-schema.md) | 맥주 데이터 스키마. **맥주를 추가하거나 실제 매장 메뉴로 교체할 때** 필드별 의미와 작성 규칙 |
| [`docs/question-guide.md`](docs/question-guide.md) | 질문 데이터 가이드. **질문을 추가 · 수정 · 삭제할 때** 지켜야 할 규칙과 연쇄 수정 지점 |
| [`docs/scoring-map.md`](docs/scoring-map.md) | 스코어 가중치 매핑 표. **추천 결과가 이상할 때 가장 먼저 볼 문서** |
| [`docs/launch-checklist.md`](docs/launch-checklist.md) | 실제 매장 데이터로 오픈할 때의 체크리스트 (사진 라이선스 · 메뉴 일치 · 매칭율 정책 · 별점 저장) |
| [`docs/prototype.html`](docs/prototype.html) | 원본 프로토타입. 화면 · 문구 · 애니메이션의 **기준 문서** — 구현이 헷갈리면 이걸 연다 |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | 브랜치 전략 · 커밋 컨벤션 |

---

## 배포

### Vercel (기본)

**별도 설정이 필요 없다 — zero-config 로 배포된다.** 저장소를 Vercel에 연결하면
프레임워크(Next.js) · 빌드 명령 · 출력 경로가 자동 감지되므로 `vercel.json` 은
두지 않았다.

브랜치 매핑은 [`CONTRIBUTING.md`](CONTRIBUTING.md) 를 따른다.

| 브랜치 | 환경 |
|---|---|
| `main` | production |
| `dev` | preview |

환경 변수는 현재 없다.

[`next.config.ts`](next.config.ts) 에 있는 설정은 `images.remotePatterns` 하나뿐이고,
맥주 사진을 Pexels(`images.pexels.com`)에서 불러오기 위한 허용 목록이다.
사진 호스트를 바꾸면 이 목록도 함께 고쳐야 한다 — 안 고치면 이미지가 막힌다.

### 정적 호스팅 (`output: 'export'`)

현재 서버 API · Server Action · 동적 라우트를 쓰지 않으므로 **정적 export도
가능하다.** 단, `next.config.ts` 에 두 줄이 함께 필요하다.

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,   // ← 이게 없으면 맥주 사진이 전부 깨진다
    remotePatterns: [/* … */],
  },
};
```

`unoptimized` 를 빠뜨리면 **빌드는 성공하지만 런타임에 사진이 깨진다.**
`next/image` 가 기본 loader로 `/_next/image?url=…` 를 가리키는데, 그 경로는
Next 서버가 제공하는 엔드포인트라서 정적 호스트에서는 404 가 된다. 결과
화면은 `BeerPhoto` 의 안전장치 덕에 회색 배경 + 맥주 이모지로 조용히 대체되므로
**빌드 로그만 봐서는 눈치채기 어렵다.** 정적 export로 배포했다면 결과 화면에서
사진이 실제로 뜨는지 눈으로 확인한다.

`unoptimized: true` 를 켜면 사진을 Pexels에서 그대로(원본 크기로) 받는다.
Vercel의 이미지 최적화(리사이즈 · WebP 변환)를 포기하는 것이므로, **Vercel에
배포하는 동안에는 켜지 않는다.** 그래서 이 저장소의 기본값은 export가 꺼진
상태다.

빌드 산출물은 `out/` 에 생기고, 그 폴더만 정적 호스트에 올리면 된다.

> **📌 Phase 8 메모 — 별점 저장용 API를 추가하면 정적 export를 쓸 수 없게 된다.**
>
> Route Handler(`POST`) · Server Action · 요청 기반 로직은 정적 export가
> 지원하지 않는다 (`GET` Route Handler는 빌드 시점 정적 응답으로만 처리된다).
> 별점을 서버에 저장하기 시작하면 Vercel처럼 서버가 있는 호스팅이 필요하다.
>
> 별점을 바깥으로 넘기는 자리는 이미 열려 있다 —
> [`src/types/feedback.ts`](src/types/feedback.ts) 의 `RatingSubmitHandler` 를
> `<BeerFinderApp onSubmitRating={…} />` 로 주입하면 된다. 지금은 아무도
> 넘기지 않아서 별점이 화면 안에서만 소비된다.
