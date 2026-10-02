import { formatLongDate } from "@/lib/dates";
import type { Plan } from "@/lib/plan";
import { SheetHeading } from "./sheet-parts";
import { Timeline } from "./timeline";

function Key({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`w-7 ${swatch}`} />
      {label}
    </span>
  );
}

export function TimelineSheet({ plan, today }: { plan: Plan; today: string }) {
  const layerASize = plan.tasks.filter((t) => t.layer === "A").length;
  return (
    <div className="sheet max-w-[1440px] gap-[22px]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <SheetHeading title="Dependency timeline" />
        <div className="flex flex-wrap gap-[18px] font-mono text-[10.5px] tracking-[.12em] text-ink-soft">
          <Key swatch="h-1.5 bg-uae-green" label="CRITICAL PATH" />
          <Key swatch="h-[3px] bg-ink" label="TASK" />
          {layerASize > 0 && <Key swatch="h-0 border-t border-dashed border-uae-red" label="LAYER B OPENS" />}
        </div>
      </div>
      <p className="max-w-[72ch] text-[15px] leading-normal text-ink-soft">
        Days from today, {formatLongDate(today)}. Hover a row to trace what it is waiting on. Durations are estimates
        pending verification — TODO(verify).
      </p>
      <Timeline tasks={plan.tasks} layerASize={layerASize} bridgeDay={plan.byId.A07?.end ?? null} />
    </div>
  );
}
