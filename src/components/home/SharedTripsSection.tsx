import * as C from "./common.styled";
import * as S from "./SharedTripsSection.styled";
import type { SharedTrip } from "../../types/home";
import calendar from "../../assets/icons/calendar-outline-large.svg";

interface SharedTripsSectionProps {
  trips: SharedTrip[];
}
function SharedTripsSection({ trips }: SharedTripsSectionProps) {
  if (!trips.length) return null;
  return (
    <C.Section aria-label="친구가 공유한 여행">
      <C.Heading>
        <h2>친구가 공유한 여행</h2>
      </C.Heading>
      {trips.map(({ trip, invitedBy, inviterAvatar }) => (
        <S.Card key={trip.id}>
          <S.Info>
            <b>{trip.countdownLabel}</b>
            <h3>{trip.title}</h3>
            <p>
              <img src={calendar} alt="" />
              {trip.dateLabel} | {trip.durationLabel}
            </p>
            <p>
              <S.Avatar src={inviterAvatar} alt="" />
              {invitedBy}님이 초대했어요
            </p>
          </S.Info>
          <S.Photo
            loading="lazy"
            decoding="async"
            src={trip.coverImage}
            alt={`${trip.city} 여행`}
          />
        </S.Card>
      ))}
    </C.Section>
  );
}

export default SharedTripsSection;
