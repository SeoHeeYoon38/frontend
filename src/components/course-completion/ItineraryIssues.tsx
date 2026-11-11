import type { ValidationResult } from "../../api/types";

const issueLabels: Record<string, string> = {
  OUTSIDE_OPENING_HOURS: "영업시간을 벗어난 방문이에요.",
  CLOSED_ON_DAY: "방문일에 문을 닫아요.",
  FIXED_TIME_MISSED: "예약 시각보다 늦게 도착해요.",
  LONG_WAIT: "방문 전 대기 시간이 길어요.",
  DAY_OVERFLOW: "하루 일정이 가능한 시간을 넘었어요.",
  HOURS_UNKNOWN: "영업시간을 확인하지 못했어요.",
  PLACE_INFO_MISSING: "장소 정보를 확인하지 못했어요.",
  PLACE_LOCATION_MISSING: "장소 위치를 확인하지 못했어요.",
  ROUTE_NOT_FOUND: "이동 경로를 찾지 못했어요.",
  TRAVEL_ESTIMATED: "이동시간은 추정값이에요.",
  FAR_FROM_HOTEL: "숙소에서 첫 장소까지 거리가 멀어요.",
};

function ItineraryIssues({ validation }: { validation: ValidationResult }) {
  if (!validation.issues.length) return null;
  return (
    <section aria-label="일정 검증 결과">
      <p role="status">확인 사항 {validation.issues.length}건</p>
      <ul>
        {validation.issues.map((issue, index) => (
          <li key={`${issue.date}-${issue.itemId}-${issue.code}-${index}`}>
            {issue.date} · {issueLabels[issue.code] ?? `일정 확인이 필요해요. (${issue.code})`}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ItineraryIssues;
