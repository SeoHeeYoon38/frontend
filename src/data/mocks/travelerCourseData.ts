import author from "../../assets/traveler-course/author.png";
import hero from "../../assets/traveler-course/hero.png";
import kiyomizu from "../../assets/traveler-course/place-kiyomizu.png";
import sannenzaka from "../../assets/traveler-course/place-sannenzaka.png";
import yasaka from "../../assets/traveler-course/place-yasaka.png";
import routePreview from "../../assets/traveler-course/route-preview.png";
import mapFull from "../../assets/traveler-course/map-full.png";
import sannenzakaHero from "../../assets/traveler-course/sannenzaka-hero.png";
import sannenzakaMap from "../../assets/traveler-course/sannenzaka-map.png";
import sannenzakaPhoto2 from "../../assets/traveler-course/sannenzaka-photo-2.png";
import sannenzakaPhoto3 from "../../assets/traveler-course/sannenzaka-photo-3.png";
import type { TravelerCourseDay, TravelerCourseView } from "../../types/course";

export const travelerCourse: TravelerCourseView = {
  id: "kyoto-walk",
  city: "교토",
  duration: "2박 3일",
  tags: ["교토", "2박 3일", "산책", "전통"],
  title: "골목을 걷다 만나는\n교토의 느린 하루",
  author: "산책하는 유진",
  authorNote: "직접 다녀온 여행",
  publishedAt: "2026. 03",
  description:
    "유명한 곳은 이른 아침에, 낮에는 골목을 천천히 걸어요. 하루에 4곳만 담아 여유롭게 다녔어요.",
  placeCount: 9,
  transport: "도보와 버스",
  hero,
  authorImage: author,
  routePreview,
  mapFull,
  days: [
    {
      label: "1일차",
      places: [
        {
          id: "kiyomizu",
          name: "기요미즈데라",
          category: "명소",
          image: kiyomizu,
          travelTime: "도보 18분",
          distance: "1.2km",
        },
        {
          id: "sannenzaka",
          name: "산넨자카 골목",
          category: "명소",
          image: sannenzaka,
          travelTime: "도보 12분",
          distance: "850m",
        },
        {
          id: "yasaka",
          name: "야사카 탑",
          category: "명소",
          image: yasaka,
          travelTime: "도보 10분",
          distance: "700m",
        },
      ],
    },
    {
      label: "2일차",
      places: [
        { id: "ginkakuji", name: "은각사", category: "명소", image: kiyomizu },
        { id: "philosopher", name: "철학의 길", category: "산책", image: sannenzaka },
        { id: "nanzenji", name: "난젠지", category: "명소", image: yasaka },
      ],
    },
    {
      label: "3일차",
      places: [
        { id: "nishiki", name: "니시키 시장", category: "시장", image: sannenzaka },
        { id: "kamogawa", name: "가모가와", category: "산책", image: yasaka },
        { id: "kyoto-station", name: "교토역", category: "교통", image: kiyomizu },
      ],
    },
  ] as TravelerCourseDay[],
};

export const sannenzakaDetail = {
  id: "sannenzaka",
  name: "산넨자카 골목",
  englishName: "Sannenzaka",
  category: "명소",
  rating: "4.5",
  reviewCount: "구글 리뷰 12,400",
  region: "교토 히가시야마",
  description:
    "기요미즈데라로 이어지는 돌계단 골목이에요. 전통 찻집과 기념품 가게가 양옆으로 늘어서 있어 천천히 걸으며 구경하기 좋아요.",
  hours: "09:00 ~ 18:00",
  address: "2 Chome Kiyomizu, Higashiyama Ward, Kyoto",
  hero: sannenzakaHero,
  gallery: [sannenzakaHero, sannenzakaPhoto2, sannenzakaPhoto3],
  map: sannenzakaMap,
};

