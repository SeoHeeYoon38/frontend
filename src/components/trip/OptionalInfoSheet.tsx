import { useEffect, useEffectEvent, useRef, useState, type ComponentProps } from "react";
import { shouldUseMockFallback } from "../../api/client";
import { isApiEnabled } from "../../api/config";
import { searchPlaces } from "../../api/places";
import { applyReservationsToDraft, reservationFlight } from "../../api/reservationAdapters";
import { saveFlights, saveRental, saveStays, searchFlights } from "../../api/reservations";
import { hasAuthSession } from "../../api/tokenStorage";
import flightAirplane from "../../assets/icons/flight-route-airplane.svg";
import selectedDate from "../../assets/icons/calendar-date-selected.svg";
import searchIcon from "../../assets/icons/search-default.svg";
import { mockFlights, mockHotels } from "../../data/mocks/tripData";
import type { PrepareServerTrip } from "../../hooks/useServerTripDraft";
import type { Flight, Stay, TripDraft } from "../../types/trip";
import { addDays, changeDates, dateLabel, dayCount, rangeDates, toggleId, validDate, validateStays } from "../../utils/trip";
import TripSheet from "../common/TripSheet";
import DateRangePicker from "./DateRangePicker";
import * as O from "./OptionalInfoSheet.styled";
import * as S from "./Trip.styled";

interface ReservationSheetProps {
  draft: TripDraft;
  prepareServerTrip: PrepareServerTrip;
  onClose: () => void;
  onSave: (draft: TripDraft) => void;
}

interface OptionalInfoSheetProps extends ReservationSheetProps {
  mode: "flight" | "stay" | "car";
}

type SearchChoice = Pick<Stay, "placeId" | "name" | "address" | "city">;
type SearchResult = { query: string; places: SearchChoice[] } | { query: string; error: string };

const flightNumber = /^(?:[A-Z][A-Z0-9]|\d[A-Z]|[A-Z]{3})\d{1,4}[A-Z]?$/;
const hotelName = /호텔|모텔|호스텔|게스트하우스|여관|료칸|리조트|펜션|숙소|ホテル|旅館|民宿|khách sạn|khach san|โรงแรม|\b(hotel|hostel|resort|inn|lodging|stay|suites?|ryokan|homestay|guesthouse)\b/i;
const weekLabels = ["일", "월", "화", "수", "목", "금", "토"];

function reservationDraft(draft: TripDraft): TripDraft {
  // Place search needs a server draft. The companion choice remains unset in the form.
  return draft.companion ? draft : { ...draft, companion: "혼자", people: 1 };
}

function ReservationSearchField({ label, selected, ...input }: ComponentProps<"input"> & { label: string; selected?: boolean }) {
  return (
    <O.Field>
      <span>{label}</span>
      <O.Search $selected={Boolean(selected)}>
        <img src={searchIcon} alt="" />
        <input {...input} aria-label={input["aria-label"] ?? label} />
      </O.Search>
    </O.Field>
  );
}

function ReservationDays({ start, end, selected, range, label, onSelect }: {
  start: string;
  end: string;
  selected: string[];
  range?: boolean;
  label: string;
  onSelect: (date: string) => void;
}) {
  const dates = rangeDates(start, end);
  if (!dates.length) return null;
  const first = addDays(start, -new Date(start + "T12:00:00Z").getUTCDay());
  const last = addDays(end, 6 - new Date(end + "T12:00:00Z").getUTCDay());
  const inRange = (date: string) => range
    ? selected.length > 1 && date >= selected[0] && date <= selected[1]
    : selected.includes(date);
  return (
    <O.Weeks role="group" aria-label={label}>
      {rangeDates(first, last).map((date, index) => {
        const checked = selected.includes(date);
        return (
          <O.WeekDay
            key={date}
            type="button"
            aria-label={date}
            aria-pressed={checked || inRange(date)}
            disabled={date < start || date > end}
            $connectedBefore={index % 7 !== 0 && inRange(date) && inRange(addDays(date, -1))}
            $connectedAfter={index % 7 !== 6 && inRange(date) && inRange(addDays(date, 1))}
            onClick={() => onSelect(date)}
          >
            <span>{weekLabels[index % 7]}</span>
            <strong>
              {checked && <img src={selectedDate} alt="" />}
              <b>{Number(date.slice(-2))}</b>
            </strong>
          </O.WeekDay>
        );
      })}
    </O.Weeks>
  );
}

function usePlaceSearch(draft: TripDraft, prepareServerTrip: PrepareServerTrip, query: string, active: boolean, lodging: boolean) {
  const [result, setResult] = useState<SearchResult>();
  const live = isApiEnabled() && hasAuthSession();
  const prepare = useEffectEvent(() => prepareServerTrip(reservationDraft(draft)));

  useEffect(() => {
    if (!live || !active || !query) return;
    const controller = new AbortController();
    const { signal } = controller;
    const timer = window.setTimeout(async () => {
      try {
        const tripId = await prepare();
        if (signal.aborted) return;
        const searchQuery = lodging && !hotelName.test(query) ? query + " 호텔" : query;
        let places = await searchPlaces(tripId, searchQuery, signal);
        if (!Array.isArray(places)) throw new Error("장소 검색 결과를 확인하지 못했어요.");
        if (lodging && !places.length && searchQuery !== query && !signal.aborted) {
          places = await searchPlaces(tripId, query + " hotel", signal);
          if (!Array.isArray(places)) throw new Error("숙소 검색 결과를 확인하지 못했어요.");
        }
        if (!signal.aborted) setResult({ query, places: places.map((place) => ({ ...place, city: draft.city })) });
      } catch (reason) {
        if (!signal.aborted) {
          setResult({ query, error: reason instanceof Error ? reason.message : "장소를 검색하지 못했어요." });
        }
      }
    }, 380);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft.city, draft.country, draft.startDate, draft.endDate, draft.companion, draft.people, active, live, lodging, query]);

  return { result: result?.query === query ? result : undefined, clearResult: () => setResult(undefined) };
}

function SearchResults({ result, loading, emptyText, onSelect }: {
  result?: SearchResult;
  loading: boolean;
  emptyText: string;
  onSelect: (place: SearchChoice) => void;
}) {
  if (loading) return <S.Help role="status">검색하고 있어요.</S.Help>;
  if (!result) return null;
  if ("error" in result) return <S.ErrorText role="alert">{result.error}</S.ErrorText>;
  if (!result.places.length) return <S.Help role="status">{emptyText}</S.Help>;
  return (
    <O.Matches>
      {result.places.map((place) => (
        <button key={place.placeId ?? place.name} type="button" onClick={() => onSelect(place)}>
          <strong>{place.name}</strong>
          <small>{place.address}</small>
        </button>
      ))}
    </O.Matches>
  );
}

function FlightSheet({ draft, onClose, onSave, prepareServerTrip }: ReservationSheetProps) {
  const [direction, setDirection] = useState<"outbound" | "inbound">("outbound");
  const [period, setPeriod] = useState({ start: draft.startDate, end: draft.endDate });
  const [calendar, setCalendar] = useState<typeof period>();
  const [date, setDate] = useState(draft.outbound?.date || draft.startDate);
  const [code, setCode] = useState(draft.outbound?.code ?? "");
  const [flight, setFlight] = useState<Flight | null>(draft.outbound);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(false);
  const live = isApiEnabled() && hasAuthSession();
  const allowedCode = flightNumber.test(code.replace(/\s/g, ""));

  function selectDate(next: string) {
    if (date === next) return;
    setDate(next);
    setFlight(null);
    setError("");
  }

  async function submit() {
    if (request.current || !allowedCode || !date) return;
    request.current = true;
    setPending(true);
    setError("");
    try {
      if (!flight) {
        const number = code.replace(/\s/g, "");
        if (live) {
          const results = await searchFlights(number, date);
          if (!Array.isArray(results)) throw new Error("항공편 조회 응답을 확인하지 못했어요.");
          if (results.length) {
            setFlight(reservationFlight(results[0], date));
            return;
          }
        } else if (!isApiEnabled()) {
          const match = mockFlights.find((item) => item.code === number
            && (direction === "outbound" ? item.from.includes("인천") : item.to.includes("인천")));
          if (match && ["오사카", "교토"].includes(draft.city)) {
            setFlight({ ...match, date });
            return;
          }
        }
        setError("조건에 맞는 항공편이 없어요. 편명과 날짜를 확인해 주세요.");
        return;
      }
      const next = { ...changeDates(draft, period.start, period.end), [direction]: flight };
      if (next.outbound && next.inbound && next.outbound.date === next.inbound.date
        && next.inbound.departure <= next.outbound.arrival) {
        setError("오는 편 출발 시간이 도착 시간보다 빨라요. 항공편과 날짜를 확인해 주세요.");
        return;
      }
      if (live && flight.apiFlight) {
        try {
          const tripId = await prepareServerTrip(reservationDraft(next));
          await saveFlights(tripId, next.outbound?.apiFlight ?? null, next.inbound?.apiFlight ?? null);
          onSave({ ...next, tripId: String(tripId) });
          return;
        } catch (reason) {
          if (!shouldUseMockFallback(reason)) throw reason;
        }
      }
      onSave(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "항공권 정보를 처리하지 못했어요.");
    } finally {
      request.current = false;
      setPending(false);
    }
  }

  if (calendar) return (
    <TripSheet key="flight-calendar" title="언제 떠나세요?" variant="dates" compactHeader minHeight={654} onClose={() => setCalendar(undefined)}
      footer={<S.Primary type="button" disabled={!validDate(calendar.start) || !validDate(calendar.end)} onClick={() => {
        setPeriod(calendar);
        selectDate(direction === "outbound" ? calendar.start : calendar.end);
        setCalendar(undefined);
      }}>선택 완료</S.Primary>}
    >
      <S.CalendarHelp>여행 기간에 맞춰 날짜별 일정을 짜드려요</S.CalendarHelp>
      <DateRangePicker start={calendar.start} end={calendar.end} onChange={(start, end) => setCalendar({ start, end })} />
    </TripSheet>
  );

  return (
    <TripSheet key="flight" title="항공권 등록" contentGap={24} onClose={onClose} closeDisabled={pending}
      footer={<S.Primary type="button" disabled={pending || !allowedCode || !date} onClick={() => void submit()}>
        {pending ? flight ? "등록하고 있어요" : "항공편을 찾고 있어요" : flight
          ? (direction === "outbound" ? "가는 편 등록하기" : "오는 편 등록하기")
          : "항공편 찾기"}
      </S.Primary>}
    >
      <O.Tabs>
        {(["outbound", "inbound"] as const).map((tab) => (
          <button key={tab} type="button" aria-pressed={direction === tab} disabled={pending} onClick={() => {
            setDirection(tab);
            const saved = draft[tab];
            const savedDate = saved?.date;
            setDate(savedDate && savedDate >= period.start && savedDate <= period.end
              ? savedDate : tab === "outbound" ? period.start : period.end);
            setCode(saved?.code ?? "");
            setFlight(savedDate && savedDate >= period.start && savedDate <= period.end ? saved : null);
            setError("");
          }}>{tab === "outbound" ? "가는 편" : "오는 편"}</button>
        ))}
      </O.Tabs>
      <ReservationSearchField label="편명" placeholder="예) KE723, 7C1301" maxLength={10} value={code} selected={Boolean(flight)}
        readOnly={pending} onChange={(event) => { setCode(event.target.value.toUpperCase()); setFlight(null); setError(""); }} />
      <O.DateSection>
        <O.SectionTitle>
          <strong>탑승일</strong>
          <button type="button" disabled={pending} aria-label="탑승일 달력 열기" onClick={() => setCalendar(period)}>{dateLabel(date)}</button>
        </O.SectionTitle>
        <fieldset disabled={pending}><ReservationDays start={period.start} end={period.end} selected={[date]} label="탑승일" onSelect={selectDate} /></fieldset>
      </O.DateSection>
      {flight && (
        <O.FlightResult>
          <strong>{flight.airline}</strong>
          <S.FlightTimes>
            <div><small>{flight.from.split(" ").at(-1)}</small><strong>{flight.departure}</strong></div>
            <O.FlightLine><img src={flightAirplane} alt="" /></O.FlightLine>
            <div><small>{flight.to.split(" ").at(-1)}</small><strong>{flight.arrival}</strong></div>
          </S.FlightTimes>
        </O.FlightResult>
      )}
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
    </TripSheet>
  );
}

function StaySheet({ draft, onClose, onSave, prepareServerTrip }: ReservationSheetProps) {
  const [stays, setStays] = useState(draft.stays);
  const [editing, setEditing] = useState<Stay | null | undefined>(draft.stays.length ? undefined : null);
  const [hotel, setHotel] = useState<SearchChoice | null>(null);
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [calendar, setCalendar] = useState<{ start: string; end: string }>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const live = isApiEnabled() && hasAuthSession();
  const nights = dayCount(draft.startDate, draft.endDate) - 1;
  const searched = query.trim();
  const active = editing !== undefined && !hotel;
  const { result, clearResult } = usePlaceSearch(draft, prepareServerTrip, searched, active, true);
  const mockMatches: SearchResult | undefined = !isApiEnabled() && searched
    ? { query: searched, places: mockHotels.filter((place) => (place.name + " " + place.address).toLowerCase().includes(searched.toLowerCase())) }
    : undefined;
  const totalBooked = stays.reduce((total, stay) => total + dayCount(stay.startDate, stay.endDate) - 1, 0);

  function startEditing(stay: Stay | null) {
    setEditing(stay);
    setHotel(stay);
    setQuery(stay?.name ?? "");
    setCheckIn(stay?.startDate ?? "");
    setCheckOut(stay?.endDate ?? "");
    setError("");
    clearResult();
  }

  function selectDay(date: string) {
    setError("");
    if (checkIn && !checkOut && date > checkIn) {
      setCheckOut(date);
    } else if (date < draft.endDate) {
      setCheckIn(date);
      setCheckOut("");
    }
  }

  function registerStay() {
    if (!hotel || !checkIn || !checkOut) return;
    const stay = { ...hotel, id: editing?.id ?? crypto.randomUUID(), startDate: checkIn, endDate: checkOut };
    const next = [...stays.filter((current) => current.id !== editing?.id), stay]
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const invalid = validateStays(next, draft.startDate, draft.endDate);
    if (invalid) { setError(invalid); return; }
    setStays(next);
    setEditing(undefined);
    setError("");
  }

  async function complete() {
    if (pending.current) return;
    if (!live || stays === draft.stays) {
      onSave({ ...draft, stays });
      return;
    }
    const input = stays.flatMap((stay) => stay.placeId
      ? [{ placeId: stay.placeId, checkIn: stay.startDate, checkOut: stay.endDate }]
      : []);
    if (input.length !== stays.length) {
      setError("검색 결과에서 숙소를 선택해 주세요.");
      return;
    }
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const id = await prepareServerTrip(reservationDraft(draft));
      const saved = await saveStays(id, input);
      onSave({ ...draft, tripId: String(id), stays: applyReservationsToDraft(draft, saved).stays });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "숙소를 저장하지 못했어요.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  if (calendar) return (
    <TripSheet key="stay-calendar" title="언제 머무르세요?" variant="dates" compactHeader minHeight={642} onClose={() => setCalendar(undefined)}
      footer={<S.Primary type="button" disabled={!calendar.start || !calendar.end || calendar.start >= calendar.end} onClick={() => {
        setCheckIn(calendar.start);
        setCheckOut(calendar.end);
        setError("");
        setCalendar(undefined);
      }}>선택 완료</S.Primary>}
    >
      <S.CalendarHelp>여행 기간에 맞춰 숙소를 배정해 주세요</S.CalendarHelp>
      <DateRangePicker start={calendar.start} end={calendar.end} initialMonth={draft.startDate}
        minDate={draft.startDate} maxDate={draft.endDate} onChange={(start, end) => setCalendar({ start, end })} />
    </TripSheet>
  );

  const form = editing !== undefined;
  return (
    <O.StaySheet key="stay" title="숙소 등록" minHeight={form ? 439 : 401} contentGap={24} closeDisabled={saving}
      onClose={form && stays.length ? () => setEditing(undefined) : onClose}
      footer={form
        ? <S.Primary type="button" disabled={!hotel || !checkIn || !checkOut || checkOut <= checkIn} onClick={registerStay}>숙소 등록하기</S.Primary>
        : <S.Primary type="button" disabled={saving} onClick={() => void complete()}>{saving ? "등록하고 있어요" : "완료"}</S.Primary>}
    >
      {form ? (
        <>
          <O.PlaceField>
            <ReservationSearchField label="숙소" aria-label="숙소 검색" placeholder="호텔, 숙소 이름 검색" value={query} selected={Boolean(hotel)}
              onChange={(event) => { setQuery(event.target.value); setHotel(null); clearResult(); setError(""); }} />
            {searched && active && <SearchResults
              result={live ? result : mockMatches} loading={live && !result} emptyText="검색 결과가 없어요. 숙소 이름을 확인해 주세요."
              onSelect={(place) => {
                if (place.city !== draft.city) { setError("여행 도시의 숙소를 선택해 주세요."); return; }
                setHotel(place);
                setQuery(place.name);
                setError("");
              }}
            />}
            {!live && isApiEnabled() && searched && <S.Help>로그인 후 숙소를 검색할 수 있어요.</S.Help>}
          </O.PlaceField>
          <O.DateSection>
            <O.SectionTitle>
              <button type="button" aria-label="묵는 날짜 달력 열기" disabled={!nights} onClick={() => setCalendar({ start: checkIn, end: checkOut })}>묵는 날짜</button>
              {checkIn && checkOut && <b>{dayCount(checkIn, checkOut) - 1}박</b>}
            </O.SectionTitle>
            <fieldset disabled={nights <= 0}><ReservationDays start={draft.startDate} end={draft.endDate}
              selected={[checkIn, checkOut].filter(Boolean)} range label="묵는 날짜" onSelect={selectDay} /></fieldset>
            <S.Help>{nights <= 0 ? "당일치기 여행은 숙박할 밤이 없어요." : checkIn && checkOut
              ? dateLabel(checkIn) + " 체크인 → " + dateLabel(checkOut) + " 체크아웃"
              : "체크인, 체크아웃 날짜를 차례로 눌러주세요"}</S.Help>
          </O.DateSection>
        </>
      ) : (
        <>
          <O.StaySummary>
            <strong>{totalBooked === nights ? nights + "박 모두 등록했어요" : nights + "박 중 " + totalBooked + "박 등록했어요"}</strong>
            <span>{dateLabel(draft.startDate).split(" ")[0]} – {dateLabel(draft.endDate).split(" ")[0]}</span>
          </O.StaySummary>
          <O.StayList>
            {stays.map((stay) => (
              <li key={stay.id}>
                <div><strong>{stay.name}</strong><small>{dateLabel(stay.startDate).split(" ")[0]} – {dateLabel(stay.endDate).split(" ")[0]}, {dayCount(stay.startDate, stay.endDate) - 1}박</small></div>
                <button type="button" disabled={saving} aria-label={stay.name + " 수정"} onClick={() => startEditing(stay)}>수정</button>
              </li>
            ))}
          </O.StayList>
          {totalBooked < nights && <O.AddStay type="button" disabled={saving} onClick={() => startEditing(null)}>숙소 추가</O.AddStay>}
        </>
      )}
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
    </O.StaySheet>
  );
}

function RentalSheet({ draft, onClose, onSave, prepareServerTrip }: ReservationSheetProps) {
  const [days, setDays] = useState(draft.rental?.days ?? []);
  const [calendarDays, setCalendarDays] = useState<string[]>();
  const [placeId, setPlaceId] = useState(draft.rental?.placeId);
  const [location, setLocation] = useState(draft.rental?.location ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const live = isApiEnabled() && hasAuthSession();
  const query = location.trim();
  const dates = rangeDates(draft.startDate, draft.endDate);
  const { result, clearResult } = usePlaceSearch(draft, prepareServerTrip, query, !placeId && query.length >= 2, false);
  const locationField = (
    <O.PlaceField>
      <ReservationSearchField label="픽업, 반납 장소" placeholder="공항, 역, 영업소 검색" value={location} selected={Boolean(placeId)}
        readOnly={saving} maxLength={200} onChange={(event) => {
          setLocation(event.target.value);
          setPlaceId(undefined);
          setError("");
          clearResult();
        }} />
      {live && !placeId && query.length >= 2 && (
        <SearchResults result={result} loading={!result} emptyText="해당 장소를 찾지 못했어요."
          onSelect={(place) => { setLocation(place.name); setPlaceId(place.placeId); clearResult(); }} />
      )}
    </O.PlaceField>
  );

  async function submit() {
    if (pending.current || !days.length || !query) return;
    const rental = { days: [...days].sort(), location: query, placeId };
    if (!live) { onSave({ ...draft, rental }); return; }
    if (!placeId) { setError("검색 결과에서 픽업·반납 장소를 선택해 주세요."); return; }
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const id = await prepareServerTrip(reservationDraft(draft));
      const saved = await saveRental(id, rental.days, placeId);
      onSave({ ...draft, tripId: String(id), rental: applyReservationsToDraft(draft, saved).rental });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "렌터카 정보를 저장하지 못했어요.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  if (calendarDays) return (
    <TripSheet key="rental-calendar" title="언제 빌리시나요?" variant="dates" onClose={() => setCalendarDays(undefined)}
      footer={<S.Primary type="button" disabled={!calendarDays.length} onClick={() => {
        setDays(calendarDays);
        setCalendarDays(undefined);
      }}>선택 완료</S.Primary>}
    >
      <DateRangePicker start="" end="" initialMonth={draft.startDate} minDate={draft.startDate} maxDate={draft.endDate}
        multiple={{ selected: calendarDays, onToggle: (date) => setCalendarDays(toggleId(calendarDays, date)) }}
      />
      {locationField}
    </TripSheet>
  );

  return (
    <TripSheet key="rental" title="렌터카 등록" contentGap={24} onClose={onClose} closeDisabled={saving}
      footer={<S.Primary type="button" disabled={saving || !days.length || !query || (live && !placeId)} onClick={() => void submit()}>
        {saving ? "등록하고 있어요" : "렌터카 등록하기"}
      </S.Primary>}
    >
      {locationField}
      <O.DateSection>
        <O.SectionTitle>
          <button type="button" disabled={saving} aria-label="렌터카 달력 열기" onClick={() => setCalendarDays(days)}>렌터카 쓰는 날</button>
          {days.length > 0
            ? <b>{days.length}일</b>
            : <button type="button" className="select-all" onClick={() => setDays(dates)}>전체 선택</button>}
        </O.SectionTitle>
        <fieldset disabled={saving}><ReservationDays start={draft.startDate} end={draft.endDate} selected={days}
          label="렌터카 쓰는 날" onSelect={(date) => setDays((current) => toggleId(current, date))} /></fieldset>
        <S.Help>{days.length ? "고른 날만 차로 이동하는 코스로 짜요" : "여러 날 고를 수 있어요"}</S.Help>
      </O.DateSection>
      {error && <S.ErrorText role="alert">{error}</S.ErrorText>}
    </TripSheet>
  );
}

export default function OptionalInfoSheet({ mode, ...props }: OptionalInfoSheetProps) {
  if (mode === "flight") return <FlightSheet {...props} />;
  if (mode === "stay") return <StaySheet {...props} />;
  return <RentalSheet {...props} />;
}
