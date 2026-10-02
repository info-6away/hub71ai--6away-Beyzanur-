// Answers live in the URL query string: a plan is shareable and reloadable,
// and nothing is stored on a server.

import { isIsoDate } from "./dates";
import {
  type Answers,
  type ChoiceId,
  type Option,
  type QuestionId,
  OPTIONS,
  PAYROLL_MAX,
  PAYROLL_MIN,
  questionSequence,
  targetDateOptions,
} from "./questions";

export type SearchParams = Record<string, string | string[] | undefined>;

export const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function choice<K extends ChoiceId>(id: K, raw: string | undefined): Answers[K] | undefined {
  return (OPTIONS[id] as Option[]).some((o) => o.value === raw) ? (raw as Answers[K]) : undefined;
}

function payroll(raw: string | undefined): number | undefined {
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  return n >= PAYROLL_MIN && n <= PAYROLL_MAX ? n : undefined;
}

/** Keeps only answers to questions this person is actually asked. */
export function pruneToSequence(a: Answers): Answers {
  const keep = questionSequence(a);
  return Object.fromEntries(
    Object.entries(a).filter(([id, value]) => value !== undefined && keep.includes(id as QuestionId)),
  ) as Answers;
}

/** Parses untrusted query params; anything unrecognised is dropped. */
export function parseAnswers(params: SearchParams): Answers {
  const get = (id: QuestionId) => firstParam(params[id]);
  const when = get("when");
  return pruneToSequence({
    role: choice("role", get("role")),
    visaStage: choice("visaStage", get("visaStage")),
    allowance: choice("allowance", get("allowance")),
    established: choice("established", get("established")),
    build: choice("build", get("build")),
    pays: choice("pays", get("pays")),
    payroll: payroll(get("payroll")),
    where: choice("where", get("where")),
    moving: choice("moving", get("moving")),
    when: when && isIsoDate(when) ? when : undefined,
    area: choice("area", get("area")),
  });
}

export const isComplete = (a: Answers) => questionSequence(a).every((id) => a[id] !== undefined);

/** Index of the first unanswered question, or of the last question when all are answered. */
export function openStep(a: Answers): number {
  const sequence = questionSequence(a);
  const open = sequence.findIndex((id) => a[id] === undefined);
  return open === -1 ? sequence.length - 1 : open;
}

export function toQuery(a: Answers, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  for (const id of questionSequence(a)) {
    const value = a[id];
    if (value !== undefined) params.set(id, String(value));
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params.toString();
}

export type Demo = "founder" | "employee";
export const isDemo = (value: string | undefined): value is Demo => value === "founder" || value === "employee";

/** Sample profiles behind the header's demo links; target dates move with today. */
export function demoAnswers(demo: Demo, today: string): Answers {
  const targets = targetDateOptions(today);
  if (demo === "employee") {
    return { role: "employee", visaStage: "filed", allowance: "yes", moving: "with_partner", when: targets[0].value, area: "reem" };
  }
  return {
    role: "founder",
    established: "no",
    build: "restaurant_fnb",
    pays: "uae_domestic",
    payroll: 9,
    where: "customer_facing",
    moving: "with_family",
    when: targets[2].value,
    area: "saadiyat",
  };
}
