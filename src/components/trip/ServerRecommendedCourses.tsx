import { useEffect, useState } from "react";
import { getCourse, getCourses } from "../../api/courses";
import { getNearbyPlaces, getPopularPlaces } from "../../api/places";
import { courseSummaryToTravelCourse, courseTitle } from "../../api/adapters";
import type { CityResponse, CourseDetailResponse, CourseSummaryResponse, PlaceCategoryCode, SavedPlaceResponse } from "../../api/types";
import { savedPlaceCategoryLabels } from "../../utils/tripPlaces";
import pinIcon from "../../assets/icons/field-location.svg";
import TripSheet from "../common/TripSheet";
import { PlaceThumbnail } from "../common/PlacePhoto";
import CourseRouteMap from "../course-completion/CourseRouteMap";
import * as P from "./SavedPlacesStep.styled";
import * as S from "./Trip.styled";

interface RecommendationProps {
  city: CityResponse;
  tripId: number;
  view: "popular" | "recommended";
  selectedPlaces: SavedPlaceResponse[];
  busy: boolean;
  saveError: string;
  onOpen: () => void;
  onAdd: (ids: string[]) => Promise<boolean>;
  onToggle: (id: string) => void;
}

type SuggestedPlace = {
  placeId: string;
  name: string;
  address: string | null;
  category?: PlaceCategoryCode | null;
};

async function getSuggestedPlaces(tripId: number, lat: number, lng: number, signal: AbortSignal): Promise<SuggestedPlace[]> {
  const popular = await getPopularPlaces(tripId, signal);
  if (popular.length) return popular;
  return getNearbyPlaces(tripId, lat, lng, undefined, signal);
}

export default function ServerRecommendedCourses({ city, tripId, view, selectedPlaces, busy, saveError, onOpen, onAdd, onToggle }: RecommendationProps) {
  const { name: cityName, lat, lng } = city;
  const [courses, setCourses] = useState<CourseSummaryResponse[]>();
  const [popular, setPopular] = useState<SuggestedPlace[]>();
  const [selectedCourse, setSelectedCourse] = useState<CourseSummaryResponse>();
  const [attempt, setAttempt] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [coursesFailed, setCoursesFailed] = useState(false);
  const [placesFailed, setPlacesFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void getCourses(cityName, controller.signal).then(
      (items) => { if (!controller.signal.aborted) setCourses(items); },
      () => { if (!controller.signal.aborted) setCoursesFailed(true); },
    );
    void getSuggestedPlaces(tripId, lat, lng, controller.signal).then(
      (items) => { if (!controller.signal.aborted) setPopular(items); },
      () => { if (!controller.signal.aborted) setPlacesFailed(true); },
    );
    return () => controller.abort();
  }, [cityName, lat, lng, tripId, attempt]);

  const retry = () => {
    setCoursesFailed(false);
    setPlacesFailed(false);
    setAttempt((current) => current + 1);
  };
  const selectedIds = new Set(selectedPlaces.map((place) => place.placeId));

  return (
    <>
      {view === "recommended" && (
        coursesFailed ? (
          <div>
            <S.ErrorText role="alert">추천 코스를 불러오지 못했어요.</S.ErrorText>
            <P.MatchButton type="button" onClick={retry}>다시 불러오기</P.MatchButton>
          </div>
        ) : !courses ? <p role="status">추천 코스를 불러오고 있어요.</p> : (
          <P.SuggestedSection aria-label="추천 코스">
            <P.PlacesSummary><span>{cityName} 추천 코스 <b>{courses.length}개</b></span></P.PlacesSummary>
            {courses.length === 0 ? <p role="status">이 도시의 추천 코스가 없어요.</p> : <>
              <P.SuggestedCarousel onScroll={(event) => {
                const { scrollWidth, clientWidth, scrollLeft } = event.currentTarget;
                const distance = scrollWidth - clientWidth;
                if (distance > 0) setActiveSlide(Math.round((scrollLeft / distance) * (courses.length - 1)));
              }}>
                {courses.map((course) => {
                  const { title, image } = courseSummaryToTravelCourse(course);
                  return (
                    <P.SuggestedCourse key={course.id} type="button" aria-haspopup="dialog" disabled={busy}
                      onClick={() => { onOpen(); setSelectedCourse(course); }}>
                      {image && <img className="suggested-cover" src={image} alt="" loading="lazy" />}
                      <span className="suggested-course-copy">
                        <strong>{title}</strong>
                        <span><img src={pinIcon} alt="" />{course.stopCount}곳</span>
                      </span>
                    </P.SuggestedCourse>
                  );
                })}
              </P.SuggestedCarousel>
              {courses.length > 1 && <P.SuggestedDots aria-hidden="true">
                {courses.map((course, index) => <span key={course.id} data-active={index === activeSlide} />)}
              </P.SuggestedDots>}
            </>}
          </P.SuggestedSection>
        )
      )}
      {placesFailed ? (
        <div>
          <S.ErrorText role="alert">추천 장소를 불러오지 못했어요.</S.ErrorText>
          <P.MatchButton type="button" onClick={retry}>다시 불러오기</P.MatchButton>
        </div>
      ) : !popular ? <p role="status">추천 장소를 불러오고 있어요.</p> : (
        <P.SuggestedSection aria-label="추천 장소">
          {view === "recommended" && <h2>이런 장소도 있어요!</h2>}
          <P.PlacesSummary><span>{cityName} 추천 장소 <b>{popular.length}개</b></span></P.PlacesSummary>
          {popular.length === 0 && <p role="status">이 도시의 추천 장소가 없어요.</p>}
          <P.PlaceList>
            {popular.map((place) => (
              <P.PlaceRow key={place.placeId}>
                <P.PlaceThumb><PlaceThumbnail placeId={place.placeId} name={place.name} /></P.PlaceThumb>
                <P.PlaceCopy>
                  <div>
                    <strong>{place.name}</strong>
                    {place.category && <P.PlaceStatus>{savedPlaceCategoryLabels[place.category]}</P.PlaceStatus>}
                  </div>
                  {place.address && <p>{place.address}</p>}
                </P.PlaceCopy>
                <P.Checkbox type="checkbox" aria-label={`${place.name} 선택`} checked={selectedIds.has(place.placeId)}
                  disabled={busy} onChange={() => onToggle(place.placeId)} />
              </P.PlaceRow>
            ))}
          </P.PlaceList>
        </P.SuggestedSection>
      )}
      {selectedCourse && (
        <ServerCourseDetail
          course={selectedCourse}
          busy={busy}
          saveError={saveError}
          onClose={() => setSelectedCourse(undefined)}
          onAdd={onAdd}
        />
      )}
    </>
  );
}

function ServerCourseDetail({ course, busy, saveError, onClose, onAdd }: {
  course: CourseSummaryResponse;
  busy: boolean;
  saveError: string;
  onClose: () => void;
  onAdd: RecommendationProps["onAdd"];
}) {
  const [detail, setDetail] = useState<CourseDetailResponse>();
  const [ids, setIds] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void getCourse(course.id, controller.signal).then(
      (item) => { if (!controller.signal.aborted) setDetail(item); },
      () => { if (!controller.signal.aborted) setFailed(true); },
    );
    return () => controller.abort();
  }, [course.id, attempt]);

  const stops = detail?.days.flatMap((day) => day.stops) ?? [];
  return (
    <TripSheet
      variant="course"
      title={courseTitle(course.title)}
      onClose={onClose}
      closeDisabled={busy}
      footer={detail && (
        <S.Primary type="button" disabled={busy || !ids.length} onClick={async () => {
          if (await onAdd(ids)) onClose();
        }}>
          {busy ? "장소를 담고 있어요" : ids.length ? `선택한 장소 ${ids.length}곳 담기` : "장소를 선택해 주세요"}
        </S.Primary>
      )}
    >
      <S.Help>장소 {course.stopCount}곳</S.Help>
      {saveError && <S.ErrorText role="alert">{saveError}</S.ErrorText>}
      {failed ? (
        <div>
          <S.ErrorText role="alert">코스 장소를 불러오지 못했어요.</S.ErrorText>
          <P.MatchButton type="button" onClick={() => { setFailed(false); setAttempt((current) => current + 1); }}>
            다시 불러오기
          </P.MatchButton>
        </div>
      ) : !detail ? <p role="status">코스 장소를 불러오고 있어요.</p> : (
        <>
          {stops.length > 0 && (
            <P.CourseMap>
              <CourseRouteMap places={stops} city={course.city} live />
            </P.CourseMap>
          )}
          <P.PlaceList>
            {stops.map((stop, index) => (
              <P.CourseStop key={stop.id}>
                <P.StopRail aria-hidden="true"><span>{index + 1}</span></P.StopRail>
                <P.StopContent>
                  <P.StopCard>
                    {stop.imageUrl ? <img src={stop.imageUrl} alt="" loading="lazy" /> : (
                      <PlaceThumbnail courseId={course.id} placeId={stop.placeId} name={stop.name} />
                    )}
                    <label>
                      <div>
                        <strong>{stop.name}</strong>
                        <p>{[stop.visitTime?.slice(0, 5), savedPlaceCategoryLabels[stop.category]].filter(Boolean).join(" | ")}</p>
                      </div>
                      <P.Checkbox
                        type="checkbox"
                        aria-label={`${stop.name} 선택`}
                        checked={ids.includes(stop.placeId)}
                        disabled={busy}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          setIds((current) => checked
                            ? [...current, stop.placeId]
                            : current.filter((id) => id !== stop.placeId));
                        }}
                      />
                    </label>
                  </P.StopCard>
                </P.StopContent>
              </P.CourseStop>
            ))}
          </P.PlaceList>
          {stops.length === 0 && <p>이 코스에 표시할 장소가 없어요.</p>}
        </>
      )}
    </TripSheet>
  );
}
