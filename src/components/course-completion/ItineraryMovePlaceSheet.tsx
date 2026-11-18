import styled from "styled-components";
import type { ItineraryDayInput } from "../../api/types";
import checkedIcon from "../../assets/course-completion/picker-selected.svg";
import unselectedIcon from "../../assets/course-completion/picker-unselected.svg";
import { dateLabel } from "../../utils/trip";
import TripSheet from "../common/TripSheet";
import { ErrorText } from "../trip/Trip.styled";

const Day = styled.button`
  && {
    width: 100%;
    min-height: 71px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #e4e6ec;
  }
  span { display: grid; gap: 6px; }
  strong { font-size: 15px; line-height: 20px; }
  em { color: #8a8a8e; font-size: 13px; font-style: normal; font-weight: 400; }
  small { color: #8a8a8e; font-size: 12px; }
  img { width: 22px; height: 22px; flex: none; }
  &:disabled { cursor: default; }
`;

export default function ItineraryMovePlaceSheet({ days, currentDay, placeId, pending, error, onMove, onClose }: {
  days: ItineraryDayInput[];
  currentDay: number;
  placeId: string;
  pending: boolean;
  error: string;
  onMove: (day: number) => void;
  onClose: () => void;
}) {
  return <TripSheet title="어느 날에 담을까요?" variant="course" courseHeight={549} contentGap={0}
    closeDisabled={pending} onClose={onClose}
    footer={error ? <ErrorText role="alert">{error}</ErrorText> : undefined}>
    {days.map((day, index) => {
      const checked = currentDay === index + 1;
      return <Day key={day.date} type="button" aria-pressed={checked}
        disabled={pending || checked || day.visits.some((visit) => visit.placeId === placeId)} onClick={() => onMove(index + 1)}>
        <span>
          <strong>{index + 1}일차 <em>{dateLabel(day.date)}</em></strong>
          <small>{day.visits.length ? `담은 장소 ${day.visits.length}곳` : "아직 담은 장소가 없어요"}</small>
        </span>
        <img src={checked ? checkedIcon : unselectedIcon} alt="" />
      </Day>;
    })}
    {pending && <p role="status">장소를 옮기고 있어요.</p>}
  </TripSheet>;
}
