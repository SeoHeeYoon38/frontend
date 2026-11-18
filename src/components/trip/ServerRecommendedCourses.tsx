import { useEffect, useState } from "react";
import { getCourse, getCourses } from "../../api/courses";
import type { CourseDetailResponse, CourseSummaryResponse } from "../../api/types";
import TripSheet from "../common/TripSheet";
import { PlaceThumbnail } from "../common/PlacePhoto";
import CourseRouteMap from "../course-completion/CourseRouteMap";
import * as P from "./SavedPlacesStep.styled";
import * as S from "./Trip.styled";

interface RecommendationProps {
  city: string;
  busy: boolean;
  saveError: string;
  onOpen: () => void;
  onAdd: (ids: string[]) => Promise<boolean>;
}

export default function ServerRecommendedCourses({ city, busy, saveError, onOpen, onAdd }: RecommendationProps) {
  const [courses, setCourses] = useState<CourseSummaryResponse[]>();
  const [selectedCourse, setSelectedCourse] = useState<CourseSummaryResponse>();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void getCourses(city, controller.signal).then(
      (items) => { if (!controller.signal.aborted) setCourses(items); },
      () => { if (!controller.signal.aborted) setFailed(true); },
    );
    return () => controller.abort();
  }, [city, attempt]);

  return (
    <>
      {failed ? (
        <div>
          <S.ErrorText role="alert">추천 코스를 불러오지 못했어요.</S.ErrorText>
          <P.MatchButton type="button" onClick={() => { setFailed(false); setAttempt((current) => current + 1); }}>
            다시 불러오기
          </P.MatchButton>
        </div>
      ) : !courses ? <p role="status">추천 코스를 불러오고 있어요.</p> : (
        <P.PlaceList>
          {courses.length === 0 && <p>이 도시의 추천 코스가 없어요.</p>}
          {courses.map((course) => (
            <P.CourseCard key={course.id}>
              {course.coverImageUrl && <P.RouteImage src={course.coverImageUrl} alt="" loading="lazy" />}
              <h3>{course.title}</h3>
              <p>장소 {course.stopCount}곳</p>
              <button type="button" disabled={busy} onClick={() => { onOpen(); setSelectedCourse(course); }}>
                {course.title} 장소 고르기
              </button>
            </P.CourseCard>
          ))}
        </P.PlaceList>
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
      title={course.title}
      onClose={onClose}
      closeDisabled={busy}
      footer={detail && (
        <S.Primary type="button" disabled={busy || !ids.length} onClick={async () => {
          if (await onAdd(ids)) onClose();
        }}>
          {busy ? "장소를 담고 있어요" : `선택한 장소 ${ids.length}곳 담기`}
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
              <CourseRouteMap places={stops} city={course.city} liveTiles />
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
                      <div><strong>{stop.name}</strong>{stop.visitTime && <p>{stop.visitTime.slice(0, 5)}</p>}</div>
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
