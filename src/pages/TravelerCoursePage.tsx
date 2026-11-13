import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import backIcon from "../assets/figma/traveler-back.svg";
import calendarIcon from "../assets/figma/traveler-calendar.svg";
import heartIcon from "../assets/figma/traveler-heart.svg";
import heartFilledIcon from "../assets/figma/traveler-heart-filled.svg";
import pinIcon from "../assets/figma/traveler-pin.svg";
import trainIcon from "../assets/figma/traveler-train.svg";
import walkIcon from "../assets/figma/traveler-walk.svg";
import { routes } from "../config/routes";
import { travelerCourse } from "../data/mocks/travelerCourseData";
import { mockTripCities } from "../data/mocks/tripData";
import TravelerCourseMap from "../components/traveler-course/TravelerCourseMap";
import TravelerPlaceDetail from "../components/traveler-course/TravelerPlaceDetail";
import * as S from "./TravelerCoursePage.styled";
import { importedTripPath } from "../utils/navigation";
import { createImportedTrip, saveMockTrip, tripStorageNotice } from "../data/mocks/mockTripService";
import { getCourse } from "../api/courses";
import { isApiEnabled } from "../api/config";
import type { CourseDetailResponse, PlaceCategoryCode } from "../api/types";
import type { TravelerCourseView } from "../types/course";

const categoryLabels: Record<PlaceCategoryCode, string> = {
  FOOD: "맛집",
  CAFE: "카페",
  SIGHTSEEING: "명소",
  SHOPPING: "쇼핑",
  NATURE: "자연",
  CULTURE: "문화",
  NIGHTLIFE: "야경",
  ACTIVITY: "액티비티",
  OTHER: "기타",
};

function courseView(course: CourseDetailResponse): TravelerCourseView {
  const cityImage = mockTripCities.find((item) => item.name === course.city)?.image;
  const hero = course.coverImageUrl || cityImage || travelerCourse.hero;
  return {
    id: String(course.id),
    city: course.city,
    duration: `${course.nightCount}박 ${course.dayCount}일`,
    tags: course.tags,
    title: course.title,
    author: course.author.name,
    authorNote: course.author.sourceLabel,
    publishedAt: course.author.travelMonth?.replace("-", ". ") ?? "",
    description: course.description,
    placeCount: course.stopCount,
    transport: course.transportSummary,
    hero,
    authorImage: course.author.imageUrl || travelerCourse.authorImage,
    routePreview: travelerCourse.routePreview,
    mapFull: travelerCourse.mapFull,
    days: course.days.map((day) => ({
      label: `${day.dayNumber}일차`,
      places: day.stops.map((stop) => ({
        id: stop.placeId,
        name: stop.name,
        category: categoryLabels[stop.category],
        image: stop.imageUrl || hero,
      })),
    })),
  };
}

function readSavedState(courseId: string) {
  try {
    return localStorage.getItem(`dotlo:saved-traveler-course:${courseId}`) === "true";
  } catch {
    return false;
  }
}

function TravelerCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const liveCourseId = courseId && /^\d+$/.test(courseId) && isApiEnabled()
    ? Number(courseId)
    : null;
  const [course, setCourse] = useState<TravelerCourseView | undefined>(() =>
    liveCourseId ? undefined : travelerCourse,
  );
  const [loadError, setLoadError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [isSaved, setIsSaved] = useState(() =>
    readSavedState(courseId ?? travelerCourse.id),
  );
  const [notice, setNotice] = useState("");
  const [screen, setScreen] = useState<"course" | "map" | "place">("course");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();

  useEffect(() => {
    if (!liveCourseId) return;
    const controller = new AbortController();
    void getCourse(liveCourseId, controller.signal).then(
      (response) => {
        if (controller.signal.aborted) return;
        setCourse(courseView(response));
        setActiveDay(0);
        setLoadError("");
      },
      () => {
        if (!controller.signal.aborted) {
          setLoadError("코스 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        }
      },
    );
    return () => controller.abort();
  }, [liveCourseId]);

  if (!course) {
    return (
      <S.Shell>
        <S.Content>
          <p role={loadError ? "alert" : "status"}>
            {loadError || "코스를 불러오고 있어요."}
          </p>
        </S.Content>
      </S.Shell>
    );
  }

  const day = course.days[activeDay];
  const selectedPlace = course.days
    .flatMap((item) => item.places)
    .find((place) => place.id === selectedPlaceId);

  const toggleSaved = () => {
    const next = !isSaved;
    setIsSaved(next);
    setNotice(next ? "찜한 코스에 담았어요" : "찜한 코스에서 뺐어요");
    try {
      localStorage.setItem(`dotlo:saved-traveler-course:${course.id}`, String(next));
    } catch {
      // 저장소를 사용할 수 없어도 목업 화면은 계속 동작합니다.
    }
  };

  const importCourse = () => {
    if (liveCourseId) {
      setNotice("코스 담기 API가 준비되면 연결할 예정이에요.");
      return;
    }
    const trip = createImportedTrip(crypto.randomUUID());
    if (!saveMockTrip(trip)) {
      setNotice(tripStorageNotice);
      return;
    }
    navigate(`${importedTripPath(trip.id)}?toast=course-imported`);
  };

  if (screen === "map") {
    return (
      <TravelerCourseMap
        course={course}
        activeDay={activeDay}
        onBack={() => setScreen("course")}
        onDayChange={setActiveDay}
        onOpenPlace={(placeId) => {
          setSelectedPlaceId(placeId);
          setScreen("place");
        }}
      />
    );
  }

  if (screen === "place") {
    return <TravelerPlaceDetail place={selectedPlace} city={course.city} onBack={() => setScreen("map")} />;
  }

  return (
    <S.Shell>
      <S.Hero>
        <img src={course.hero} alt={course.title.replace("\n", " ")} />
        <S.Navigation aria-label="여행자 코스 탐색">
          <button type="button" aria-label="코스 목록으로 돌아가기" onClick={() => navigate(routes.courses)}>
            <img src={backIcon} alt="" />
          </button>
          <strong>여행자 코스</strong>
          <S.Heart type="button" $saved={isSaved} aria-label={isSaved ? "코스 찜 해제" : "코스 찜하기"} onClick={toggleSaved}>
            <img src={isSaved ? heartFilledIcon : heartIcon} alt="" />
          </S.Heart>
        </S.Navigation>
      </S.Hero>

      <S.Content>
        <S.Intro>
          <div>
            <S.Tags>
              {course.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </S.Tags>
            <h1>{course.title}</h1>
          </div>
          <S.Author>
            <img src={course.authorImage} alt="" />
            <div>
              <strong>{course.author}</strong>
              <small>{course.authorNote}　|　{course.publishedAt}</small>
            </div>
          </S.Author>
          <p>{course.description}</p>
        </S.Intro>

        <S.Facts aria-label="코스 요약">
          <div><img src={calendarIcon} alt="" /><strong>{course.duration}</strong><span>여행 기간</span></div>
          <div><img src={pinIcon} alt="" /><strong>{course.placeCount}곳</strong><span>방문 장소</span></div>
          <div><img src={trainIcon} alt="" /><strong>{course.transport}</strong><span>이동 방법</span></div>
        </S.Facts>

        <S.Days>
          <S.SectionHeading><h2>일차별 코스</h2><span>전체 {course.placeCount}곳</span></S.SectionHeading>
          <S.DayTabs role="tablist" aria-label="여행 일차">
            {course.days.map((item, index) => (
              <button key={item.label} type="button" role="tab" aria-selected={activeDay === index} onClick={() => setActiveDay(index)}>
                {item.label}
              </button>
            ))}
          </S.DayTabs>
          <S.MapPreview type="button" aria-label={`${day.label} 지도 전체 보기`} onClick={() => setScreen("map")}>
            <img src={course.routePreview} alt={`${course.city} 여행 경로 지도`} />
            <span>지도 크게 보기</span>
          </S.MapPreview>
          <S.PlaceList>
            {day.places.map((place, index) => (
              <S.PlaceRow key={place.id}>
                <S.Rail><b>{index + 1}</b>{index < day.places.length - 1 && <i />}</S.Rail>
                <S.PlaceContent>
                  <S.PlaceCard type="button" onClick={() => { setSelectedPlaceId(place.id); setScreen("place"); }}>
                    <img src={place.image} alt="" />
                    <span><strong>{place.name}</strong><small>{place.category}</small></span>
                  </S.PlaceCard>
                  {place.travelTime && <S.Move><img src={walkIcon} alt="" />{place.travelTime}<span>{place.distance}</span></S.Move>}
                </S.PlaceContent>
              </S.PlaceRow>
            ))}
          </S.PlaceList>
        </S.Days>
      </S.Content>

      <S.Cta><button type="button" onClick={importCourse}>내 일정으로 가져오기</button></S.Cta>
      {notice && <S.Toast role="status"><b>✓</b>{notice}</S.Toast>}
    </S.Shell>
  );
}

export default TravelerCoursePage;

