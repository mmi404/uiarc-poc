"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar, AvatarGroup } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import type { BadgeTone } from "../badge/badge";
import styles from "./kanban.module.css";

export interface KanbanColumn {
  id: string;
  title: string;
  tone?: string;
}

export interface KanbanTask {
  id: string;
  column: string;
  title: string;
  tag: string;
  tagTone?: BadgeTone;
  priority?: "Low" | "Medium" | "High";
  assignees: string[];
}

export interface KanbanProps {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  /** Fired after a card changes column. */
  onMove?: (task: KanbanTask, toColumn: string) => void;
}

const PRIORITY_TONE: Record<string, string> = {
  High: "var(--danger)",
  Medium: "var(--warning)",
  Low: "var(--text-muted)",
};

/** A board whose cards glide to their new column via shared-layout animation. Move with the chevrons or drag a card onto another column. */
export function Kanban({ columns, tasks: initial, onMove }: KanbanProps) {
  const reduced = useReducedMotion();
  const [tasks, setTasks] = useState(initial);

  const move = (task: KanbanTask, dir: -1 | 1) => {
    const idx = columns.findIndex((c) => c.id === task.column);
    const next = columns[idx + dir];
    if (!next) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, column: next.id } : t)));
    onMove?.(task, next.id);
  };

  return (
    <LayoutGroup>
      <div className={styles.board} style={{ ["--cols" as string]: columns.length }}>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);
          const colIdx = columns.findIndex((c) => c.id === col.id);
          return (
            <motion.div key={col.id} layout className={styles.column}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>
                  <span className={styles.dot} style={{ ["--tone" as string]: col.tone ?? "var(--text-muted)" }} />
                  {col.title}
                </span>
                <motion.span layout className={styles.count}>
                  {colTasks.length}
                </motion.span>
              </div>

              <div className={styles.cards}>
                <AnimatePresence initial={false}>
                  {colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      layoutId={task.id}
                      className={styles.card}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, transition: { duration: 0.14 } }}
                      transition={reduced ? { duration: 0.15 } : motionTokens.spring.smooth}
                      whileHover={reduced ? undefined : { y: -2 }}
                    >
                      <div className={styles.cardTop}>
                        <Badge tone={task.tagTone ?? "neutral"} dot>
                          {task.tag}
                        </Badge>
                        {task.priority ? (
                          <span className={styles.priority} style={{ color: PRIORITY_TONE[task.priority] }}>
                            <Flag size={11} strokeWidth={2.4} />
                            {task.priority}
                          </span>
                        ) : null}
                      </div>
                      <p className={styles.cardTitle}>{task.title}</p>
                      <div className={styles.cardFooter}>
                        <AvatarGroup>
                          {task.assignees.slice(0, 3).map((name) => (
                            <Avatar key={name} name={name} size={26} />
                          ))}
                        </AvatarGroup>
                        <div className={styles.moves}>
                          <button
                            type="button"
                            className={styles.moveBtn}
                            aria-label="Move left"
                            disabled={colIdx === 0}
                            onClick={() => move(task, -1)}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            className={styles.moveBtn}
                            aria-label="Move right"
                            disabled={colIdx === columns.length - 1}
                            onClick={() => move(task, 1)}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 ? <div className={styles.empty}>Drop tasks here</div> : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default Kanban;
