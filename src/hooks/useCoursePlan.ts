import { useMemo, useState } from "react";
import { initialCoursePlaces } from "../data/mocks/courseCompletionData";

function useCoursePlan() {
  const [activeDay, setActiveDay] = useState(0);
  const [places, setPlaces] = useState(initialCoursePlaces);
  const [notice, setNotice] = useState("");
  const removedPlace = useMemo(
    () =>
      initialCoursePlaces.find(
        (place) => !places.some((item) => item.id === place.id),
      ),
    [places],
  );

  const addPlace = () => {
    if (!removedPlace) {
      setNotice("모든 장소가 일정에 포함되어 있어요.");
      return;
    }

    setPlaces((current) => [...current, removedPlace]);
    setNotice(`${removedPlace.name}을(를) 다시 추가했어요.`);
  };

  const removePlace = (id: number) => {
    setPlaces((current) => current.filter((place) => place.id !== id));
  };

  const requestAiEdit = () => {
    setNotice("AI 수정 요청 화면은 다음 단계에서 연결할 수 있어요.");
  };

  return {
    activeDay,
    places,
    notice,
    setActiveDay,
    addPlace,
    removePlace,
    requestAiEdit,
  };
}

export default useCoursePlan;
