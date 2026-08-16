import { BRAND_NAME } from "@/config";

/**
 * 셋업 확인용 임시 화면. 랜딩 → 퀴즈 → 결과 플로우는 다음 단계에서 구현한다.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-shell flex-col items-center justify-center bg-white">
      <h1 className="text-ink text-2xl font-medium tracking-[0.06em]">
        <span className="bg-red mr-2 inline-block size-[7px] rounded-full align-middle" />
        {BRAND_NAME}
      </h1>
    </main>
  );
}
