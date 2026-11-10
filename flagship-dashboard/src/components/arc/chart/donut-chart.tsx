"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./donut-chart.module.css";

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  format?: (value: number) => string;
  legend?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

/** A ring of segments that sweep in on mount. Each arc is a stroked circle, animated via stroke-dashoffset. */
export function DonutChart({ data, size = 160, thickness = 18, centerLabel, format = (v) => String(Math.round(v)), legend = true, className }: DonutChartProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const gap = 0.012 * C; // small spacing between segments

  let acc = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const start = acc;
    acc += fraction;
    const len = Math.max(0, fraction * C - gap);
    return {
      ...d,
      color: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      len,
      rotation: (start * 360),
      fraction,
    };
  });

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} data-hovering={hover !== null}>
      <div className={styles.chart} style={{ width: size, height: size }}>
        <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
          <circle className={styles.track} cx={cx} cy={cy} r={r} fill="none" strokeWidth={thickness} />
          {segments.map((s, i) => (
            <motion.circle
              key={i}
              className={styles.seg}
              data-active={hover === i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${s.len} ${C}`}
              transform={`rotate(${s.rotation} ${cx} ${cy})`}
              initial={reduced ? { strokeDashoffset: 0 } : { strokeDashoffset: s.len }}
              whileInView={{ strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={reduced ? { duration: 0.2 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.12 }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className={styles.center}>
          <div>
            <div className={styles.centerValue}>{hover !== null ? `${Math.round(segments[hover].fraction * 100)}%` : format(total)}</div>
            <div className={styles.centerLabel}>{hover !== null ? data[hover].label : centerLabel ?? "Total"}</div>
          </div>
        </div>
      </div>

      {legend ? (
        <div className={styles.legend}>
          {segments.map((s, i) => (
            <div key={i} className={styles.legendRow} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <span className={styles.legendName}>
                <span className={styles.legendSwatch} style={{ background: s.color }} />
                {s.label}
              </span>
              <span className={styles.legendValue}>{format(s.value)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default DonutChart;
