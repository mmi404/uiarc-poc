"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./bar-chart.module.css";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  format?: (value: number) => string;
  gridLines?: number;
  className?: string;
}

const PAD = { top: 18, right: 4, bottom: 24, left: 4 };

/** Vertical bars that grow up from the baseline with a staggered spring. Rounded tops, hover dims the others and shows the value. */
export function BarChart({ data, height = 220, format = (v) => String(Math.round(v)), gridLines = 4, className }: BarChartProps) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(Math.max(240, entry.contentRect.width)));
    ro.observe(el);
    setWidth(Math.max(240, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const max = data.length ? Math.max(...data.map((d) => d.value)) : 1;
  const yMax = max * 1.1 || 1;
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.min(44, slot * 0.56);
  const baseline = PAD.top + plotH;

  const scaleY = useCallback((v: number) => (v / yMax) * plotH, [plotH, yMax]);

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className ?? ""}`} data-hovering={hover !== null} style={{ height }}>
      <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart">
        <defs>
          <linearGradient id={`bar-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--series-1)" />
            <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.55} />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const y = PAD.top + (plotH / gridLines) * i;
          return <line key={i} className={styles.grid} x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} />;
        })}

        {data.map((d, i) => {
          const h = scaleY(d.value);
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const y = baseline - h;
          const active = hover === i;
          return (
            <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              {/* invisible hit area spanning the full slot height */}
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH} fill="transparent" />
              <motion.rect
                className={styles.bar}
                data-active={active}
                x={x}
                width={barW}
                rx={Math.min(7, barW / 2)}
                fill={d.color ?? `url(#bar-${id})`}
                initial={reduced ? { height: h, y } : { height: 0, y: baseline }}
                whileInView={{ height: h, y }}
                viewport={{ once: true }}
                transition={reduced ? { duration: 0.2 } : { ...motionTokens.spring.smooth, delay: i * motionTokens.stagger.item }}
              />
              {active ? (
                <text className={styles.value} x={x + barW / 2} y={y - 7} textAnchor="middle">
                  {format(d.value)}
                </text>
              ) : null}
              <text className={styles.label} x={PAD.left + slot * i + slot / 2} y={height - 7} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BarChart;
