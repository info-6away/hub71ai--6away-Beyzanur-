import type { Directory } from "@/lib/catalogue";
import { SheetHeading } from "./sheet-parts";

export function TaskContext({ task, why }: { task: string; why: string }) {
  return (
    <div className="flex max-w-[78ch] flex-col gap-2">
      <span className="eyebrow text-mute">{task}</span>
      <p className="border-l-2 border-ink pl-3.5 text-[17px] leading-normal text-pretty">{why}</p>
    </div>
  );
}

export function DirectoryView({ directory: d }: { directory: Directory }) {
  return (
    <div className="sheet max-w-[1240px] gap-[22px]">
      <SheetHeading title={d.title} badge="REAL PROVIDERS · NO PARTNERSHIP · NOT RANKED" />
      <TaskContext task={d.task} why={d.why} />

      {/* Small screens: stacked list */}
      <ul className="flex flex-col border-t border-ink md:hidden">
        {d.providers.map((p) => (
          <li key={p.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 border-b border-rule px-0.5 py-3.5">
            <span className="text-base font-medium">{p.name}</span>
            <span className="text-right font-mono text-[15px] font-medium">{p.website}</span>
            <span className="font-mono text-[11px] tracking-[.06em] text-ink-body">
              {p.forStep} · {p.type}
            </span>
            <span className="stamp justify-self-end self-center">REFERENCE</span>
          </li>
        ))}
      </ul>

      {/* Wider screens: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] table-fixed border-t border-ink">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[19%]" />
            <col className="w-[16%]" />
            <col className="w-[30%]" />
            <col className="w-[13%]" />
            <col className="w-[110px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink font-mono text-[10px] tracking-[.14em] whitespace-nowrap text-mute">
              <th className="px-2 py-2.5 text-left font-normal">FOR</th>
              <th className="px-2 py-2.5 text-left font-normal">PROVIDER</th>
              <th className="px-2 py-2.5 text-left font-normal">TYPE</th>
              <th className="px-2 py-2.5 text-left font-normal">WHY IT IS HERE</th>
              <th className="px-2 py-2.5 text-left font-normal">WEBSITE</th>
              <th className="px-2 py-2.5">
                <span className="sr-only">Listing status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {d.providers.map((p) => (
              <tr key={p.name} className="border-b border-rule hover:bg-paper-sunk">
                <td className="px-2 py-4 font-mono text-[11px]">{p.forStep}</td>
                <td className="px-2 py-4 text-[15px] font-medium">{p.name}</td>
                <td className="px-2 py-4 text-sm">{p.type}</td>
                <td className="px-2 py-4 text-sm text-pretty">{p.why}</td>
                <td className="px-2 py-4 font-mono text-xs">{p.website}</td>
                <td className="px-2 py-4 text-right">
                  <span className="stamp inline-block">REFERENCE</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-[90ch] font-mono text-[10.5px] leading-relaxed tracking-[.1em] text-mute">
        LISTED FOR REFERENCE ONLY. WUSOOL HAS NO PARTNERSHIP WITH ANY PROVIDER. PRICES ARE NOT SHOWN — CHECK DIRECTLY
        WITH EACH PROVIDER. DETAILS · TODO(verify)
      </p>
    </div>
  );
}
