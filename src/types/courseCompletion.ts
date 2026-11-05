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
}

export interface CourseMapPin {
  number: number;
  left: string;
  top: string;
}
