import airportIcon from "../../assets/course-completion/category-airport.svg";
import cafeIcon from "../../assets/course-completion/category-cafe.svg";
import foodIcon from "../../assets/course-completion/category-food.svg";
import hotelIcon from "../../assets/course-completion/category-hotel.svg";
import placeAirport from "../../assets/course-completion/place-airport.png";
import placeCoffee from "../../assets/course-completion/place-coffee.png";
import placeDotonbori from "../../assets/course-completion/place-dotonbori.png";
import placeHotel from "../../assets/course-completion/place-hotel.png";
import placeMarket from "../../assets/course-completion/place-market.png";
import type {
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
  },
  {
    id: 5,
    name: "도톤보리 저녁 식사",
    category: "맛집",
    detail: "영업 중 09:00~18:00",
    image: placeDotonbori,
    icon: foodIcon,
  },
];
