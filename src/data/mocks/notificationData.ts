import osaka from "../../assets/images/city-osaka.webp";
import kyoto from "../../assets/images/city-kyoto.webp";
import tokyo from "../../assets/images/city-tokyo.webp";
import fukuoka from "../../assets/images/city-fukuoka.webp";
import type { NotificationItem } from "../../types/notifications";

export const mockNotifications: NotificationItem[] = [
  {
    id: "osaka-countdown",
    group: "오늘",
    category: "trip",
    label: "내 여행",
    time: "1시간 전",
    message: "오사카 여행이 7일 남았어요.\n출발 전 일정을 한 번 더 확인해 보세요",
    icon: "airplane",
    thumbnail: osaka,
    unread: true,
  },
  {
    id: "tokyo-invite",
    group: "오늘",
    category: "friend",
    label: "친구",
    time: "3시간 전",
    message: "소연님이 도쿄 여행에 초대했어요",
    icon: "friend",
    invitation: true,
    unread: true,
  },
  {
    id: "kyoto-ai-course",
    group: "오늘",
    category: "trip",
    label: "AI 코스",
    time: "5시간 전",
    message: "교토 2박 3일 맞춤 코스가 완성됐어요",
    icon: "route",
    thumbnail: kyoto,
  },
  {
    id: "fukuoka-edit",
    group: "이번 주",
    category: "friend",
    label: "친구",
    time: "2일 전",
    message: "우사기님이 후쿠오카 여행의\n2일차 일정 수정을 요청했어요",
    icon: "friend",
  },
  {
    id: "tokyo-saved",
    group: "이번 주",
    category: "trip",
    label: "내 코스",
    time: "3일 전",
    message: "내가 공유한 도쿄 산책 코스를\n12명이 저장했어요",
    icon: "pin",
    thumbnail: tokyo,
  },
  {
    id: "autumn-news",
    group: "이전",
    category: "news",
    label: "소식",
    time: "10월 28일",
    message: "지금 떠나기 좋은 가을 단풍 코스 8곳을 모았어요",
    icon: "bell",
  },
  {
    id: "fukuoka-news",
    group: "이전",
    category: "news",
    label: "소식",
    time: "10월 21일",
    message: "후쿠오카 신규 코스가 추가됐어요.\n먼저 둘러보세요",
    icon: "calendar",
    thumbnail: fukuoka,
  },
];
