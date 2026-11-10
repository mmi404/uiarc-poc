"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./command-palette.module.css";

export interface Command {
  id: string;
  label: string;
  icon?: ReactNode;
  hint?: string;
  keywords?: string;
  group?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  placeholder?: string;
}

/** A ⌘K command menu: fuzzy-ish substring filter, full keyboard nav, a gliding selection highlight, and a spring entrance. */
export function CommandPalette({ open, onOpenChange, commands, placeholder = "Type a command or search…" }: CommandPaletteProps) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.group ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      const g = c.group ?? "Commands";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    // Flatten to a stable index order matching keyboard navigation.
    const ordered: { group: string; items: Command[] }[] = [];
    for (const [group, items] of map) ordered.push({ group, items });
    return ordered;
  }, [filtered]);

  // Reset state when opening.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const run = (cmd: Command) => {
    onOpenChange(false);
    // Defer so the close animation starts before the action navigates/toasts.
    requestAnimationFrame(() => cmd.action());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) run(cmd);
    }
  };

  // Keep the active row in view.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let runningIndex = -1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} transition={{ duration: 0.2 }} />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount aria-label="Command palette" onKeyDown={onKeyDown}>
              <motion.div
                className={styles.content}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14 } }}
                transition={reduced ? { duration: 0.14 } : { default: motionTokens.spring.smooth, opacity: { duration: 0.16 } }}
              >
                <DialogPrimitive.Title style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  Command palette
                </DialogPrimitive.Title>
                <div className={styles.searchRow}>
                  <Search className={styles.searchIcon} size={18} />
                  {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
                  <input
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    autoFocus
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Command search"
                  />
                  <span className={styles.kbd}>ESC</span>
                </div>

                <div className={styles.list} ref={listRef}>
                  {filtered.length === 0 ? (
                    <div className={styles.empty}>No results for “{query}”</div>
                  ) : (
                    groups.map((grp) => (
                      <div key={grp.group} className={styles.group}>
                        <div className={styles.groupLabel}>{grp.group}</div>
                        {grp.items.map((cmd) => {
                          runningIndex++;
                          const index = runningIndex;
                          const isActive = index === active;
                          return (
                            <div
                              key={cmd.id}
                              data-index={index}
                              className={`${styles.item} ${isActive ? styles.active : ""}`}
                              onPointerMove={() => setActive(index)}
                              onClick={() => run(cmd)}
                              role="option"
                              aria-selected={isActive}
                            >
                              {isActive ? (
                                <motion.span className={styles.highlight} layoutId="cmd-highlight" transition={reduced ? { duration: 0 } : motionTokens.spring.morph} />
                              ) : null}
                              {cmd.icon ? <span className={styles.itemIcon}>{cmd.icon}</span> : null}
                              <span className={styles.itemLabel}>{cmd.label}</span>
                              {cmd.hint ? <span className={styles.itemHint}>{cmd.hint}</span> : null}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.footer}>
                  <span className={styles.footerHint}>
                    <span className={styles.kbd}>↑</span>
                    <span className={styles.kbd}>↓</span>
                    to navigate
                  </span>
                  <span className={styles.footerHint}>
                    <span className={styles.kbd}>
                      <CornerDownLeft size={11} />
                    </span>
                    to select
                  </span>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export default CommandPalette;
