import type { Verdict } from "@/lib/plan-view";

const pad = (n: number) => String(n).padStart(2, "0");

export function VerdictSection({ verdict: v }: { verdict: Verdict }) {
  return (
    <section aria-labelledby="verdict-heading" className="flex flex-col gap-9 border-t border-ink pt-[22px]">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="verdict-heading" className="eyebrow font-semibold">
          JURISDICTION VERDICT
        </h2>
        <span aria-hidden className="h-px flex-1 bg-rule" />
        <span className="border border-uae-red px-[7px] py-[3px] font-mono text-[10px] tracking-[.1em] text-uae-red">
          SRC {v.source} · VERIFIED ON — · TODO(verify)
        </span>
      </div>

      <div className="flex flex-wrap items-start gap-10">
        <div className="min-w-0 flex-[1_1_420px] overflow-hidden">
          <p className="font-condensed text-[clamp(56px,7.2vw,124px)] leading-[.85] font-bold tracking-[.02em] [overflow-wrap:anywhere] uppercase">
            {v.word}
          </p>
          <p className="mt-4 font-mono text-xs tracking-[.14em] text-mute">{v.sub}</p>
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-[18px] pt-2">
          {v.notes.map((n) => (
            <div key={n.k} className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-3">
              <div aria-hidden className="flex h-[18px] items-center">
                <span className="size-[5px] bg-ink" />
                <span className="h-px flex-1 bg-ink" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] tracking-[.14em] text-mute">{n.k}</span>
                <span className="text-base leading-[1.45] text-pretty">{n.v}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-12 gap-y-6">
        <div className="flex flex-[1_1_360px] flex-col">
          <h3 className="eyebrow border-b border-ink pb-2.5 font-semibold text-uae-red">WHAT YOU GIVE UP</h3>
          <ol>
            {v.tradeoffs.map((t, i) => (
              <li key={t} className="flex gap-3.5 border-b border-rule py-3 text-[15px] leading-normal">
                <span className="pt-[3px] font-mono text-[11px] text-mute">{pad(i + 1)}</span>
                <span className="text-pretty">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-[1_1_360px] flex-col">
          <h3 className="eyebrow border-b border-ink pb-2.5 font-semibold">ALTERNATIVES CONSIDERED</h3>
          {v.alternatives.map((alt) => (
            <div key={alt.name} className="flex flex-col gap-1 border-b border-rule py-3">
              <s className="font-condensed text-xl font-semibold tracking-[.04em] text-mute decoration-[1.5px]">
                {alt.name}
              </s>
              <span className="text-[15px] leading-normal text-pretty">{alt.why}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
