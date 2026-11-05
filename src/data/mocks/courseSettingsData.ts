import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import shareAirDrop from "../../assets/course-settings/share-airdrop.png";
import shareKakao from "../../assets/course-settings/share-kakao.png";
import shareMail from "../../assets/course-settings/share-mail.png";
import shareMessages from "../../assets/course-settings/share-messages.png";
import type {
  CourseSettingsMember,
  CourseSettingsShareTarget,
} from "../../types/courseSettings";

export const courseInviteLink = "https://dotlo.app/t/tokyo-3n4d-sample";

export const courseMembers: CourseSettingsMember[] = [
  {
    name: "우예빈",
    suffix: "(나)",
    role: "여행 생성자",
    avatar: avatarPurple,
  },
  { name: "정다은", suffix: "", role: "편집 가능", avatar: avatarBlue },
  { name: "이지우", suffix: "", role: "편집 가능", avatar: avatarYellow },
];

export const courseShareTargets: CourseSettingsShareTarget[] = [
  { label: "AirDrop", image: shareAirDrop },
  { label: "메시지", image: shareMessages },
  { label: "카카오톡", image: shareKakao },
  { label: "Mail", image: shareMail },
];
