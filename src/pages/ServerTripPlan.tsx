import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ApiError } from "../api/client";
import { getLatestItinerary } from "../api/itineraries";
import { getSavedPlaces } from "../api/places";
import { getTrip } from "../api/trips";
import type { ItineraryVersionView, SavedPlaceResponse, TripResponse } from "../api/types";
import { resumeTripPath, tripPlanBackPath } from "../utils/navigation";
import { apiTripToDraft, apiTripToSummary } from "../utils/serverTrip";
import { dateLabel } from "../utils/trip";

interface TripPlanData {
  trip: TripResponse;
  itinerary: ItineraryVersionView | null;
  places: SavedPlaceResponse[];
}

function timeLabel(value: string) {
  return (value.split("T")[1] ?? value).slice(0, 5);
}

function ServerTripPlan({ tripId }: { tripId: number }) {
  const { search } = useLocation();
  const [data, setData] = useState<TripPlanData>();
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadPlan() {
      try {
        const trip = await getTrip(tripId, signal);
        if (signal.aborted) return;
        const itinerary = await getLatestItinerary(tripId, signal).catch((reason: unknown) => {
          if (reason instanceof ApiError && reason.code === "ITINERARY_NOT_FOUND") return null;
          throw reason;
        });
        if (signal.aborted) return;
        const saved = itinerary ? await getSavedPlaces(tripId, signal).catch(() => undefined) : undefined;
        if (!signal.aborted) setData({ trip, itinerary, places: saved?.places ?? [] });
      } catch (reason) {
        if (signal.aborted) return;
        setError(reason instanceof ApiError && reason.code === "TRIP_NOT_FOUND"
          ? "여행을 찾지 못했어요."
          : "여행 일정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    }

    void loadPlan();
    return () => controller.abort();
  }, [tripId]);

  const summary = data && apiTripToSummary(data.trip);
  const days = data?.itinerary?.validation.days ?? [];
  const day = days[activeDay];

  return (
    <div className="course-page-shell">
      <main className="course-page">
        <div className="course-content">
          <Link to={tripPlanBackPath(search)}>여행 목록으로 돌아가기</Link>
          {error && <p role="alert">{error}</p>}
          {!data && !error && <p role="status">여행 일정을 불러오고 있어요.</p>}
          {data && summary && (
            <section className="course-section">
              <h1>{summary.title}</h1>
              <p>{summary.dateLabel} · {apiTripToDraft(data.trip).companion} {data.trip.companionCount}명</p>
              {data.itinerary ? (
                <>
                  <h2>일정</h2>
                  {data.itinerary.validation.summary.placesNeedingCheck > 0 && (
                    <p role="status">확인이 필요한 장소 {data.itinerary.validation.summary.placesNeedingCheck}곳</p>
                  )}
                  <div className="course-tabs" aria-label="여행 일차">
                    {days.map((item, index) => (
                      <button
                        key={item.date}
                        type="button"
                        className={activeDay === index ? "is-active" : ""}
                        aria-pressed={activeDay === index}
                        onClick={() => setActiveDay(index)}
                      >
                        <strong>{index + 1}일차</strong>
                        <span>{dateLabel(item.date)}</span>
                      </button>
                    ))}
                  </div>
                  {day?.visits.length ? (
                    <ol>
                      {day.visits.map((visit) => {
                        const place = data.places.find((item) => item.placeId === visit.placeId);
                        return (
                          <li key={visit.itemId}>
                            <strong>{place?.name ?? "장소 정보 없음"}</strong>
                            <p>
                              {timeLabel(visit.start)} – {timeLabel(visit.end)}
                              {" · 이동 "}{visit.travel.minutes}분
                              {["ESTIMATED", "ROUTE_NOT_FOUND"].includes(visit.travel.source) && " (추정)"}
                            </p>
                          </li>
                        );
                      })}
                    </ol>
                  ) : <p>이날 일정에 담긴 장소가 없어요.</p>}
                </>
              ) : (
                <>
                  <p>아직 저장된 일정이 없어요.</p>
                  <Link to={resumeTripPath(tripId)}>일정 만들기</Link>
                </>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default ServerTripPlan;
