import { useRef, useState } from "react";
import { addPlaceToItinerary } from "../../api/itineraries";
import type { SavedPlaceResponse } from "../../api/types";
import TripSheet from "../common/TripSheet";
import ServerSavedPlaces from "../trip/ServerSavedPlaces";
import { ErrorText, Primary } from "../trip/Trip.styled";

interface AddItineraryPlaceSheetProps {
  tripId: number;
  day: number;
  scheduledPlaceIds: Set<string>;
  onClose: () => void;
  onSaved: (result: Awaited<ReturnType<typeof addPlaceToItinerary>>, place: SavedPlaceResponse) => void;
}

export default function AddItineraryPlaceSheet({
  tripId, day, scheduledPlaceIds, onClose, onSaved,
}: AddItineraryPlaceSheetProps) {
  const [place, setPlace] = useState<SavedPlaceResponse>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);

  async function addPlace() {
    if (!place?.placeId || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    try {
      const result = await addPlaceToItinerary(tripId, place.placeId, day);
      onSaved(result, place);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "장소를 추가하지 못했어요.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  return (
    <TripSheet
      title={`${day}일차 장소 추가`}
      onClose={onClose}
      closeDisabled={pending}
      footer={place && (
        <Primary type="button" disabled={pending} onClick={() => void addPlace()}>
          {pending ? "AI가 장소를 넣고 있어요" : `AI로 ${day}일차에 넣기`}
        </Primary>
      )}
    >
      <div hidden={Boolean(place)}>
        <ServerSavedPlaces
          tripId={tripId}
          onPick={setPlace}
          pickedPlaceIds={scheduledPlaceIds}
          pickLabel="선택"
          pickedLabel="이미 일정에 있어요"
        />
      </div>
      {place && (
        <div aria-busy={pending}>
          <strong>{place.name}</strong>
          {place.address && <p>{place.address}</p>}
          <p>AI가 {day}일차 동선에 맞춰 장소를 넣어요.</p>
          <button type="button" disabled={pending} onClick={() => {
            setError("");
            setPlace(undefined);
          }}>다른 장소 선택</button>
        </div>
      )}
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </TripSheet>
  );
}
