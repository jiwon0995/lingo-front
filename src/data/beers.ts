import type { Beer } from "@/types";

/**
 * 맥주 데이터.
 *
 * 프로토타입(`docs/prototype.html`)의 `BEER_DB` 7종을 그대로 옮긴 것이다.
 * 원본은 스타일 key를 가진 객체였지만, 한 스타일에 여러 종을 넣을 수 있도록
 * 배열로 바꾸고 원래 key를 `id` · `styleId` 에 담았다.
 *
 * 맥주를 추가할 때는 이 배열에 항목 하나만 넣으면 된다 —
 * 자세한 규칙은 `docs/beer-schema.md` 참고.
 *
 * `profile` · `moodTags` · `foodTags` 는 프로토타입에 없던 추천 전용 필드로
 * 각 맥주의 `taste` 와 `tags` 를 근거로 새로 매겼다. 화면에는 보이지 않는다.
 */
export const BEERS: Beer[] = [
  {
    id: "clean-lager",
    styleId: "clean-lager",
    name: "골든 라거",
    emoji: "🧊",
    tags: ["청량함", "가벼움", "부드러운 목넘김"],
    taste: "청량하고 깔끔한 목넘김에 은은한 몰트 향이 감도는 산뜻한 라거.",
    tagline: "시원하게 들이켜는 첫 잔에 가장 잘 어울려요.",
    perfectFor: "첫 잔이 필요한 순간, 부담 없이 즐기고 싶을 때.",
    pairing: ["감자튀김", "치킨윙", "그릴드 소시지"],
    abv: "4.8%",
    ibu: 14,
    match: 95,
    color: "#F0C34A",
    colorLight: "#F8DE8E",
    foam: "#FFFBEE",
    garnish: "🧊",
    photo:
      "https://images.pexels.com/photos/5538223/pexels-photo-5538223.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 2,
      bitterness: 1,
      aroma: 2,
      body: 1,
      refreshing: 5,
    },
    moodTags: ["chill", "meal", "gathering"],
    foodTags: ["fried"],
  },
  {
    id: "hop-forward",
    styleId: "hop-forward",
    name: "트로피컬 IPA",
    emoji: "🍊",
    tags: ["쌉쌀함", "시트러스", "화려한 향"],
    taste: "자몽과 열대과일 향이 화려하게 퍼지는 홉 풍미 가득한 IPA.",
    tagline: "기분 좋은 쌉쌀함과 상큼한 과일향의 조화.",
    perfectFor: "향이 풍부한 한 잔, 화려한 맛을 원할 때.",
    pairing: ["프라이드 치킨", "타코", "블루치즈"],
    abv: "6.5%",
    ibu: 55,
    match: 93,
    color: "#E08A2E",
    colorLight: "#F4B85E",
    foam: "#FFEFC9",
    garnish: "🍊",
    photo:
      "https://images.pexels.com/photos/13027856/pexels-photo-13027856.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 2,
      bitterness: 4,
      aroma: 5,
      body: 3,
      refreshing: 3,
    },
    moodTags: ["celebration", "gathering"],
    foodTags: ["fried", "spicy", "light"],
  },
  {
    id: "wheat-yeast",
    styleId: "wheat-yeast",
    name: "바나나 클로브 바이젠",
    emoji: "🍌",
    tags: ["향긋함", "부드러움", "달콤함"],
    taste: "바나나와 정향의 은은한 향이 감도는 부드럽고 향긋한 밀맥주.",
    tagline: "부드러운 목넘김과 풍성한 과일·향신료 향.",
    perfectFor: "향긋하고 부드러운 맥주를 찾을 때.",
    pairing: ["소시지 플래터", "훈제 연어", "프레첼"],
    abv: "5.3%",
    ibu: 13,
    match: 92,
    color: "#E9C97A",
    colorLight: "#F5E3AE",
    foam: "#FFF9E8",
    garnish: "🍌",
    photo:
      "https://images.pexels.com/photos/5538222/pexels-photo-5538222.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 3,
      bitterness: 1,
      aroma: 4,
      body: 3,
      refreshing: 3,
    },
    moodTags: ["chill", "meal"],
    foodTags: ["fried", "seafood", "light"],
  },
  {
    id: "sour-funky",
    styleId: "sour-funky",
    name: "레몬 고제",
    emoji: "🍋",
    tags: ["새콤달콤", "상큼함", "리프레시"],
    taste: "레몬과 베리의 상큼한 산미가 침샘을 자극하는 새콤달콤한 사워.",
    tagline: "와인처럼 상큼하게, 리프레시가 필요할 때 딱이에요.",
    perfectFor: "가볍고 상큼한 리프레시가 필요할 때.",
    pairing: ["세비체", "염소치즈", "산뜻한 샐러드"],
    abv: "4.2%",
    ibu: 8,
    match: 91,
    color: "#E8577A",
    colorLight: "#F191A9",
    foam: "#FDE3EA",
    garnish: "🍋",
    photo:
      "https://images.pexels.com/photos/5538225/pexels-photo-5538225.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 3,
      bitterness: 1,
      aroma: 3,
      body: 1,
      refreshing: 5,
    },
    moodTags: ["chill", "celebration"],
    foodTags: ["seafood", "light"],
  },
  {
    id: "dark-malty",
    styleId: "dark-malty",
    name: "카카오 스타우트",
    emoji: "☕",
    tags: ["고소함", "진한 풍미", "다크"],
    taste: "커피와 다크초콜릿 향이 진하게 어우러진 묵직하고 고소한 흑맥주.",
    tagline: "커피·초콜릿 향 가득한 진하고 고소한 한 잔.",
    perfectFor: "진하고 묵직한 풍미를 원할 때.",
    pairing: ["초콜릿 케이크", "바비큐 립", "바닐라 아이스크림"],
    abv: "6.2%",
    ibu: 32,
    match: 96,
    color: "#2B160C",
    colorLight: "#4A2A17",
    foam: "#E4D2B8",
    garnish: "☕",
    photo:
      "https://images.pexels.com/photos/5659493/pexels-photo-5659493.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 3,
      bitterness: 3,
      aroma: 4,
      body: 5,
      refreshing: 1,
    },
    moodTags: ["chill", "meal"],
    foodTags: ["dessert", "fried"],
  },
  {
    id: "barrel-strong",
    styleId: "barrel-strong",
    name: "오크 배럴 스트롱 에일",
    emoji: "🥃",
    tags: ["고도수", "깊은 여운", "위스키향"],
    taste:
      "위스키 오크통에서 숙성된 깊고 진한 풍미, 은은한 바닐라와 카라멜 향.",
    tagline: "천천히 음미하는 위스키·오크향의 고도수 한 잔.",
    perfectFor: "깊고 진한 맛을 천천히 음미하고 싶을 때.",
    pairing: ["다크초콜릿", "블루치즈", "견과류"],
    abv: "9.5%",
    ibu: 25,
    match: 90,
    color: "#4A2410",
    colorLight: "#6E3A1C",
    foam: "#D8B98A",
    garnish: "🥃",
    photo:
      "https://images.pexels.com/photos/5659756/pexels-photo-5659756.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 3,
      bitterness: 2,
      aroma: 5,
      body: 5,
      refreshing: 0,
    },
    moodTags: ["chill", "celebration"],
    foodTags: ["dessert", "light"],
  },
  {
    id: "dessert-specialty",
    styleId: "dessert-specialty",
    name: "디저트 페이스트리 스타우트",
    emoji: "🍰",
    tags: ["달콤함", "이색 부재료", "스페셜티"],
    taste: "마시멜로우와 캐러멜, 바닐라가 어우러진 디저트 같은 달콤한 스타우트.",
    tagline: "인스타그래머블한 달콤함, 도전해볼 만한 특별한 한 잔.",
    perfectFor: "특별하고 재미있는 맛을 원할 때.",
    pairing: ["티라미수", "마시멜로우 스모어", "캐러멜 팝콘"],
    abv: "7.0%",
    ibu: 20,
    match: 94,
    color: "#3B2013",
    colorLight: "#5C3820",
    foam: "#F2D9B8",
    garnish: "🍰",
    photo:
      "https://images.pexels.com/photos/5538224/pexels-photo-5538224.jpeg?auto=compress&cs=tinysrgb&w=800",
    profile: {
      sweetness: 5,
      bitterness: 2,
      aroma: 4,
      body: 4,
      refreshing: 0,
    },
    moodTags: ["celebration", "gathering"],
    foodTags: ["dessert"],
  },
];

/** id로 맥주 하나를 찾는다. 없으면 undefined */
export function getBeerById(id: string): Beer | undefined {
  return BEERS.find((beer) => beer.id === id);
}

/**
 * 스타일에 속한 맥주를 전부 반환한다.
 * 지금은 스타일당 1종이지만, 늘어나면 자동으로 여러 개가 나온다.
 */
export function getBeersByStyle(styleId: string): Beer[] {
  return BEERS.filter((beer) => beer.styleId === styleId);
}

/**
 * 스타일의 대표 맥주 한 종. 여러 종이면 `match` 가 가장 높은 것을 고른다.
 * 프로토타입의 `BEER_DB[styleId]` 자리를 대신한다.
 */
export function getBeerByStyle(styleId: string): Beer | undefined {
  return getBeersByStyle(styleId).reduce<Beer | undefined>(
    (best, beer) => (best && best.match >= beer.match ? best : beer),
    undefined,
  );
}

/** 데이터에 존재하는 스타일 id 목록 (등장 순서 유지) */
export function getStyleIds(): string[] {
  return [...new Set(BEERS.map((beer) => beer.styleId))];
}
