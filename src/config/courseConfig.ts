import type { CourseInterest, CourseTheme } from "../types/course";
import kyoto from "../assets/images/city-kyoto.webp";
import castle from "../assets/images/cover-osaka-castle.webp";
import fukuoka from "../assets/images/city-fukuoka.webp";
export const courseInterests: CourseInterest[] = [
  "전체",
  "미식",
  "도시 산책",
  "휴양",
];

export const courseThemes: CourseTheme[] = [
  {
    id: "walk",
    title: "골목 따라 도시 산책",
    cities: ["교토", "도쿄", "가나자와"],
    image: kyoto,
    interest: "도시 산책",
  },
  {
    id: "sights",
    title: "명소부터 맛집까지",
    cities: ["오사카", "후쿠오카"],
    image: castle,
    interest: "미식",
  },
  {
    id: "sea",
    title: "바다 보며 쉬는 여행",
    cities: ["후쿠오카", "오키나와"],
    image: fukuoka,
    interest: "휴양",
  },
];
