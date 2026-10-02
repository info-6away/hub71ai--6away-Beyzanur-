import { PAYROLL_MAX, PAYROLL_MIN, payrollNote } from "@/lib/questions";

const stepButton =
  "flex w-16 cursor-pointer items-center justify-center font-mono text-[26px] hover:bg-paper-sunk disabled:cursor-default disabled:text-rule disabled:hover:bg-transparent";

interface Props {
  value: number;
  onChange: (value: number) => void;
  onRecord: () => void;
}

export function PayrollStepper({ value, onChange, onRecord }: Props) {
  return (
    <div className="flex max-w-[980px] flex-col gap-[22px] border-t border-ink pt-7">
      <div className="flex w-max items-stretch border border-ink">
        <button
          type="button"
          aria-label="One fewer person"
          disabled={value <= PAYROLL_MIN}
          onClick={() => onChange(Math.max(PAYROLL_MIN, value - 1))}
          className={`${stepButton} border-r border-ink`}
        >
          −
        </button>
        <output
          aria-live="polite"
          aria-label="People on payroll"
          className="w-[clamp(110px,36vw,170px)] py-[18px] text-center font-mono text-[clamp(52px,16vw,72px)] leading-none font-medium tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          aria-label="One more person"
          disabled={value >= PAYROLL_MAX}
          onClick={() => onChange(Math.min(PAYROLL_MAX, value + 1))}
          className={`${stepButton} border-l border-ink`}
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px w-9 bg-ink" />
        <span className="eyebrow">{payrollNote(value)}</span>
      </div>
      <button
        type="button"
        onClick={onRecord}
        className="w-max cursor-pointer bg-ink px-[26px] py-4 font-mono text-xs tracking-[.14em] text-paper hover:bg-uae-red"
      >
        RECORD {value} ON PAYROLL →
      </button>
    </div>
  );
}
