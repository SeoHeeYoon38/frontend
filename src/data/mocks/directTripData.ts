import placeDotonbori from "../../assets/images/place-dotonbori-cruise.webp";
import placeKuromon from "../../assets/images/place-kuromon-market.webp";
import figmaOsakaCastle from "../../assets/direct-trip/osaka-castle-figma.png";
import figmaIchiran from "../../assets/direct-trip/ichiran-figma.png";
import figmaHarbs from "../../assets/direct-trip/harbs-figma.png";
import figmaShinsaibashi from "../../assets/direct-trip/shinsaibashi-figma.png";
import figmaHozenji from "../../assets/direct-trip/hozenji-figma.png";
import type { DirectTripDay, DirectTripPlace } from "../../types/directTrip";

export const directTripDays: DirectTripDay[] = [
  { day: 1, date: "5.18", weekday: "월" },
  { day: 2, date: "5.19", weekday: "화" },
  { day: 3, date: "5.20", weekday: "수" },
  { day: 4, date: "5.21", weekday: "목" },
];

export const directTripPlaces: DirectTripPlace[] = [
  {
    id: "osaka-castle",
    name: "오사카성",
    category: "관광",
    detail: "구로몬 시장에서 1.2km",
    image: figmaOsakaCastle,
    source: "recommend",
  },
  {
    id: "ichiran",
    name: "이치란 라멘 도톤보리",
    category: "맛집",
    detail: "도톤보리에서 200m",
    image: figmaIchiran,
    source: "recommend",
  },
  {
    id: "harbs",
    name: "HARBS 난바",
    category: "카페",
    detail: "APA 호텔 난바에서 350m",
    image: figmaHarbs,
    source: "google",
  },
  {
    id: "shinsaibashi",
    name: "신사이바시 쇼핑거리",
    category: "쇼핑",
    detail: "도톤보리에서 400m",
    image: figmaShinsaibashi,
    source: "google",
  },
  {
    id: "hozenji",
    name: "호젠지 요코초",
    category: "관광",
    detail: "도톤보리에서 300m",
    image: figmaHozenji,
    source: "recommend",
  },
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
];

export const directTripRecentSearches = ["구로몬", "오사카성", "도톤보리"];

