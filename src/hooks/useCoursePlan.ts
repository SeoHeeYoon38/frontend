import { useMemo, useState } from "react";
import {
  aiAdjustedCoursePlaces,
  initialCoursePlaces,
  replacementPlaces,
  suggestedPlaces,
} from "../data/mocks/courseCompletionData";
import type {
  CoursePlanVariant,
  CourseScreen,
} from "../types/courseCompletion";
import {
  isFigmaCoursePlanSaved,
  saveFigmaCoursePlan,
} from "../data/mocks/flowData";

function useCoursePlan() {
  const [activeDay, setActiveDay] = useState(0);
  const [places, setPlaces] = useState(initialCoursePlaces);
  const [screen, setScreen] = useState<CourseScreen>("plan");
  const [planVariant, setPlanVariant] =
    useState<CoursePlanVariant>("default");
  const [notice, setNotice] = useState("");
  const [isSaved, setIsSaved] = useState(isFigmaCoursePlanSaved);
  const [aiRequest, setAiRequest] = useState(
    "첫날은 좀 여유롭게, 카페는 빼도 괜찮아요",
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([
    101, 103,
  ]);
  const [replacementId, setReplacementId] = useState(201);

  const removedPlaces = useMemo(
    () =>
      initialCoursePlaces.filter(
        (place) => !places.some((item) => item.id === place.id),
      ),
    [places],
  );

  const selectedPlace = useMemo(
    () =>
      places.find((place) => place.id === selectedPlaceId) ??
      initialCoursePlaces[2],
    [places, selectedPlaceId],
  );

  const displayPlaces =
    screen === "ai-result" || planVariant === "applied"
      ? aiAdjustedCoursePlaces
      : places;

  const addRemovedPlace = () => {
    const [removedPlace] = removedPlaces;
    if (!removedPlace) {
      setScreen("place-add");
      return;
    }

    setPlaces((current) => [...current, removedPlace]);
    setNotice(`${removedPlace.name}을(를) 일정에 다시 추가했어요.`);
  };

  const removePlace = (id: number) => {
    setPlaces((current) => current.filter((place) => place.id !== id));
    setNotice("일정에 포함되지 않은 장소가 생겼어요.");
  };

  const openPlaceDetail = (id: number) => {
    setSelectedPlaceId(id);
    setScreen("place-detail");
  };

  const removeSelectedPlace = () => {
    removePlace(selectedPlace.id);
    setScreen("plan");
  };

  const toggleCandidate = (id: number) => {
    setSelectedCandidateIds((current) =>
      current.includes(id)
        ? current.filter((candidateId) => candidateId !== id)
        : [...current, id],
    );
  };

  const addSelectedCandidates = () => {
    const newPlaces = suggestedPlaces
      .filter((candidate) => selectedCandidateIds.includes(candidate.id))
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        category: candidate.category,
        detail: candidate.distance,
        image: candidate.image,
        icon: initialCoursePlaces[2].icon,
        description: candidate.distance,
      }));

    setPlaces((current) => [
      ...current,
      ...newPlaces.filter(
        (candidate) => !current.some((place) => place.id === candidate.id),
      ),
    ]);
    setNotice(`${newPlaces.length}곳을 1일차에 추가했어요.`);
    setScreen("schedule-edit");
  };

  const applyReplacement = () => {
    const replacement = replacementPlaces.find(
      (candidate) => candidate.id === replacementId,
    );
    if (!replacement) return;

    setPlaces((current) =>
      current.map((place) =>
        place.id === 4
          ? {
              ...place,
              name: replacement.name,
              image: replacement.image,
              detail: replacement.distance,
              description: replacement.distance,
            }
          : place,
      ),
    );
    setNotice(`${replacement.name}(으)로 교체했어요.`);
    setScreen("schedule-edit");
  };

  const applyAiResult = () => {
    setPlanVariant("applied");
    setScreen("plan");
    setNotice("수정한 일정을 적용했어요.");
  };

  const undoAiResult = () => {
    setPlanVariant("default");
    setNotice("AI 수정 전 일정으로 되돌렸어요.");
  };

  const saveManualEdit = () => {
    setScreen("plan");
    setNotice("1일차 수정 내용을 저장했어요.");
  };

  const savePlan = () => {
    saveFigmaCoursePlan();
    setIsSaved(true);
    setNotice("오사카 3박 4일 일정을 내 여행에 저장했어요.");
  };

  return {
    activeDay,
    aiRequest,
    displayPlaces,
    isSaved,
    notice,
    places,
    planVariant,
    removedPlaces,
    replacementId,
    screen,
    selectedCandidateIds,
    selectedPlace,
    setActiveDay,
    setAiRequest,
    setReplacementId,
    setScreen,
    addRemovedPlace,
    addSelectedCandidates,
    applyAiResult,
    applyReplacement,
    openPlaceDetail,
    removePlace,
    removeSelectedPlace,
    saveManualEdit,
    savePlan,
    toggleCandidate,
    undoAiResult,
  };
}

export default useCoursePlan;
