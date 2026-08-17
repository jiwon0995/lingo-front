"use client";

/**
 * 왼쪽 화살표 뒤로가기 버튼. 퀴즈 · 결과 화면이 같은 마크업을 쓴다.
 * 프로토타입 `.back-btn` 과 SVG path 그대로다 (`aria-label` 만 더했다).
 */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="뒤로 가기"
      className="back-btn -ml-1 flex size-9 shrink-0 items-center justify-center rounded-full"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
