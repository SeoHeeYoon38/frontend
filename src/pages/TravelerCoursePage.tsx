import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
import CourseMapScreen from "../components/traveler-course/CourseMapScreen";
import TravelerPlaceDetail from "../components/traveler-course/TravelerPlaceDetail";
import TravelerAiChat from "../components/traveler-course/TravelerAiChat";
import { PlaceThumbnail } from "../components/common/PlacePhoto";
import * as S from "./TravelerCoursePage.styled";
import { importedTripPath, serverTripPlanPath } from "../utils/navigation";
import { createImportedTrip, saveMockTrip, tripStorageNotice } from "../data/mocks/mockTripService";
import { getCourse, importCourse as importApiCourse } from "../api/courses";
import { isApiEnabled } from "../api/config";
import type { CourseDetailResponse, PlaceCategoryCode } from "../api/types";
import type { TravelerCourseView } from "../types/course";
import useSavedItems from "../hooks/useSavedItems";
import checkIcon from "../assets/icons/status-selected-check.svg";
import chevronIcon from "../assets/icons/nav-chevron-right.svg";
import CourseRouteMap from "../components/course-completion/CourseRouteMap";
import DateRangePicker from "../components/trip/DateRangePicker";
import * as ImportedSheet from "./ImportedTripPage.styled";
import closeIcon from "../assets/icons/action-close.svg";
import { courseImportEndDate, courseImportUncertain } from "../utils/courseImport";
import { ApiError } from "../api/client";
import { courseTitle } from "../api/adapters";

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
  const hero = course.coverImageUrl || cityImage || "";
  const duration = `${course.nightCount}박 ${course.dayCount}일`;
  return {
    id: String(course.id),
    city: course.city,
    duration,
    tags: [...new Set([course.city, duration, ...course.tags])],
    title: courseTitle(course.title),
    author: course.author.name ?? "",
    authorNote: course.author.sourceLabel === "연동 테스트용" ? "" : course.author.sourceLabel ?? "",
    publishedAt: course.author.travelMonth?.replace("-", ". ") ?? "",
    description: course.description ?? "",
    placeCount: course.stopCount,
    transport: course.transportSummary ?? "미정",
    hero,
    authorImage: course.author.imageUrl ?? "",
    routePreview: travelerCourse.routePreview,
    mapFull: travelerCourse.mapFull,
    days: course.days.map((day) => ({
      label: `${day.dayNumber}일차`,
      places: day.stops.map((stop) => ({
        id: stop.placeId,
        name: stop.name,
        category: categoryLabels[stop.category],
        image: stop.imageUrl || hero,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
    })),
  };
}

function TravelerCoursePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const catalogSearch: unknown = location.state?.courseCatalogSearch;
  const settingsSearch: unknown = location.state?.courseSettingsSearch;
  const { courseId } = useParams();
  const apiEnabled = isApiEnabled();
  const liveCourseId = courseId && /^\d+$/.test(courseId) && apiEnabled
    ? Number(courseId)
    : null;
  const [course, setCourse] = useState<TravelerCourseView | undefined>(() =>
    apiEnabled ? undefined : travelerCourse,
  );
  const [serverCoverImageUrl, setServerCoverImageUrl] = useState<string>();
  const [courseDayCount, setCourseDayCount] = useState(0);
  const [loadError, setLoadError] = useState(() => apiEnabled && !liveCourseId ? "코스 주소를 확인해 주세요." : "");
  const [activeDay, setActiveDay] = useState(0);
  const [mapDay, setMapDay] = useState<number>();
  const [placeOrigin, setPlaceOrigin] = useState<"course" | "map">("course");
  const { isCourseSaved, setCourse: setSavedCourse, saveError, coursesLoading, coursesLoadError, pendingId } = useSavedItems();
  const [notice, setNotice] = useState("");
  const [screen, setScreen] = useState<"course" | "map" | "place" | "ai">("course");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [importStartDate, setImportStartDate] = useState("");
  const [importPending, setImportPending] = useState(false);
  const [importError, setImportError] = useState("");
  const [importUncertain, setImportUncertain] = useState(false);
  const importing = useRef(false);
  const detailScroll = useRef(0);

  useLayoutEffect(() => {
    window.scrollTo(0, screen === "course" ? detailScroll.current : 0);
  }, [screen]);

  useEffect(() => {
    if (!liveCourseId) return;
    const controller = new AbortController();
    void getCourse(liveCourseId, controller.signal).then(
      (response) => {
        if (controller.signal.aborted) return;
        setCourse(courseView(response));
        setCourseDayCount(response.dayCount);
        setServerCoverImageUrl(response.coverImageUrl || undefined);
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

  const isSaved = isCourseSaved(course.id);
  const toggleSaved = async () => {
    if (await setSavedCourse(course.id, isSaved ? null : {
      id: course.id,
      title: course.title.replace(/\s+/g, " "),
      durationLabel: course.duration,
      city: course.city,
      placeCount: course.placeCount,
      image: course.hero,
    })) {
      setNotice(isSaved ? "찜한 코스에서 뺐어요" : "찜한 코스에 담았어요");
    } else {
      setNotice("");
    }
  };

  const importCourse = () => {
    if (liveCourseId) {
      if (!importUncertain) {
        setImportStartDate("");
        setImportError("");
      }
      setDateSheetOpen(true);
    } else {
      const trip = createImportedTrip(crypto.randomUUID());
      if (!saveMockTrip(trip)) {
        setNotice(tripStorageNotice);
        return;
      }
      navigate(`${importedTripPath(trip.id)}?toast=course-imported`);
    }
  };

  const submitImport = async () => {
    if (!liveCourseId || !courseImportEndDate(importStartDate, courseDayCount) || importing.current || importUncertain) return;
    importing.current = true;
    setImportPending(true);
    setImportError("");
    try {
      const result = await importApiCourse(liveCourseId, importStartDate);
      if (!Number.isSafeInteger(result.tripId) || result.tripId <= 0) {
        throw new ApiError(502, "IMPORT_RESULT_UNKNOWN", "생성한 여행 주소를 확인하지 못했어요.");
      }
      navigate(serverTripPlanPath("my-trips", String(result.tripId)), {
        replace: true,
        state: { courseImported: true, importedCoverImageUrl: serverCoverImageUrl },
      });
    } catch (reason) {
      if (courseImportUncertain(reason)) {
        setImportUncertain(true);
        setImportError("가져오기 완료 여부를 확인하지 못했어요. 중복 생성을 피하려면 마이트립에서 생성된 여행을 먼저 확인해 주세요.");
      } else {
        setImportError(reason instanceof Error ? reason.message : "코스를 가져오지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      importing.current = false;
      setImportPending(false);
    }
  };

  if (screen === "map") {
    return (
      <CourseMapScreen
        title={`${course.city} ${course.duration}`}
        city={course.city}
        days={course.days.map(({ label, places }) => ({ label, places: places.map((place) => ({ ...place, photoPlaceId: place.id })) }))}
        photoCourseId={liveCourseId ?? undefined}
        sampleMap={liveCourseId ? undefined : course.mapFull}
        activeDay={mapDay}
        onBack={() => setScreen("course")}
        onDayChange={setMapDay}
        onOpenPlace={(place) => {
          setSelectedPlaceId(String(place.id));
          setPlaceOrigin("map");
          setScreen("place");
        }}
      />
    );
  }

  if (screen === "place") {
    return <TravelerPlaceDetail key={selectedPlaceId} place={selectedPlace} city={course.city} photoCourseId={liveCourseId ?? undefined} onBack={() => setScreen(placeOrigin)} onAskAi={() => setScreen("ai")} />;
  }

  if (screen === "ai") {
    return <TravelerAiChat place={selectedPlace} onBack={() => setScreen("place")} />;
  }

  return (
    <S.Shell>
      <S.Hero>
        {course.hero && <img src={course.hero} alt={course.title.replace("\n", " ")} />}
        <S.Navigation aria-label="여행자 코스 탐색">
          <button type="button" aria-label={typeof settingsSearch === "string" ? "코스 설정으로 돌아가기" : "코스 목록으로 돌아가기"} onClick={() => navigate({
            pathname: typeof settingsSearch === "string" ? routes.tripSettings : routes.courses,
            search: typeof settingsSearch === "string" ? settingsSearch : typeof catalogSearch === "string" ? catalogSearch : "",
          })}>
            <img src={backIcon} alt="" />
          </button>
          <strong>여행자 코스</strong>
          <S.Heart type="button" $saved={isSaved} aria-label={isSaved ? "코스 찜 해제" : "코스 찜하기"} disabled={coursesLoading || Boolean(coursesLoadError) || pendingId !== null} onClick={() => { void toggleSaved(); }}>
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
          {(course.author || course.authorImage) && <S.Author>
            {course.authorImage && <img src={course.authorImage} alt="" />}
            <div>
              <strong>{course.author}</strong>
              <small>{[course.authorNote, course.publishedAt].filter(Boolean).join(" · ")}</small>
            </div>
          </S.Author>}
          {course.description && <p>{course.description}</p>}
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
          {day && <S.MapPreview type="button" aria-label={`${day.label} 지도 보기`} onClick={() => {
            detailScroll.current = window.scrollY;
            setMapDay(activeDay);
            setScreen("map");
          }}>
            {liveCourseId ? <CourseRouteMap
              places={day.places.map((place, index) => ({
                id: place.id,
                name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
                order: index + 1,
              }))}
              city={course.city}
              day={activeDay + 1}
              live
            /> : <img src={course.routePreview} alt={`${course.city} 여행 경로 지도`} />}
          </S.MapPreview>}
          <S.PlaceList>
            {day?.places.map((place, index) => (
              <S.PlaceRow key={place.id}>
                <S.Rail><b>{index + 1}</b>{index < day.places.length - 1 && <i />}</S.Rail>
                <S.PlaceContent>
                  <S.PlaceCard type="button" onClick={() => {
                    detailScroll.current = window.scrollY;
                    setSelectedPlaceId(place.id);
                    setPlaceOrigin("course");
                    setScreen("place");
                  }}>
                    {liveCourseId ? <PlaceThumbnail courseId={liveCourseId} placeId={place.id} name={place.name} /> : <img src={place.image} alt="" />}
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
      {notice && <S.Toast role="status">
        <b><img src={checkIcon} alt="" /></b>{notice}
        {notice === "찜한 코스에 담았어요" && <button type="button" onClick={() => navigate(`${routes.savedItems}?tab=courses`)}>
          찜 목록 보기<img src={chevronIcon} alt="" />
        </button>}
      </S.Toast>}
      {saveError && <S.Toast role="alert">{saveError}</S.Toast>}
      {coursesLoadError && <S.Toast role="alert">{coursesLoadError}</S.Toast>}
      {dateSheetOpen && <ImportedSheet.Overlay role="presentation" onMouseDown={() => { if (!importPending) setDateSheetOpen(false); }}>
        <ImportedSheet.Sheet role="dialog" aria-modal="true" aria-labelledby="course-import-date-title" onMouseDown={(event) => event.stopPropagation()}>
          <ImportedSheet.Handle />
          <ImportedSheet.SheetHeader><div>
            <h2 id="course-import-date-title">언제 떠나세요?</h2>
            <p>코스 기간({course.duration})에 맞춰 날짜를 골라주세요</p>
          </div><button type="button" aria-label="닫기" disabled={importPending} onClick={() => setDateSheetOpen(false)}><img src={closeIcon} alt="" /></button></ImportedSheet.SheetHeader>
          <div inert={importPending} aria-busy={importPending}><DateRangePicker
            start={importStartDate}
            end={courseImportEndDate(importStartDate, courseDayCount)}
            onChange={(startDate) => { if (!importing.current) { setImportStartDate(startDate); if (!importUncertain) setImportError(""); } }}
          /></div>
          {importError && <p role="alert">{importError}</p>}
          {importUncertain && <button type="button" onClick={() => navigate(routes.myTrips)}>마이트립에서 확인</button>}
          <ImportedSheet.PrimaryButton type="button" disabled={!courseImportEndDate(importStartDate, courseDayCount) || importPending || importUncertain} onClick={() => void submitImport()}>
            {importPending ? "코스를 가져오고 있어요" : "선택 완료"}
          </ImportedSheet.PrimaryButton>
        </ImportedSheet.Sheet>
      </ImportedSheet.Overlay>}
    </S.Shell>
  );
}

export default TravelerCoursePage;

