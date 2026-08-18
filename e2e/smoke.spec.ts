import { expect, test, type Page } from "@playwright/test";

/**
 * 스모크 e2e — 랜딩 → 퀴즈 전체 응답 → 결과 노출 → 다이스 리롤.
 *
 * 화면 문구는 프로토타입(`docs/prototype.html`) 원문이라 셀렉터로 그대로 쓴다 —
 * 문구가 바뀌면 이 테스트도 깨진다(의도한 것이다). 데이터에 의존하는 부분
 * (맥주 이름)은 값을 박지 않고 화면에서 읽어 비교한다.
 */

/** 질문 개수 (`QUESTIONS.length`) — 질문을 늘리면 여기만 고친다 */
const TOTAL_STEPS = 5;

/** 퀴즈 화면에서 n번째 선택지를 고르고 다음 화면으로 넘어갈 때까지 기다린다 */
async function chooseOption(page: Page, index: number, nextStep: number) {
  await page.locator("button.opt-card").nth(index).click();
  // 260ms 뒤 다음 스텝으로 넘어간다 — 스타일 질문 두 화면은 제목이 같으므로
  // 전환 확인은 STEP 표시로 한다
  await expect(page.getByText(`STEP ${nextStep}/${TOTAL_STEPS}`)).toBeVisible({
    timeout: 5_000,
  });
}

test("랜딩 → 퀴즈 5문항 → 결과 → 다이스 리롤", async ({ page }) => {
  await page.goto("/");

  /* ---------- 랜딩 ---------- */
  await expect(page.getByRole("heading", { name: "나에게 맞는 맥주 찾기" })).toBeVisible();
  await expect(
    page.getByText(`간단한 질문 ${TOTAL_STEPS}개에 답하면 딱 맞는 맥주를 추천해드려요.`),
  ).toBeVisible();
  await expect(page.getByText(`질문 0 / ${TOTAL_STEPS} · 30초면 충분해요`)).toBeVisible();

  await page.getByRole("button", { name: "시작하기" }).click();

  /* ---------- 퀴즈 5문항 ---------- */
  // 스타일 질문은 두 화면(종류 → 맛)이라 제목이 연달아 같다
  const expectedTitles = [
    "오늘은 누구와 함께 하시나요?",
    "오늘 방문한 이유가 궁금해요",
    "저희 매장은 어떻게 알고 오셨나요?",
    "어떤 스타일의 맥주가 끌리시나요?",
    "어떤 스타일의 맥주가 끌리시나요?",
  ];

  for (const [index, title] of expectedTitles.entries()) {
    const step = index + 1;
    await expect(page.locator("h2")).toHaveText(title);
    await expect(page.getByText(`STEP ${step}/${TOTAL_STEPS}`)).toBeVisible();
    // 스텝퍼 동그라미는 질문 개수만큼
    await expect(page.locator(".step-circle")).toHaveCount(TOTAL_STEPS);

    if (step < expectedTitles.length) {
      // 스타일 첫 화면(STEP 4)에서도 마지막 화면과 같은 "스타우트 · 포터"(index 4)를 고른다
      await chooseOption(page, step === 4 ? 4 : 0, step + 1);
    } else {
      // 마지막 질문: 결과로 넘어간다. "고소 · 진한 흑맥주"(index 4) 선택
      await page.locator("button.opt-card").nth(4).click();
    }
  }

  /* ---------- 결과 ---------- */
  const card = page.locator(".result-card");
  await expect(card).toBeVisible({ timeout: 5_000 });

  await expect(page.getByText("당신을 위한 완벽한 한 잔")).toBeVisible();
  // 고른 스타일(dark-malty)의 맥주가 나와야 한다
  await expect(card.getByRole("heading")).toHaveText("카카오 스타우트");
  await expect(card.getByText("매칭 96%")).toBeVisible();
  await expect(card.getByText("도수", { exact: true })).toBeVisible();
  await expect(card.getByText("쓴맛(IBU)")).toBeVisible();
  for (const section of ["맛", "이럴 때 딱", "안주 추천"]) {
    await expect(card.getByText(section, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "처음부터 다시하기" })).toBeVisible();

  /* ---------- 별점 시트: 1400ms 뒤 자동으로 열린다 ---------- */
  // 닫히면 aria-hidden 이 붙어 접근성 트리에서 빠지므로 클래스는 CSS 로 확인한다
  const overlay = page.locator(".rating-overlay");
  await expect(overlay).toHaveClass(/open/, { timeout: 5_000 });

  const sheet = page.getByRole("dialog", { name: "추천 만족도" });
  await expect(sheet.getByText("피드백을 남겨주세요")).toBeVisible();
  await expect(sheet.getByRole("heading")).toHaveText("이 맥주 추천이얼마나 마음에 드시나요?");
  await expect(sheet.getByRole("button", { name: /^별 \d개$/ })).toHaveCount(5);

  await sheet.getByRole("button", { name: "닫기" }).click();
  await expect(overlay).not.toHaveClass(/open/);

  /* ---------- 다이스 리롤 ---------- */
  const beerName = await card.getByRole("heading").textContent();
  await page.getByRole("button", { name: "다른 추천 보기" }).click();

  // 다른 맥주로 갈아끼워진다
  await expect(card.getByRole("heading")).not.toHaveText(beerName ?? "", {
    timeout: 5_000,
  });
  // 카드 자체는 그대로 있고 매칭 배지도 새 맥주 값으로 다시 그려진다
  await expect(card.getByText(/^매칭 \d+%$/)).toBeVisible();
});
