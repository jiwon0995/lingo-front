"use client";

import { cn } from "@/lib";
import type { Option } from "@/types";

/** 선택지 하나가 등장할 때 앞 선택지 대비 밀리는 시간(ms) */
const STAGGER_MS = 40;

export interface OptionCardProps {
  option: Option;
  /** 목록에서의 순서. 등장 지연(40ms × index)을 계산한다 */
  index: number;
  selected: boolean;
  /** 방금 탭해서 popSelect 를 재생 중인지 */
  popping?: boolean;
  onSelect: (optionId: string) => void;
}

/**
 * 퀴즈 선택지 카드.
 *
 * 라벨 · 아이콘 · 서브타이틀은 전부 `option` 에서 온다 — 문구를 여기에 박지 않는다.
 * 모양은 프로토타입 `renderQuestion()` 이 만들던 마크업 그대로다.
 */
export function OptionCard({
  option,
  index,
  selected,
  popping = false,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      style={{ animationDelay: `${index * STAGGER_MS}ms` }}
      className={cn(
        "opt-card flex w-full items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 text-left",
        selected && "selected",
        popping && "pulse-pop",
      )}
    >
      <span className="icon-badge bg-surface flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl">
        {option.icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-ink text-[16px] leading-tight font-semibold">
          {option.label}
        </span>
        {option.subtitle && (
          <span className="text-ink mt-0.5 truncate text-[12px] font-medium">
            {option.subtitle}
          </span>
        )}
      </span>
      <span
        className={cn(
          "opt-check text-red ml-auto shrink-0 text-lg",
          !selected && "opacity-0",
        )}
      >
        ✓
      </span>
    </button>
  );
}
