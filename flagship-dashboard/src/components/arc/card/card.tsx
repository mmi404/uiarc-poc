"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { cn } from "@/lib/utils";
import styles from "./card.module.css";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref" | "children"> {
  children?: ReactNode;
  /** Position in a staggered group; drives the entrance delay. */
  index?: number;
  interactive?: boolean;
  /** Set false to render without the entrance animation (e.g. inside an already-animating parent). */
  animated?: boolean;
}

/** A surface panel. On mount it rises and fades in; give sibling cards increasing `index` values for a staggered entrance. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, index = 0, interactive = false, animated = true, children, ...props },
  ref,
) {
  const reduced = useReducedMotion();
  const classes = cn(styles.card, interactive && styles.interactive, className);
  if (!animated) {
    return (
      <div ref={ref} className={classes} {...(props as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      ref={ref}
      className={classes}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={
        reduced
          ? { duration: motionTokens.duration.fast }
          : { ...motionTokens.spring.smooth, delay: Math.min(index, 8) * motionTokens.stagger.item }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
});

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.header, className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(styles.title, className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(styles.description, className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.content, className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.footer, className)} {...props} />;
}

export function CardEyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(styles.eyebrow, className)} {...props} />;
}

export default Card;
