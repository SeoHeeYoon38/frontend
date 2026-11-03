import { useState } from "react";
import { dateLabel, durationLabel, validDate } from "../../utils/trip";
import selectedDate from "../../assets/icons/calendar-date-selected.svg";
import arrows from "../../assets/icons/calendar-month-arrows.svg";
import * as S from "./Trip.styled";
interface DateRangePickerProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}
function DateRangePicker({ start, end, onChange }: DateRangePickerProps) {
  const [month, setMonth] = useState(() => {
    const initial = validDate(start)
      ? new Date(start + "T12:00:00")
      : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const year = month.getFullYear();
  const m = month.getMonth();
  const blanks = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();
  function choose(day: number) {
    const value = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (!start || end || value < start) onChange(value, "");
    else onChange(start, value);
  }
  return (
    <>
      <S.CalendarHeader>
        <span>
          {year}년 {m + 1}월
        </span>
        <S.MonthArrows>
          <img src={arrows} alt="" />
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => setMonth(new Date(year, m - 1, 1))}
          />
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => setMonth(new Date(year, m + 1, 1))}
          />
        </S.MonthArrows>
      </S.CalendarHeader>
      <S.CalendarGrid>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <S.Weekday key={day}>{day}</S.Weekday>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const value = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return (
            <S.CalendarDay
              key={value}
              type="button"
              aria-label={value}
              aria-pressed={value === start || value === end}
              $range={!!end && value > start && value < end}
              $edge={value === start || value === end}
              $startEdge={!!end && start !== end && value === start}
              $endEdge={!!end && start !== end && value === end}
              $sunday={(blanks + i) % 7 === 0}
              onClick={() => choose(day)}
            >
              {(value === start || value === end) && (
                <img src={selectedDate} alt="" aria-hidden="true" />
              )}
              <span>{day}</span>
            </S.CalendarDay>
          );
        })}
      </S.CalendarGrid>
      <S.DateSummary>
        <span>
          {dateLabel(start)}
          {end ? ` ~ ${dateLabel(end)}` : ""}
        </span>
        {start && end && <b>{durationLabel(start, end)}</b>}
      </S.DateSummary>
    </>
  );
}
export default DateRangePicker;
