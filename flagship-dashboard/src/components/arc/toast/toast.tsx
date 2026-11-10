"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./toast.module.css";

export type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

const ToastContext = createContext<(opts: ToastOptions) => void>(() => {});

const ICONS: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduced = useReducedMotion();
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = nextId.current++;
      const duration = opts.duration ?? 4200;
      setToasts((prev) => [...prev.slice(-3), { ...opts, id }]);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const viewport =
    typeof document !== "undefined"
      ? createPortal(
          <div className={styles.viewport}>
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const Icon = ICONS[t.variant ?? "default"];
                const duration = t.duration ?? 4200;
                return (
                  <motion.div
                    key={t.id}
                    layout
                    className={`${styles.toast} ${styles[t.variant ?? "default"] ?? ""}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.18 } }}
                    transition={reduced ? { duration: 0.14 } : motionTokens.spring.smooth}
                  >
                    <span className={styles.icon}>
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <div className={styles.body}>
                      <p className={styles.title}>{t.title}</p>
                      {t.description ? <p className={styles.description}>{t.description}</p> : null}
                    </div>
                    <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                      <X size={14} strokeWidth={2} />
                    </button>
                    {duration > 0 && !reduced ? (
                      <motion.span
                        className={styles.progress}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: duration / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )
      : null;

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {viewport}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default ToastProvider;
