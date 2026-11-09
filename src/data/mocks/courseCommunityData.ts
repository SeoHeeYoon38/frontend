import aiAvatar from "../../assets/course-completion/ai-avatar.png";
import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import type {
  CommunityMember,
  CommunityPollOption,
  CompanionComment,
} from "../../types/courseCommunity";

export { aiAvatar };

export const communityMembers: CommunityMember[] = [
  { id: "yebin", name: "우예빈", avatar: avatarBlue, tone: "blue" },
  { id: "daeun", name: "정다은", avatar: avatarPurple, tone: "purple" },
  { id: "jiwoo", name: "이지우", avatar: avatarYellow, tone: "yellow" },
];

export const initialCompanionComments: CompanionComment[] = [
  {
    id: 1,
    author: "정다은",
    avatar: avatarPurple,
    message: "해산물 꼬치 여기 진짜 맛있대! 첫날 꼭 가자",
    time: "방금 전",
    likes: 1,
    liked: true,
  },
  {
    id: 2,
    author: "우예빈",
    avatar: avatarBlue,
    message: "좋아! 첫날 점심으로 넣자",
    time: "방금 전",
    likes: 0,
    liked: false,
    replyTo: "정다은",
  },
  {
    id: 3,
    author: "이지우",
    avatar: avatarYellow,
    message: "난 날것 잘 못 먹어서 익힌 메뉴도 있는지 궁금해",
    time: "5분 전",
    likes: 0,
    liked: false,
  },
];

export const communityPollOptions: CommunityPollOption[] = [
  {
    id: "osaka-castle",
    title: "오사카성 공원",
    detail: "공원, 입장 무료",
    votes: 2,
  },
  {
    id: "kaiyukan",
    title: "가이유칸 수족관",
    detail: "수족관",
    votes: 0,
  },
  {
    id: "tempozan",
    title: "덴포잔 대관람차",
    detail: "전망",
    votes: 0,
  },
];

export const communityDays = [
  { id: 1, label: "1일차", date: "5.18", recommended: false },
  { id: 2, label: "2일차", date: "5.19", recommended: true },
  { id: 3, label: "3일차", date: "5.20", recommended: false },
  { id: 4, label: "4일차", date: "5.21", recommended: false },
] as const;
