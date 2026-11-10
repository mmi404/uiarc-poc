"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import styles from "./sidebar.module.css";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface SidebarProps {
  sections: NavSection[];
  active: string;
  onSelect: (id: string) => void;
  user: { name: string; email: string };
}

/** App navigation with a gliding active highlight (shared layout). */
export function Sidebar({ sections, active, onSelect, user }: SidebarProps) {
  const reduced = useReducedMotion();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M9 22 L16 9 L23 22 M11.6 17.4 h8.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={styles.brandName}>
          <span className={styles.brandTitle}>Northwind</span>
          <span className={styles.brandSub}>Analytics</span>
        </span>
      </div>

      <LayoutGroup>
        <nav className={styles.nav}>
          {sections.map((section, si) => (
            <div key={si} className={styles.section}>
              {section.label ? <div className={styles.sectionLabel}>{section.label}</div> : null}
              {section.items.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.item}
                    data-active={isActive}
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive ? (
                      <motion.span className={styles.highlight} layoutId="nav-highlight" transition={reduced ? { duration: 0 } : motionTokens.spring.morph} />
                    ) : null}
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.badge != null ? <span className={styles.badge}>{item.badge}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </LayoutGroup>

      <div className={styles.footer}>
        <Avatar name={user.name} size={36} status="online" />
        <div className={styles.footerInfo}>
          <span className={styles.footerName}>{user.name}</span>
          <span className={styles.footerMail}>{user.email}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
