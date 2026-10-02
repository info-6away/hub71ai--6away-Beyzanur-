import type { Question } from "@/lib/questions";

const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  question: Extract<Question, { kind: "choice" }>;
  /** The saved answer, when revisiting a question. */
  chosen: string | number | undefined;
  /** The value just clicked, while the other rows fade out. */
  picking: string | number | null;
  onPick: (value: string) => void;
}

export function Choices({ question, chosen, picking, onPick }: Props) {
  return (
    <>
      <div className="flex max-w-[980px] flex-col border-t border-ink">
        {question.options.map((o, i) => {
          const selected = picking !== null ? picking === o.value : chosen === o.value;
          const fading = picking !== null && picking !== o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(o.value)}
              className={`flex cursor-pointer flex-wrap items-baseline gap-x-3.5 gap-y-1 border-b border-rule px-1 py-4 text-left transition-[opacity,filter,translate,background-color] duration-300 ease-drawn hover:bg-paper-sunk motion-reduce:transition-none md:flex-nowrap md:gap-[18px] md:px-2.5 md:py-[22px] ${fading ? "-translate-y-2 opacity-0 blur-[6px]" : ""} ${selected ? "text-uae-red" : ""}`}
            >
              <span className="w-6 flex-none font-mono text-[13px]">{pad(i + 1)}</span>
              <span className="flex-[0_1_auto] text-[clamp(18px,1.8vw,23px)] font-medium">{o.label}</span>
              <span aria-hidden className="hidden h-px min-w-6 flex-[1_1_40px] self-center bg-rule md:block" />
              <span
                className={`flex-[1_1_100%] pl-[38px] font-mono text-[11px] tracking-[.14em] md:flex-none md:pl-0 md:text-right ${selected ? "" : "text-mute"}`}
              >
                {o.caption}
              </span>
            </button>
          );
        })}
      </div>
      <p className="hidden font-mono text-[10px] tracking-[.12em] text-mute md:block">
        PRESS 1–{question.options.length} OR CLICK A ROW
      </p>
    </>
  );
}
