"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { areaPath, smoothPath } from "./chart-utils";
import type { Point } from "./chart-utils";
import styles from "./area-chart.module.css";

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface AreaChartProps {
  series: ChartSeries[];
  labels: string[];
  height?: number;
  /** Format values in the tooltip. */
  format?: (value: number) => string;
  /** Number of horizontal gridlines. */
  gridLines?: number;
  className?: string;
}

const DEFAULT_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];
const PAD = { top: 12, right: 8, bottom: 26, left: 8 };

/** A responsive multi-series area chart. Lines draw in on mount; hover shows a crosshair and a glass tooltip. SVG + motion only. */
export function AreaChart({ series, labels, height = 260, format = (v) => String(Math.round(v)), gridLines = 4, className }: AreaChartProps) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, entry.contentRect.width));
    });
    ro.observe(el);
    setWidth(Math.max(240, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const all = series.flatMap((s) => s.data);
  const dataMin = all.length ? Math.min(...all) : 0;
  const dataMax = all.length ? Math.max(...all) : 1;
  const span = dataMax - dataMin || 1;
  const yMin = dataMin - span * 0.14;
  const yMax = dataMax + span * 0.1;
  const n = labels.length;

  const scaleX = useCallback((i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2), [n, plotW]);
  const scaleY = useCallback((v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH, [plotH, yMin, yMax]);

  const built = series.map((s, si) => {
    const color = s.color ?? DEFAULT_COLORS[si % DEFAULT_COLORS.length];
    const pts: Point[] = s.data.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));
    const line = smoothPath(pts);
    return { ...s, color, pts, line, area: areaPath(line, pts, PAD.top + plotH) };
  });

  const onMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || n === 0) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left - PAD.left;
    const i = Math.round((x / plotW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const hoverX = hover !== null ? scaleX(hover) : 0;
  const tipLeftPct = hover !== null ? (hoverX / width) * 100 : 0;
  // Keep every gridline label unique; show up to ~7 labels.
  const labelStep = Math.max(1, Math.ceil(n / 7));

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${className ?? ""}`}
      onPointerMove={(e) => onMove(e.clientX)}
      onPointerLeave={() => setHover(null)}
      style={{ height }}
    >
      <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Chart of ${series.map((s) => s.name).join(", ")}`}>
        <defs>
          {built.map((s, i) => (
            <linearGradient key={i} id={`area-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.26} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal gridlines */}
        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = PAD.top + (plotH / gridLines) * i;
          return <line key={i} className={styles.grid} x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} />;
        })}

        {/* X-axis labels */}
        {labels.map((label, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text key={i} className={styles.axisLabel} x={scaleX(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
              {label}
            </text>
          ) : null,
        )}

        {/* Areas + lines */}
        {built.map((s, i) => (
          <g key={i}>
            <motion.path
              d={s.area}
              fill={`url(#area-${id}-${i})`}
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: reduced ? 0 : 0.45 + i * 0.08 }}
            />
            <motion.path
              d={s.line}
              fill="none"
              stroke={s.color}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1], delay: reduced ? 0 : i * 0.08 }}
            />
          </g>
        ))}

        {/* Hover crosshair + dots */}
        {hover !== null ? (
          <g>
            <line className={styles.guide} x1={hoverX} y1={PAD.top} x2={hoverX} y2={PAD.top + plotH} />
            {built.map((s, i) => (
              <circle key={i} className={styles.hoverDot} cx={hoverX} cy={scaleY(s.data[hover])} r={4.5} fill={s.color} />
            ))}
          </g>
        ) : null}
      </svg>

      <AnimatePresence>
        {hover !== null ? (
          <motion.div
            className={styles.tooltip}
            style={{ left: `${tipLeftPct}%` }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={reduced ? { duration: 0.12 } : motionTokens.spring.snappy}
          >
            <p className={styles.ttLabel}>{labels[hover]}</p>
            {built.map((s, i) => (
              <div key={i} className={styles.ttRow}>
                <span className={styles.ttName}>
                  <span className={styles.ttSwatch} style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className={styles.ttValue}>{format(s.data[hover])}</span>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default AreaChart;
