import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./badge.module.css";

export type BadgeTone =
  | "neutral"
  | "teal"
  | "sky"
  | "orchid"
  | "violet"
  | "rose"
  | "amber"
  | "green"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  solid?: boolean;
}

export function Badge({ className, tone = "neutral", dot = false, solid = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], solid && styles.solid, className)} {...props}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export default Badge;
