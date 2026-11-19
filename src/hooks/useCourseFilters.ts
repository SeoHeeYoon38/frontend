import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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
} from "../data/mocks/courseData";
import { getCities } from "../api/trips";
import { getCourses } from "../api/courses";
import { isApiEnabled } from "../api/config";
import { courseSummaryToTravelCourse } from "../api/adapters";
import { courseInterests, courseThemes } from "../config/courseConfig";

const recentDestinationsKey = "dotlo:recent-course-destinations";

function readRecentDestinations(): string[] {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(recentDestinationsKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((key): key is string => typeof key === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
}

function useCourseFilters() {
  const [params, setParams] = useSearchParams();
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const liveCourses = isApiEnabled();
  const [destinations, setDestinations] = useState<CourseDestination[]>(() =>
    liveCourses ? [] : mockDestinations,
  );
  const [courseCatalog, setCourseCatalog] = useState<TravelCourse[]>(() =>
    liveCourses ? [] : [...mockPopularCourses, ...mockTravelerCourses],
  );
  const [pending, setPending] = useState(liveCourses);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [recentKeys, setRecentKeys] = useState(readRecentDestinations);

  useEffect(() => {
    try { sessionStorage.setItem(recentDestinationsKey, JSON.stringify(recentKeys)); } catch { /* session storage can be unavailable */ }
  }, [recentKeys]);

  useEffect(() => {
    if (!liveCourses) return;
    const controller = new AbortController();
    const { signal } = controller;
    void Promise.allSettled([getCities(signal), getCourses(undefined, signal)]).then(
      ([citiesResult, coursesResult]) => {
        if (signal.aborted) return;
        if (citiesResult.status === "fulfilled") {
          setDestinations(citiesResult.value.map((city) => ({
            name: city.name,
            country: city.country,
            image: mockDestinations.find((item) => item.name === city.name)?.image,
          })));
        }
        if (coursesResult.status === "fulfilled") {
          setCourseCatalog(coursesResult.value.map(courseSummaryToTravelCourse));
        }
        setError(coursesResult.status === "rejected"
          ? "코스 정보를 불러오지 못했어요."
          : citiesResult.status === "rejected" ? "지원 도시 목록을 불러오지 못했어요." : "");
        setPending(false);
      },
    );
    return () => controller.abort();
  }, [attempt, liveCourses]);

  // Catalog cities may be outside the set supported by new trip creation.
  const regions = new Map(destinations.map((city) => [`${city.country}:${city.name}`, city]));
  for (const course of courseCatalog) {
    const key = `${course.country}:${course.city}`;
    if (!regions.has(key)) {
      const image = course.image || mockDestinations.find((city) => city.name === course.city && city.country === course.country)?.image;
      regions.set(key, { name: course.city, country: course.country, image });
    }
  }
  const allDestinations = [...regions.values()];
  const requestedCountry = params.get("country") || "일본";
  const country = allDestinations.some((city) => city.country === requestedCountry)
    ? requestedCountry : allDestinations[0]?.country ?? requestedCountry;
  const cities = allDestinations.filter((city) => city.country === country);
  const destination = cities.find((city) => city.name === params.get("city")) ?? null;
  const requestedInterest = params.get("interest");
  const interest = courseInterests.find((item) => item === requestedInterest) ?? "전체";

  function setDestination(selected: CourseDestination | null) {
    if (selected) {
      const key = `${selected.country}:${selected.name}`;
      setRecentKeys((current) => [key, ...current.filter((item) => item !== key)].slice(0, 3));
    }
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("country", selected?.country ?? country);
      if (selected) next.set("city", selected.name);
      else next.delete("city");
      return next;
    }, { replace: true });
  }

  function setInterest(selected: CourseInterest) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (selected === "전체") next.delete("interest");
      else next.set("interest", selected);
      return next;
    }, { replace: true });
  }

  function matchesCourse(course: TravelCourse) {
    const matchesCity = course.country === country && (!destination || course.city === destination.name);
    return (
      matchesCity &&
      (interest === "전체" || course.interests.includes(interest))
    );
  }

  function handleSelectDestination(selected: CourseDestination) {
    setDestination(selected);
    setIsRegionOpen(false);
  }

  const themes = courseThemes.filter(
    (theme) =>
      (destination
        ? theme.cities.includes(destination.name)
        : theme.cities.some((city) =>
            cities.some((item) => item.name === city),
          )) &&
      (interest === "전체" || theme.interest === interest),
  );
  const matchingCourses = courseCatalog.filter(matchesCourse);

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
    destinations: allDestinations,
    recentDestinations: liveCourses ? recentKeys.flatMap((key) => {
      const region = regions.get(key);
      return region ? [region] : [];
    }) : mockRecentDestinations,
    initialDestination: destination ?? cities[0] ?? destinations[0],
    popularCourses: liveCourses ? [] : mockPopularCourses.filter(matchesCourse),
    travelerCourses: liveCourses ? matchingCourses : mockTravelerCourses.filter(matchesCourse),
    pending,
    error,
    retry: () => { setError(""); setPending(true); setAttempt((current) => current + 1); },
  };
}
export default useCourseFilters;
