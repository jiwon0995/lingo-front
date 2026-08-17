"use client";

import { APP_TITLE } from "@/config";
import { PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { useQuiz } from "@/context";

/**
 * 첫 화면. 문구는 프로토타입 원문 그대로이고,
 * 질문 개수만 `totalSteps`(= `QUESTIONS.length`) 로 조립한다.
 */
export function LandingScreen() {
  const { totalSteps, start, quickPick } = useQuiz();

  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-between px-6 pt-10 pb-8">
        <div />

        <div className="flex flex-col items-center text-center">
          {/* 장식용 이모지 — 읽어줄 내용이 없어 접근성 트리에서 뺀다 */}
          <div aria-hidden="true" className="landing-emoji mb-6 text-7xl">
            🍺
          </div>
          <h1 className="display text-ink mb-4 text-[28px] leading-[1.25] font-medium">
            {APP_TITLE}
          </h1>
          <p className="text-ink max-w-[280px] text-[15px] leading-relaxed">
            간단한 질문 {totalSteps}개에 답하면 딱 맞는 맥주를 추천해드려요.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <PrimaryButton onClick={start}>시작하기</PrimaryButton>
          <SecondaryButton
            onClick={quickPick}
            className="flex items-center justify-center gap-2"
          >
            🎲 아무거나 추천받기
          </SecondaryButton>
          <span className="text-ink text-[12px] font-medium tracking-wide">
            질문 0 / {totalSteps} · 30초면 충분해요
          </span>
        </div>
      </div>
    </Screen>
  );
}
