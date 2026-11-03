import chevron from "../../assets/icons/nav-chevron-right.svg";
import * as C from "./common.styled";
import * as S from "./MyTripsSection.styled";
import { useState } from "react";
import type { TripSummary } from "../../types/home";
import calendar from "../../assets/icons/calendar-outline.svg";

interface MyTripsSectionProps {
  trips: TripSummary[];
}

function MyTripsSection({ trips }: MyTripsSectionProps) {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const visibleTrips = trips.filter((trip) => trip.status === selectedTab);

  return (
    <C.Section id="my-trips" aria-label="내 여행">
      <C.Heading>
        <h2>내 여행</h2>
        <button type="button">
          더보기
          <img src={chevron} alt="" />
        </button>
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
      <S.List>
        {visibleTrips.map((trip) => (
          <S.TripRow key={trip.id}>
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
    </C.Section>
  );
}

export default MyTripsSection;
