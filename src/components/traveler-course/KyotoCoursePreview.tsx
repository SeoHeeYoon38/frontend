import { kyotoMapStops } from "./kyotoMapStops";

export default function KyotoCoursePreview({ map, openStop }: { map: string; openStop: (id: string) => void }) {
  return <svg className="sample-preview" viewBox="0 0 362 300" preserveAspectRatio="xMidYMid slice">
    <g transform="translate(.2 -115) scale(.9)">
      <image href={map} width="402" height="874" />
      <g transform="translate(0 -120)">
        {kyotoMapStops.map((stop, index) => {
          const next = kyotoMapStops[index + 1];
          return stop.leg && next && <image key={stop.id} href={stop.leg} x={Math.min(stop.x, next.x) - 3}
            y={Math.min(stop.y, next.y) - 3} width={Math.abs(stop.x - next.x) + 6}
            height={Math.abs(stop.y - next.y) + 6} preserveAspectRatio="none" />;
        })}
        {kyotoMapStops.map((stop, index) => (
          <foreignObject key={stop.id} x={stop.x - 18} y={stop.y - 18} width="36" height="36">
            <button className="sample-pin" type="button" aria-label={`${index + 1}번 장소 지도에서 선택`}
              onClick={() => openStop(stop.id)}>{index + 1}</button>
          </foreignObject>
        ))}
      </g>
    </g>
  </svg>;
}
