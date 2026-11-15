import { useState } from "react";
import { savedCourses, savedPlaces } from "../data/mocks/myData";
import type { SavedCourse, SavedPlace } from "../types/my";

const storageKey = "dotlo:saved-items:v1";
type Changes = {
  places: Record<string, SavedPlace | null>;
  courses: Record<string, SavedCourse | null>;
};

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
  const [changes, setChanges] = useState<Changes>(() => {
    try {
      return readChanges();
    } catch {
      return { places: {}, courses: {} };
    }
  });
  const [saveError, setSaveError] = useState("");

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

  const courses = mergeItems(savedCourses, changes.courses);

  return {
    places: mergeItems(savedPlaces, changes.places),
    courses,
    isCourseSaved: (id: string) => {
      if (courses.some((course) => course.id === id)) return true;
      if (Object.hasOwn(changes.courses, id)) return false;
      try {
        return localStorage.getItem(`dotlo:saved-traveler-course:${id}`) === "true";
      } catch {
        return false;
      }
    },
    saveError,
    setPlace: (id: string, place: SavedPlace | null) => save("places", id, place),
    setCourse: (id: string, course: SavedCourse | null) => save("courses", id, course),
  };
}
