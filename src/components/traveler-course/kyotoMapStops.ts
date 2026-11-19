import leg1 from "../../assets/traveler-course/route-leg-1.svg";
import leg2 from "../../assets/traveler-course/route-leg-2.svg";
import leg3 from "../../assets/traveler-course/route-leg-3.svg";

// Pin centers on the original 402 × 874 Kyoto map artwork with a place selected.
export const kyotoMapStops = [
  { id: "kiyomizu", x: 321, y: 540, leg: leg1, detail: "이른 아침 사람 없는 본당 전망" },
  { id: "sannenzaka", x: 233, y: 498, leg: leg2, detail: "기념품 가게와 찻집이 이어진 돌길" },
  { id: "yasaka", x: 188, y: 436, leg: leg3, detail: "해 질 무렵 골목 끝에 보이는 오층탑" },
  { id: "gion", x: 89, y: 290, detail: "저녁 등불이 켜진 전통 거리 산책" },
];
