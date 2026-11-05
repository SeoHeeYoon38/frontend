export type CourseSettingsSheet = "trip" | "invite";

export interface CourseSettingsMember {
  name: string;
  suffix: string;
  role: string;
  avatar: string;
}

export interface CourseSettingsShareTarget {
  label: string;
  image: string;
}
