import { useEffect, useState } from "react";
import type {
  CourseDestination,
  CourseInterest,
  TravelCourse,
} from "../types/course";
import {
  mockDestinations,
  mockRecentDestinations,
  mockPopularCourses,
  mockTravelerCourses,
  mockCourseThemes,
} from "../data/mocks/courseData";
import { getCities } from "../api/trips";
import { getCourses } from "../api/courses";
import { isApiEnabled } from "../api/config";
import { courseSummaryToTravelCourse } from "../api/adapters";
function useCourseFilters() {
  const [destination, setDestination] = useState<CourseDestination | null>(
    null,
  );
  const [interest, setInterest] = useState<CourseInterest>("전체");
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [destinations, setDestinations] = useState(mockDestinations);
  const [courseCatalog, setCourseCatalog] = useState<TravelCourse[]>([
    ...mockPopularCourses,
    ...mockTravelerCourses,
  ]);
  const [pending, setPending] = useState(isApiEnabled());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isApiEnabled()) return;
    const controller = new AbortController();
    const { signal } = controller;
    void Promise.all([getCities(signal), getCourses(undefined, signal)]).then(
      ([cityRows, courseRows]) => {
        if (signal.aborted) return;
        setDestinations(
          cityRows.map((city) => ({
            name: city.name,
            country: city.country,
            image: mockDestinations.find((item) => item.name === city.name)?.image,
          })),
        );
        setCourseCatalog(courseRows.map(courseSummaryToTravelCourse));
        setError("");
        setPending(false);
      },
      () => {
        if (signal.aborted) return;
        setError("코스 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        setPending(false);
      },
    );
    return () => controller.abort();
  }, []);

  const country = destination?.country ?? "일본";
  const cities = destinations.filter((city) => city.country === country);

  function matchesCourse(course: TravelCourse) {
    const matchesCity = destination
      ? course.city === destination.name
      : course.country === country;
    return (
      matchesCity &&
      (interest === "전체" || course.interests.includes(interest))
    );
  }

  function handleSelectDestination(selected: CourseDestination) {
    setDestination(selected);
    setIsRegionOpen(false);
  }

  const themes = mockCourseThemes.filter(
    (theme) =>
      (destination
        ? theme.cities.includes(destination.name)
        : theme.cities.some((city) =>
            cities.some((item) => item.name === city),
          )) &&
      (interest === "전체" || theme.interest === interest),
  );

  return {
    destination,
    setDestination,
    interest,
    setInterest,
    isRegionOpen,
    setIsRegionOpen,
    country,
    cities,
    themes,
    handleSelectDestination,
    destinations,
    recentDestinations: mockRecentDestinations.filter((recent) =>
      destinations.some((city) => city.name === recent.name),
    ),
    initialDestination: destination ?? cities[0] ?? destinations[0],
    popularCourses: courseCatalog.filter(matchesCourse).slice(0, 3),
    travelerCourses: courseCatalog.filter(matchesCourse).slice(3),
    pending,
    error,
  };
}
export default useCourseFilters;
