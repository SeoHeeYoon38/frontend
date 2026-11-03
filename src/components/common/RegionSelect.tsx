import { useEffect, useRef, useState } from "react";
import type { CourseDestination } from "../../types/course";
import close from "../../assets/icons/action-close.svg";
import search from "../../assets/icons/search-default.svg";
import check from "../../assets/icons/status-selected-check.svg";
import * as S from "./RegionSelect.styled";

interface RegionSelectProps {
  mode?: "courses" | "trip";
  destinations: CourseDestination[];
  recentDestinations: CourseDestination[];
  initialDestination: CourseDestination;
  onClose: () => void;
  onSelect: (destination: CourseDestination) => void;
}

function RegionSelect({
  mode = "courses",
  destinations,
  recentDestinations,
  initialDestination,
  onClose,
  onSelect,
}: RegionSelectProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initialDestination);
  const visibleDestinations = destinations.filter(
    (city) =>
      city.name.includes(query.trim()) || city.country.includes(query.trim()),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <S.Sheet
      $trip={mode === "trip"}
      ref={dialogRef}
      aria-labelledby="region-title"
      onCancel={onClose}
    >
      <S.Grabber />
      <S.Header>
        <h2 id="region-title">
          {mode === "trip" ? "어디로 떠나세요?" : "어디로 떠나볼까요?"}
        </h2>
        <button
          type="button"
          aria-label="지역 선택 닫기"
          autoFocus
          onClick={onClose}
        >
          <img src={close} alt="" />
        </button>
      </S.Header>
      <S.Description>
        {mode === "trip"
          ? "도시 하나를 골라주세요. 나중에 바꿀 수 있어요"
          : "나라나 도시를 고르면 그곳의 코스만 보여드려요"}
      </S.Description>
      <S.Search>
        <img src={search} alt="" />
        <input
          aria-label="도시나 나라 이름 검색"
          placeholder="도시나 나라 이름을 검색하세요"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </S.Search>
      {mode === "courses" && (
        <S.Section>
          <h3>최근 본 도시</h3>
          <S.Recent>
            {recentDestinations.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelected(city)}
                aria-pressed={selected.name === city.name}
              >
                {city.name}
              </button>
            ))}
          </S.Recent>
        </S.Section>
      )}
      <S.Section>
        <h3>인기 여행지</h3>
        <S.Grid>
          {!visibleDestinations.length && (
            <S.Description>
              아직 지원하지 않는 도시예요. 다른 도시를 검색해 주세요.
            </S.Description>
          )}
          {visibleDestinations.map((city) => (
            <S.Destination
              key={city.name}
              type="button"
              $selected={selected.name === city.name}
              aria-pressed={selected.name === city.name}
              onClick={() => setSelected(city)}
            >
              <S.Photo src={city.image} alt="" />
              <S.Scrim />
              <S.CityName>
                <strong>{city.name}</strong>
                <span>{city.country}</span>
              </S.CityName>
              {selected.name === city.name && (
                <S.Check src={check} alt="선택됨" />
              )}
            </S.Destination>
          ))}
        </S.Grid>
      </S.Section>
      <S.Footer>
        <button type="button" onClick={() => onSelect(selected)}>
          {mode === "trip"
            ? `${selected.name}로 정하기`
            : `${selected.name} 코스 보기`}
        </button>
      </S.Footer>
    </S.Sheet>
  );
}
export default RegionSelect;
