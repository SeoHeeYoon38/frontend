export type Companion = "혼자" | "친구" | "연인" | "가족";
export type PlaceCategory = "맛집" | "카페" | "명소" | "쇼핑" | "산책";
export interface TripCity {
  name: string;
  country: string;
  image: string;
  latitude: number;
  longitude: number;
}
export interface TripPlace {
  id: string;
  title: string;
  city: string;
  category: PlaceCategory;
  description: string;
  image: string;
  latitude?: number;
  longitude?: number;
  closed?: boolean;
  needsMatch?: boolean;
}
export interface Flight {
  code: string;
  airline: string;
  date: string;
  departure: string;
  arrival: string;
  from: string;
  to: string;
}
export interface Stay {
  id: string;
  name: string;
  address: string;
  city: string;
  startDate: string;
  endDate: string;
}
export interface Rental {
  days: string[];
  location: string;
}
export interface Preferences {
  text: string;
  tastes: string[];
  pace: string[];
  companion: string[];
  analyzed: boolean;
}
export interface TripDraft {
  version: 1;
  tripId: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  companion: Companion | null;
  people: number;
  outbound: Flight | null;
  inbound: Flight | null;
  stays: Stay[];
  rental: Rental | null;
  places: TripPlace[];
  selectedPlaceIds: string[];
  source: "none" | "file" | "manual" | "mock";
  preferences: Preferences;
}
export interface PlaceCourse {
  id: string;
  title: string;
  savedLabel: string;
  placeIds: string[];
}
