"use client";

import Image from "next/image";
import { useState } from "react";

export interface BeerPhotoProps {
  src: string;
  alt: string;
  /** 사진을 못 불러왔을 때 대신 보여줄 이모지 */
  fallbackEmoji: string;
}

/**
 * 결과 카드의 맥주 사진.
 *
 * 프로토타입은 `<img class="absolute inset-0 w-full h-full object-cover">` 였고,
 * `fill` 을 준 `next/image` 가 같은 배치를 만든다.
 *
 * 로드 실패 시 회색 배경 + 맥주 이모지로 갈아끼운다 — 프로토타입엔 없던
 * 안전장치이며, 정상 로드되는 동안에는 화면 차이가 없다.
 */
export function BeerPhoto({ src, alt, fallbackEmoji }: BeerPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="bg-surface absolute inset-0 flex items-center justify-center text-5xl"
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      // 셸 최대 너비(390px)에서 좌우 여백(24px×2)과 카드 패딩(24px×2)을 뺀 값
      sizes="(max-width: 390px) 100vw, 294px"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
