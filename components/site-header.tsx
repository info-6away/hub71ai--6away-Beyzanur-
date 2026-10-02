import Link from "next/link";

const item = "border-r border-ink px-3.5 py-[9px] font-mono text-[11px] tracking-[.12em] hover:bg-paper-sunk";
const restartItem = "bg-ink px-3.5 py-[9px] font-mono text-[11px] tracking-[.12em] text-paper hover:bg-uae-red";

function Label({ short, long }: { short: string; long: string }) {
  return (
    <>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{long}</span>
    </>
  );
}

/**
 * Inside onboarding, pass `onRestart` so "restart" clears the in-progress answers;
 * elsewhere it is a plain link back to the first question.
 */
export function SiteHeader({ onRestart }: { onRestart?: () => void }) {
  const restart = <Label short="RESTART" long="RESTART ONBOARDING" />;
  return (
    <header className="gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-ink bg-paper py-3.5">
      <div className="flex flex-wrap items-center gap-3.5">
        <span aria-hidden className="relative block h-5 w-[30px] flex-none bg-uae-red">
          <span className="absolute top-0 left-0 h-2 w-2.5 bg-paper" />
        </span>
        <span className="font-condensed text-[22px] font-bold tracking-[.16em]">WUSOOL</span>
        <span lang="ar" dir="rtl" className="font-arabic text-xl leading-none font-semibold">
          وصول
        </span>
        <span className="font-mono text-[11px] tracking-[.12em] text-mute">ARRIVAL — IN THE RIGHT ORDER</span>
      </div>
      <nav aria-label="Demos and restart" className="flex flex-none border border-ink whitespace-nowrap">
        <Link href="/plan?demo=founder" className={item}>
          <Label short="FOUNDER" long="FOUNDER DEMO" />
        </Link>
        <Link href="/plan?demo=employee" className={item}>
          <Label short="EMPLOYEE" long="EMPLOYEE DEMO" />
        </Link>
        {onRestart ? (
          <button type="button" onClick={onRestart} className={`${restartItem} cursor-pointer`}>
            {restart}
          </button>
        ) : (
          <Link href="/" className={restartItem}>
            {restart}
          </Link>
        )}
      </nav>
    </header>
  );
}
