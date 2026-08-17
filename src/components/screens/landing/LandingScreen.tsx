"use client";

import { APP_TITLE } from "@/config";
import { PrimaryButton, Screen, SecondaryButton } from "@/components/ui";

export interface LandingScreenProps {
  /** 질문 개수. `QUESTIONS.length` 에서 오고, 안내 문구 두 곳에 들어간다 */
  totalQuestions: number;
  onStart: () => void;
  /** "아무거나 추천받기" — 질문 없이 바로 결과로 */
  onQuickPick: () => void;
}

/**
 * 첫 화면. 문구는 프로토타입 원문 그대로이고,
 * 질문 개수만 `totalQuestions` 로 조립한다.
 */
export function LandingScreen({
  totalQuestions,
  onStart,
  onQuickPick,
}: LandingScreenProps) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-between px-6 pt-10 pb-8">
        <div />

        <div className="flex flex-col items-center text-center">
          <div className="landing-emoji mb-6 text-7xl">🍺</div>
          <h1 className="display text-ink mb-4 text-[28px] leading-[1.25] font-medium">
            {APP_TITLE}
          </h1>
          <p className="text-ink max-w-[280px] text-[15px] leading-relaxed">
            간단한 질문 {totalQuestions}개에 답하면 딱 맞는 맥주를
            추천해드려요.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <PrimaryButton onClick={onStart}>시작하기</PrimaryButton>
          <SecondaryButton
            onClick={onQuickPick}
            className="flex items-center justify-center gap-2"
          >
            🎲 아무거나 추천받기
          </SecondaryButton>
          <span className="text-ink text-[12px] font-medium tracking-wide">
            질문 0 / {totalQuestions} · 30초면 충분해요
          </span>
        </div>
      </div>
    </Screen>
  );
}
