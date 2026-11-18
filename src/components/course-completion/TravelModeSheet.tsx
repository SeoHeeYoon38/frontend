import { useEffect, useState } from "react";
import type { TravelLeg } from "../../api/types";
import { getTravelOptions, type TravelOption } from "../../api/itineraries";
import walk from "../../assets/course-completion/travel-walk-figma.svg";
import train from "../../assets/course-completion/travel-train-figma.svg";
import car from "../../assets/course-completion/travel-car-figma.svg";
import selectedCheck from "../../assets/icons/status-selected-check.svg";
import TripSheet from "../common/TripSheet";
import { Primary } from "../trip/Trip.styled";

import { travelModeLabels } from "../../utils/trip";
const options = [
  { mode: "WALK", icon: walk },
  { mode: "TRANSIT", icon: train },
  { mode: "DRIVE", icon: car },
] as const;

export default function TravelModeSheet({ tripId, from, to, fromCoordinate, toCoordinate, departAt, travel, current, saving, error, onClose, onApply }: {
  tripId: number;
  from: string;
  to: string;
  fromCoordinate?: { latitude: number; longitude: number };
  toCoordinate?: { latitude: number; longitude: number };
  departAt?: string;
  travel: TravelLeg;
  current: TravelLeg["mode"];
  saving: boolean;
  error: string;
  onClose: () => void;
  onApply: (mode: TravelLeg["mode"], all: boolean) => void;
}) {
  const [selected, setSelected] = useState(current);
  const [all, setAll] = useState(false);
  const [travelOptions, setTravelOptions] = useState<TravelOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(Boolean(fromCoordinate && toCoordinate));
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    if (!fromCoordinate || !toCoordinate) return;
    const controller = new AbortController();
    void getTravelOptions(tripId, fromCoordinate, toCoordinate, departAt, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) {
          setTravelOptions(Array.isArray(result) ? result : []);
          setOptionsLoading(false);
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setOptionsError("이동 시간을 불러오지 못했어요.");
          setOptionsLoading(false);
        }
      },
    );
    return () => controller.abort();
  }, [tripId, fromCoordinate, toCoordinate, departAt]);

  return (
    <TripSheet title="이동 수단 선택" variant="course" courseHeight={491} onClose={onClose} closeDisabled={saving}
      footer={<Primary className="travel-mode-apply" type="button" disabled={saving} onClick={() => onApply(selected, all)}>{saving ? "저장하고 있어요" : "적용하기"}</Primary>}>
      <p className="travel-mode-description">{from} → {to}</p>
      {optionsLoading && <p className="travel-mode-status" role="status">이동 시간을 확인하고 있어요.</p>}
      {optionsError && <p className="travel-mode-status" role="alert">{optionsError}</p>}
      {error && <p className="travel-mode-status" role="alert">{error}</p>}
      <fieldset className="travel-mode-options" aria-label="이동 수단">
        {options.map(({ mode, icon }) => {
          const option = travelOptions.find((item) => item.mode === mode) ?? (mode === travel.mode ? travel : undefined);
          return (
          <label key={mode} className="travel-mode-option">
            <input type="radio" name="travel-mode" checked={selected === mode} disabled={saving} onChange={() => setSelected(mode)} />
            <span className="travel-mode-icon"><img src={icon} alt="" /></span>
            <span>
              <strong>{travelModeLabels[mode]}</strong>
              {option && <small>{option.minutes}분 · {(option.distanceMeters / 1000).toFixed(1)}km{option.estimated ? " · 예상" : ""}</small>}
            </span>
            <span className="travel-mode-indicator" aria-hidden="true">{selected === mode && <img src={selectedCheck} alt="" />}</span>
          </label>
          );
        })}
      </fieldset>
      <label className="travel-mode-all">
        <input type="checkbox" checked={all} disabled={saving} onChange={(event) => setAll(event.target.checked)} />
        다른 구간에도 같은 이동 수단 적용
      </label>
    </TripSheet>
  );
}
