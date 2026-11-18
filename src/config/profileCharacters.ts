import type { ProfileAvatar } from "../utils/mySettings";
import avatarOne from "../assets/profile-characters/avatar-1.png";
import avatarTwo from "../assets/profile-characters/avatar-2.png";
import avatarThree from "../assets/profile-characters/avatar-3.png";
import avatarFour from "../assets/profile-characters/avatar-4.png";
import avatarFive from "../assets/profile-characters/avatar-5.png";
import avatarSix from "../assets/profile-characters/avatar-6.png";
import avatarSeven from "../assets/profile-characters/avatar-7.png";
import avatarEight from "../assets/profile-characters/avatar-8.png";
import avatarNine from "../assets/profile-characters/avatar-9.png";
import avatarTen from "../assets/profile-characters/avatar-10.png";

// Keep the original blue, purple, and yellow IDs for existing profiles.
export const profileCharacters: { id: ProfileAvatar; image: string; color: string; label: string }[] = [
  { id: 1, image: avatarOne, color: "#ddf7ff", label: "파란 캐릭터 1" },
  { id: 4, image: avatarTwo, color: "#ddf7ff", label: "파란 캐릭터 2" },
  { id: 5, image: avatarThree, color: "#ddf7ff", label: "파란 캐릭터 3" },
  { id: 2, image: avatarFour, color: "#efedff", label: "보라 캐릭터 1" },
  { id: 6, image: avatarFive, color: "#efedff", label: "보라 캐릭터 2" },
  { id: 7, image: avatarSix, color: "#efedff", label: "보라 캐릭터 3" },
  { id: 3, image: avatarSeven, color: "#fff8d6", label: "노란 캐릭터 1" },
  { id: 8, image: avatarEight, color: "#fff8d6", label: "노란 캐릭터 2" },
  { id: 9, image: avatarNine, color: "#fff8d6", label: "노란 캐릭터 3" },
  { id: 10, image: avatarTen, color: "#f3f5fa", label: "도틀로 AI 캐릭터" },
];

export function profileCharacter(characterId: number | null | undefined) {
  return profileCharacters.find(({ id }) => id === characterId) ?? profileCharacters[0];
}
