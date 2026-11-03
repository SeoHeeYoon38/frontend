import type {
  CourseDestination,
  CourseTheme,
  TravelCourse,
} from "../../types/course";
import osaka from "../../assets/images/city-osaka.webp";
import tokyo from "../../assets/images/city-tokyo.webp";
import kyoto from "../../assets/images/city-kyoto.webp";
import fukuoka from "../../assets/images/city-fukuoka.webp";
import bangkok from "../../assets/images/city-bangkok.webp";
import danang from "../../assets/images/city-danang.webp";
import castle from "../../assets/images/cover-osaka-castle.webp";
import soyeon from "../../assets/images/profile-author-soyeon.png";
import usagi from "../../assets/images/profile-author-usagi.png";
import collector from "../../assets/images/profile-author-collector.png";

export const mockDestinations: CourseDestination[] = [
  { name: "오사카", country: "일본", image: osaka },
  { name: "도쿄", country: "일본", image: tokyo },
  { name: "교토", country: "일본", image: kyoto },
  { name: "후쿠오카", country: "일본", image: fukuoka },
  { name: "방콕", country: "태국", image: bangkok },
  { name: "다낭", country: "베트남", image: danang },
];
export const mockRecentDestinations: CourseDestination[] = [
  mockDestinations[2],
  mockDestinations[5],
  { name: "타이베이", country: "대만" },
];
export const mockPopularCourses: TravelCourse[] = [
  {
    id: "kyoto-walk",
    title: "골목을 걷다 만나는\n교토의 느린 하루",
    city: "교토",
    country: "일본",
    duration: "2박 3일",
    author: "산책하는 유진의 여행",
    image: kyoto,
    interests: ["도시 산책"],
  },
  {
    id: "osaka-food",
    title: "먹고 걷고,\n오사카 미식 산책",
    city: "오사카",
    country: "일본",
    duration: "3박 4일",
    author: "민지의 여행",
    image: osaka,
    interests: ["미식", "도시 산책"],
  },
  {
    id: "tokyo-cafes",
    title: "카페와 편집숍 사이,\n나만의 도쿄",
    city: "도쿄",
    country: "일본",
    duration: "2박 3일",
    author: "지우의 여행",
    image: tokyo,
    interests: ["도시 산책", "미식"],
  },
];
export const mockCourseThemes: CourseTheme[] = [
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
export const mockTravelerCourses: TravelCourse[] = [
  {
    id: "osaka-soyeon",
    title: "처음 만나는 오사카,\n꼭 가고 싶은 곳만 알차게",
    city: "오사카",
    country: "일본",
    duration: "3박 4일",
    author: "여행하는 소연",
    image: osaka,
    avatar: soyeon,
    description: "관광과 미식",
    interests: ["미식"],
  },
  {
    id: "tokyo-usagi",
    title: "카페와 편집숍 사이,\n나만의 도쿄 산책",
    city: "도쿄",
    country: "일본",
    duration: "2박 3일",
    author: "우사기",
    image: tokyo,
    avatar: usagi,
    description: "혼자 떠난 여행",
    interests: ["도시 산책", "미식"],
  },
  {
    id: "kyoto-collector",
    title: "골목과 정원 사이,\n천천히 머무는 교토",
    city: "교토",
    country: "일본",
    duration: "3박 4일",
    author: "여행수집가",
    image: kyoto,
    avatar: collector,
    description: "여유로운 여행",
    interests: ["도시 산책"],
  },
];
