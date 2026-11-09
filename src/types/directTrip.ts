export type DirectTripStage = "info" | "itinerary" | "search";

export type DirectTripSearchTab = "recommend" | "google";

export interface DirectTripDay {
  day: number;
  date: string;
  weekday: string;
}

export interface DirectTripPlace {
  id: string;
  name: string;
  category: string;
  detail: string;
  image: string;
  source: "recommend" | "google";
  travelTime?: string;
}

