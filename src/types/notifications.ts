export type NotificationFilter = "all" | "trip" | "friend" | "news";

export type NotificationIcon =
  | "airplane"
  | "friend"
  | "route"
  | "pin"
  | "bell"
  | "calendar";

export interface NotificationItem {
  id: string;
  group: "오늘" | "이번 주" | "이전";
  category: Exclude<NotificationFilter, "all">;
  label: string;
  time: string;
  message: string;
  icon: NotificationIcon;
  thumbnail?: string;
  unread?: boolean;
  invitation?: boolean;
}
