import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./avatar.module.css";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: number;
  status?: "online" | "away" | "busy";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({ name, src, size, status, className, style, ...props }: AvatarProps) {
  const vars = size ? ({ ...style, "--size": `${size / 16}rem` } as CSSProperties) : style;
  return (
    <span className={cn(styles.avatar, className)} style={vars} title={name} aria-label={name} {...props}>
      {src ? <img className={styles.image} src={src} alt="" /> : initials(name)}
      {status ? <span className={cn(styles.status, styles[status])} aria-hidden="true" /> : null}
    </span>
  );
}

export function AvatarGroup({ children, className, ...props }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.group, className)} {...props}>
      {children}
    </div>
  );
}

export function AvatarMore({ count, size }: { count: number; size?: number }) {
  const vars = size ? ({ "--size": `${size / 16}rem` } as CSSProperties) : undefined;
  return (
    <span className={cn(styles.avatar, styles.more)} style={vars} aria-label={`${count} more`}>
      +{count}
    </span>
  );
}

export default Avatar;
