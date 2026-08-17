"use client";

import { useState } from "react";
import { BackButton, OptionCard, Screen, Stepper } from "@/components/ui";
import type { Question } from "@/types";

export interface QuizScreenProps {
  question: Question;
  /** 현재 스텝 (1부터) */
  step: number;
  /** 총 스텝 수 = 질문 개수 */
  totalSteps: number;
  /** 이 질문에 이미 고른 선택지 id. 없으면 undefined */
  selectedOptionId?: string;
  onSelect: (questionKey: string, optionId: string) => void;
  onBack: () => void;
}

/**
 * 질문 한 개를 보여주는 화면.
 *
 * 제목 · 선택지는 전부 `question` 에서 읽는다. 스텝퍼와 "STEP n/N" 의 N 도
 * `totalSteps` 에서 오므로 질문이 늘어도 이 파일은 그대로다.
 */
export function QuizScreen({
  question,
  step,
  totalSteps,
  selectedOptionId,
  onSelect,
  onBack,
}: QuizScreenProps) {
  /** 방금 탭해서 popSelect 를 재생 중인 선택지 */
  const [poppingId, setPoppingId] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    setPoppingId(optionId);
    onSelect(question.key, optionId);
  };

  return (
    <Screen>
      <div className="flex items-center gap-[10px] px-5 pt-[14px] pb-3">
        <BackButton onClick={onBack} />
        <Stepper total={totalSteps} current={step} />
        <span className="text-ink shrink-0 text-[11px] font-medium tracking-[0.03em] whitespace-nowrap">
          STEP {step}/{totalSteps}
        </span>
      </div>

      <div className="fade-enter flex flex-1 flex-col overflow-y-auto px-6 pt-4 pb-10">
        <h2 className="display text-ink mb-7 text-[22px] leading-snug font-medium">
          {question.title}
        </h2>
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              index={index}
              selected={option.id === selectedOptionId}
              popping={option.id === poppingId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </Screen>
  );
}
