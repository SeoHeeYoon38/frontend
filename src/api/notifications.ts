import { apiRequest } from "./client";

export type ServerNotificationType =
  | "PLACE_ADDED"
  | "COMMENT_MENTION"
  | "POLL_CLOSED"
  | "AI_DRAFT_READY"
  | "MEMBER_JOINED";

export interface ServerNotification {
  id: number;
  type: ServerNotificationType;
  tripId: number;
  tripTitle: string;
  message: string;
  highlight: string | null;
  read: boolean;
  createdAt: string;
}

export function getNotifications(signal?: AbortSignal) {
  return apiRequest<{ notifications: ServerNotification[] }>("/api/notifications", { signal });
}

export function getUnreadNotifications(signal?: AbortSignal) {
  return apiRequest<{ hasUnread: boolean }>("/api/notifications/unread", { signal });
}

export function markNotificationRead(notificationId: number) {
  return apiRequest<void>(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return apiRequest<void>("/api/notifications/read-all", { method: "PATCH" });
}
