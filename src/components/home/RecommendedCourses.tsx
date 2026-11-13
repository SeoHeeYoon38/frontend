import chevron from "../../assets/icons/nav-chevron-right.svg";
import { useState, type UIEvent } from "react";
import type { CourseSummary } from "../../types/home";
import * as S from "./RecommendedCourses.styled";
import * as C from "./common.styled";
import { Link, useNavigate } from "react-router";
import { routes } from "../../config/routes";
import { travelerCoursePath } from "../../utils/navigation";

interface RecommendedCoursesProps {
  courses: CourseSummary[];
}

function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const cardSize = S.CARD_WIDTH + S.CARD_GAP;
    const nextIndex = Math.round(event.currentTarget.scrollLeft / cardSize);
    setActiveIndex(Math.max(0, Math.min(nextIndex, courses.length - 1)));
  }

  return (
    <C.Section aria-label="이런 여행 어때요?">
      <C.Heading>
        <h2>이런 여행 어때요?</h2>
        <button type="button" onClick={() => navigate(routes.courses)}>
          더보기
          <img src={chevron} alt="" />
        </button>
      </C.Heading>
      {courses.length > 0 && (
        <>
          <S.Carousel aria-label="추천 코스" onScroll={handleScroll}>
            {courses.map((course) => (
              <S.Card
                as={Link}
                to={travelerCoursePath(course.id)}
                aria-label={`${course.title.replace("\n", " ")} 코스 둘러보기`}
                key={course.id}
              >
                <C.Cover
                  loading="lazy"
                  decoding="async"
                  src={course.coverImage}
                  alt=""
                />
                <C.Scrim />
                <S.Badges>
                  <span>{course.category}</span>
                  <span>코스 {course.courseCount}개</span>
                </S.Badges>
                <S.Text>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </S.Text>
              </S.Card>
            ))}
          </S.Carousel>
          <S.Dots aria-label="추천 코스 페이지">
            {courses.map((course, index) => (
              <S.Dot key={course.id} $active={index === activeIndex} />
            ))}
          </S.Dots>
        </>
      )}
    </C.Section>
  );
}

export default RecommendedCourses;
