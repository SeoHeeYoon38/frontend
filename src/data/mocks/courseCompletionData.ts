import airportIcon from "../../assets/course-completion/category-airport.svg";
import cafeIcon from "../../assets/course-completion/category-cafe.svg";
import foodIcon from "../../assets/course-completion/category-food.svg";
import hotelIcon from "../../assets/course-completion/category-hotel.svg";
import placeAirport from "../../assets/course-completion/place-airport.png";
import placeCoffee from "../../assets/course-completion/place-coffee.png";
import placeDotonbori from "../../assets/course-completion/place-dotonbori.png";
import placeHotel from "../../assets/course-completion/place-hotel.png";
import placeMarket from "../../assets/course-completion/place-market.png";
import replacementBrooklyn from "../../assets/course-completion/replacement-brooklyn.png";
import replacementHarbs from "../../assets/course-completion/replacement-harbs.png";
import replacementLilo from "../../assets/course-completion/replacement-lilo.png";
import replacementMarufuku from "../../assets/course-completion/replacement-marufuku.png";
import suggestionHarbs from "../../assets/course-completion/suggestion-harbs.png";
import suggestionHozenji from "../../assets/course-completion/suggestion-hozenji.png";
import suggestionIchiran from "../../assets/course-completion/suggestion-ichiran.png";
import suggestionOsakaCastle from "../../assets/course-completion/suggestion-osaka-castle.png";
import suggestionShinsaibashi from "../../assets/course-completion/suggestion-shinsaibashi.png";
import type {
  CourseCandidate,
  CourseDay,
  CourseMapPin,
  CoursePlace,
} from "../../types/courseCompletion";

export const courseDays: CourseDay[] = [
  { label: "1일차", date: "5.18" },
  { label: "2일차", date: "5.19" },
  { label: "3일차", date: "5.20" },
  { label: "4일차", date: "5.21" },
];

export const courseMapPins: CourseMapPin[] = [
  { number: 1, left: "25.69%", top: "8.33%" },
  { number: 2, left: "45.58%", top: "19.32%" },
  { number: 3, left: "30.66%", top: "41.67%" },
  { number: 4, left: "28.73%", top: "66.67%" },
  { number: 5, left: "47.51%", top: "68.56%" },
  { number: 6, left: "42.27%", top: "78.03%" },
];

export const initialCoursePlaces: CoursePlace[] = [
  {
    id: 1,
    name: "간사이 공항 도착",
    category: "항공",
    detail: "KE723, 대한항공",
    image: placeAirport,
    icon: airportIcon,
    travel: "도보 18분",
    distance: "1.2km",
    travelTone: "walk",
    description: "공항 도착 후 난바로 이동해요",
    fixed: true,
  },
  {
    id: 2,
    name: "APA 호텔 난바",
    category: "숙소",
    detail: "체크인 15:00",
    image: placeHotel,
    icon: hotelIcon,
    travel: "도보 5분",
    distance: "300m",
    travelTone: "walk",
    description: "숙소에 짐을 맡기고 잠시 쉬어가요",
    fixed: true,
  },
  {
    id: 3,
    name: "구로몬 시장",
    category: "맛집",
    detail: "영업 중 09:00~18:00",
    image: placeMarket,
    icon: foodIcon,
    travel: "대중교통 8분",
    distance: "1.6km",
    travelTone: "transit",
    description: "해산물 꼬치와 과일 길거리 음식",
  },
  {
    id: 4,
    name: "리로 커피 로스터스",
    category: "카페",
    detail: "영업 중 09:00~18:00",
    image: placeCoffee,
    icon: cafeIcon,
    travel: "도보 6분",
    distance: "400m",
    travelTone: "walk",
    description: "취향에 맞게 고르는 스페셜티 커피",
  },
  {
    id: 5,
    name: "도톤보리 저녁 식사",
    category: "맛집",
    detail: "영업 중 09:00~18:00",
    image: placeDotonbori,
    icon: foodIcon,
    description: "강변에서 즐기는 오코노미야키",
  },
];

export const aiAdjustedCoursePlaces: CoursePlace[] = [
  initialCoursePlaces[0],
  initialCoursePlaces[1],
  { ...initialCoursePlaces[2], changeLabel: "30분 더 머물러요" },
  {
    id: 6,
    name: "숙소에서 쉬는 시간",
    category: "휴식",
    detail: "40분",
    image: placeHotel,
    icon: hotelIcon,
    description: "APA 호텔 난바에서 잠시 쉬어가요",
    changeLabel: "새로 추가",
  },
  { ...initialCoursePlaces[4], changeLabel: "30분 늦게 시작" },
];

export const suggestedPlaces: CourseCandidate[] = [
  {
    id: 101,
    name: "오사카성",
    category: "관광",
    distance: "구로몬 시장에서 1.2km",
    image: suggestionOsakaCastle,
  },
  {
    id: 102,
    name: "이치란 라멘 도톤보리",
    category: "맛집",
    distance: "도톤보리에서 200m",
    image: suggestionIchiran,
  },
  {
    id: 103,
    name: "HARBS 난바",
    category: "카페",
    distance: "APA 호텔 난바에서 350m",
    image: suggestionHarbs,
  },
  {
    id: 104,
    name: "신사이바시 쇼핑거리",
    category: "쇼핑",
    distance: "도톤보리에서 400m",
    image: suggestionShinsaibashi,
  },
  {
    id: 105,
    name: "호젠지 요코초",
    category: "관광",
    distance: "도톤보리에서 300m",
    image: suggestionHozenji,
  },
];

export const replacementPlaces: CourseCandidate[] = [
  {
    id: 201,
    name: "HARBS 난바",
    category: "카페",
    distance: "숙소에서 350m",
    image: replacementHarbs,
  },
  {
    id: 202,
    name: "마루후쿠 커피 센니치마에",
    category: "카페",
    distance: "도톤보리에서 250m",
    image: replacementMarufuku,
  },
  {
    id: 203,
    name: "릴로 커피 킷사",
    category: "카페",
    distance: "신사이바시에서 300m",
    image: replacementLilo,
  },
  {
    id: 204,
    name: "브루클린 로스팅 난바",
    category: "카페",
    distance: "난바역에서 400m",
    image: replacementBrooklyn,
  },
];
