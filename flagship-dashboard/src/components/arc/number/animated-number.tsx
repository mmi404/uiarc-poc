"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export interface AnimatedNumberProps {
  value: number;
  /** Format the current (interpolated) value into display text. */
  format?: (value: number) => string;
  /** Seconds. */
  duration?: number;
  className?: string;
  /** Start the count only when scrolled into view. */
  startOnView?: boolean;
}

/** Counts from 0 (first mount) or the previous value up to `value` with an eased tween; snaps instantly under reduced motion. */
export function AnimatedNumber({
  value,
  format = (v) => Math.round(v).toLocaleString("en-US"),
  duration = 1.1,
  className,
  startOnView = true,
}: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(() => (reduced ? value : 0));
  const from = useRef(0);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (reduced) {
      setDisplay(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        from.current = value;
      },
    });
    return () => controls.stop();
  }, [value, duration, reduced, inView, startOnView]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}

export default AnimatedNumber;
