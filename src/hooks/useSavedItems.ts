import { useEffect, useState } from "react";
import { apiMode, isApiEnabled } from "../api/config";
import { hasAuthSession } from "../api/tokenStorage";
import { bookmarkCourse, getCourseBookmarks, unbookmarkCourse } from "../api/courses";
import { deleteSavedPlace, getMySavedPlaces } from "../api/places";
import type { CourseSummaryResponse, MySavedPlaceResponse, PlaceCategoryCode, PlaceSource } from "../api/types";
import { savedCourses, savedPlaces } from "../data/mocks/myData";
import type { SavedCourse, SavedPlace } from "../types/my";

const storageKey = "dotlo:saved-items:v1";
type Changes = {
  places: Record<string, SavedPlace | null>;
  courses: Record<string, SavedCourse | null>;
};

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

const sourceLabels: Record<PlaceSource, SavedPlace["source"]> = {
  TAKEOUT: "Google Maps에서 가져옴",
  SHARED_LINK: "Google Maps에서 가져옴",
  MANUAL_SEARCH: "직접 저장",
  AI_RECOMMEND: "AI 추천에서 저장",
  POPULAR: "인기 코스에서 저장",
};

function toSavedPlace({ trip, place }: MySavedPlaceResponse): SavedPlace {
  return {
    id: `${trip.id}:${place.id}`,
    tripId: trip.id,
    savedPlaceId: place.id,
    placeId: place.placeId,
    name: place.name,
    city: trip.city,
    category: place.category ? categoryLabels[place.category] : "기타",
    source: sourceLabels[place.source],
    image: "",
  };
}

function toSavedCourse(course: CourseSummaryResponse): SavedCourse {
  return {
    id: String(course.id),
    title: course.title,
    durationLabel: `${course.nightCount}박 ${course.dayCount}일`,
    city: course.city,
    placeCount: course.stopCount,
    image: course.coverImageUrl ?? "",
  };
}

function readChanges(): Changes {
  const raw = localStorage.getItem(storageKey);
  if (raw) return JSON.parse(raw) as Changes;

  const courses: Changes["courses"] = {};
  for (const course of savedCourses) {
    if (localStorage.getItem(`dotlo:saved-traveler-course:${course.id}`) === "false") {
      courses[course.id] = null;
    }
  }
  return { places: {}, courses };
}

function mergeItems<T extends { id: string }>(initial: T[], changes: Record<string, T | null>) {
  const items = new Map(initial.map((item) => [item.id, item]));
  for (const [id, item] of Object.entries(changes)) {
    if (item) items.set(id, item);
    else items.delete(id);
  }
  return [...items.values()];
}

export default function useSavedItems() {
  const [live] = useState(() => apiMode === "live" || (isApiEnabled() && hasAuthSession()));
  const [changes, setChanges] = useState<Changes>(() => {
    try {
      return readChanges();
    } catch {
      return { places: {}, courses: {} };
    }
  });
  const [livePlaces, setLivePlaces] = useState<SavedPlace[]>([]);
  const [liveCourses, setLiveCourses] = useState<SavedCourse[]>([]);
  const [placesLoading, setPlacesLoading] = useState(live);
  const [coursesLoading, setCoursesLoading] = useState(live);
  const [placesLoadError, setPlacesLoadError] = useState("");
  const [coursesLoadError, setCoursesLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    void getMySavedPlaces(controller.signal).then(
      (places) => {
        if (controller.signal.aborted) return;
        setLivePlaces(places.map(toSavedPlace));
        setPlacesLoadError("");
        setPlacesLoading(false);
      },
      () => {
        if (controller.signal.aborted) return;
        setPlacesLoadError("저장한 장소를 불러오지 못했어요. 잠시 후 다시 열어 주세요.");
        setPlacesLoading(false);
      },
    );
    void getCourseBookmarks(controller.signal).then(
      (courses) => {
        if (controller.signal.aborted) return;
        setLiveCourses(courses.map(toSavedCourse));
        setCoursesLoadError("");
        setCoursesLoading(false);
      },
      () => {
        if (controller.signal.aborted) return;
        setCoursesLoadError("저장한 코스를 불러오지 못했어요. 잠시 후 다시 열어 주세요.");
        setCoursesLoading(false);
      },
    );
    return () => controller.abort();
  }, [live]);

  function save<T extends keyof Changes>(kind: T, id: string, value: Changes[T][string]) {
    try {
      const current = readChanges();
      const next = { ...current, [kind]: { ...current[kind], [id]: value } };
      localStorage.setItem(storageKey, JSON.stringify(next));
      setChanges(next);
      setSaveError("");
      return true;
    } catch {
      setSaveError("저장 상태를 변경하지 못했어요. 다시 시도해 주세요.");
      return false;
    }
  }

  const courses = live ? liveCourses : mergeItems(savedCourses, changes.courses);
  const places = live ? livePlaces : mergeItems(savedPlaces, changes.places);

  async function setPlace(id: string, place: SavedPlace | null) {
    if (!live) return save("places", id, place);
    if (pendingId || placesLoading || placesLoadError) return false;
    const target = livePlaces.find((item) => item.id === id);
    if (place || !target?.tripId || !target.savedPlaceId) {
      setSaveError("이 장소를 저장할 여행을 먼저 선택해 주세요.");
      return false;
    }
    setPendingId(id);
    try {
      await deleteSavedPlace(target.tripId, target.savedPlaceId);
      setLivePlaces((current) => current.filter((item) => item.id !== id));
      setSaveError("");
      return true;
    } catch {
      setSaveError("장소 저장을 해제하지 못했어요. 다시 시도해 주세요.");
      return false;
    } finally {
      setPendingId(null);
    }
  }

  async function setCourse(id: string, course: SavedCourse | null) {
    if (!live) return save("courses", id, course);
    if (pendingId || coursesLoading || coursesLoadError) return false;
    const courseId = Number(id);
    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      setSaveError("이 코스는 서버에 저장할 수 없어요.");
      return false;
    }
    setPendingId(id);
    try {
      if (course) {
        await bookmarkCourse(courseId);
        setLiveCourses((current) => current.some((item) => item.id === id) ? current : [course, ...current]);
      } else {
        await unbookmarkCourse(courseId);
        setLiveCourses((current) => current.filter((item) => item.id !== id));
      }
      setSaveError("");
      return true;
    } catch {
      setSaveError("코스 저장 상태를 변경하지 못했어요. 다시 시도해 주세요.");
      return false;
    } finally {
      setPendingId(null);
    }
  }

  return {
    places,
    courses,
    placesLoading,
    coursesLoading,
    placesLoadError,
    coursesLoadError,
    pendingId,
    isCourseSaved: (id: string) => {
      if (courses.some((course) => course.id === id)) return true;
      if (live || Object.hasOwn(changes.courses, id)) return false;
      try {
        return localStorage.getItem(`dotlo:saved-traveler-course:${id}`) === "true";
      } catch {
        return false;
      }
    },
    saveError,
    setPlace,
    setCourse,
  };
}
