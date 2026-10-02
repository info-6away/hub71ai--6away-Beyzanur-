import type { QuestionId } from "@/lib/questions";

export interface LedgerEntry {
  id: QuestionId;
  /** "Q3" */
  n: string;
  key: string;
  value: string;
  /** The question on screen now. */
  current: boolean;
}

interface Props {
  entries: LedgerEntry[];
  onRevise: (id: QuestionId) => void;
}

/** Horizontal ledger above the question on small screens. */
export function LedgerStrip({ entries, onRevise }: Props) {
  return (
    <div className="flex flex-[1_1_100%] items-center gap-2 overflow-x-auto border-b border-rule bg-paper-sunk px-5 py-3 md:hidden">
      <span className="flex-none font-mono text-[10px] font-semibold tracking-[.14em]">LEDGER</span>
      {entries.length === 0 && <span className="text-[13px] whitespace-nowrap text-mute">Answers appear here.</span>}
      {entries.map((e) => (
        <button
          key={e.id}
          type="button"
          onClick={() => onRevise(e.id)}
          aria-label={`Revise ${e.key.toLowerCase()}: ${e.value}`}
          className={`flex min-h-7 flex-none cursor-pointer items-baseline gap-1.5 border border-rule bg-paper px-2.5 py-2 ${e.current ? "text-uae-red" : ""}`}
        >
          <span className="font-mono text-[10px]">{e.n}</span>
          <span className="text-[13px] font-medium whitespace-nowrap">{e.value}</span>
        </button>
      ))}
    </div>
  );
}

/** Sidebar ledger on wider screens. */
export function LedgerAside({ entries, onRevise }: Props) {
  return (
    <aside
      aria-label="Answer ledger"
      className="hidden max-w-[360px] flex-[1_1_260px] flex-col gap-[18px] border-r border-rule bg-paper-sunk px-6 py-9 md:flex"
    >
      <div className="flex items-center gap-2.5">
        <span className="eyebrow font-semibold">ANSWER LEDGER</span>
        <span aria-hidden className="h-px flex-1 bg-ink" />
      </div>
      {entries.length === 0 && (
        <p className="text-sm leading-normal text-pretty text-mute">
          Each answer is written here as you give it. Click any line to revise it.
        </p>
      )}
      <div className="flex flex-col">
        {entries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onRevise(e.id)}
            className={`grid cursor-pointer grid-cols-[34px_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 border-b border-rule py-3 text-left hover:bg-paper-deep ${e.current ? "text-uae-red" : ""}`}
          >
            <span className="row-span-2 pt-0.5 font-mono text-[11px]">{e.n}</span>
            <span className="font-mono text-[10px] tracking-[.14em] text-mute">{e.key}</span>
            <span className="text-[15px] font-medium">{e.value}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto font-mono text-[10px] leading-relaxed tracking-[.12em] text-mute">
        NOTHING IS SAVED.
        <br />
        THIS SESSION ONLY.
      </div>
    </aside>
  );
}
