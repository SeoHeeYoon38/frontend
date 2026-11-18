import { useState } from "react";
import { dateLabel, durationLabel, validDate } from "../../utils/trip";
import selectedDate from "../../assets/icons/calendar-date-selected.svg";
import arrows from "../../assets/icons/calendar-month-arrows.svg";
import * as S from "./Trip.styled";
interface DateRangePickerProps {
  start: string;
  end: string;
  onChange?: (start: string, end: string) => void;
  initialMonth?: string;
  minDate?: string;
  maxDate?: string;
  multiple?: { selected: string[]; onToggle: (date: string) => void };
}
function DateRangePicker({ start, end, onChange, initialMonth, minDate, maxDate, multiple }: DateRangePickerProps) {
  const [month, setMonth] = useState(() => {
    const initial = validDate(start)
      ? new Date(start + "T12:00:00")
      : validDate(initialMonth ?? "")
        ? new Date(`${initialMonth}T12:00:00`)
      : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });
  const year = month.getFullYear();
  const m = month.getMonth();
  const blanks = new Date(year, m, 1).getDay();
  const days = new Date(year, m + 1, 0).getDate();
  function choose(value: string) {
    if (multiple) multiple.onToggle(value);
    else if (!start || end || value < start) onChange?.(value, "");
    else onChange?.(start, value);
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
          const selected = multiple ? multiple.selected.includes(value) : value === start || value === end;
          return (
            <S.CalendarDay
              key={value}
              type="button"
              aria-label={value}
              aria-pressed={selected}
              disabled={Boolean((minDate && value < minDate) || (maxDate && value > maxDate))}
              $range={!!end && value > start && value < end}
              $edge={selected}
              $startEdge={!!end && start !== end && value === start}
              $endEdge={!!end && start !== end && value === end}
              $sunday={(blanks + i) % 7 === 0}
              onClick={() => choose(value)}
            >
              {selected && (
                <img src={selectedDate} alt="" aria-hidden="true" />
              )}
              <span>{day}</span>
            </S.CalendarDay>
          );
        })}
      </S.CalendarGrid>
      <S.DateSummary>
        <span>
          {multiple
            ? [...multiple.selected].sort().map(dateLabel).join(", ")
            : dateLabel(start) + (end ? " ~ " + dateLabel(end) : "")}
        </span>
        {multiple ? multiple.selected.length > 0 && <b>{multiple.selected.length}일</b>
          : start && end && <b>{durationLabel(start, end)}</b>}
      </S.DateSummary>
    </>
  );
}
export default DateRangePicker;
