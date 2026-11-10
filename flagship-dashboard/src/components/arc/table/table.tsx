"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { cn } from "@/lib/utils";
import styles from "./table.module.css";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  sortable?: boolean;
  /** Value used for sorting; defaults to the rendered field when `field` is set. */
  sortValue?: (row: T) => number | string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  className?: string;
}

/** A sortable table whose rows stagger in on mount. Click a sortable header to cycle asc/desc. */
export function DataTable<T>({ columns, rows, rowKey, initialSort, className }: DataTableProps<T>) {
  const reduced = useReducedMotion();
  const [sort, setSort] = useState(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "desc" };
      return { key, dir: prev.dir === "desc" ? "asc" : "desc" };
    });
  };

  return (
    <div className={cn(styles.wrap, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  className={cn(styles.th, col.align === "right" && styles.right, col.sortable && styles.sortable, isSorted && styles.sorted)}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  aria-sort={isSorted ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                >
                  <span className={styles.thInner}>
                    {col.header}
                    {col.sortable ? (
                      <span className={styles.sortIcon}>
                        {!isSorted ? (
                          <ChevronsUpDown size={13} />
                        ) : sort!.dir === "asc" ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </span>
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <motion.tr
              key={rowKey(row)}
              className={styles.row}
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0.15 } : { ...motionTokens.spring.smooth, delay: Math.min(i, 12) * 0.03 }}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn(styles.td, col.align === "right" && styles.right)}>
                  {col.render(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
