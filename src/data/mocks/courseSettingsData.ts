import avatarBlue from "../../assets/course-settings/avatar-blue.png";
import avatarPurple from "../../assets/course-settings/avatar-purple.png";
import avatarYellow from "../../assets/course-settings/avatar-yellow.png";
import type { CourseSettingsMember } from "../../types/courseSettings";

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
