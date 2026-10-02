import { describe, expect, it } from "vitest";
import { demoAnswers, isComplete, openStep, parseAnswers, toQuery } from "./answers";
import { daysBetween, formatStampDate, todayInAbuDhabi } from "./dates";
import { buildPlan, type Plan, type TaskId } from "./plan";
import { planHeader, layerBehindYou, risk, verdict } from "./plan-view";
import { type Answers, OPTIONS, questionSequence, targetDateOptions } from "./questions";
import { planTabs } from "./tabs";

const TODAY = "2026-10-02";
const ids = (plan: Plan, pred: (id: TaskId) => boolean) => plan.tasks.map((t) => t.id).filter(pred);
const allText = (plan: Plan) => plan.tasks.flatMap((t) => [t.title, t.desc, t.why]).join("\n");

describe("dates", () => {
  it("offers target dates relative to today", () => {
    expect(targetDateOptions(TODAY).map((o) => [o.value, o.caption])).toEqual([
      ["2026-12-01", "≈ DAY 60"],
      ["2027-02-01", "≈ DAY 122"],
      ["2027-04-01", "≈ DAY 181"],
      ["2027-08-01", "SCHOOL INTAKE"],
    ]);
    expect(targetDateOptions("2027-01-15").map((o) => o.value)).toEqual([
      "2027-03-01",
      "2027-05-01",
      "2027-07-01",
      "2027-08-01",
    ]);
  });

  it("reads today in Abu Dhabi, not the server's zone", () => {
    // 22:30 UTC on 1 Oct is already 2 Oct in Abu Dhabi (UTC+4).
    expect(todayInAbuDhabi(new Date("2026-10-01T22:30:00Z"))).toBe("2026-10-02");
    expect(formatStampDate("2026-09-07")).toBe("07 SEP 2026");
    expect(daysBetween("2026-10-02", "2027-04-01")).toBe(181);
  });
});

describe("answers in the URL", () => {
  it("drops unknown values and answers to questions this person is not asked", () => {
    const a = parseAnswers({ role: "employee", visaStage: "filed", build: "consultancy", area: "mars", payroll: "9" });
    expect(a).toEqual({ role: "employee", visaStage: "filed" });
  });

  it("only accepts a payroll between 1 and 60 and real ISO dates", () => {
    const base = { role: "founder", established: "no" };
    expect(parseAnswers({ ...base, payroll: "0" }).payroll).toBeUndefined();
    expect(parseAnswers({ ...base, payroll: "61" }).payroll).toBeUndefined();
    expect(parseAnswers({ ...base, payroll: "12" }).payroll).toBe(12);
    expect(parseAnswers({ ...base, when: "2027-02-30" }).when).toBeUndefined();
  });

  it("round-trips through the query string", () => {
    const a = demoAnswers("founder", TODAY);
    expect(parseAnswers(Object.fromEntries(new URLSearchParams(toQuery(a))))).toEqual(a);
    expect(isComplete(a)).toBe(true);
    expect(openStep({ role: "founder", established: "no" })).toBe(2);
  });
});

describe("founder demo — restaurant, not yet established", () => {
  const a = demoAnswers("founder", TODAY);
  const plan = buildPlan(a);

  it("schedules both layers and arrives on day 111", () => {
    expect(plan.profile).toBe("founder_new");
    expect(ids(plan, (id) => id.startsWith("A"))).toEqual(["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08"]);
    expect(plan.licenceDay).toBe(50);
    expect(plan.arrival).toBe(111);
  });

  it("finds the critical path through licensing, the visa chain and the lease", () => {
    expect(ids(plan, (id) => plan.byId[id]!.critical)).toEqual([
      "A01", "A02", "A03", "A04", "A05", "A06", "A07", "B01", "B02", "B03", "B04", "B06", "B05", "B09",
    ]);
  });

  it("blocks people tasks behind the establishment card, except search-only tasks", () => {
    expect(ids(plan, (id) => plan.byId[id]!.blocked)).toEqual(["B01", "B02", "B08", "B03", "B04", "B06", "B05", "B09", "B10"]);
    expect(plan.byId.B07!.blocked).toBe(false);
  });

  it("is on track for the six-month target", () => {
    expect(risk(plan, a, TODAY)).toEqual({ label: "ON TRACK", tone: "green" });
    expect(planTabs(plan).map((t) => t.id)).toContain("schools");
  });

  // Bug fix: the lease used to finish before the residence visa its own advice said to wait for.
  it("signs the home lease only after the residence visa", () => {
    expect(plan.byId.B06!.start).toBe(plan.byId.B04!.end);
  });
});

describe("employee demo — permit filed, moving with a partner", () => {
  const a = demoAnswers("employee", TODAY);
  const plan = buildPlan(a);

  it("has one layer and the entry permit in progress", () => {
    expect(questionSequence(a)).toHaveLength(6);
    expect(ids(plan, (id) => id.startsWith("A"))).toEqual([]);
    expect(plan.byId.B01!.inProgress).toBe(true);
    expect(plan.arrival).toBe(47);
  });

  it("flags a two-month target as at risk", () => {
    expect(risk(plan, a, TODAY).label).toBe("AT RISK");
    expect(planTabs(plan).map((t) => t.id)).toContain("hr");
  });
});

// Bug fix: founders with an existing company were shown employee copy.
describe("founder whose company is already licensed", () => {
  const a: Answers = { role: "founder", established: "yes", moving: "with_partner", when: "2027-02-01", area: "raha" };
  const plan = buildPlan(a);

  it("never refers to an employer", () => {
    expect(plan.profile).toBe("founder_established");
    expect(allText(plan)).not.toMatch(/employer/i);
    expect(layerBehindYou(plan)).toMatch(/^Your company already holds/);
    expect(planHeader(plan, a).kicker).toBe("SHEET 01 · FOUNDER · COMPANY ALREADY LICENSED");
  });

  it("can file the entry permit straight away", () => {
    expect(plan.byId.B01!.inProgress).toBe(false);
    expect(plan.byId.B01!.deps).toEqual([]);
  });
});

// Bug fix: a mainland verdict always claimed the founder invoices UAE customers.
describe("mainland routing reasons", () => {
  const founder = (over: Partial<Answers>): Answers => ({
    ...demoAnswers("founder", TODAY),
    where: "office_only",
    pays: "export_only",
    ...over,
  });

  it("explains a food business on the mainland by food, not invoicing", () => {
    const a = founder({ build: "restaurant_fnb" });
    const plan = buildPlan(a);
    const v = verdict(plan, a)!;
    expect(plan.mainlandReasons).toEqual(["food"]);
    expect(v.word).toBe("Mainland");
    expect(plan.byId.A01!.why).not.toMatch(/invoice UAE customers directly —/);
    expect(v.notes[0].v).toMatch(/would allow a free zone/);
    expect(v.alternatives[0].why).not.toMatch(/invoice/);
  });

  it("only mentions walk-in trade when customers walk in", () => {
    const a = founder({ build: "consultancy", pays: "uae_domestic" });
    const v = verdict(buildPlan(a), a)!;
    expect(v.word).toBe("Mainland");
    expect(v.tradeoffs.join(" ")).not.toMatch(/walk-in/);
  });

  it("recommends a free zone when nothing ties the company to the mainland", () => {
    const a = founder({ build: "tech_startup", pays: "international_remote", where: "remote" });
    const plan = buildPlan(a);
    expect(plan.mainland).toBe(false);
    expect(verdict(plan, a)!.word).toBe("Free zone");
  });
});

describe("every combination of answers", () => {
  const combos: Answers[] = [];
  const whens = targetDateOptions(TODAY).map((o) => o.value);
  for (const moving of OPTIONS.moving.map((o) => o.value))
    for (const when of whens)
      for (const area of OPTIONS.area.map((o) => o.value)) {
        for (const visaStage of OPTIONS.visaStage.map((o) => o.value))
          for (const allowance of OPTIONS.allowance.map((o) => o.value))
            combos.push({ role: "employee", visaStage, allowance, moving, when, area });
        combos.push({ role: "founder", established: "yes", moving, when, area });
        for (const build of OPTIONS.build.map((o) => o.value))
          for (const pays of OPTIONS.pays.map((o) => o.value))
            for (const where of OPTIONS.where.map((o) => o.value))
              for (const payroll of [1, 5, 9])
                combos.push({ role: "founder", established: "no", build, pays, payroll, where, moving, when, area });
      }

  it("produces a consistent schedule and copy", () => {
    expect(combos.length).toBeGreaterThan(9000);
    const failures: string[] = [];
    const check = (ok: boolean, a: Answers, what: string) => ok || failures.push(`${what}: ${toQuery(a)}`);
    for (const a of combos) {
      check(isComplete(a), a, "incomplete");
      const plan = buildPlan(a);
      for (const t of plan.tasks) {
        check(t.deps.every((d) => t.start >= plan.byId[d]!.end), a, `${t.id} starts before a dependency ends`);
        check(t.end === t.start + t.duration, a, `${t.id} duration`);
      }
      check(plan.byId.B09!.critical, a, "arrival not critical");
      check(plan.arrival === Math.max(...plan.tasks.filter((t) => t.critical).map((t) => t.end)), a, "arrival");
      if (plan.profile === "founder_established") check(!/employer/i.test(allText(plan)), a, "employer copy");
      const v = verdict(plan, a);
      if (v && !plan.mainlandReasons.includes("invoicing")) {
        const text = [plan.byId.A01!.why, v.notes[0].v, ...v.alternatives.map((x) => x.why)].join(" ");
        check(!/You invoice UAE customers directly|invoice your UAE customers/.test(text), a, "invoicing copy");
      }
    }
    expect(failures).toEqual([]);
  });
});
