import { type Answers, type Area, optionLabel } from "./questions";
import type { Plan } from "./plan";

interface Listing {
  area: Area;
  type: "Apartment" | "Townhouse" | "Villa";
  beds: number;
  /** AED per year. */
  rent: number;
  /** Minutes to Al Maryah Island, estimated. */
  commute: number;
}

/** Illustrative listings only — not live inventory. */
export const SAMPLE_LISTINGS: Listing[] = [
  { area: "reem", type: "Apartment", beds: 1, rent: 85_000, commute: 10 },
  { area: "reem", type: "Apartment", beds: 2, rent: 125_000, commute: 12 },
  { area: "reem", type: "Apartment", beds: 3, rent: 170_000, commute: 12 },
  { area: "raha", type: "Apartment", beds: 2, rent: 110_000, commute: 25 },
  { area: "raha", type: "Townhouse", beds: 3, rent: 165_000, commute: 25 },
  { area: "khalifa", type: "Villa", beds: 3, rent: 135_000, commute: 32 },
  { area: "khalifa", type: "Villa", beds: 4, rent: 160_000, commute: 30 },
  { area: "saadiyat", type: "Apartment", beds: 2, rent: 150_000, commute: 18 },
  { area: "saadiyat", type: "Villa", beds: 4, rent: 320_000, commute: 20 },
];

export interface HousingRow {
  areaLabel: string;
  type: string;
  beds: number;
  rent: string;
  commute: string;
  inChosenArea: boolean;
  /** Too few bedrooms for who is moving; shown dimmed. */
  tooSmall: boolean;
}

/** Chosen area first, then listings with enough bedrooms, then cheapest. */
export function housingRows(a: Answers, plan: Plan): HousingRow[] {
  const minBeds = plan.family ? 3 : 1;
  const rank = (l: Listing) => [l.area === a.area ? 0 : 1, l.beds >= minBeds ? 0 : 1, l.rent];
  return [...SAMPLE_LISTINGS]
    .sort((x, y) => {
      const [rx, ry] = [rank(x), rank(y)];
      return rx[0] - ry[0] || rx[1] - ry[1] || rx[2] - ry[2];
    })
    .map((l) => ({
      areaLabel: optionLabel("area", l.area),
      type: l.type,
      beds: l.beds,
      rent: l.rent.toLocaleString("en-US"),
      commute: `${l.commute} MIN`,
      inChosenArea: l.area === a.area,
      tooSmall: l.beds < minBeds,
    }));
}

export function housingNote(plan: Plan): string {
  return `${plan.family ? "A family move needs at least three bedrooms" : "One bedroom covers your move"}; rows below that are greyed. Commute is an estimate to Al Maryah Island. Whichever home you choose, its lease must be registered in Tawtheeq${plan.partner ? " before family sponsorship can open" : ""}.`;
}
