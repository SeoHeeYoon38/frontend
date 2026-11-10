import bangkok from "../../assets/images/city-bangkok.webp";
import fukuoka from "../../assets/images/city-fukuoka.webp";
import kyoto from "../../assets/images/city-kyoto.webp";
import osaka from "../../assets/images/city-osaka.webp";
import tokyo from "../../assets/images/city-tokyo.webp";
import europe from "../../assets/images/theme-europe.webp";
import shanghai from "../../assets/images/city-shanghai.webp";
import type { MyTripSummary } from "../../types/myTrips";

export const upcomingTrips: MyTripSummary[] = [
  { id: "osaka", title: "오사카 3박 4일", city: "오사카", dateLabel: "2026.5.18 – 5.21", countdownLabel: "D-7", coverImage: osaka },
  { id: "kyoto", title: "교토 2박 3일", city: "교토", dateLabel: "날짜 미정", coverImage: kyoto },
  { id: "tokyo", title: "도쿄 여행", city: "도쿄", dateLabel: "2026.6.27 – 7.2", countdownLabel: "D-45", coverImage: tokyo },
  { id: "fukuoka", title: "후쿠오카 여행", city: "후쿠오카", dateLabel: "2026.7.29 – 7.31", countdownLabel: "D-77", coverImage: fukuoka },
];

export const pastTrips: MyTripSummary[] = [
  { id: "past-kyoto", title: "교토 2박 3일", city: "교토", dateLabel: "2026.2.13 – 2.15", coverImage: kyoto },
  { id: "past-tokyo", title: "도쿄 여행", city: "도쿄", dateLabel: "2025.12.24 – 12.27", coverImage: tokyo },
  { id: "past-osaka", title: "오사카 3박 4일", city: "오사카", dateLabel: "2025.10.3 – 10.6", coverImage: osaka },
  { id: "past-seoul", title: "서울 주말 여행", city: "서울", dateLabel: "2025.8.15 – 8.16", coverImage: shanghai },
  { id: "past-paris", title: "파리 5박 6일", city: "파리", dateLabel: "2025.5.1 – 5.6", coverImage: europe },
  { id: "past-bangkok", title: "방콕 여행", city: "방콕", dateLabel: "2025.2.7 – 2.10", coverImage: bangkok },
];

