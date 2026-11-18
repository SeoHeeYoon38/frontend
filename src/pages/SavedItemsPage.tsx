import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import backIcon from "../assets/course-settings/back.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import bookmarkOn from "../assets/my/bookmark-on.svg";
import bookmarkOff from "../assets/icons/nav-bookmark.svg";
import sortChevron from "../assets/my/sort-chevron.svg";
import emptyPin from "../assets/direct-trip/empty-pin.svg";
import { PlaceThumbnail } from "../components/common/PlacePhoto";
import { isApiEnabled } from "../api/config";
import { getCourse } from "../api/courses";
import { routes } from "../config/routes";
import { savedRegions } from "../data/mocks/myData";
import useSavedItems from "../hooks/useSavedItems";
import type { SavedCourse } from "../types/my";
import * as S from "./SavedItemsPage.styled";

type SavedTab = "places" | "courses";

interface BookmarkButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function BookmarkButton({ active, label, onClick, disabled }: BookmarkButtonProps) {
  return (
    <S.BookmarkButton type="button" aria-label={label} onClick={onClick} disabled={disabled}>
      <img src={active ? bookmarkOn : bookmarkOff} alt="" />
    </S.BookmarkButton>
  );
}

function CourseThumbnail({ course }: { course: SavedCourse }) {
  const preview = useRef<HTMLSpanElement>(null);
  const [brokenCover, setBrokenCover] = useState(false);
  const [placeId, setPlaceId] = useState<string>();
  const courseId = Number(course.id);
  const hasCover = Boolean(course.image && !brokenCover);

  useEffect(() => {
    if (hasCover || !Number.isSafeInteger(courseId) || courseId <= 0 || !isApiEnabled()) return;
    const controller = new AbortController();
    const load = () => {
      void getCourse(courseId, controller.signal).then(({ days }) => {
        if (!controller.signal.aborted) setPlaceId(days.find((day) => day.stops.length)?.stops[0]?.placeId);
      }).catch(() => {});
    };
    const element = preview.current;
    const observer = element && typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer?.disconnect();
      load();
    }) : undefined;
    if (element && observer) observer.observe(element);
    else load();
    return () => { observer?.disconnect(); controller.abort(); };
  }, [courseId, hasCover]);

  if (hasCover) return <img src={course.image} alt="" loading="lazy" onError={() => setBrokenCover(true)} />;
  if (placeId) return <PlaceThumbnail placeId={placeId} courseId={courseId} name={course.title}
    placeholder={<img src={emptyPin} width={22} height={22} alt="" />} />;
  return <S.ImageFallback ref={preview}><img src={emptyPin} alt="" /></S.ImageFallback>;
}

function SavedItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") === "courses" ? "courses" : "places") as SavedTab;
  const [region, setRegion] = useState("전체");
  const {
    places, courses, setPlace, setCourse, saveError, pendingId,
    placesLoading, coursesLoading, placesLoadError, coursesLoadError,
  } = useSavedItems();
  const loading = tab === "places" ? placesLoading : coursesLoading;
  const loadError = tab === "places" ? placesLoadError : coursesLoadError;
  const isPlaces = tab === "places";
  const regions = new Set([
    ...(isApiEnabled() ? ["전체"] : savedRegions),
    ...(isPlaces ? places : courses).map((item) => item.city),
  ]);
  const activeRegion = regions.has(region) ? region : "전체";
  const filteredPlaces = places.filter((place) => activeRegion === "전체" || place.city === activeRegion);
  const filteredCourses = courses.filter((course) => activeRegion === "전체" || course.city === activeRegion);

  const selectTab = (nextTab: SavedTab) => {
    setRegion("전체");
    setSearchParams(nextTab === "courses" ? { tab: "courses" } : { tab: "places" });
  };

  const visibleCount = isPlaces ? `${filteredPlaces.length}곳` : `${filteredCourses.length}개`;

  return (
    <S.Page>
      <S.Header>
        <Link to={routes.my} aria-label="마이 화면으로 돌아가기">
          <img src={backIcon} alt="" />
        </Link>
        <h1>저장한 장소와 코스</h1>
      </S.Header>

      <S.Tabs aria-label="저장 목록 분류">
        <button
          type="button"
          aria-pressed={isPlaces}
          onClick={() => selectTab("places")}
        >
          장소 <b>{placesLoading ? "…" : places.length}</b>
        </button>
        <button
          type="button"
          aria-pressed={!isPlaces}
          onClick={() => selectTab("courses")}
        >
          코스 <b>{coursesLoading ? "…" : courses.length}</b>
        </button>
      </S.Tabs>

      <S.Content>
        {saveError && <p role="alert">{saveError}</p>}
        {loadError && <p role="alert">{loadError}</p>}
        <S.RegionFilters aria-label="지역 필터">
          {[...regions].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={activeRegion === item}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </S.RegionFilters>

        <S.ListHeader>
          <strong>
            {activeRegion} {visibleCount}
          </strong>
          <span>최근 저장순 {isPlaces && <img src={sortChevron} alt="" />}</span>
        </S.ListHeader>

        {loading ? <S.Empty role="status">저장 목록을 불러오고 있어요.</S.Empty> : isPlaces ? (
          <S.List aria-label="저장한 장소">
            {filteredPlaces.map((place) => (
              <S.PlaceRow key={place.id}>
                {place.placeId ? (
                  <PlaceThumbnail placeId={place.placeId} name={place.name} />
                ) : place.image ? (
                  <img src={place.image} alt="" />
                ) : (
                  <S.ImageFallback><img src={emptyPin} alt="" /></S.ImageFallback>
                )}
                <S.ItemText>
                  <strong>{place.name}</strong>
                  <span>
                    {place.city} <i /> {place.category}
                  </span>
                  <small data-google={place.source.startsWith("Google") || undefined}>
                    {place.source.startsWith("Google") && (
                      <img src={googleMapsLogo} alt="" />
                    )}
                    {place.source}
                  </small>
                </S.ItemText>
                <BookmarkButton
                  active
                  label={`${place.name} 저장 해제`}
                  disabled={pendingId !== null}
                  onClick={() => { void setPlace(place.id, null); }}
                />
              </S.PlaceRow>
            ))}
          </S.List>
        ) : (
          <S.List aria-label="저장한 코스">
            {filteredCourses.map((course) => (
              <S.CourseRow key={course.id}>
                <CourseThumbnail key={course.image} course={course} />
                <S.ItemText>
                  <em>{course.durationLabel}</em>
                  <Link to={routes.courseDetail.replace(":courseId", course.id)}><strong>{course.title}</strong></Link>
                  <span>
                    {course.city} <i /> 장소 {course.placeCount}곳
                  </span>
                </S.ItemText>
                <BookmarkButton
                  active
                  label={`${course.title} 저장 해제`}
                  disabled={pendingId !== null}
                  onClick={() => { void setCourse(course.id, null); }}
                />
              </S.CourseRow>
            ))}
          </S.List>
        )}

        {!loading && !loadError && (isPlaces ? filteredPlaces.length : filteredCourses.length) === 0 && (
          <S.Empty>
            {activeRegion !== "전체" ? "이 지역에 저장한 항목이 없어요."
              : isPlaces ? "아직 저장한 장소가 없어요." : "아직 저장한 코스가 없어요."}
            {!isPlaces && activeRegion === "전체" && <S.BrowseLink to={routes.courses}>코스 둘러보기</S.BrowseLink>}
          </S.Empty>
        )}
      </S.Content>
    </S.Page>
  );
}

export default SavedItemsPage;
