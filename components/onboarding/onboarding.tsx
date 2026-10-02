"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { pruneToSequence, toQuery } from "@/lib/answers";
import {
  type Answers,
  type QuestionId,
  answerLabel,
  getQuestion,
  questionKey,
  questionSequence,
  sequenceKnown,
} from "@/lib/questions";
import { Choices } from "./choices";
import { type LedgerEntry, LedgerAside, LedgerStrip } from "./ledger";
import { PayrollStepper } from "./payroll-stepper";

/** Long enough for the unchosen rows to fade out before the next question. */
const PICK_MS = 380;
const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  /** ISO date from the server, so option captions match between server and client. */
  today: string;
  initialAnswers: Answers;
  initialStep: number;
}

export function Onboarding({ today, initialAnswers, initialStep }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(initialStep);
  const [picking, setPicking] = useState<string | number | null>(null);
  const [draft, setDraft] = useState(initialAnswers.payroll ?? 3);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const sequence = questionSequence(answers);
  const index = Math.min(step, sequence.length - 1);
  const question = getQuestion(sequence[index], today);

  function pick(id: QuestionId, value: string | number) {
    if (picking !== null) return;
    setPicking(value);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(
      () => {
        const next = pruneToSequence({ ...answers, [id]: value } as Answers);
        const open = questionSequence(next).findIndex((q) => next[q] === undefined);
        setAnswers(next);
        if (open === -1) {
          // Leave `picking` set so the screen stays still until the plan replaces it.
          router.push(`/plan?${toQuery(next)}`);
          return;
        }
        setPicking(null);
        setStep(open);
        if (next.payroll !== undefined) setDraft(next.payroll);
      },
      reduced ? 0 : PICK_MS,
    );
  }

  function revise(id: QuestionId) {
    if (picking !== null) return;
    setStep(sequence.indexOf(id));
    setDraft(answers.payroll ?? 3);
    window.scrollTo(0, 0);
  }

  function restart() {
    clearTimeout(timer.current);
    setAnswers({});
    setStep(0);
    setPicking(null);
    setDraft(3);
    window.history.replaceState(null, "", "/");
    window.scrollTo(0, 0);
  }

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (question.kind !== "choice" || e.metaKey || e.ctrlKey || e.altKey) return;
    const i = Number.parseInt(e.key, 10) - 1;
    if (i >= 0 && i < question.options.length) pick(question.id, question.options[i].value);
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const t = timer;
    return () => clearTimeout(t.current);
  }, []);

  // Move focus to each new question so screen readers announce it; not on first load.
  useEffect(() => {
    if (mounted.current) heading.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [question.id]);

  const ledger: LedgerEntry[] = sequence
    .filter((id) => answers[id] !== undefined)
    .map((id) => ({
      id,
      n: `Q${sequence.indexOf(id) + 1}`,
      key: questionKey(id),
      value: answerLabel(id, answers),
      current: id === question.id,
    }));

  return (
    <>
      <SiteHeader onRestart={restart} />
      <div className="flex flex-1 flex-wrap">
        <LedgerStrip entries={ledger} onRevise={revise} />
        <LedgerAside entries={ledger} onRevise={revise} />
        <main className="flex min-w-0 flex-[3_1_480px] flex-col gap-7 px-[clamp(20px,5vw,80px)] py-[clamp(32px,6vh,72px)]">
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="font-mono text-xs font-semibold tracking-[.14em] text-uae-red">Q{index + 1}</span>
            <span className="font-mono text-xs tracking-[.14em] text-mute">
              QUESTION {pad(index + 1)} OF {sequenceKnown(answers) ? pad(sequence.length) : "—"}
            </span>
            <div aria-hidden className="ml-auto flex gap-1">
              {sequence.map((id, i) => (
                <span
                  key={id}
                  className={`h-[3px] w-[22px] ${i === index ? "bg-uae-red" : answers[id] !== undefined ? "bg-ink" : "bg-rule"}`}
                />
              ))}
            </div>
          </div>

          <h1
            ref={heading}
            tabIndex={-1}
            className="display max-w-[18ch] text-[clamp(34px,4.6vw,60px)] leading-none text-balance outline-none"
          >
            {question.title}
          </h1>

          {question.note && (
            <div className="flex max-w-[720px] items-baseline gap-3">
              <span className="eyebrow flex-none font-semibold text-uae-red">NOTE</span>
              <span aria-hidden className="h-px w-9 flex-none self-center bg-uae-red" />
              <span className="text-base leading-normal text-pretty text-ink-soft">{question.note}</span>
            </div>
          )}

          {question.kind === "choice" ? (
            <Choices
              question={question}
              chosen={answers[question.id]}
              picking={picking}
              onPick={(value) => pick(question.id, value)}
            />
          ) : (
            <PayrollStepper value={draft} onChange={setDraft} onRecord={() => pick("payroll", draft)} />
          )}
        </main>
      </div>
    </>
  );
}
