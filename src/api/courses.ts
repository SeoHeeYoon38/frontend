import { apiRequest, queryString } from "./client";
import type { CourseDetailResponse, CourseSummaryResponse, ItineraryVersionView } from "./types";

export function getCourses(city?: string, signal?: AbortSignal) {
  return apiRequest<CourseSummaryResponse[]>(
    `/api/courses${queryString({ city })}`,
    { auth: false, signal },
  );
}

export function getCourse(courseId: number, signal?: AbortSignal) {
  return apiRequest<CourseDetailResponse>(`/api/courses/${courseId}`, {
    auth: false,
    signal,
  });
}

export function getCourseBookmarks(signal?: AbortSignal) {
  return apiRequest<CourseSummaryResponse[]>("/api/courses/bookmarks", { signal });
}

export function bookmarkCourse(courseId: number, signal?: AbortSignal) {
  return apiRequest<void>(`/api/courses/${courseId}/bookmark`, {
    method: "POST",
    signal,
  });
}

export function unbookmarkCourse(courseId: number, signal?: AbortSignal) {
  return apiRequest<void>(`/api/courses/${courseId}/bookmark`, {
    method: "DELETE",
    signal,
  });
}

export function importCourse(courseId: number, startDate: string) {
  return apiRequest<{ tripId: number; itinerary: ItineraryVersionView }>(`/api/courses/${courseId}/import`, {
    method: "POST",
    json: { startDate },
    timeoutMs: 180_000,
  });
}

