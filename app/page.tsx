import { Onboarding } from "@/components/onboarding/onboarding";
import { firstParam, openStep, parseAnswers, toQuery } from "@/lib/answers";
import { todayInAbuDhabi } from "@/lib/dates";
import { type QuestionId, questionSequence } from "@/lib/questions";

/**
 * Onboarding. Starts empty, or from answers in the URL when a plan sends
 * someone back to revise (`?…&revise=<question>`).
 */
export default async function Home(props: PageProps<"/">) {
  const params = await props.searchParams;
  const answers = parseAnswers(params);
  const revise = firstParam(params.revise);
  const reviseStep = questionSequence(answers).indexOf(revise as QuestionId);

  return (
    <Onboarding
      key={toQuery(answers, revise ? { revise } : {})}
      today={todayInAbuDhabi()}
      initialAnswers={answers}
      initialStep={reviseStep >= 0 ? reviseStep : openStep(answers)}
    />
  );
}
