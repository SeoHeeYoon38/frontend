import type { Flight, PlaceCourse, TripPlace } from "../../types/trip";
import { mockDestinations } from "./courseData";
import castle from "../../assets/images/place-osaka-castle.webp";
import ichiran from "../../assets/images/place-ichiran-dotonbori.webp";
import kuromon from "../../assets/images/place-kuromon-market.webp";
import harbs from "../../assets/images/place-harbs-namba.webp";
import shopping from "../../assets/images/place-shinsaibashi-shopping.webp";
import cruise from "../../assets/images/place-dotonbori-cruise.webp";

export const mockTripCities = mockDestinations.map((city, index) => ({
  ...city,
  image: city.image ?? "",
  latitude: [34.6937, 35.6762, 35.0116, 33.5904, 13.7563, 16.0544][index],
  longitude: [135.5023, 139.6503, 135.7681, 130.4017, 100.5018, 108.2022][
    index
  ],
}));
export const mockTripPlaces: TripPlace[] = [
  {
    id: "osaka-castle",
    title: "오사카성",
    city: "오사카",
    category: "명소",
    description: "천수각 전망대, 벚꽃 시즌 추천",
    image: castle,
    latitude: 34.6873,
    longitude: 135.5262,
  },
  {
    id: "ichiran",
    title: "이치란 라멘 도톤보리",
    city: "오사카",
    category: "맛집",
    description: "혼자 먹기 좋은 칸막이 좌석",
    image: ichiran,
    latitude: 34.6692,
    longitude: 135.5031,
  },
  {
    id: "kuromon",
    title: "구로몬 시장",
    city: "오사카",
    category: "맛집",
    description: "해산물 꼬치와 과일 길거리 음식",
    image: kuromon,
    latitude: 34.6654,
    longitude: 135.5063,
  },
  {
    id: "harbs",
    title: "HARBS 난바",
    city: "오사카",
    category: "카페",
    description: "과일 듬뿍 생크림 케이크",
    image: harbs,
    latitude: 34.6669,
    longitude: 135.5011,
  },
  {
    id: "shinsaibashi",
    title: "신사이바시 쇼핑거리",
    city: "오사카",
    category: "쇼핑",
    description: "드럭스토어와 브랜드 매장이 모인 거리",
    image: shopping,
    latitude: 34.6749,
    longitude: 135.5011,
  },
  {
    id: "cruise",
    title: "도톤보리 리버 크루즈",
    city: "오사카",
    category: "명소",
    description: "글리코 간판을 지나는 20분 유람선",
    image: cruise,
    latitude: 34.6687,
    longitude: 135.5013,
  },
];
const otherNames: Record<string, string[]> = {
  도쿄: ["센소지", "도쿄 타워", "시부야"],
  교토: ["기요미즈데라", "야사카 탑", "기온 거리"],
  후쿠오카: ["오호리 공원", "하카타역", "후쿠오카 타워"],
  방콕: ["왓 아룬", "왕궁", "짜뚜짝 시장"],
  다낭: ["미케 해변", "한 시장", "용다리"],
};
for (const city of mockTripCities) {
  for (const [index, title] of (otherNames[city.name] ?? []).entries())
    mockTripPlaces.push({
      id: `${city.name}-${index}`,
      title,
      city: city.name,
      category: index === 2 ? "쇼핑" : "명소",
      description: city.name,
      image: city.image,
      latitude: city.latitude,
      longitude: city.longitude,
    });
}
export function getPlaceCourses(city: string): PlaceCourse[] {
  const places = mockTripPlaces.filter((p) => p.city === city);
  if (city !== "오사카")
    return [
      {
        id: `${city}-popular`,
        title: `처음 가는 ${city} 필수 코스`,
        savedLabel: "",
        placeIds: places.map((p) => p.id),
      },
    ];
  return [
    {
      id: "osaka-first",
      title: "처음 가는 오사카 필수 코스",
      savedLabel: "1.2천명이 담았어요",
      placeIds: [
        "osaka-castle",
        "cruise",
        "kuromon",
        "shinsaibashi",
        "harbs",
        "ichiran",
      ],
    },
    {
      id: "osaka-food",
      title: "먹다가 끝나는 미식 코스",
      savedLabel: "8천명이 담았어요",
      placeIds: ["ichiran", "kuromon", "harbs", "cruise", "shinsaibashi"],
    },
    {
      id: "osaka-night",
      title: "밤이 예쁜 야경 코스",
      savedLabel: "6천명이 담았어요",
      placeIds: ["cruise", "shinsaibashi", "harbs", "ichiran"],
    },
  ];
}
export const mockHotels = [
  {
    id: "apa-namba",
    name: "APA 호텔 난바",
    city: "오사카",
    address: "오사카 난바",
  },
  { id: "kyoto-ryokan", name: "교토 료칸", city: "교토", address: "교토 기온" },
];
export const mockFlights: Omit<Flight, "date">[] = [
  {
    code: "KE723",
    airline: "대한항공",
    departure: "09:35",
    arrival: "11:20",
    from: "인천 ICN",
    to: "간사이 KIX",
  },
  {
    code: "7C1301",
    airline: "제주항공",
    departure: "08:20",
    arrival: "10:05",
    from: "인천 ICN",
    to: "간사이 KIX",
  },
  {
    code: "KE724",
    airline: "대한항공",
    departure: "18:20",
    arrival: "20:10",
    from: "간사이 KIX",
    to: "인천 ICN",
  },
];
export const mockTripScenario = {
  importDelay: 150,
  importFailure: false,
  emptyImport: false,
  analysisFailure: false,
  analysisDelay: 100,
  generationDelay: 1250,
  generationFailures: 0,
};

export const mockTripCatalog: Record<
  string,
  { places: TripPlace[]; courses: (PlaceCourse & { places: TripPlace[] })[] }
> = {};
for (const city of mockTripCities) {
  const places = mockTripPlaces.filter(
    (place) => place.city === city.name && !place.closed,
  );
  mockTripCatalog[city.name] = {
    places,
    courses: getPlaceCourses(city.name).map((course) => ({
      ...course,
      places: course.placeIds
        .map((id) => places.find((place) => place.id === id))
        .filter((place): place is TripPlace => !!place),
    })),
  };
}

export const mockSavedPlacesByCity: Record<string, TripPlace[]> = {};
for (const city of mockTripCities)
  mockSavedPlacesByCity[city.name] =
    city.name === "후쿠오카" ? [] : mockTripCatalog[city.name].places;

export const mockCourseStopDetails = [
  { time: "09:00", move: "도보 18분", distance: "1.2km" },
  { time: "12:00", move: "도보 18분", distance: "1.2km" },
  { time: "16:30", move: "도보 10분", distance: "700m" },
  { time: "18:00", move: "", distance: "" },
];
