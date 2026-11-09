import placeDotonbori from "../../assets/images/place-dotonbori-cruise.webp";
import placeHarbs from "../../assets/images/place-harbs-namba.webp";
import placeIchiran from "../../assets/images/place-ichiran-dotonbori.webp";
import placeKuromon from "../../assets/images/place-kuromon-market.webp";
import placeOsakaCastle from "../../assets/images/place-osaka-castle.webp";
import placeShinsaibashi from "../../assets/images/place-shinsaibashi-shopping.webp";
import type { DirectTripDay, DirectTripPlace } from "../../types/directTrip";

export const directTripDays: DirectTripDay[] = [
  { day: 1, date: "5.18", weekday: "월" },
  { day: 2, date: "5.19", weekday: "화" },
  { day: 3, date: "5.20", weekday: "수" },
  { day: 4, date: "5.21", weekday: "목" },
];

export const directTripPlaces: DirectTripPlace[] = [
  {
    id: "kuromon",
    name: "구로몬 시장",
    category: "시장 · 맛집",
    detail: "오사카 주오구 · 영업 중",
    image: placeKuromon,
    source: "google",
    travelTime: "도보 12분",
  },
  {
    id: "dotonbori",
    name: "도톤보리",
    category: "관광 명소",
    detail: "글리코상과 도톤보리 강 산책",
    image: placeDotonbori,
    source: "recommend",
    travelTime: "도보 7분",
  },
  {
    id: "ichiran",
    name: "이치란 라멘 도톤보리점",
    category: "라멘 · 맛집",
    detail: "오사카에서 꼭 먹어야 할 라멘",
    image: placeIchiran,
    source: "recommend",
    travelTime: "도보 6분",
  },
  {
    id: "shinsaibashi",
    name: "신사이바시 상점가",
    category: "쇼핑",
    detail: "약 600m 길이의 대형 쇼핑 아케이드",
    image: placeShinsaibashi,
    source: "google",
    travelTime: "도보 9분",
  },
  {
    id: "osaka-castle",
    name: "오사카성",
    category: "역사 · 관광",
    detail: "오사카를 대표하는 랜드마크",
    image: placeOsakaCastle,
    source: "recommend",
    travelTime: "지하철 24분",
  },
  {
    id: "harbs",
    name: "HARBS 난바 파크스점",
    category: "카페 · 디저트",
    detail: "겹겹이 쌓인 밀크레이프가 유명해요",
    image: placeHarbs,
    source: "google",
    travelTime: "도보 11분",
  },
];

export const directTripRecentSearches = ["구로몬", "오사카성", "도톤보리"];

