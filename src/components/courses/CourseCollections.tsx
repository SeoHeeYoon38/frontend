import type { CourseTheme, TravelCourse } from "../../types/course";
import * as S from "./CourseCollections.styled";
import { Link } from "react-router";
import { travelerCoursePath } from "../../utils/navigation";
interface CourseCollectionsProps {
  popularCourses: TravelCourse[];
  themes: CourseTheme[];
  travelerCourses: TravelCourse[];
}
function CourseCollections({
  popularCourses,
  themes,
  travelerCourses,
}: CourseCollectionsProps) {
  return (
    <>
      <S.Section aria-label="이번 주 많이 저장한 코스">
        <S.Heading>
          <h2>이번 주 많이 저장한 코스</h2>
          <button type="button">전체 보기</button>
        </S.Heading>
        <S.Carousel>
          {popularCourses.map((course) => (
            <S.PopularCard
              as={Link}
              to={travelerCoursePath(course.id)}
              aria-label={`${course.title.replace("\n", " ")} 일정 보기`}
              key={course.id}
            >
              <S.Cover src={course.image} alt={course.city} />
              <S.Scrim />
              <S.PopularText>
                <S.Meta>
                  {course.city}
                  <i />
                  {course.duration}
                </S.Meta>
                <h3>{course.title}</h3>
                <p>{course.author}</p>
              </S.PopularText>
            </S.PopularCard>
          ))}
        </S.Carousel>
      </S.Section>
      <S.Section aria-label="이번 달 이런 여행 어때요?">
        <S.Heading>
          <h2>이번 달 이런 여행 어때요?</h2>
        </S.Heading>
        <S.Carousel>
          {themes.map((theme) => (
            <S.Theme key={theme.id}>
              <img src={theme.image} alt="" />
              <h3>{theme.title}</h3>
              <S.ThemeCities>
                {theme.cities.map((city) => (
                  <span key={city}>{city}</span>
                ))}
              </S.ThemeCities>
            </S.Theme>
          ))}
        </S.Carousel>
      </S.Section>
      <S.Section aria-label="여행자들의 코스">
        <S.Heading>
          <h2>여행자들의 코스</h2>
          <span>최신순</span>
        </S.Heading>
        <S.TravelerList>
          {travelerCourses.map((course) => (
            <S.TravelerRow
              as={Link}
              to={travelerCoursePath(course.id)}
              aria-label={`${course.title.replace("\n", " ")} 일정 보기`}
              key={course.id}
            >
              <S.TravelerText>
                <S.TravelerMeta>
                  {course.city}
                  <i />
                  {course.duration}
                </S.TravelerMeta>
                <h3>{course.title}</h3>
                <S.Author>
                  {course.avatar && <img src={course.avatar} alt="" />}
                  <span>{course.author}</span>
                  <i />
                  <small>{course.description}</small>
                </S.Author>
              </S.TravelerText>
              <S.Thumbnail src={course.image} alt={course.city} />
            </S.TravelerRow>
          ))}
        </S.TravelerList>
      </S.Section>
    </>
  );
}
export default CourseCollections;
