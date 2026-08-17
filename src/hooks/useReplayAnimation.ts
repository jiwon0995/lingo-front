"use client";

import { useEffect, useRef } from "react";

/**
 * `trigger` 값이 바뀔 때마다 CSS 애니메이션 클래스를 뗐다 붙여 **다시 재생**한다.
 *
 * 같은 클래스를 다시 넣는 것만으로는 애니메이션이 재시작되지 않아서,
 * 프로토타입도 `classList.remove` → `void el.offsetWidth`(리플로우) → `classList.add`
 * 순으로 했다. 그 세 줄을 그대로 옮긴 것이다.
 *
 * 클래스를 React 의 `className` 이 아니라 DOM 으로 직접 붙이는 이유는,
 * "지금 몇 번째 재생인지" 를 렌더 결과에 담지 않기 위해서다. 대신 호출부는
 * 이 클래스를 `className` 에 같이 넣지 말아야 한다 — React 가 덮어쓴다.
 *
 * @param className 재생할 애니메이션 클래스 (예: `"card-swap"`)
 * @param trigger 재생 횟수. `0` 이면 아직 한 번도 재생하지 않은 것으로 보고 건너뛴다
 */
export function useReplayAnimation<T extends HTMLElement>(
  className: string,
  trigger: number,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const element = ref.current;
    if (!element) return;

    element.classList.remove(className);
    void element.offsetWidth; // 리플로우를 강제해 애니메이션을 처음부터 재생시킨다
    element.classList.add(className);
  }, [className, trigger]);

  return ref;
}
