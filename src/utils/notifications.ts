import type { ServerNotification, ServerNotificationType } from "../api/notifications";
import type { NotificationIcon, NotificationItem } from "../types/notifications";

const appearance: Record<ServerNotificationType, {
  category: NotificationItem["category"];
  icon: NotificationIcon;
  suffix: string;
}> = {
  PLACE_ADDED: { category: "trip", icon: "pin", suffix: "장소" },
  COMMENT_MENTION: { category: "friend", icon: "friend", suffix: "댓글" },
  POLL_CLOSED: { category: "friend", icon: "route", suffix: "투표" },
  AI_DRAFT_READY: { category: "trip", icon: "route", suffix: "AI 코스" },
  MEMBER_JOINED: { category: "friend", icon: "friend", suffix: "동행자" },
};

export function toNotificationItem(notification: ServerNotification, now = new Date()): NotificationItem {
  const createdAt = new Date(notification.createdAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const createdDay = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  const daysAgo = Math.max(0, Math.floor((today.getTime() - createdDay.getTime()) / 86_400_000));
  const hoursAgo = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / 3_600_000));
  const group = daysAgo === 0 ? "오늘" : daysAgo < 7 ? "이번 주" : "이전";
  const time = daysAgo === 0
    ? hoursAgo === 0 ? "방금 전" : `${hoursAgo}시간 전`
    : daysAgo < 7 ? `${daysAgo}일 전` : `${createdAt.getMonth() + 1}월 ${createdAt.getDate()}일`;
  const style = appearance[notification.type];

  return {
    id: String(notification.id),
    tripId: notification.tripId,
    group,
    category: style.category,
    label: `${notification.tripTitle} · ${style.suffix}`,
    time,
    message: notification.message,
    icon: style.icon,
    unread: !notification.read,
  };
}
