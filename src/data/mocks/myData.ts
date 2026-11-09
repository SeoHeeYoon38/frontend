import avatar from "../../assets/images/character-blue.webp";
import bangkok from "../../assets/images/city-bangkok.webp";
import fukuoka from "../../assets/images/city-fukuoka.webp";
import kyoto from "../../assets/images/city-kyoto.webp";
import osaka from "../../assets/images/city-osaka.webp";
import tokyo from "../../assets/images/city-tokyo.webp";
import europe from "../../assets/images/theme-europe.webp";
import kuromonMarket from "../../assets/images/place-kuromon-market.webp";
import osakaCastle from "../../assets/images/place-osaka-castle.webp";
import type { MyProfile, SavedCourse, SavedPlace, SavedRegion } from "../../types/my";

export const myProfile: MyProfile = {
  name: "예빈",
  username: "yebin5929",
  avatar,
  savedPlaceCount: 56,
  savedCourseCount: 6,
  visitedTripCount: 2,
  googlePlaceCount: 52,
};

export const savedRegions: SavedRegion[] = ["전체", "도쿄", "오사카", "교토"];

export const savedPlaces: SavedPlace[] = [
  {
    id: "blue-bottle-kiyosumi",
    name: "블루보틀 기요스미",
    city: "도쿄",
    category: "카페",
    source: "Google Maps에서 가져옴",
    image: tokyo,
  },
  {
    id: "teamlab-planets",
    name: "팀랩 플래닛",
    city: "도쿄",
    category: "전시",
    source: "직접 저장",
    image: tokyo,
  },
  {
    id: "osaka-castle",
    name: "오사카성",
    city: "오사카",
    category: "관광",
    source: "Google Maps에서 가져옴",
    image: osakaCastle,
  },
  {
    id: "dotonbori",
    name: "도톤보리",
    city: "오사카",
    category: "관광",
    source: "인기 코스에서 저장",
    image: osaka,
  },
  {
    id: "sannenzaka",
    name: "산넨자카 골목",
    city: "교토",
    category: "명소",
    source: "직접 저장",
    image: kyoto,
  },
  {
    id: "tokyo-tower",
    name: "도쿄 타워",
    city: "도쿄",
    category: "전망",
    source: "Google Maps에서 가져옴",
    image: tokyo,
  },
  {
    id: "fushimi-inari",
    name: "후시미 이나리",
    city: "교토",
    category: "명소",
    source: "Google Maps에서 가져옴",
    image: kyoto,
  },
  {
    id: "kuromon-market",
    name: "구로몬 시장",
    city: "오사카",
    category: "맛집",
    source: "Google Maps에서 가져옴",
    image: kuromonMarket,
  },
];

export const savedCourses: SavedCourse[] = [
  {
    id: "kyoto-alley-walk",
    title: "교토 골목 산책",
    durationLabel: "3박 4일",
    city: "교토",
    placeCount: 4,
    image: kyoto,
  },
  {
    id: "tokyo-night",
    title: "아름다운 도쿄의 밤",
    durationLabel: "단일 코스",
    city: "도쿄",
    placeCount: 9,
    image: tokyo,
  },
  {
    id: "osaka-food-night",
    title: "오사카 미식과 야경",
    durationLabel: "단일 코스",
    city: "오사카",
    placeCount: 6,
    image: osaka,
  },
  {
    id: "fukuoka-food-tour",
    title: "후쿠오카 먹방 원정대",
    durationLabel: "단일 코스",
    city: "후쿠오카",
    placeCount: 8,
    image: fukuoka,
  },
  {
    id: "europe-emotion",
    title: "유럽 감성 여행",
    durationLabel: "5박 6일",
    city: "파리",
    placeCount: 12,
    image: europe,
  },
  {
    id: "bangkok-temple-market",
    title: "사원과 야시장 하루에",
    durationLabel: "단일 코스",
    city: "방콕",
    placeCount: 7,
    image: bangkok,
  },
];
