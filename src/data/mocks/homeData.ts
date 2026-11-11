import type { HomeData } from "../../types/home";
import osaka from "../../assets/images/city-osaka.webp";
import tokyo from "../../assets/images/city-tokyo.webp";
import fukuoka from "../../assets/images/city-fukuoka.webp";
import europe from "../../assets/images/theme-europe.webp";
import thailand from "../../assets/images/city-bangkok.webp";
import pool from "../../assets/images/theme-pool-villa.webp";
import beach from "../../assets/images/theme-beach.webp";
import kyoto from "../../assets/images/city-kyoto.webp";
import avatar from "../../assets/images/character-yellow.webp";
import aiCharacter from "../../assets/images/character-purple.webp";
import courseCharacter from "../../assets/images/character-blue.webp";

export const mockHomeData: HomeData = {
  userName: "하늘",
  nextTrip: {
    id: "osaka",
    title: "오사카 여행",
    city: "오사카",
    dateLabel: "4.17 금 ~ 4.23 목",
    countdownLabel: "D-7",
    durationLabel: "4박 5일",
    status: "upcoming",
    coverImage: osaka,
    memberAvatars: [avatar, courseCharacter, aiCharacter],
  },
  trips: [
    {
      id: "tokyo",
      title: "도쿄 여행",
      city: "도쿄",
      dateLabel: "5.17 금 ~ 5.23 목",
      countdownLabel: "D-30",
      status: "upcoming",
      coverImage: tokyo,
      memberAvatars: [],
    },
    {
      id: "fukuoka",
      title: "후쿠오카 여행",
      city: "후쿠오카",
      dateLabel: "7.3 목 ~ 7.5 토",
      countdownLabel: "D-77",
      status: "upcoming",
      coverImage: fukuoka,
      memberAvatars: [],
    },
  ],
  courses: [
    {
      id: "europe",
      title: "처음 떠나는\n유럽 감성 여행",
      description: "파리, 니스, 몽생미셸",
      category: "유럽",
      courseCount: 6,
      coverImage: europe,
    },
    {
      id: "thailand",
      title: "사원과 야시장을\n하루에",
      description: "방콕, 치앙마이",
      category: "미식 & 문화",
      courseCount: 3,
      coverImage: thailand,
    },
    {
      id: "pool",
      title: "가까운 해외에서\n즐기는 풀빌라",
      description: "다낭, 푸켓, 발리",
      category: "호캉스",
      courseCount: 4,
      coverImage: pool,
    },
    {
      id: "beach",
      title: "바다 앞에서\n쉬어가는 리조트",
      description: "다낭, 나트랑, 세부",
      category: "시티 & 비치",
      courseCount: 4,
      coverImage: beach,
    },
    {
      id: "kyoto",
      title: "교토 골목을 걷는\n느린 하루",
      description: "기온, 히가시야마, 아라시야마",
      category: "문화 & 역사",
      courseCount: 5,
      coverImage: kyoto,
    },
  ],
  sharedTrips: [
    {
      trip: {
        id: "osaka-demo",
        title: "오사카 3박 4일",
        city: "오사카",
        dateLabel: "5.18 월 ~ 5.21 목",
        countdownLabel: "데모",
        durationLabel: "3박 4일",
        status: "upcoming",
        coverImage: osaka,
        memberAvatars: [],
      },
      invitedBy: "우예빈",
      inviterAvatar: aiCharacter,
    },
  ],
};

export const mockEmptyHomeData: HomeData = {
  userName: "하늘",
  nextTrip: null,
  trips: [],
  courses: [],
  sharedTrips: [],
};
