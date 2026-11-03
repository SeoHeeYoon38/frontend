export interface TripSummary {
  id: string;
  title: string;
  city: string;
  dateLabel: string;
  countdownLabel: string;
  durationLabel?: string;
  status: "upcoming" | "past";
  coverImage: string;
  memberAvatars: string[];
}
export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  courseCount: number;
  coverImage: string;
}
export interface SharedTrip {
  trip: TripSummary;
  invitedBy: string;
  inviterAvatar: string;
}
export interface HomeData {
  userName: string;
  nextTrip: TripSummary | null;
  trips: TripSummary[];
  courses: CourseSummary[];
  sharedTrips: SharedTrip[];
}
