import { housingNote, housingRows } from "@/lib/housing";
import type { Plan } from "@/lib/plan";
import type { Answers } from "@/lib/questions";
import { SheetHeading } from "./sheet-parts";

export function Housing({ plan, answers }: { plan: Plan; answers: Answers }) {
  const rows = housingRows(answers, plan);
  return (
    <div className="sheet max-w-[1240px] gap-[22px]">
      <SheetHeading title="Housing" badge="ALL LISTINGS ARE SAMPLE DATA" />
      <p className="max-w-[70ch] text-base leading-normal text-pretty text-ink-soft">{housingNote(plan)}</p>

      {/* Small screens: stacked list */}
      <ul className="flex flex-col border-t border-ink md:hidden">
        {rows.map((h, i) => (
          <li
            key={i}
            className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 border-b border-rule px-0.5 py-3.5 ${h.tooSmall ? "text-dim" : ""}`}
          >
            <span className="text-base font-medium">
              {h.areaLabel}
              {h.inChosenArea && <span className="ml-2 font-mono text-[9.5px] tracking-[.12em] text-uae-red">YOUR AREA</span>}
            </span>
            <span className="text-right font-mono text-base font-medium tabular-nums">AED {h.rent}</span>
            <span className="font-mono text-[11px] tracking-[.08em]">
              {h.type} · {h.beds} BR · {h.commute}
            </span>
            <span className="stamp justify-self-end self-center text-ink">SAMPLE DATA</span>
          </li>
        ))}
      </ul>

      {/* Wider screens: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] table-fixed border-t border-ink">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[16%]" />
            <col className="w-[70px]" />
            <col className="w-[20%]" />
            <col className="w-[17%]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink font-mono text-[10px] tracking-[.14em] text-mute">
              <th className="px-2 py-2.5 text-left font-normal">AREA</th>
              <th className="px-2 py-2.5 text-left font-normal">TYPE</th>
              <th className="px-2 py-2.5 text-right font-normal">BEDS</th>
              <th className="px-2 py-2.5 text-right font-normal">RENT · AED / YEAR</th>
              <th className="px-2 py-2.5 text-right font-normal">COMMUTE · EST.</th>
              <th className="px-2 py-2.5">
                <span className="sr-only">Data status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr
                key={i}
                className={`border-b border-rule hover:bg-paper-sunk ${h.tooSmall ? "text-dim" : ""}`}
              >
                <td className="px-2 py-4 text-base font-medium">
                  {h.areaLabel}
                  {h.inChosenArea && <span className="ml-2.5 font-mono text-[9.5px] tracking-[.12em] text-uae-red">YOUR AREA</span>}
                </td>
                <td className="px-2 py-4 text-[15px]">{h.type}</td>
                <td className="px-2 py-4 text-right font-mono text-[15px] tabular-nums">{h.beds}</td>
                <td className="px-2 py-4 text-right font-mono text-base font-medium tabular-nums">{h.rent}</td>
                <td className="px-2 py-4 text-right font-mono text-sm tabular-nums">{h.commute}</td>
                <td className="px-2 py-4 text-right">
                  <span className="stamp inline-block text-ink">SAMPLE DATA</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
