import type { CoursePlace } from "./courseCompletion";
import type { Companion } from "./trip";

export interface MockTripDay {
  date: string;
  places: CoursePlace[];
}

export interface MockTrip {
  id: string;
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  companion: Companion;
  people: number;
  coverImage: string;
  source: "generated" | "direct" | "imported" | "sample";
  saved: boolean;
  sampleStatus?: "upcoming" | "past";
  days: MockTripDay[];
}
