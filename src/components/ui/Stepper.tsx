import { Fragment } from "react";
import { cn } from "@/lib";

/** 프로토타입 `.step-circle` 의 공통 모양 (transition 은 globals.css) */
const CIRCLE =
  "step-circle flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] font-medium";

/** 프로토타입 `.step-circle[data-state=...]` 의 상태별 색 */
const CIRCLE_STATE = {
  done: "border-red bg-red text-ink",
  current: "border-ink bg-ink text-white",
  upcoming: "border-line text-ink bg-white",
} as const;

export interface StepperProps {
  /** 총 스텝 수. 호출부가 `QUESTIONS.length` 를 넘긴다 — 여기에 개수를 박지 않는다 */
  total: number;
  /** 현재 스텝 (1부터). 0이면 아직 시작 전이라 모든 동그라미가 `upcoming` */
  current: number;
}

/**
 * 진행 상태 동그라미 + 연결선.
 *
 * 지나온 스텝은 체크(✓) + 노란 배경, 현재 스텝은 짙은 남색, 남은 스텝은 흰 배경이다.
 * 연결선은 지나온 구간만 노란색. 질문이 5개가 되어도 `total` 만 바뀌면 그대로 동작한다.
 */
export function Stepper({ total, current }: StepperProps) {
  const step = Math.max(0, Math.min(current, total));

  return (
    <div className="flex flex-1 items-center">
      {Array.from({ length: total }, (_, index) => index + 1).map((number) => {
        const state =
          number < step ? "done" : number === step ? "current" : "upcoming";

        return (
          <Fragment key={number}>
            <div className={cn(CIRCLE, CIRCLE_STATE[state])}>
              {state === "done" ? "✓" : number}
            </div>
            {number < total && (
              <div
                className={cn(
                  "step-line mx-1 h-[2px] flex-1",
                  number < step ? "bg-red" : "bg-line",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
