import { BRAND_NAME } from "@/config";

/**
 * 모든 화면 위에 고정되는 상단 헤더.
 *
 * 프로토타입(`docs/prototype.html`)의 `.app-header` · `.brand` · `.brand-dot`
 * 규칙을 그대로 옮겼다. 해당 클래스들은 레이아웃 값이라 `globals.css` 가 아니라
 * 여기서 유틸리티로 표현한다.
 */
export function AppHeader() {
  return (
    <header className="border-line relative z-[2] flex h-[52px] shrink-0 items-center border-b bg-white px-5">
      <div className="text-ink flex items-center gap-[7px] text-[13px] font-medium tracking-[0.06em]">
        <span className="bg-red size-[7px] shrink-0 rounded-full" />
        {BRAND_NAME}
      </div>
    </header>
  );
}
