import type { CSSProperties } from "react";
import type { Plan, Task } from "@/lib/plan";
import { taskView } from "@/lib/plan-view";

function frameClass(t: Task): string {
  const sides = t.blocked ? "border-dashed border-faint" : t.critical ? "border-ink" : "border-rule";
  const top = t.critical
    ? `border-t-[3px] [border-top-style:solid] ${t.blocked ? "border-t-green-soft" : "border-t-uae-green"}`
    : "";
  const fill = t.blocked ? "bg-transparent text-dim" : t.optional ? "bg-paper-sunk" : "bg-paper-raised";
  return `border ${sides} ${top} ${fill}`;
}

export function TaskCard({ task: t, plan }: { task: Task; plan: Plan }) {
  const v = taskView(t, plan);
  const statusColor = v.tone === "blocked" ? "text-uae-red" : v.tone === "critical" ? "text-uae-green" : "text-mute";
  const whyRule = t.bridge ? "border-uae-red" : t.blocked ? "border-faint" : "border-ink";
  // Grid footprint comes from the engine; on small screens every card is full width.
  const placement = { "--col": t.col, "--row": t.row } as CSSProperties;

  return (
    <article
      style={placement}
      className={`col-span-12 flex min-w-0 flex-col gap-3 px-5 py-[18px] md:col-span-(--col) md:row-span-(--row) ${frameClass(t)}`}
    >
      <div className="flex flex-col gap-1 font-mono text-[10.5px] tracking-[.12em] whitespace-nowrap">
        <span className="text-mute">
          {t.id} · {t.category.toUpperCase()}
        </span>
        <span className={`font-semibold ${statusColor}`}>{v.status}</span>
      </div>
      <h3
        className={`font-condensed leading-[1.05] font-semibold tracking-[.04em] uppercase ${v.prominent ? "text-[30px]" : "text-[19px]"}`}
      >
        {t.title}
      </h3>
      <p className={`text-sm leading-normal text-pretty ${t.blocked ? "" : "text-ink-body"}`}>{t.desc}</p>
      <p className={`border-l-2 pl-3.5 leading-normal text-pretty ${whyRule} ${v.prominent ? "text-lg" : "text-base"}`}>
        {t.why}
      </p>
      {t.blocked && (
        <div className="flex flex-col gap-1 font-mono text-[11px] tracking-[.1em] text-uae-red">
          <span className="font-semibold">WAITING ON: {v.waitingOn}</span>
          <span className="text-dim">ROOT BLOCKER: A07 ESTABLISHMENT CARD</span>
        </div>
      )}
      {v.showAfter && <span className="font-mono text-[11px] tracking-[.1em] text-mute">AFTER: {v.waitingOn}</span>}
      {t.provider && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-rule pt-2.5">
          <span className="font-mono text-[10px] tracking-[.14em] text-mute">PROVIDERS</span>
          <span className="text-[13px]">{t.provider}</span>
          <span className="stamp">SAMPLE DATA</span>
        </div>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        <span className="chip">{v.estimate}</span>
        <span className="chip">SRC {t.source} · VERIFIED ON —</span>
      </div>
    </article>
  );
}
