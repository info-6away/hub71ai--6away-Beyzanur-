// Turns a computed plan into the words and figures each screen shows.
// Kept apart from the engine so copy can change without touching scheduling.

import { daysBetween, formatStampDate } from "./dates";
import { type Answers, answerLabel, optionLabel } from "./questions";
import type { Plan, Task } from "./plan";

export type Tone = "ink" | "red" | "green";

/** ±range around an estimate: durations are unverified, so they are never shown as a single number. */
export function estimateRange(days: number): [number, number] {
  return [Math.max(1, Math.round(days * 0.7)), Math.round(days * 1.5)];
}

export function arrivalRange(plan: Plan): [number, number] {
  return [Math.round(plan.arrival * 0.85), Math.round(plan.arrival * 1.3)];
}

export function risk(plan: Plan, a: Answers, today: string): { label: string; tone: Tone } {
  const target = a.when ? daysBetween(today, a.when) : Infinity;
  const [lo, hi] = arrivalRange(plan);
  if (lo > target) return { label: "NOT REACHABLE", tone: "red" };
  if (hi > target) return { label: "AT RISK", tone: "red" };
  return { label: "ON TRACK", tone: "green" };
}

export type TaskTone = "default" | "critical" | "blocked";

export interface TaskView {
  status: string;
  tone: TaskTone;
  /** Large card: wide or tall on the plan grid. */
  prominent: boolean;
  waitingOn: string;
  /** "AFTER: …" line, shown when there is no company layer to explain the wait. */
  showAfter: boolean;
  estimate: string;
}

export function taskView(t: Task, plan: Plan): TaskView {
  const state = t.done
    ? "DONE"
    : t.blocked
      ? "BLOCKED"
      : t.inProgress
        ? "IN PROGRESS"
        : t.optional
          ? "OPTIONAL"
          : t.deps.length === 0
            ? "READY"
            : "QUEUED";
  const [lo, hi] = estimateRange(t.duration);
  return {
    status: t.critical && !t.blocked ? `CRITICAL · ${state}` : state,
    tone: t.blocked ? "blocked" : t.critical ? "critical" : "default",
    prominent: t.row > 1 || t.col >= 7,
    waitingOn: t.deps.map((d) => plan.byId[d]!.title).join(", "),
    showAfter: !t.blocked && t.deps.length > 0 && plan.profile !== "founder_new",
    estimate: `EST. ${lo}–${hi} DAYS · TODO(verify)`,
  };
}

export function planHeader(plan: Plan, a: Answers) {
  const tasks = plan.tasks.length;
  if (plan.profile === "founder_new") {
    const blocked = plan.tasks.filter((t) => t.blocked).length;
    return {
      kicker: `SHEET 01 · ${optionLabel("build", a.build).toUpperCase()} · NOT YET ESTABLISHED`,
      headline: "Company first, then people.",
      summary: `${tasks} tasks across two layers. ${blocked} of your people tasks are blocked until the company holds an establishment card — the licence date sets your arrival.`,
    };
  }
  const summary = `${tasks} tasks, one layer. No licensing in your path — your arrival is set by your documents and your lease in ${plan.areaLabel}.`;
  if (plan.profile === "founder_established") {
    return { kicker: "SHEET 01 · FOUNDER · COMPANY ALREADY LICENSED", headline: "Your plan starts at the visa.", summary };
  }
  return {
    kicker: `SHEET 01 · EMPLOYEE · ${optionLabel("visaStage", a.visaStage ?? "not_started").toUpperCase()}`,
    headline: a.visaStage === "approved" ? "Your plan starts at the medical." : "Your plan starts at the visa.",
    summary,
  };
}

/** Shown in place of Layer A when someone else's licence already covers the company side. */
export function layerBehindYou(plan: Plan): string | null {
  if (plan.profile === "founder_new") return null;
  const holder = plan.profile === "employee" ? "Your employer" : "Your company";
  return `${holder} already holds a licence and an establishment card, so there is no company layer here. Your plan starts at the entry permit — and its length is set by your own documents and your lease, not by licensing.`;
}

export interface TitleCell {
  k: string;
  v: string;
  wide?: boolean;
  tone?: Tone;
}

export function titleBlock(plan: Plan, a: Answers, today: string): TitleCell[] {
  const [lo, hi] = arrivalRange(plan);
  const status = risk(plan, a, today);
  const moving = answerLabel("moving", a).toLowerCase();
  const company =
    plan.profile === "founder_new"
      ? `${optionLabel("build", a.build)} · name pending`
      : plan.profile === "employee"
        ? "Employer · licensed"
        : "Your company · licensed";
  const cells: TitleCell[] = [
    { k: "PROJECT", v: "WUSOOL" },
    { k: "SHEET", v: "01 OF 03" },
    { k: "COMPANY", v: company, wide: true },
    { k: "PERSON", v: `${plan.profile === "employee" ? "Employee" : "Founder"} · ${moving}`, wide: true },
  ];
  if (plan.profile === "employee") cells.push({ k: "HOUSING", v: answerLabel("allowance", a).toUpperCase(), wide: true });
  cells.push(
    { k: "GENERATED", v: formatStampDate(today) },
    { k: "DURATION · EST.", v: `${lo}–${hi} DAYS` },
    { k: "TARGET", v: `${plan.targetLabel.toUpperCase()} · DAY ${a.when ? daysBetween(today, a.when) : "—"}` },
    { k: "STATUS", v: status.label, tone: status.tone },
    plan.licenceDay !== null
      ? { k: "HEADLINE", v: `ARRIVAL = LICENCE + ${lo - plan.licenceDay}+ DAYS`, wide: true, tone: "red" }
      : { k: "HEADLINE", v: `ARRIVAL ≈ DAY ${lo}–${hi}`, wide: true },
  );
  return cells;
}

export function bridgeLine(plan: Plan) {
  const licence = plan.licenceDay ?? 0;
  const [lo, hi] = arrivalRange(plan);
  return {
    licence: `LICENCE ≈ DAY ${Math.round(licence * 0.85)}–${Math.round(licence * 1.3)}`,
    arrival: `ARRIVAL ≈ DAY ${lo}–${hi}`,
  };
}

export interface Verdict {
  word: string;
  sub: string;
  source: string;
  notes: { k: string; v: string }[];
  tradeoffs: string[];
  alternatives: { name: string; why: string }[];
}

/** Jurisdiction verdict for a new company; null when there is no company to license. */
export function verdict(plan: Plan, a: Answers): Verdict | null {
  if (plan.profile !== "founder_new") return null;
  const invoicing = plan.mainlandReasons.includes("invoicing");
  const publicFacing = plan.walkIn || plan.food;

  const notes = [
    {
      k: `INPUT · ${optionLabel("pays", a.pays).toUpperCase()}`,
      v: invoicing
        ? "Invoicing UAE customers directly is the trade a mainland licence exists for."
        : plan.mainland
          ? "With no UAE invoices, this answer alone would allow a free zone — the inputs below are what decide it."
          : "With no UAE invoices, a free zone covers the activity you described.",
    },
  ];
  if (plan.walkIn) {
    notes.push({
      k: "INPUT · CUSTOMERS WALK IN",
      v: "Public-facing premises are licensed through ADDED and need a registered tenancy before the licence.",
    });
  }
  if (plan.food) {
    notes.push({
      k: "INPUT · FOOD & BEVERAGE",
      v: "ADAFSA food-establishment approval sits between your lease and your licence.",
    });
  }
  notes.push({
    k: `INPUT · ${plan.staff} ON PAYROLL`,
    v:
      plan.staff >= 6
        ? "Headcount at this level ties visa allocation to registered floor area — TODO(verify)."
        : "A small team keeps premises options open; check the visa allocation each option carries.",
  });

  if (plan.mainland) {
    return {
      word: "Mainland",
      sub: "LICENSED BY ADDED · APPLIED THROUGH TAMM",
      source: "ADDED.GOV.AE",
      notes,
      tradeoffs: [
        publicFacing
          ? "A registered physical lease is required before the licence — there is no virtual-office route for walk-in trade."
          : "A registered lease is part of the licence application — check which premises types ADDED accepts for your activity. TODO(verify)",
        "Moving premises later means re-registering the tenancy in Tawtheeq and updating the licence.",
        "Fees and timelines are not yet verified for your activity — shown as ranges, TODO(verify).",
      ],
      alternatives: [
        {
          name: "Free zone",
          why: invoicing
            ? "Would need a mainland distributor or branch to invoice your UAE customers directly."
            : "Would not cover the public-facing premises your business depends on, which are licensed through ADDED.",
        },
        { name: "Offshore entity", why: "Cannot trade inside the UAE or sponsor residence visas." },
      ],
    };
  }
  return {
    word: "Free zone",
    sub: "SHORTLIST · ADGM · KEZAD · COMPARE ACTIVITY LISTS",
    source: "ADGM.COM",
    notes,
    tradeoffs: [
      "You cannot invoice UAE mainland customers directly without a distributor or a mainland branch.",
      "Your office must sit inside the zone, which narrows where your team can work from.",
      "Fees and visa allocations differ by zone and are not yet verified — TODO(verify).",
    ],
    alternatives: [
      {
        name: "Mainland — ADDED",
        why: "Its main advantage, direct UAE trade, is one you would not use — you would carry its premises rules for nothing.",
      },
    ],
  };
}
