"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { AnimatedNumber } from "../number/animated-number";
import { Sparkline } from "../chart/sparkline";
import { cn } from "@/lib/utils";
import styles from "./stat-card.module.css";

export interface StatCardProps {
  label: string;
  value: number;
  /** Percent change versus previous period. */
  delta: number;
  deltaNote?: string;
  icon?: ReactNode;
  trend: number[];
  format?: (value: number) => string;
  /** Position in a staggered group. */
  index?: number;
  className?: string;
}

/** A KPI tile: an animated counter, a delta chip, and a sparkline of the recent trend. Enters with a staggered spring. */
export function StatCard({ label, value, delta, deltaNote, icon, trend, format, index = 0, className }: StatCardProps) {
  const reduced = useReducedMotion();
  const up = delta >= 0;
  const sparkColor = up ? "var(--success)" : "var(--danger)";

  return (
    <motion.div
      className={cn(styles.card, className)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduced ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.smooth, delay: index * 0.06 }}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
      </div>

      <div className={styles.value}>
        <AnimatedNumber value={value} format={format} startOnView={false} />
      </div>

      <div className={styles.bottom}>
        <span className={cn(styles.delta, up ? styles.up : styles.down)}>
          {up ? <ArrowUpRight size={15} strokeWidth={2.25} /> : <ArrowDownRight size={15} strokeWidth={2.25} />}
          {up ? "+" : ""}
          {delta.toFixed(1)}%{deltaNote ? <span className={styles.deltaNote}>{deltaNote}</span> : null}
        </span>
        <Sparkline className={styles.spark} data={trend} color={sparkColor} width={104} height={34} />
      </div>
    </motion.div>
  );
}

export default StatCard;
