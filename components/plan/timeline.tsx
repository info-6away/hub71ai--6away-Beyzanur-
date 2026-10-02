"use client";

import { type CSSProperties, useState } from "react";
import type { Task, TaskId } from "@/lib/plan";

const LABEL_W = 270;
const PX_PER_DAY = 8;
const ROW_H = 30;
const TOP = 36;
const MONO = "var(--font-plex-mono), monospace";
const SANS = "var(--font-plex-sans), sans-serif";

interface Props {
  /** Layer A tasks first, then layer B, as on the plan. */
  tasks: Task[];
  /** Rows above the layer divider; 0 when there is no company layer. */
  layerASize: number;
  /** Day the establishment card is issued, where layer B opens. */
  bridgeDay: number | null;
}

/** Stroke that draws itself in once, staggered by row. */
const drawn = (length: number, delay: number, extra: CSSProperties = {}): CSSProperties =>
  ({ "--len": length, strokeDasharray: length, animationDelay: `${delay}ms`, ...extra }) as CSSProperties;

export function Timeline({ tasks, layerASize, bridgeDay }: Props) {
  const [hover, setHover] = useState<TaskId | null>(null);

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const rowOf = new Map(tasks.map((t, i) => [t.id, i]));
  const chain = hover ? new Set<TaskId>([hover, ...byId.get(hover)!.upstream]) : null;

  const lastDay = Math.max(...tasks.map((t) => t.end)) + 12;
  const x = (day: number) => LABEL_W + 16 + day * PX_PER_DAY;
  const yOf = (row: number) => TOP + row * ROW_H + ROW_H / 2;
  const width = x(lastDay) + 20;
  const height = TOP + tasks.length * ROW_H + 16;
  const ticks = Array.from({ length: Math.floor(lastDay / 10) + 1 }, (_, i) => i * 10);
  const divY = TOP + layerASize * ROW_H;
  const arrival = Math.max(...tasks.filter((t) => t.critical).map((t) => t.end));

  const links = tasks.flatMap((t) =>
    t.deps.map((d) => {
      const from = byId.get(d)!;
      const [x1, y1, x2, y2] = [x(from.end), yOf(rowOf.get(d)!), x(t.start), yOf(rowOf.get(t.id)!)];
      const xm = x1 + Math.max(0, Math.min(8, (x2 - x1) / 2));
      const lit = !!chain && chain.has(t.id) && chain.has(d);
      return {
        key: `${d}-${t.id}`,
        d: `M${x1} ${y1} H${xm} V${y2} H${x2}`,
        length: xm - x1 + Math.abs(y2 - y1) + (x2 - xm),
        delay: 200 + rowOf.get(t.id)! * 35,
        lit,
        faded: !!chain && !lit,
      };
    }),
  );

  return (
    <div className="overflow-x-auto border border-ink bg-paper-raised">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`Dependency timeline: ${tasks.length} tasks, arrival around day ${arrival}.`}
        onMouseLeave={() => setHover(null)}
        className="block"
      >
        {tasks.map((t, i) => (
          <rect
            key={t.id}
            x={0}
            y={TOP + i * ROW_H}
            width={width}
            height={ROW_H}
            onMouseEnter={() => setHover(t.id)}
            style={{ fill: hover === t.id ? "var(--color-paper-sunk)" : "transparent" }}
          />
        ))}
        {ticks.map((d) => (
          <g key={d} className="pointer-events-none">
            <line x1={x(d)} y1={28} x2={x(d)} y2={height} style={{ stroke: "var(--color-paper-deep)" }} />
            <text x={x(d)} y={18} style={{ font: `500 10px ${MONO}`, fill: "var(--color-mute)", textAnchor: "middle" }}>
              D{d}
            </text>
          </g>
        ))}
        <line x1={0} y1={28} x2={width} y2={28} style={{ stroke: "var(--color-ink)" }} />
        <line x1={LABEL_W} y1={28} x2={LABEL_W} y2={height} style={{ stroke: "var(--color-ink)" }} />
        {layerASize > 0 && bridgeDay !== null && (
          <g className="pointer-events-none">
            <line x1={0} y1={divY} x2={width} y2={divY} style={{ stroke: "var(--color-ink)" }} />
            <line
              x1={x(bridgeDay)}
              y1={28}
              x2={x(bridgeDay)}
              y2={height}
              style={{ stroke: "var(--color-uae-red)", strokeDasharray: "4 4" }}
            />
            <text
              x={x(bridgeDay) + 8}
              y={divY - 8}
              style={{ font: `600 10px ${MONO}`, fill: "var(--color-uae-red)", letterSpacing: ".1em" }}
            >
              LAYER B OPENS · ESTABLISHMENT CARD
            </text>
          </g>
        )}
        {links.map((l) => (
          <path
            key={l.key}
            d={l.d}
            className="pointer-events-none animate-draw transition-opacity duration-150 motion-reduce:animate-none"
            style={drawn(l.length, l.delay, {
              fill: "none",
              stroke: l.lit ? "var(--color-uae-red)" : "var(--color-faint)",
              strokeWidth: l.lit ? 1.5 : 1,
              opacity: l.faded ? 0.15 : 1,
              animationDuration: "700ms",
            })}
          />
        ))}
        {tasks.map((t, i) => {
          const y = yOf(i);
          const opacity = !chain || chain.has(t.id) ? 1 : 0.18;
          const [x1, x2] = [x(t.start), x(t.end)];
          return (
            <g key={t.id} className="pointer-events-none" style={{ opacity }}>
              <text
                x={14}
                y={y + 4}
                style={{ font: `500 10.5px ${MONO}`, fill: t.blocked ? "var(--color-uae-red)" : "var(--color-mute)" }}
              >
                {t.id}
              </text>
              <text x={54} y={y + 4} style={{ font: `500 12.5px ${SANS}`, fill: "var(--color-ink)" }}>
                {t.title.length > 30 ? `${t.title.slice(0, 29)}…` : t.title}
              </text>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                className="animate-draw motion-reduce:animate-none"
                style={drawn(x2 - x1, i * 35, {
                  stroke: t.critical ? "var(--color-uae-green)" : t.blocked ? "var(--color-faint)" : "var(--color-ink)",
                  strokeWidth: t.critical ? 6 : 3,
                })}
              />
              <text x={x2 + 8} y={y + 4} style={{ font: `400 10px ${MONO}`, fill: "var(--color-mute)" }}>
                D{t.start}–{t.end}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
