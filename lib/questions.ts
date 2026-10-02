import { daysBetween, firstOfMonthAfter, formatMonthYear } from "./dates";

export interface Option<V extends string = string> {
  value: V;
  label: string;
  /** Short consequence shown at the end of the row, e.g. "MAINLAND LIKELY". */
  caption: string;
}

const options = <V extends string>(...list: Option<V>[]) => list;

export const OPTIONS = {
  role: options(
    { value: "employee", label: "I am joining an employer", caption: "PEOPLE ONLY" },
    { value: "founder", label: "I am setting up a company", caption: "COMPANY + PEOPLE" },
  ),
  visaStage: options(
    { value: "not_started", label: "Not yet", caption: "PLAN STARTS AT ENTRY PERMIT" },
    { value: "filed", label: "Entry permit filed", caption: "IN PROGRESS" },
    { value: "approved", label: "Entry permit approved", caption: "MEDICAL NEXT" },
  ),
  allowance: options(
    { value: "yes", label: "Yes, a housing allowance", caption: "SETS YOUR RENT BUDGET" },
    { value: "provided", label: "Housing is provided", caption: "NO LEASE TO SIGN" },
    { value: "no", label: "No, rent comes from salary", caption: "BUDGET FROM SALARY" },
  ),
  established: options(
    { value: "no", label: "No — I am setting it up", caption: "BOTH LAYERS" },
    { value: "yes", label: "Yes — it already holds a UAE licence", caption: "PEOPLE ONLY" },
  ),
  build: options(
    { value: "restaurant_fnb", label: "Restaurant or food & beverage", caption: "ADAFSA IN PATH" },
    { value: "consultancy", label: "Consultancy", caption: "PROFESSIONAL LICENCE" },
    { value: "trading", label: "Trading", caption: "COMMERCIAL LICENCE" },
    { value: "tech_startup", label: "Tech startup", caption: "FREE ZONE VIABLE" },
  ),
  pays: options(
    { value: "uae_domestic", label: "Customers in the UAE, invoiced directly", caption: "MAINLAND LIKELY" },
    { value: "export_only", label: "Customers outside the UAE only", caption: "FREE ZONE VIABLE" },
    { value: "international_remote", label: "International clients, delivered remotely", caption: "FREE ZONE VIABLE" },
    { value: "mixed", label: "A mix of UAE and overseas", caption: "MAINLAND LIKELY" },
  ),
  where: options(
    { value: "customer_facing", label: "Customers walk in", caption: "ADDED MATTER" },
    { value: "office_only", label: "An office, no walk-ins", caption: "EITHER ROUTE" },
    { value: "warehouse", label: "A warehouse or storage space", caption: "ZONING CHECK" },
    { value: "remote", label: "Remote — no fixed premises", caption: "FLEXI-DESK VIABLE" },
  ),
  moving: options(
    { value: "solo", label: "Just me", caption: "ONE VISA" },
    { value: "with_partner", label: "Me and a partner", caption: "+ SPONSORSHIP" },
    { value: "with_family", label: "Me, a partner and children", caption: "+ SCHOOL DEADLINE" },
  ),
  area: options(
    { value: "reem", label: "Al Reem Island", caption: "CITY · SHORT COMMUTE" },
    { value: "raha", label: "Al Raha Beach", caption: "MID-DISTANCE · NEAR YAS" },
    { value: "khalifa", label: "Khalifa City", caption: "VILLAS · LONGER DRIVE" },
    { value: "saadiyat", label: "Saadiyat Island", caption: "SCHOOLS · CULTURAL DISTRICT" },
  ),
};

type ValueOf<K extends keyof typeof OPTIONS> = (typeof OPTIONS)[K][number]["value"];
export type Role = ValueOf<"role">;
export type VisaStage = ValueOf<"visaStage">;
export type Allowance = ValueOf<"allowance">;
export type Established = ValueOf<"established">;
export type Build = ValueOf<"build">;
export type Pays = ValueOf<"pays">;
export type Premises = ValueOf<"where">;
export type Moving = ValueOf<"moving">;
export type Area = ValueOf<"area">;

export interface Answers {
  role?: Role;
  visaStage?: VisaStage;
  allowance?: Allowance;
  established?: Established;
  build?: Build;
  pays?: Pays;
  /** Year-one headcount, 1–60. */
  payroll?: number;
  where?: Premises;
  moving?: Moving;
  /** Target arrival date, ISO YYYY-MM-DD. */
  when?: string;
  area?: Area;
}

export type QuestionId = keyof Answers;
export type ChoiceId = keyof typeof OPTIONS;

export const PAYROLL_MIN = 1;
export const PAYROLL_MAX = 60;

interface QuestionCopy {
  /** Ledger label. */
  key: string;
  title: string;
  note?: string;
}

const COPY: Record<QuestionId, QuestionCopy> = {
  role: {
    key: "ROLE",
    title: "Are you joining an employer, or setting up a company?",
    note: "This one answer decides the shape of everything that follows.",
  },
  visaStage: {
    key: "VISA",
    title: "Has your employer started your visa?",
    note: "Your employer is your sponsor. Where they are in the process is where your plan begins.",
  },
  allowance: { key: "PACKAGE", title: "Does your package include a housing allowance?" },
  established: {
    key: "COMPANY",
    title: "Is your company already established in the UAE?",
    note: "A company without a UAE licence and establishment card cannot sponsor anyone yet.",
  },
  build: { key: "BUILDING", title: "What are you building?" },
  pays: {
    key: "REVENUE",
    title: "Who pays you?",
    note: "Whether you invoice UAE customers directly is what separates a mainland licence from a free-zone one.",
  },
  payroll: {
    key: "PAYROLL",
    title: "How many people on payroll in year one?",
    note: "Headcount decides the premises you need, and the premises decide the licence.",
  },
  where: { key: "PREMISES", title: "Where does the work happen?" },
  moving: { key: "MOVING", title: "Who is moving?" },
  when: { key: "TARGET", title: "When do you need to be here?" },
  area: {
    key: "AREA",
    title: "Where would you like to live?",
    note: "Commute is estimated to Al Maryah Island. Estimates only.",
  },
};

export type Question = QuestionCopy &
  ({ id: QuestionId; kind: "choice"; options: Option[] } | { id: "payroll"; kind: "stepper" });

/** Target dates: the first of the month in two, four and six months, then the next August school intake. */
export function targetDateOptions(today: string): Option[] {
  const near = [2, 4, 6].map((months) => firstOfMonthAfter(today, months));
  let year = Number(today.slice(0, 4));
  let intake = `${year}-08-01`;
  while (intake <= near[near.length - 1]) intake = `${++year}-08-01`;
  return [
    ...near.map((value) => ({ value, label: formatMonthYear(value), caption: `≈ DAY ${daysBetween(today, value)}` })),
    { value: intake, label: formatMonthYear(intake), caption: "SCHOOL INTAKE" },
  ];
}

export function getQuestion(id: QuestionId, today: string): Question {
  if (id === "payroll") return { ...COPY.payroll, id, kind: "stepper" };
  const list = id === "when" ? targetDateOptions(today) : OPTIONS[id];
  return { ...COPY[id], id, kind: "choice", options: list };
}

export const questionKey = (id: QuestionId) => COPY[id].key;

/** The questions this person is asked, in order. Depends on the role and company answers. */
export function questionSequence(a: Answers): QuestionId[] {
  if (a.role === "employee") return ["role", "visaStage", "allowance", "moving", "when", "area"];
  if (a.established === "yes") return ["role", "established", "moving", "when", "area"];
  return ["role", "established", "build", "pays", "payroll", "where", "moving", "when", "area"];
}

/** Until role (and, for founders, company status) is known, the length of the sequence is not. */
export const sequenceKnown = (a: Answers) => a.role === "employee" || a.established !== undefined;

export function optionLabel(id: ChoiceId, value: string | undefined): string {
  return (OPTIONS[id] as Option[]).find((o) => o.value === value)?.label ?? "";
}

/** Human-readable answer, as written in the ledger. */
export function answerLabel(id: QuestionId, a: Answers): string {
  if (id === "payroll") return a.payroll === undefined ? "" : `${a.payroll} on payroll`;
  if (id === "when") return a.when ? formatMonthYear(a.when) : "";
  return optionLabel(id, a[id]);
}

export function payrollNote(n: number): string {
  if (n <= 3) return "A FLEXI-DESK MAY COVER THIS — TODO(verify)";
  if (n <= 7) return "A SMALL REGISTERED OFFICE IS LIKELY";
  return "DEDICATED FLOOR AREA — PREMISES BECOME A HIRING CONSTRAINT";
}
