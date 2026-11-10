"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { cn } from "@/lib/utils";
import styles from "./theme-toggle.module.css";

export interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
}

/** A sun/moon toggle. The outgoing icon spins and scales out while the incoming one spins in. */
export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const reduced = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={onToggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={theme}
          className={styles.iconWrap}
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -70, scale: 0.4 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 70, scale: 0.4 }}
          transition={reduced ? { duration: 0.12 } : motionTokens.spring.snappy}
        >
          {isDark ? <Moon size={18} strokeWidth={1.9} /> : <Sun size={18} strokeWidth={1.9} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;
