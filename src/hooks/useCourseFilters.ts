import { useState } from "react";
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
function useCourseFilters() {
  const [destination, setDestination] = useState<CourseDestination | null>(
    null,
  );
  const [interest, setInterest] = useState<CourseInterest>("전체");
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const country = destination?.country ?? "일본";
  const cities = mockDestinations.filter((city) => city.country === country);

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
    destinations: mockDestinations,
    recentDestinations: mockRecentDestinations,
    initialDestination: destination ?? cities[0] ?? mockDestinations[0],
    popularCourses: mockPopularCourses.filter(matchesCourse),
    travelerCourses: mockTravelerCourses.filter(matchesCourse),
  };
}
export default useCourseFilters;
