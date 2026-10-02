import { hrSheet } from "@/lib/catalogue";
import type { Answers } from "@/lib/questions";
import { TaskContext } from "./directory";
import { OffsetPanel, SheetHeading } from "./sheet-parts";

export function HrSheet({ answers }: { answers: Answers }) {
  return (
    <div className="sheet max-w-[1240px] gap-[22px]">
      <SheetHeading title="HR & package" badge="ALL RECORDS ARE SAMPLE DATA" />
      <TaskContext
        task="EMPLOYER POLICY · SAMPLE"
        why="Your package decides which of these tasks are yours and which are your employer’s. Anything your employer pays or files comes off your critical path."
      />
      <OffsetPanel className="max-w-[900px]" gridClassName="grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {hrSheet(answers).map((c) => (
          <div key={c.k} className="flex flex-col gap-1.5 bg-paper px-4 py-3.5">
            <dt className="font-mono text-[9.5px] tracking-[.16em] text-mute">{c.k}</dt>
            <dd className="flex flex-col gap-1.5">
              <span className="font-mono text-[15px] font-medium tabular-nums">{c.v}</span>
              <span className="text-[13px] leading-[1.45] text-pretty text-ink-body">{c.n}</span>
            </dd>
          </div>
        ))}
      </OffsetPanel>
      <p className="max-w-[90ch] font-mono text-[10.5px] leading-relaxed tracking-[.1em] text-mute">
        EVERY VALUE ON THIS SHEET IS SAMPLE DATA. CONFIRM EACH ITEM AGAINST YOUR OFFER LETTER · TODO(verify)
      </p>
    </div>
  );
}
