import { Link } from "react-router";
import type { TripSummary } from "../../types/home";
import aiCharacter from "../../assets/images/character-purple.webp";
import courseCharacter from "../../assets/images/character-blue.webp";
import glow from "../../assets/icons/effect-action-glow.svg";
import pen from "../../assets/icons/action-pen.svg";
import manualChevron from "../../assets/icons/nav-chevron-right-muted.svg";
import arrow from "../../assets/icons/nav-arrow-right-circle.svg";
import { routes } from "../../config/routes";
import { tripPlanPath } from "../../utils/navigation";
import * as S from "./HomeIntro.styled";
import * as C from "./common.styled";

interface HomeIntroProps {
  name: string;
  trip: TripSummary | null;
  tripPath?: (id: string) => string;
  resumePath?: string;
}

function HomeIntro({ name, trip, tripPath = (id) => tripPlanPath("home", id), resumePath }: HomeIntroProps) {
  return (
    <>
      <S.Greeting>
        안녕하세요{name ? `, ${name}님` : ""}
        <br />
        다음 여행은 어디로 갈까요?
      </S.Greeting>
      <S.Create>
        {resumePath && (
          <S.ManualAction as={Link} to={resumePath}>
            <S.ManualIcon><img src={pen} alt="" /></S.ManualIcon>
            <S.ManualText><strong>이어서 만들기</strong></S.ManualText>
            <img src={manualChevron} alt="" />
          </S.ManualAction>
        )}
        <S.Actions>
          <S.Action as={Link} to={routes.createTrip} $variant="ai">
            <strong>
              AI 맞춤
              <br />
              여행 만들기
            </strong>
            <span>
              취향과 저장 장소로
              <br />
              전체 일정을 짜줘요
            </span>
            <S.Glow src={glow} alt="" $variant="ai" />
            <S.Character src={aiCharacter} alt="" $variant="ai" />
          </S.Action>
          <S.Action as={Link} to={routes.courses} $variant="course">
            <strong>
              인기 코스
              <br />
              둘러보기
            </strong>
            <span>
              많이 선택한 코스를
              <br />내 일정에 가져와요
            </span>
            <S.Glow src={glow} alt="" $variant="course" />
            <S.Character src={courseCharacter} alt="" $variant="course" />
          </S.Action>
        </S.Actions>
        <S.ManualAction as={Link} to={`${routes.createTrip}?mode=manual`}>
          <S.ManualIcon>
            <img src={pen} alt="" />
          </S.ManualIcon>
          <S.ManualText>
            <strong>직접 일정 만들기</strong>
            <span>빈 일정에서 장소를 하나씩 담아요</span>
          </S.ManualText>
          <img src={manualChevron} alt="" />
        </S.ManualAction>
      </S.Create>
      {trip && (
        <S.Card
          as={Link}
          to={tripPath(trip.id)}
          aria-label={`${trip.title} 일정 보기`}
        >
          <C.Cover src={trip.coverImage} alt={`${trip.city} 여행`} />
          <C.Scrim />
          <S.Badge>
            다가오는 여행 <b>{trip.countdownLabel}</b>
          </S.Badge>
          <S.Avatars>
            {trip.memberAvatars.slice(0, 3).map((avatar, index) => (
              <img key={`${avatar}-${index}`} src={avatar} alt="" />
            ))}
          </S.Avatars>
          <S.Title>
            <h2>{trip.title}</h2>
            <p>
              {trip.dateLabel} {trip.durationLabel}
            </p>
          </S.Title>
          <S.Arrow src={arrow} alt="일정 보기" />
        </S.Card>
      )}
    </>
  );
}

export default HomeIntro;
