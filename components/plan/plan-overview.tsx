import Link from "next/link";
import type { ReactNode } from "react";
import type { Plan } from "@/lib/plan";
import { bridgeLine, layerBehindYou, planHeader, titleBlock, verdict } from "@/lib/plan-view";
import type { Answers } from "@/lib/questions";
import { OffsetPanel, TONE_TEXT } from "./sheet-parts";
import { TaskCard } from "./task-card";
import { VerdictSection } from "./verdict-section";

function Layer({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-baseline gap-4 border-b border-ink pb-3">
        <h2 className="font-condensed text-[28px] font-semibold tracking-[.05em] uppercase">{title}</h2>
        <span className="eyebrow text-mute">{meta}</span>
      </div>
      <div className="grid grid-flow-row-dense auto-rows-[minmax(110px,auto)] grid-cols-12 gap-2">{children}</div>
    </section>
  );
}

interface Props {
  plan: Plan;
  answers: Answers;
  today: string;
  reviseHref: string;
}

export function PlanOverview({ plan, answers, today, reviseHref }: Props) {
  const header = planHeader(plan, answers);
  const v = verdict(plan, answers);
  const behind = layerBehindYou(plan);
  const layerA = plan.tasks.filter((t) => t.layer === "A");
  const layerB = plan.tasks.filter((t) => t.layer === "B");
  const blocked = layerB.filter((t) => t.blocked).length;
  const bridge = bridgeLine(plan);

  return (
    <div className="sheet max-w-[1440px] gap-12">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-[18px]">
          <span className="eyebrow text-mute">{header.kicker}</span>
          <h1 className="display max-w-[14ch] text-[clamp(40px,5.4vw,76px)] leading-[.95] text-balance">
            {header.headline}
          </h1>
          <p className="max-w-[56ch] text-lg leading-normal text-pretty text-ink-soft">{header.summary}</p>
          <Link
            href={reviseHref}
            className="eyebrow w-max border-b border-ink pb-[3px] hover:border-uae-red hover:text-uae-red"
          >
            REVISE ANSWERS →
          </Link>
        </div>
        <OffsetPanel className="min-w-[280px] flex-[0_1_460px]" gridClassName="grid-cols-2">
          {titleBlock(plan, answers, today).map((c) => (
            <div key={c.k} className={`flex flex-col gap-1 bg-paper px-3 py-2.5 ${c.wide ? "col-span-2" : ""}`}>
              <dt className="font-mono text-[9.5px] tracking-[.16em] text-mute">{c.k}</dt>
              <dd className={`font-mono text-[13px] font-medium tabular-nums ${TONE_TEXT[c.tone ?? "ink"]}`}>{c.v}</dd>
            </div>
          ))}
        </OffsetPanel>
      </div>

      {v && <VerdictSection verdict={v} />}

      {behind && (
        <section className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border border-ink bg-paper-sunk px-[26px] py-6">
          <span className="eyebrow flex-none font-semibold">LAYER A · ALREADY BEHIND YOU</span>
          <p className="min-w-0 flex-[1_1_420px] text-lg leading-normal text-pretty">{behind}</p>
        </section>
      )}

      {layerA.length > 0 && (
        <>
          <Layer
            title="Layer A — Establish the company"
            meta={`LICENSING · PREMISES · BANKING · ${layerA.length} TASKS`}
          >
            {layerA.map((t) => (
              <TaskCard key={t.id} task={t} plan={plan} />
            ))}
          </Layer>

          <section className="flex flex-col gap-5 bg-ink p-[clamp(28px,4vw,48px)] text-paper">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow bg-uae-red px-2 py-1">THE BRIDGE</span>
              <span className="eyebrow">A07 ESTABLISHMENT CARD → B01 ENTRY PERMIT</span>
            </div>
            <p className="display max-w-[22ch] text-[clamp(28px,3.6vw,52px)] leading-[1.02] text-balance">
              The licence date, not the start date, determines when a family can arrive.
            </p>
            <div className="flex flex-wrap gap-x-7 gap-y-2.5 font-mono text-xs tracking-[.1em] tabular-nums">
              <span>{bridge.licence}</span>
              <span aria-hidden className="text-[#e8a0aa]">
                →
              </span>
              <span>{bridge.arrival}</span>
              <span className="text-[#b8b1a3]">ESTIMATES · TODO(verify)</span>
            </div>
          </section>
        </>
      )}

      <Layer
        title="Layer B — Relocate the people"
        meta={`${layerB.length} TASKS${layerA.length > 0 ? ` · ${blocked} BLOCKED` : ""}`}
      >
        {layerB.map((t) => (
          <TaskCard key={t.id} task={t} plan={plan} />
        ))}
      </Layer>
    </div>
  );
}
