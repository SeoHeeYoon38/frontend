import { useRef, useState } from "react";
import { addPlaceToItinerary } from "../../api/itineraries";
import type { SavedPlaceResponse } from "../../api/types";
import TripSheet from "../common/TripSheet";
import ServerSavedPlaces from "../trip/ServerSavedPlaces";
import { ErrorText } from "../trip/Trip.styled";
import PlaceDayPicker from "./PlaceDayPicker";
import { placeDayError } from "../../utils/placeDaySuggestion";

interface AddItineraryPlaceSheetProps {
  tripId: number;
  day: number;
  scheduledPlaceIds: Set<string>;
  onClose: () => void;
  onSaved: (result: Awaited<ReturnType<typeof addPlaceToItinerary>>, place: SavedPlaceResponse, day: number) => void;
}

export default function AddItineraryPlaceSheet({
  tripId, day, scheduledPlaceIds, onClose, onSaved,
}: AddItineraryPlaceSheetProps) {
  const [place, setPlace] = useState<SavedPlaceResponse>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);

  async function addPlace(selectedDay: number) {
    if (!place?.placeId || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    try {
      const result = await addPlaceToItinerary(tripId, place.placeId, selectedDay);
      onSaved(result, place, selectedDay);
    } catch (reason) {
      setError(placeDayError(reason));
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  return (
    <TripSheet
      title={place ? "언제 넣을까요?" : `${day}일차 장소 추가`}
      onClose={onClose}
      closeDisabled={pending}
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
          {place.placeId && <PlaceDayPicker key={`${tripId}:${place.placeId}`}
            tripId={tripId} placeId={place.placeId} pending={pending} onConfirm={addPlace} />}
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
