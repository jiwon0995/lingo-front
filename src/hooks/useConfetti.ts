"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/**
 * 조각 색. 프로토타입 `launchConfetti` 의 `colors` 배열 그대로다.
 * globals.css 변수를 쓰지 않는 이유는 인라인 style 로 넣어야 해서다.
 */
const COLORS = ["#FFCA58", "#12213D", "#C0141A", "#8B92A0"];

/** 기본 조각 수 — 프로토타입 `launchConfetti(26)` */
export const DEFAULT_CONFETTI_COUNT = 26;

/* 아래 값들은 전부 프로토타입 `launchConfetti` 원본 그대로다 */
const MIN_SIZE_PX = 6;
const SIZE_RANGE_PX = 6;
/** 원이 아닌 조각의 세로 비율 */
const TALL_RATIO = 1.6;
const MIN_DURATION_MS = 900;
const DURATION_RANGE_MS = 700;
const MAX_DELAY_MS = 200;
/** 낙하가 끝나고 DOM 에서 지우기까지의 여유 */
const CLEANUP_MARGIN_MS = 400;

/**
 * 컨페티를 뿌리는 훅.
 *
 * 조각은 `position: fixed` 라서 React 트리 밖(`document.body`)에 붙인다 —
 * 프로토타입과 같다. 대신 훅이 자기가 만든 조각과 타이머를 들고 있다가
 * 언마운트 때 모두 정리하므로, 화면을 떠나도 조각이 남지 않는다.
 *
 * @param originRef 조각이 떨어질 가로 범위. 없으면 뷰포트 전체를 쓴다.
 *   프로토타입은 `#app` 의 rect 를 썼으므로 모바일 셸 ref 를 넘기면 동일하다.
 */
export function useConfetti(originRef?: RefObject<HTMLElement | null>) {
  const piecesRef = useRef(new Set<HTMLElement>());
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  const clear = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    piecesRef.current.forEach((piece) => piece.remove());
    piecesRef.current.clear();
  }, []);

  useEffect(() => clear, [clear]);

  return useCallback(
    (count: number = DEFAULT_CONFETTI_COUNT) => {
      const origin = originRef?.current?.getBoundingClientRect();
      const left = origin?.left ?? 0;
      const width = origin?.width ?? window.innerWidth;

      for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";

        const size = MIN_SIZE_PX + Math.random() * SIZE_RANGE_PX;
        const isCircle = Math.random() > 0.5;
        const duration = MIN_DURATION_MS + Math.random() * DURATION_RANGE_MS;

        piece.style.width = `${size}px`;
        piece.style.height = `${isCircle ? size : size * TALL_RATIO}px`;
        piece.style.background =
          COLORS[Math.floor(Math.random() * COLORS.length)];
        if (isCircle) piece.style.borderRadius = "50%";
        piece.style.left = `${left + Math.random() * width}px`;
        piece.style.animationDuration = `${duration}ms`;
        piece.style.animationDelay = `${Math.random() * MAX_DELAY_MS}ms`;

        document.body.appendChild(piece);
        piecesRef.current.add(piece);

        const timer = setTimeout(() => {
          piece.remove();
          piecesRef.current.delete(piece);
          timersRef.current.delete(timer);
        }, duration + CLEANUP_MARGIN_MS);
        timersRef.current.add(timer);
      }
    },
    [originRef],
  );
}
