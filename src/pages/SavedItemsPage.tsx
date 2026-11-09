import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import backIcon from "../assets/course-settings/back.svg";
import googleMapsLogo from "../assets/images/brand-google-maps.webp";
import AppStatusBar from "../components/common/AppStatusBar";
import { routes } from "../config/routes";
import {
  myProfile,
  savedCourses,
  savedPlaces,
  savedRegions,
} from "../data/mocks/myData";
import type { SavedRegion } from "../types/my";
import * as S from "./SavedItemsPage.styled";

type SavedTab = "places" | "courses";

interface BookmarkButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function BookmarkButton({ active, label, onClick }: BookmarkButtonProps) {
  return (
    <S.BookmarkButton type="button" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 22 22" aria-hidden="true">
        <path
          d="M5.2 3.1c0-.8.7-1.5 1.5-1.5h8.6c.8 0 1.5.7 1.5 1.5v16.1L11 15.4l-5.8 3.8V3.1Z"
          fill={active ? "#090738" : "none"}
          stroke="#090738"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </S.BookmarkButton>
  );
}

function SavedItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") === "courses" ? "courses" : "places") as SavedTab;
  const [region, setRegion] = useState<SavedRegion>("전체");
  const [unsaved, setUnsaved] = useState<Set<string>>(() => new Set());

  const filteredPlaces = useMemo(
    () => savedPlaces.filter((place) => region === "전체" || place.city === region),
    [region],
  );
  const filteredCourses = useMemo(
    () => savedCourses.filter((course) => region === "전체" || course.city === region),
    [region],
  );

  const selectTab = (nextTab: SavedTab) => {
    setSearchParams(nextTab === "courses" ? { tab: "courses" } : { tab: "places" });
  };

  const toggleBookmark = (id: string) => {
    setUnsaved((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isPlaces = tab === "places";
  const visibleCount = isPlaces
    ? region === "전체"
      ? `${myProfile.savedPlaceCount}곳`
      : `${filteredPlaces.length}곳`
    : region === "전체"
      ? `${myProfile.savedCourseCount}개`
      : `${filteredCourses.length}개`;

  return (
    <S.Page>
      <AppStatusBar />
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
          장소 <b>{myProfile.savedPlaceCount}</b>
        </button>
        <button
          type="button"
          aria-pressed={!isPlaces}
          onClick={() => selectTab("courses")}
        >
          코스 <b>{myProfile.savedCourseCount}</b>
        </button>
      </S.Tabs>

      <S.Content>
        <S.RegionFilters aria-label="지역 필터">
          {savedRegions.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={region === item}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </S.RegionFilters>

        <S.ListHeader>
          <strong>
            {region} {visibleCount}
          </strong>
          <span>최근 저장순 {isPlaces && "⌄"}</span>
        </S.ListHeader>

        {isPlaces ? (
          <S.List aria-label="저장한 장소">
            {filteredPlaces.map((place) => (
              <S.PlaceRow key={place.id}>
                <img src={place.image} alt="" />
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
                  active={!unsaved.has(place.id)}
                  label={`${place.name} 저장 ${unsaved.has(place.id) ? "추가" : "해제"}`}
                  onClick={() => toggleBookmark(place.id)}
                />
              </S.PlaceRow>
            ))}
          </S.List>
        ) : (
          <S.List aria-label="저장한 코스">
            {filteredCourses.map((course) => (
              <S.CourseRow key={course.id}>
                <img src={course.image} alt="" />
                <S.ItemText>
                  <em>{course.durationLabel}</em>
                  <strong>{course.title}</strong>
                  <span>
                    {course.city} <i /> 장소 {course.placeCount}곳
                  </span>
                </S.ItemText>
                <BookmarkButton
                  active={!unsaved.has(course.id)}
                  label={`${course.title} 저장 ${unsaved.has(course.id) ? "추가" : "해제"}`}
                  onClick={() => toggleBookmark(course.id)}
                />
              </S.CourseRow>
            ))}
          </S.List>
        )}

        {(isPlaces ? filteredPlaces.length : filteredCourses.length) === 0 && (
          <S.Empty>해당 지역에 저장한 항목이 없어요.</S.Empty>
        )}
      </S.Content>
    </S.Page>
  );
}

export default SavedItemsPage;
