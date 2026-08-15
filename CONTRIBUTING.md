# Contributing — Lingo

> 이 프로젝트의 브랜치 전략과 커밋 컨벤션을 정의한다.
> 결정의 *왜* 는 PR 설명이 받는다. 커밋은 *무엇을* 만 간결하게 기록한다.

---

## 브랜치 전략

```
main                  # 완성 시점에만 머지 · Vercel production
  └─ dev              # 통합 브랜치 · 작업이 모이는 곳
       └─ <type>/<요약>   # dev에서 따고 dev로 머지 · 머지 후 삭제
```

- `dev` 에서 작업 브랜치를 딴다.
- 작업이 끝나면 `dev` 로 머지하며 통합한다.
- 기능이 완성된 단위(또는 배포 시점)에 `dev` → `main` 으로 올린다.
- `main` 은 항상 "완성된 것만" 들어간 깨끗한 history 를 유지한다.

### Vercel 연동

- `main` → production
- `dev` → preview

배포 환경에서만 터지는 이슈(폰트 · 이미지 최적화 · CSS 변수)를 preview 에서 미리 잡는다.

### 작업 브랜치 네이밍

`<type>/<kebab-case 요약>` — 영어 소문자 + 하이픈만 사용.

| 패턴 | 예시 |
|---|---|
| `chore/...` | `chore/setup-nextjs`, `chore/vercel-deploy` |
| `feat/...` | `feat/quiz-flow`, `feat/recommend-engine`, `feat/result-card`, `feat/landing-hero` |
| `fix/...` | `fix/answer-reset`, `fix/match-percent-rounding` |
| `refactor/...` | `refactor/quiz-state` |
| `docs/...` | `docs/contributing`, `docs/readme` |

규칙:

- 한 브랜치는 한 가지 일만 한다 (diff 가 한 가지 의도로 읽히게).
- 머지 후 브랜치는 삭제한다.
- 솔로 프로젝트이므로 `release` 등 추가 브랜치는 만들지 않는다.

---

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org) 기반. **subject 한 줄로 끝낸다 — body · footer 없음.**

```
<type>(<scope>): <subject>
```

### type

| type | 용도 |
|---|---|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `style` | 포맷 · 세미콜론 등 동작 무관 변경 |
| `perf` | 성능 개선 |
| `test` | 테스트 |
| `docs` | 문서 |
| `chore` | 설정 · 빌드 · 의존성 |

### scope

| scope | 범위 |
|---|---|
| `quiz` | 퀴즈 플로우 · 단계 진행 (`features/quiz`, `hooks/useQuizFlow`) |
| `result` | 결과 화면 · 추천 카드 (`features/result`) |
| `landing` | 랜딩 · 진입 화면 (`features/landing`) |
| `recommend` | 추천 엔진 · 스코어링 (`lib/recommend`) |
| `data` | 맥주 · 질문 데이터 (`data/`) |
| `types` | 도메인 타입 (`types/`) |
| `ui` | 공용 UI 프리미티브 (`components/ui`) |
| `layout` | 레이아웃 · 공통 셸 (`components/layout`, `app/layout`) |
| `styles` | 전역 스타일 · Tailwind 토큰 |
| `deploy` | 설정 · 빌드 · 배포 |

### 예시

```
chore(deploy): Next.js + TS + Tailwind 초기 셋업
feat(types): 맥주 프로파일 · 퀴즈 도메인 타입 정의
feat(recommend): 프로파일 거리 기반 추천 스코어링 구현
feat(quiz): 4단계 답변 상태 관리 훅 구현
fix(result): 매치율 반올림 오차 해결
refactor(quiz): 답변 상태 reducer로 분리
docs(contributing): 브랜치 전략 · 커밋 컨벤션 정의
```

### 원칙

- 명령형 한 줄, 50자 내외, 마침표 없음.
- 한 커밋 = 한 의도. 여러 번 만지는 작업도 의미 단위로 끊는다.
- `scope` 로 *어디를* + `subject` 로 *무엇을* 압축해, 한 줄만 봐도 변경 의도가 읽히게 한다.
- 결정의 *왜* 는 커밋이 아니라 PR 설명에 기록한다.
