export type CommunityStage =
  | "welcome"
  | "summary"
  | "poll"
  | "day-picker"
  | "applied";

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  tone: "blue" | "purple" | "yellow";
}

export interface CompanionComment {
  id: number;
  author: string;
  avatar: string;
  message: string;
  time: string;
  likes: number;
  liked: boolean;
  replyTo?: string;
}

export interface CommunityPollOption {
  id: string;
  title: string;
  detail: string;
  votes: number;
}
