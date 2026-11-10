"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { areaPath, smoothPath, toPoints } from "./chart-utils";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** CSS color for the line; defaults to the chart accent series. */
  color?: string;
  /** Fill the area under the line with a soft gradient. */
  fill?: boolean;
  strokeWidth?: number;
  className?: string;
}

/** A compact trend line that draws itself in on mount. Pure SVG + motion, no chart library. */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--series-1)",
  fill = true,
  strokeWidth = 2,
  className,
}: SparklineProps) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const points = toPoints(data, width, height, strokeWidth + 1);
  const line = smoothPath(points);
  const area = areaPath(line, points, height);
  const last = points[points.length - 1];

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? (
        <motion.path
          d={area}
          fill={`url(#spark-${id})`}
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.35 }}
        />
      ) : null}
      <motion.path
        d={line}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      {last ? (
        <motion.circle
          cx={last.x}
          cy={last.y}
          r={strokeWidth + 0.5}
          fill={color}
          initial={reduced ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: reduced ? 0 : 0.85 }}
          style={{ transformOrigin: `${last.x}px ${last.y}px` }}
        />
      ) : null}
    </svg>
  );
}

export default Sparkline;
