import { BeerFinderApp } from "@/components";

/**
 * 서버 컴포넌트로 두고 화면 전체는 클라이언트 컴포넌트인 `BeerFinderApp` 이 맡는다.
 */
export default function Home() {
  return <BeerFinderApp />;
}
