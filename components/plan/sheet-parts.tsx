import type { ReactNode } from "react";
import type { Tone } from "@/lib/plan-view";

export const TONE_TEXT: Record<Tone, string> = {
  ink: "text-ink",
  red: "text-uae-red",
  green: "text-uae-green",
};

/** A ruled grid on a slightly offset shadow, like a drawing's title block. */
export function OffsetPanel({
  className = "",
  gridClassName,
  children,
}: {
  className?: string;
  gridClassName: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <div aria-hidden className="absolute inset-0 -z-10 translate-x-[3px] translate-y-[3px] border border-ink bg-paper-deep" />
      <dl className={`grid gap-px border border-ink bg-rule ${gridClassName}`}>{children}</dl>
    </div>
  );
}

/** Page title with a red badge, used by every tab except the plan itself. */
export function SheetHeading({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
      <h1 className="font-condensed text-[clamp(32px,4vw,52px)] leading-none font-semibold tracking-[.04em] uppercase">
        {title}
      </h1>
      {badge && (
        <span className="eyebrow border border-uae-red px-2 py-1 text-uae-red md:flex-none md:whitespace-nowrap">{badge}</span>
      )}
    </div>
  );
}
