import chevron from "../../assets/icons/nav-chevron-right.svg";
import * as C from "./common.styled";
import * as S from "./MyTripsSection.styled";
import { useState } from "react";
import type { TripSummary } from "../../types/home";
import calendar from "../../assets/icons/calendar-outline.svg";
import pin from "../../assets/course-settings/pin.svg";
import { Link } from "react-router";
import { tripPlanPath } from "../../utils/navigation";

interface MyTripsSectionProps {
  trips: TripSummary[];
  onCreateTrip: () => void;
}

function MyTripsSection({ trips, onCreateTrip }: MyTripsSectionProps) {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const visibleTrips = trips.filter((trip) => trip.status === selectedTab);
  const isUpcoming = selectedTab === "upcoming";

  return (
    <C.Section id="my-trips" aria-label="내 여행">
      <C.Heading>
        <h2>내 여행</h2>
        {visibleTrips.length > 0 && (
          <button type="button">
            더보기
            <img src={chevron} alt="" />
          </button>
        )}
      </C.Heading>
      <S.Tabs aria-label="여행 분류">
        <button
          type="button"
          aria-pressed={selectedTab === "upcoming"}
          onClick={() => setSelectedTab("upcoming")}
        >
          예정된 여행
        </button>
        <button
          type="button"
          aria-pressed={selectedTab === "past"}
          onClick={() => setSelectedTab("past")}
        >
          다녀온 여행
        </button>
      </S.Tabs>
      {visibleTrips.length ? (
        <S.List>
          {visibleTrips.map((trip) => (
            <S.TripRow
              as={Link}
              to={tripPlanPath("home")}
              aria-label={`${trip.title} 일정 보기`}
              key={trip.id}
            >
              <S.Photo
                loading="lazy"
                decoding="async"
                src={trip.coverImage}
                alt=""
              />
              <div>
                <S.Meta>
                  <span>{trip.city}</span>
                  <b>{trip.countdownLabel}</b>
                </S.Meta>
                <h3>{trip.title}</h3>
                <p>
                  <img src={calendar} alt="" />
                  {trip.dateLabel}
                </p>
              </div>
            </S.TripRow>
          ))}
        </S.List>
      ) : (
        <S.Empty>
          <div>
            <p>{isUpcoming ? "예정된 여행이 없습니다" : "다녀온 여행이 없습니다"}</p>
            <p>
              {isUpcoming
                ? "여행을 추가하러 갈까요?"
                : "여행을 다녀오면 여기에 모아둘게요"}
            </p>
          </div>
          {isUpcoming && (
            <S.CreateButton type="button" aria-haspopup="dialog" onClick={onCreateTrip}>
              <img src={pin} alt="" />
              여행 만들기
            </S.CreateButton>
          )}
        </S.Empty>
      )}
    </C.Section>
  );
}

export default MyTripsSection;
