export type TravelTone = "walk" | "transit";

export interface CourseDay {
  label: string;
  date: string;
}

export interface CoursePlace {
  id: number;
  name: string;
  category: string;
  detail: string;
  image: string;
  icon: string;
  travel?: string;
  distance?: string;
  travelTone?: TravelTone;
  description?: string;
  changeLabel?: string;
  fixed?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface CourseMapPin {
  number: number;
  left: string;
  top: string;
}

export type CourseScreen =
  | "plan"
  | "place-detail"
  | "ai-edit"
  | "ai-loading"
  | "ai-result"
  | "schedule-edit"
  | "place-add"
  | "place-replace";

export type CoursePlanVariant = "default" | "applied";

export interface CourseCandidate {
  id: number;
  name: string;
  category: string;
  distance: string;
  image: string;
}
