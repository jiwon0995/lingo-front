"use client";

import { BackButton, Screen, SecondaryButton } from "@/components/ui";
import { useQuiz } from "@/context";
import { useReplayAnimation } from "@/hooks";
import { BeerPhoto } from "./BeerPhoto";

/** 별 5개가 매칭율 100%에 해당한다 (프로토타입 `buildStars`) */
const STAR_COUNT = 5;

/** 프로토타입 `.badge-glass` — 사진 위에 얹는 반투명 배지 */
const BADGE_GLASS =
  "border-line border bg-[rgba(255,255,255,0.92)] backdrop-blur-[6px]";

/** 프로토타입 `.stat-pill` · `.reason-box` — 회색 박스 */
const SURFACE_BOX = "border-line bg-surface border";

/** 섹션 제목("맛" · "이럴 때 딱" · "안주 추천") 공통 스타일 */
const SECTION_TITLE =
  "text-ink mb-1 text-[12px] font-semibold tracking-wide uppercase";

/** 섹션 본문 공통 스타일 */
const SECTION_BODY = "text-ink/85 text-[15px] leading-relaxed font-medium";

export function ResultScreen() {
  const { recommendation, swapCount, back, restart } = useQuiz();

  // "다른 추천"일 때는 등장 애니메이션(slideUp) 대신 가벼운 스왑으로 바꾼다
  const cardRef = useReplayAnimation<HTMLDivElement>("card-swap", swapCount);
  const imageRef = useReplayAnimation<HTMLDivElement>("card-swap", swapCount);

  if (!recommendation) return null;

  const { beer, matchPercent, reason } = recommendation;
  const filledStars = Math.round(matchPercent / (100 / STAR_COUNT));

  return (
    <Screen>
      <div className="px-5 pt-4 pb-2">
        <div className="mb-2 flex items-center">
          <BackButton onClick={back} />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-2 pb-10">
        <p className="text-ink mb-5 text-[13px] font-medium tracking-wide uppercase">
          당신을 위한 완벽한 한 잔
        </p>

        <div className="relative w-full">
          <div
            ref={cardRef}
            className="result-card border-line relative flex w-full flex-col items-center overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-[0_16px_40px_-24px_rgba(18,33,61,0.25)]"
          >
            <div
              ref={imageRef}
              className="border-line bg-surface relative mb-5 aspect-[3/4] w-full overflow-hidden rounded-xl border"
            >
              <BeerPhoto
                key={beer.photo}
                src={beer.photo}
                alt={beer.name}
                fallbackEmoji={beer.emoji}
              />
              <div
                className={`${BADGE_GLASS} absolute top-3 left-3 flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2.5`}
              >
                <span className="text-[11px] leading-none tracking-tight">
                  {Array.from({ length: STAR_COUNT }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index < filledStars ? "text-red" : "text-[#D8DBE2]"
                      }
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="text-red-dark text-[11px] leading-none font-medium">
                  매칭 {matchPercent}%
                </span>
              </div>
              <div
                className={`${BADGE_GLASS} absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-lg`}
              >
                {beer.garnish}
              </div>
            </div>

            <h3 className="display text-ink mb-1.5 text-[23px] font-semibold">
              {beer.name}
            </h3>
            <p className="text-ink mb-4 text-[14px] leading-snug italic">
              {beer.tagline}
            </p>

            <div className="mb-5 flex w-full gap-2.5">
              <div
                className={`${SURFACE_BOX} flex flex-1 flex-col items-center rounded-xl py-2.5`}
              >
                <span className="text-ink text-[10px] font-medium tracking-wide uppercase">
                  도수
                </span>
                <span className="text-ink text-[15px] font-medium">
                  {beer.abv}
                </span>
              </div>
              <div
                className={`${SURFACE_BOX} flex flex-1 flex-col items-center rounded-xl py-2.5`}
              >
                <span className="text-ink text-[10px] font-medium tracking-wide uppercase">
                  쓴맛(IBU)
                </span>
                <span className="text-ink text-[15px] font-medium">
                  {beer.ibu}
                </span>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap justify-center gap-2">
              {beer.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-red-dark rounded-full bg-[rgba(255,202,88,0.5)] px-3 py-1 text-[12px] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className={`${SURFACE_BOX} mb-6 flex w-full items-start gap-2.5 rounded-xl px-4 py-3.5 text-left`}
            >
              <span className="mt-0.5 text-base leading-none">💡</span>
              <p className="text-ink/80 text-[13.5px] leading-relaxed font-medium">
                {reason}
              </p>
            </div>

            <div className="flex w-full flex-col gap-5 text-left">
              <div>
                <p className={SECTION_TITLE}>맛</p>
                <p className={SECTION_BODY}>{beer.taste}</p>
              </div>
              <div>
                <p className={SECTION_TITLE}>이럴 때 딱</p>
                <p className={SECTION_BODY}>{beer.perfectFor}</p>
              </div>
              <div>
                <p className={SECTION_TITLE}>안주 추천</p>
                <div className="mt-1 flex flex-col gap-1.5">
                  {beer.pairing.map((food) => (
                    <div
                      key={food}
                      className="text-ink/80 flex items-center gap-2 text-[15px] font-medium"
                    >
                      <span className="text-red">•</span>
                      <span>{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex w-full flex-col gap-3">
          <SecondaryButton size="md" onClick={restart}>
            처음부터 다시하기
          </SecondaryButton>
        </div>
      </div>
    </Screen>
  );
}
