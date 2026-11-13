import useCourseFilters from "../hooks/useCourseFilters";
import { courseInterests } from "../config/courseConfig";
import CourseCollections from "../components/courses/CourseCollections";
import RegionSelect from "../components/common/RegionSelect";
import search from "../assets/icons/search-city.svg";
import down from "../assets/icons/nav-chevron-down.svg";
import * as S from "./CoursesPage.styled";

function CoursesPage() {
  const {
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
    recentDestinations,
    initialDestination,
    popularCourses,
    travelerCourses,
    pending,
    error,
  } = useCourseFilters();
  return (
    <>
      <S.Filters>
        <S.Region>
          <p>어디로 떠나볼까요?</p>
          <button
            type="button"
            onClick={() => setIsRegionOpen(true)}
            aria-haspopup="dialog"
          >
            {country}
            <img src={down} alt="" />
          </button>
        </S.Region>
        <S.Cities aria-label="도시 선택">
          <S.City
            type="button"
            $selected={!destination}
            onClick={() => setIsRegionOpen(true)}
            aria-label="도시 검색"
          >
            <S.SearchCircle $selected={!destination}>
              <img src={search} alt="" />
            </S.SearchCircle>
            <span>검색</span>
          </S.City>
          {cities.map((city) => (
            <S.City
              key={city.name}
              type="button"
              $selected={destination?.name === city.name}
              aria-pressed={destination?.name === city.name}
              onClick={() =>
                setDestination(destination?.name === city.name ? null : city)
              }
            >
              <S.CityPhoto
                src={city.image}
                alt=""
                $selected={destination?.name === city.name}
              />
              <span>{city.name}</span>
            </S.City>
          ))}
        </S.Cities>
        <S.Interests aria-label="여행 취향">
          {courseInterests.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === interest}
              onClick={() => setInterest(item)}
            >
              {item}
            </button>
          ))}
        </S.Interests>
      </S.Filters>
      {pending && <p role="status">코스를 불러오고 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      {!pending && !error && (
        <CourseCollections
          key={`${destination?.name ?? country}-${interest}`}
          popularCourses={popularCourses}
          themes={themes}
          travelerCourses={travelerCourses}
        />
      )}
      {isRegionOpen && (
        <RegionSelect
          destinations={destinations}
          recentDestinations={recentDestinations}
          initialDestination={initialDestination}
          onClose={() => setIsRegionOpen(false)}
          onSelect={handleSelectDestination}
        />
      )}
    </>
  );
}
export default CoursesPage;
