import { apiRequest, queryString } from "./client";
import type { CourseDetailResponse, CourseSummaryResponse } from "./types";

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

