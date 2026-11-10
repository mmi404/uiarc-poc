"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Command as CommandIcon,
  Download,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Moon,
  Palette,
  Plus,
  Receipt,
  Search,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import { motionTokens } from "@/components/arc/lib/motion-tokens";
import { Sidebar } from "@/components/arc/sidebar/sidebar";
import type { NavSection } from "@/components/arc/sidebar/sidebar";
import { ThemeToggle } from "@/components/arc/theme-toggle/theme-toggle";
import { Button } from "@/components/arc/button/button";
import { CommandPalette } from "@/components/arc/command-palette/command-palette";
import type { Command } from "@/components/arc/command-palette/command-palette";
import { ToastProvider, useToast } from "@/components/arc/toast/toast";
import { useTheme } from "@/lib/use-theme";
import type { Accent } from "@/lib/use-theme";
import { OverviewPage } from "@/pages/overview";
import { ProjectsPage } from "@/pages/projects";
import { TransactionsPage } from "@/pages/transactions";
import { SettingsPage } from "@/pages/settings";
import styles from "./App.module.css";

type View = "overview" | "projects" | "transactions" | "settings";

const PAGE_META: Record<View, { title: string; sub: string }> = {
  overview: { title: "Overview", sub: "Your revenue and growth at a glance" },
  projects: { title: "Projects", sub: "Track delivery across the team" },
  transactions: { title: "Transactions", sub: "Payments, invoices, and refunds" },
  settings: { title: "Settings", sub: "Workspace and personal preferences" },
};

const ACCENT_ORDER: Accent[] = ["violet", "blue", "green", "amber", "coral", "rose"];

function Dashboard() {
  const reduced = useReducedMotion();
  const { theme, accent, setAccent, toggleTheme } = useTheme();
  const toast = useToast();
  const [view, setView] = useState<View>("overview");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = useCallback((v: View) => {
    setView(v);
    setDrawerOpen(false);
  }, []);

  // ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sections: NavSection[] = useMemo(
    () => [
      {
        label: "Workspace",
        items: [
          { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} strokeWidth={1.9} /> },
          { id: "projects", label: "Projects", icon: <FolderKanban size={17} strokeWidth={1.9} />, badge: 8 },
          { id: "transactions", label: "Transactions", icon: <Receipt size={17} strokeWidth={1.9} /> },
        ],
      },
      {
        label: "Account",
        items: [{ id: "settings", label: "Settings", icon: <SettingsIcon size={17} strokeWidth={1.9} /> }],
      },
    ],
    [],
  );

  const commands: Command[] = useMemo(() => {
    const nav: Command[] = (Object.keys(PAGE_META) as View[]).map((v) => ({
      id: `nav-${v}`,
      group: "Navigate",
      label: `Go to ${PAGE_META[v].title}`,
      icon:
        v === "overview" ? (
          <LayoutDashboard size={16} />
        ) : v === "projects" ? (
          <FolderKanban size={16} />
        ) : v === "transactions" ? (
          <Receipt size={16} />
        ) : (
          <SettingsIcon size={16} />
        ),
      keywords: v,
      action: () => go(v),
    }));

    const actions: Command[] = [
      {
        id: "toggle-theme",
        group: "Actions",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
        keywords: "theme dark light appearance",
        action: toggleTheme,
      },
      {
        id: "new-report",
        group: "Actions",
        label: "Create a report",
        icon: <Plus size={16} />,
        hint: "⇧N",
        keywords: "new report create",
        action: () => toast({ title: "Report created", description: "Your November report is ready.", variant: "success" }),
      },
      {
        id: "export",
        group: "Actions",
        label: "Export transactions",
        icon: <Download size={16} />,
        keywords: "export csv download",
        action: () => toast({ title: "Export started", description: "We'll email you a CSV.", variant: "info" }),
      },
    ];

    const accents: Command[] = ACCENT_ORDER.map((a) => ({
      id: `accent-${a}`,
      group: "Accent",
      label: `Accent: ${a[0].toUpperCase()}${a.slice(1)}`,
      icon: <Palette size={16} />,
      keywords: `accent color theme ${a}`,
      action: () => {
        setAccent(a);
        toast({ title: `Accent set to ${a}`, variant: "default", duration: 1800 });
      },
    }));

    return [...nav, ...actions, ...accents];
  }, [go, theme, toggleTheme, toast, setAccent]);

  const meta = PAGE_META[view];

  const page: ReactNode =
    view === "overview" ? (
      <OverviewPage />
    ) : view === "projects" ? (
      <ProjectsPage />
    ) : view === "transactions" ? (
      <TransactionsPage />
    ) : (
      <SettingsPage theme={theme} accent={accent} onToggleTheme={toggleTheme} setAccent={setAccent} />
    );

  const sidebar = (
    <Sidebar
      sections={sections}
      active={view}
      onSelect={(id) => go(id as View)}
      user={{ name: "Jordan Casey", email: "jordan@northwind.io" }}
    />
  );

  return (
    <div className={styles.shell}>
      <div className={styles.desktopSidebar}>{sidebar}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.div
              className={styles.drawerBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className={styles.drawer}
              initial={reduced ? { opacity: 0 } : { x: "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "-100%" }}
              transition={reduced ? { duration: 0.15 } : motionTokens.spring.smooth}
            >
              {sidebar}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <Menu size={18} />
          </button>

          <div className={styles.titleBlock}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={view}
                className={styles.titleInner}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduced ? { duration: 0.12 } : motionTokens.spring.snappy}
              >
                <span className={styles.pageTitle}>{meta.title}</span>
                <span className={styles.pageSub}>{meta.sub}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.topActions}>
            <button className={styles.search} onClick={() => setCmdOpen(true)} aria-label="Open command palette">
              <Search size={16} />
              <span className={styles.searchText}>Search…</span>
              <span className={styles.kbd}>
                <CommandIcon size={11} style={{ marginRight: 1 }} />K
              </span>
            </button>
            <button className={`${styles.iconButton} ${styles.topHideSm}`} aria-label="Notifications" onClick={() => toast({ title: "3 new notifications", description: "You're all caught up otherwise.", variant: "info" })}>
              <Bell size={17} />
              <span className={styles.notifDot} />
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button size="md" className={styles.topHideSm} onClick={() => toast({ title: "Report created", description: "Your November report is ready.", variant: "success" })}>
              <Plus size={15} strokeWidth={2.2} /> New report
            </Button>
          </div>
        </header>

        <div className={styles.scroll}>
          <main className={styles.page}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduced ? { duration: 0.14 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                {page}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} commands={commands} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
