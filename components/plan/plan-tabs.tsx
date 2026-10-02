import Link from "next/link";
import type { PlanTab } from "@/lib/tabs";

interface Props {
  tabs: { id: PlanTab; label: string }[];
  active: PlanTab;
  /** Query string that identifies the plan (answers or a demo). */
  query: string;
}

export function PlanTabs({ tabs, active, query }: Props) {
  return (
    <nav
      aria-label="Plan sections"
      className="gutter flex overflow-x-auto border-b border-rule whitespace-nowrap md:flex-wrap"
    >
      {tabs.map((t) => {
        const current = t.id === active;
        return (
          <Link
            key={t.id}
            href={`/plan?${query}${t.id === "plan" ? "" : `&tab=${t.id}`}`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={`border-b-[3px] px-[18px] pt-4 pb-[13px] font-mono text-[11px] tracking-[.14em] hover:bg-paper-sunk ${current ? "border-ink text-ink" : "border-transparent text-mute"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
