// The planning engine: turns answers into a dependency graph of tasks,
// schedules it, and finds the critical path to arrival. Pure and synchronous.

import { formatMonthYear } from "./dates";
import { type Answers, answerLabel } from "./questions";

export type TaskId =
  | "A01" | "A02" | "A03" | "A04" | "A05" | "A06" | "A07" | "A08"
  | "B01" | "B02" | "B03" | "B04" | "B05" | "B06" | "B07" | "B08" | "B09" | "B10";

export type Category =
  | "licensing" | "premises" | "banking" | "visa" | "insurance" | "housing" | "school" | "travel" | "settling";

/** Who is moving, which decides whether there is a company layer at all. */
export type Profile = "employee" | "founder_new" | "founder_established";

/** Why a new company is routed to a mainland (ADDED) licence rather than a free zone. */
export type MainlandReason = "invoicing" | "walk_in" | "food";

export interface Task {
  id: TaskId;
  /** A = establish the company, B = relocate the people. */
  layer: "A" | "B";
  category: Category;
  title: string;
  desc: string;
  why: string;
  /** Estimated days — TODO(verify). */
  duration: number;
  /** Earliest day the task may start, regardless of dependencies. */
  minStart: number;
  deps: TaskId[];
  source: string;
  provider: string | null;
  /** Card footprint on the 12-column plan grid. */
  col: number;
  row: number;
  /** The licence → visa hand-off between the two layers. */
  bridge: boolean;
  done: boolean;
  inProgress: boolean;
  optional: boolean;
  // Scheduled
  start: number;
  end: number;
  critical: boolean;
  /** People task that cannot start until the company holds its establishment card. */
  blocked: boolean;
  /** Every task this one transitively waits on. */
  upstream: TaskId[];
}

type TaskSpec = Pick<Task, "id" | "layer" | "category" | "title" | "desc" | "why" | "duration" | "source"> &
  Partial<Pick<Task, "minStart" | "deps" | "provider" | "col" | "row" | "bridge" | "done" | "inProgress" | "optional">>;

export interface Plan {
  profile: Profile;
  /** Tasks in display order: layer A, then layer B. */
  tasks: Task[];
  byId: Partial<Record<TaskId, Task>>;
  /** Day the move completes (end of arrival logistics). */
  arrival: number;
  /** Day the trade licence is issued, for a new company. */
  licenceDay: number | null;
  mainland: boolean;
  mainlandReasons: MainlandReason[];
  food: boolean;
  walkIn: boolean;
  staff: number;
  partner: boolean;
  family: boolean;
  areaLabel: string;
  targetLabel: string;
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const word = (n: number) => WORDS[n] ?? String(n);
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function profileOf(a: Answers): Profile {
  if (a.role === "employee") return "employee";
  return a.established === "yes" ? "founder_established" : "founder_new";
}

function mainlandReasonsFor(a: Answers): MainlandReason[] {
  const reasons: MainlandReason[] = [];
  if (a.pays === "uae_domestic" || a.pays === "mixed") reasons.push("invoicing");
  if (a.where === "customer_facing") reasons.push("walk_in");
  if (a.build === "restaurant_fnb") reasons.push("food");
  return reasons;
}

function jurisdictionWhy(reasons: MainlandReason[]): string {
  if (reasons.includes("invoicing")) {
    return "You invoice UAE customers directly — the trade a free-zone licence does not cover on its own — so ADDED, not a free zone, issues your licence.";
  }
  if (reasons.includes("food")) {
    return "A food business serving the public needs an ADDED licence and ADAFSA approval of its premises, so the mainland route applies even though you do not invoice UAE customers directly.";
  }
  if (reasons.includes("walk_in")) {
    return "Customers walk into your premises, which makes them a mainland matter for ADDED — so the mainland route applies even though you do not invoice UAE customers directly.";
  }
  return "Every invoice you raise goes abroad, so a free-zone licence covers your activity; direct UAE trade, the mainland’s main advantage, is one you would not use.";
}

function specsFor(a: Answers, plan: Omit<Plan, "tasks" | "byId" | "arrival" | "licenceDay">): TaskSpec[] {
  const { profile, mainland, food, walkIn, staff, partner, family, areaLabel, targetLabel } = plan;
  const founder = profile === "founder_new";
  const employee = profile === "employee";
  const stage = a.visaStage ?? "not_started";
  const licensing = mainland ? "ADDED.GOV.AE" : "ADGM.COM";
  const specs: TaskSpec[] = [];
  const add = (spec: TaskSpec) => specs.push(spec);

  if (founder) {
    add({
      id: "A01", layer: "A", category: "licensing", title: "Jurisdiction decision", duration: 3, col: 5, source: licensing,
      desc: mainland
        ? "Commit to a mainland licence through ADDED before reserving a name."
        : "Shortlist free zones and compare their permitted activity lists.",
      why: jurisdictionWhy(plan.mainlandReasons),
    });
    add({
      id: "A02", layer: "A", category: "licensing", title: "Trade name reservation", duration: 3, col: 3, deps: ["A01"],
      source: "TAMM.ABUDHABI",
      desc: "Reserve the trade name through TAMM.",
      why: "Initial approval references the reserved name. A rejected name sends A03 back to the start.",
    });
    add({
      id: "A03", layer: "A", category: "licensing", title: "Initial approval", duration: 6, col: 4, deps: ["A02"], source: licensing,
      desc: mainland
        ? "Obtain ADDED initial approval for the licensed activity."
        : "Obtain the free zone’s initial approval for the activity.",
      why: "Landlords ask for initial approval before a commercial lease, which is why it sits ahead of premises rather than alongside them.",
    });
    add({
      id: "A04", layer: "A", category: "premises", title: "Premises lease & Tawtheeq registration", duration: 14, col: 7, row: 2,
      deps: ["A03"], source: "TAMM.ABUDHABI", provider: "Brokerage A · Brokerage B",
      desc: "Sign a commercial lease and register it in Tawtheeq — Abu Dhabi’s system. Ejari is Dubai’s and does not apply.",
      why: walkIn
        ? "Walk-in customers make this an ADDED matter rather than a free zone one, which is what pulls tenancy registration onto the critical path."
        : staff >= 6
          ? `${capitalise(word(staff))} people on payroll puts you past what a flexi-desk supports, so office floor area becomes a hiring constraint rather than an expense.`
          : `With ${word(staff)} on payroll a flexi-desk may be enough — check the visa allocation attached to the space before you compare rents.`,
    });
    if (food) {
      add({
        id: "A05", layer: "A", category: "licensing", title: "Food establishment approval", duration: 14, col: 5, row: 2,
        deps: ["A04"], source: "ADAFSA.GOV.AE",
        desc: "Apply to ADAFSA for food-establishment approval of the premises.",
        why: "Serving food puts ADAFSA between your tenancy and your licence. It inspects the kitchen inside the lease you signed in A04, so a layout change means a new inspection.",
      });
    }
    add({
      id: "A06", layer: "A", category: "licensing", title: "Licence issuance", duration: 10, col: 5, deps: [food ? "A05" : "A04"],
      source: licensing,
      desc: "Pay the licence fee and receive the trade licence. Fee: TODO(verify).",
      why: "Every task for your people traces back to this date. A week lost here is a week added to arrival — nothing in Layer B can absorb it.",
    });
    add({
      id: "A07", layer: "A", category: "licensing", title: "Establishment card", duration: 7, col: food ? 7 : 12, row: food ? 2 : 1,
      deps: ["A06"], source: "ICP.GOV.AE", bridge: true,
      desc: "Register the company with ICP so it can sponsor residence visas.",
      why: "Your residence visa cannot open before the company holds an establishment card, so the licence date — not your start date — is what moves your family’s arrival.",
    });
    add({
      id: "A08", layer: "A", category: "banking", title: "Corporate bank account", duration: 25, col: 5, deps: ["A06"], source: "U.AE",
      provider: "Bank A · Bank B",
      desc: "Open the company account with the issued licence and registered tenancy.",
      why: `Banks ask for the issued licence, so this cannot run in parallel with A04 — and payroll for ${word(staff)} people has nowhere to run from until it opens.`,
    });
  }

  add({
    id: "B01", layer: "B", category: "visa", title: "Entry permit",
    duration: employee && stage === "approved" ? 1 : employee && stage === "filed" ? 5 : 8,
    done: employee && stage === "approved",
    inProgress: employee && stage === "filed",
    col: founder ? 4 : 5, deps: founder ? ["A07"] : [], source: "ICP.GOV.AE", bridge: founder,
    desc: founder
      ? "The company files your entry permit with ICP."
      : employee
        ? "Your employer files the entry permit with ICP."
        : "Your company files your entry permit with ICP.",
    why: founder
      ? "The company is your sponsor. Until ICP issues its establishment card, there is no sponsor on file for the permit to name."
      : !employee
        ? "Your company already holds an establishment card, so it can file your permit today — the bottleneck moves from licensing to your own attested documents."
        : stage === "approved"
          ? "Your permit is approved, so the clock now runs on you: the medical test and biometrics are the next two steps, and both need you in the country."
          : stage === "filed"
            ? "Your employer has filed with ICP. Nothing else in the visa chain can start until approval, so send any missing attested documents the day HR asks."
            : "Your employer already holds an establishment card, so the permit can be filed now — ask HR for the filing date, because every visa step counts from it.",
  });
  add({
    id: "B02", layer: "B", category: "visa", title: "Medical fitness test", duration: 3, col: founder ? 4 : 3, deps: ["B01"],
    source: "TAMM.ABUDHABI",
    desc: "Attend the medical fitness test at an approved centre.",
    why: "Results go straight into the residence visa file, so book it the week the entry permit lands — an earlier appointment cannot be used.",
  });
  add({
    id: "B08", layer: "B", category: "insurance", title: "Health cover", duration: 4, col: founder ? 5 : 3, deps: ["B01"],
    source: "TAMM.ABUDHABI", provider: "Insurer A · Insurer B",
    desc: "Bind a health policy that names you before visa issuance.",
    why: founder
      ? "Abu Dhabi requires health cover before a residence visa is issued. As the employer, your own company now buys this policy — for you first."
      : employee
        ? "Your employer’s policy has to name you before the visa is stamped. Ask HR for the policy number in week one, not at the end."
        : "Abu Dhabi requires health cover before a residence visa is issued. Your company buys this policy, and it has to name you before the visa is stamped.",
  });
  add({
    id: "B03", layer: "B", category: "visa", title: "Emirates ID biometrics", duration: 5, col: founder ? 4 : 3, deps: ["B02"],
    source: "ICP.GOV.AE",
    desc: "Give fingerprints and photo for the Emirates ID.",
    why: founder
      ? "ICP takes biometrics against an active entry permit, so this sits three steps behind your licence, not alongside it."
      : "ICP takes biometrics against an active entry permit. Once done, nothing on your side holds the residence visa back.",
  });
  add({
    id: "B04", layer: "B", category: "visa", title: "Residence visa", duration: 7, col: founder ? 7 : 5, row: founder ? 2 : 1,
    deps: ["B03", "B08"], source: "ICP.GOV.AE",
    desc: "Receive the residence visa linked to your Emirates ID.",
    why: founder
      ? "You become the company’s first sponsored resident. Every family visa after this one is sponsored by you, so your family’s dates inherit yours."
      : "With the company side already done, your visa chain runs in weeks, not months — so housing, not paperwork, becomes your longest item.",
  });

  if (employee && a.allowance === "provided") {
    add({
      id: "B06", layer: "B", category: "housing", title: `Employer housing · ${areaLabel}`, duration: 7, col: 7,
      source: "TAMM.ABUDHABI",
      desc: "Confirm the address and move-in date with HR.",
      why: `Housing is provided, so there is no lease for you to sign — but ${partner ? "your partner’s sponsorship" : "utility and ID address updates"} still need the registered tenancy, so ask HR for its Tawtheeq certificate.`,
    });
  } else if (founder) {
    // Signing waits for the residence visa, so the lease is scheduled after B04.
    add({
      id: "B06", layer: "B", category: "housing", title: `Home lease · ${areaLabel}`, duration: 14, col: 6, deps: ["B04"],
      source: "TAMM.ABUDHABI", provider: "Brokerage A · Brokerage B",
      desc: `Shortlist homes in ${areaLabel} now; sign and register the lease in Tawtheeq once your residence visa is issued.`,
      why: `Searching in ${areaLabel} can start now, but signing should wait: a lease without a residence visa means paying rent on a home your family cannot yet enter.`,
    });
  } else {
    add({
      id: "B06", layer: "B", category: "housing", title: `Home lease · ${areaLabel}`, duration: 30, col: 7, row: 2,
      source: "TAMM.ABUDHABI", provider: "Brokerage A · Brokerage B",
      desc: "Shortlist, sign and register a home lease in Tawtheeq.",
      why: `${partner ? "Your partner’s visa" : "Utility connections"} cannot start until a home lease in ${areaLabel} is registered in Tawtheeq, which makes the lease the longest item on your list.`,
    });
  }

  if (partner) {
    add({
      id: "B05", layer: "B", category: "visa", title: "Family sponsorship", duration: 12, col: founder ? 5 : 4, deps: ["B04", "B06"],
      source: "ICP.GOV.AE",
      desc: family ? "Sponsor residence visas for your partner and children." : "Sponsor a residence visa for your partner.",
      why: `Sponsoring ${family ? "your partner and children" : "your partner"} needs your residence visa and a home lease registered in Tawtheeq — so your housing contract is also a visa document.`,
    });
  }
  if (family) {
    add({
      id: "B07", layer: "B", category: "school", title: "School placement", duration: 90, col: 6, source: "U.AE",
      desc: "Apply to schools near your chosen area and hold a place.",
      why: "School placement closes before the August intake, so your area decision is really a schooling deadline — not a preference.",
    });
  }
  add({
    id: "B09", layer: "B", category: "travel", title: "Arrival logistics", duration: 5, col: founder ? 4 : 6,
    deps: partner ? ["B05"] : ["B04"], source: "U.AE",
    desc: "Book flights and shipping against confirmed visa dates.",
    why: `Book against the residence visa date, not your ${targetLabel || "target"} target — the gap between those two dates is what ordering costs you.`,
  });
  add({
    id: "B10", layer: "B", category: "settling", title: "Settling in", duration: 10, col: 3, deps: ["B09"], source: "U.AE",
    optional: true,
    desc: "Mobile line, utilities, driving licence conversion.",
    why: "Each of these asks for an Emirates ID. None can start earlier, so leave them for week one.",
  });
  return specs;
}

export function buildPlan(a: Answers): Plan {
  const profile = profileOf(a);
  const founder = profile === "founder_new";
  const mainlandReasons = founder ? mainlandReasonsFor(a) : [];
  const family = a.moving === "with_family";
  const base = {
    profile,
    mainland: mainlandReasons.length > 0,
    mainlandReasons,
    food: founder && a.build === "restaurant_fnb",
    walkIn: founder && a.where === "customer_facing",
    staff: a.payroll ?? 1,
    family,
    partner: family || a.moving === "with_partner",
    areaLabel: answerLabel("area", a) || "Al Reem Island",
    targetLabel: a.when ? formatMonthYear(a.when) : "",
  };

  const tasks: Task[] = specsFor(a, base).map((s) => ({
    minStart: 0, deps: [], provider: null, col: 4, row: 1, bridge: false, done: false, inProgress: false, optional: false,
    ...s,
    start: 0, end: 0, critical: false, blocked: false, upstream: [],
  }));
  const byId: Partial<Record<TaskId, Task>> = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const get = (id: TaskId) => byId[id]!;

  // Earliest start: after every dependency ends (dependencies visited first).
  const scheduled = new Set<TaskId>();
  const schedule = (t: Task) => {
    if (scheduled.has(t.id)) return;
    scheduled.add(t.id);
    t.deps.forEach((d) => schedule(get(d)));
    t.start = Math.max(t.minStart, ...t.deps.map((d) => get(d).end));
    t.end = t.start + t.duration;
  };
  tasks.forEach(schedule);

  // Critical path: walk back from arrival through whichever dependency set each start date.
  let cursor: Task | undefined = get("B09");
  while (cursor) {
    cursor.critical = true;
    const start: number = cursor.start;
    cursor = cursor.deps.map(get).find((d) => d.end === start);
  }

  const upstreamOf = (id: TaskId) => {
    const seen = new Set<TaskId>();
    const visit = (i: TaskId) =>
      get(i).deps.forEach((d) => {
        if (!seen.has(d)) {
          seen.add(d);
          visit(d);
        }
      });
    visit(id);
    return [...seen];
  };
  for (const t of tasks) {
    t.upstream = upstreamOf(t.id);
    t.blocked = founder && t.layer === "B" && t.upstream.includes("A07");
  }

  return {
    ...base,
    tasks,
    byId,
    arrival: get("B09").end,
    licenceDay: founder ? get("A06").end : null,
  };
}
