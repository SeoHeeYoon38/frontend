import { useState } from "react";
import type { TravelLeg } from "../../api/types";
import walk from "../../assets/figma/traveler-walk.svg";
import train from "../../assets/course-completion/icon-train.svg";
import car from "../../assets/icons/transport-car.svg";
import TripSheet from "../common/TripSheet";
import { Primary } from "../trip/Trip.styled";

import { travelModeLabels } from "../../utils/trip";
const options = [
  { mode: "WALK", icon: walk },
  { mode: "TRANSIT", icon: train },
  { mode: "DRIVE", icon: car },
] as const;

export default function TravelModeSheet({ from, to, travel, current, onClose, onApply }: {
  from: string;
  to: string;
  travel: TravelLeg;
  current: TravelLeg["mode"];
  onClose: () => void;
  onApply: (mode: TravelLeg["mode"], all: boolean) => void;
}) {
  const [selected, setSelected] = useState(current);
  const [all, setAll] = useState(false);
  return (
    <TripSheet title="이동 수단 선택" variant="course" onClose={onClose}
      footer={<Primary type="button" onClick={() => onApply(selected, all)}>적용하기</Primary>}>
      <p className="travel-mode-description">{from} → {to}</p>
      <fieldset className="travel-mode-options" aria-label="이동 수단">
        {options.map(({ mode, icon }) => (
          <label key={mode} className="travel-mode-option">
            <input type="radio" name="travel-mode" checked={selected === mode} onChange={() => setSelected(mode)} />
            <span className="travel-mode-icon"><img src={icon} alt="" /></span>
            <span>
              <strong>{travelModeLabels[mode]}</strong>
              {mode === travel.mode && <small>{travel.minutes}분 · {(travel.distanceMeters / 1000).toFixed(1)}km</small>}
            </span>
            <span className="travel-mode-indicator" aria-hidden="true">{selected === mode && "✓"}</span>
          </label>
        ))}
      </fieldset>
      <label className="travel-mode-all">
        <input type="checkbox" checked={all} onChange={(event) => setAll(event.target.checked)} />
        다른 구간에도 같은 이동 수단 적용
      </label>
    </TripSheet>
  );
}
