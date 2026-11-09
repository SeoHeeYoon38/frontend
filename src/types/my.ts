export type SavedRegion = "전체" | "도쿄" | "오사카" | "교토";

export interface MyProfile {
  name: string;
  username: string;
  avatar: string;
  savedPlaceCount: number;
  savedCourseCount: number;
  visitedTripCount: number;
  googlePlaceCount: number;
}

export interface SavedPlace {
  id: string;
  name: string;
  city: Exclude<SavedRegion, "전체">;
  category: string;
  source: "Google Maps에서 가져옴" | "직접 저장" | "인기 코스에서 저장";
  image: string;
}

export interface SavedCourse {
  id: string;
  title: string;
  durationLabel: string;
  city: string;
  placeCount: number;
  image: string;
}
