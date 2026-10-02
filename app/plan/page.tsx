import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DirectoryView } from "@/components/plan/directory";
import { Housing } from "@/components/plan/housing";
import { HrSheet } from "@/components/plan/hr-sheet";
import { PlanOverview } from "@/components/plan/plan-overview";
import { PlanTabs } from "@/components/plan/plan-tabs";
import { TimelineSheet } from "@/components/plan/timeline-sheet";
import { SiteHeader } from "@/components/site-header";
import { demoAnswers, firstParam, isComplete, isDemo, parseAnswers, toQuery } from "@/lib/answers";
import { directory, isDirectoryTab } from "@/lib/catalogue";
import { todayInAbuDhabi } from "@/lib/dates";
import { buildPlan } from "@/lib/plan";
import { planTabs } from "@/lib/tabs";

export const metadata: Metadata = { title: "Your plan" };

/**
 * The plan for a complete set of answers, read from the query string
 * (or `?demo=founder|employee`). Incomplete answers go back to onboarding.
 */
export default async function PlanPage(props: PageProps<"/plan">) {
  const params = await props.searchParams;
  const today = todayInAbuDhabi();
  const demo = firstParam(params.demo);
  const answers = isDemo(demo) ? demoAnswers(demo, today) : parseAnswers(params);
  if (!isComplete(answers)) redirect(`/?${toQuery(answers)}`);

  const plan = buildPlan(answers);
  const tabs = planTabs(plan);
  const tab = tabs.find((t) => t.id === firstParam(params.tab))?.id ?? "plan";

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <PlanTabs tabs={tabs} active={tab} query={isDemo(demo) ? `demo=${demo}` : toQuery(answers)} />
        {tab === "plan" && (
          <PlanOverview
            plan={plan}
            answers={answers}
            today={today}
            reviseHref={`/?${toQuery(answers, { revise: "role" })}`}
          />
        )}
        {tab === "timeline" && <TimelineSheet plan={plan} today={today} />}
        {tab === "housing" && <Housing plan={plan} answers={answers} />}
        {tab === "hr" && <HrSheet answers={answers} />}
        {isDirectoryTab(tab) && <DirectoryView directory={directory(tab, plan)} />}
      </main>
    </>
  );
}
