import type { DirectoryTab } from "./catalogue";
import type { Plan } from "./plan";

export type PlanTab = "plan" | "timeline" | "housing" | "hr" | DirectoryTab;

/** The tabs a plan shows, in order; some exist only for certain profiles. */
export function planTabs(plan: Plan): { id: PlanTab; label: string }[] {
  const tabs: [PlanTab, string][] = [
    ["plan", "PLAN"],
    ["timeline", "TIMELINE"],
    ["housing", "HOUSING"],
  ];
  if (plan.profile === "founder_new") tabs.push(["company", "COMPANY SETUP"]);
  if (plan.family) tabs.push(["schools", "SCHOOLS"]);
  tabs.push(
    ["insurance", "HEALTH COVER"],
    ["banking", "BANKING"],
    ["logistics", "MOVING & LOGISTICS"],
    ["settling", "SETTLING IN"],
  );
  if (plan.profile === "employee") tabs.push(["hr", "HR & PACKAGE"]);
  return tabs.map(([id, label], i) => ({ id, label: `${String(i + 1).padStart(2, "0")} ${label}` }));
}
