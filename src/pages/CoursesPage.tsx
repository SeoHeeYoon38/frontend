import useCourseFilters from "../hooks/useCourseFilters";
import { courseInterests } from "../config/courseConfig";
import CourseCollections from "../components/courses/CourseCollections";
import RegionSelect from "../components/common/RegionSelect";
import pin from "../assets/icons/field-location.svg";
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
    retry,
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
            disabled={!initialDestination}
          >
            {country}
            <img src={down} alt="" />
          </button>
        </S.Region>
        <S.Cities aria-label="도시 선택">
          <S.City
            type="button"
            $selected={!destination}
            onClick={() => setDestination(null)}
            aria-pressed={!destination}
            disabled={!cities.length}
          >
            <S.CityGroup $selected={!destination} $single={cities.length === 1}>
              {cities.slice(0, 4).map((city) => city.image ? <img key={city.name} src={city.image} alt="" /> : <img key={city.name} className="city-placeholder" src={pin} alt="" />)}
            </S.CityGroup>
            <span>전체</span>
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
              {city.image ? <S.CityPhoto src={city.image} alt="" $selected={destination?.name === city.name} /> : (
                <S.CityGroup $selected={destination?.name === city.name} $single><img className="city-placeholder" src={pin} alt="" /></S.CityGroup>
              )}
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
      {error && <S.LoadMessage role="alert">{error}<button type="button" onClick={retry}>다시 시도</button></S.LoadMessage>}
      {!pending && (!error || travelerCourses.length > 0) && (
        <CourseCollections
          key={`${destination?.name ?? country}-${interest}`}
          popularCourses={popularCourses}
          themes={themes}
          travelerCourses={travelerCourses}
          region={destination?.name ?? country}
        />
      )}
      {isRegionOpen && initialDestination && (
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
