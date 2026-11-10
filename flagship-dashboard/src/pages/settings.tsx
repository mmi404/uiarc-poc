"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/arc/card/card";
import { Switch } from "@/components/arc/switch/switch";
import { ThemeToggle } from "@/components/arc/theme-toggle/theme-toggle";
import { Button } from "@/components/arc/button/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/arc/dialog/dialog";
import type { Accent, Theme } from "@/lib/use-theme";
import { useToast } from "@/components/arc/toast/toast";
import styles from "@/App.module.css";

const ACCENTS: { id: Accent; color: string }[] = [
  { id: "violet", color: "#7747ff" },
  { id: "blue", color: "#0562ef" },
  { id: "green", color: "#0db879" },
  { id: "amber", color: "#f3ad20" },
  { id: "coral", color: "#f15f55" },
  { id: "rose", color: "#ed4e9d" },
];

export interface SettingsPageProps {
  theme: Theme;
  accent: Accent;
  onToggleTheme: () => void;
  setAccent: (a: Accent) => void;
}

export function SettingsPage({ theme, accent, onToggleTheme, setAccent }: SettingsPageProps) {
  const toast = useToast();
  const [notifs, setNotifs] = useState({ product: true, billing: true, weekly: false, security: true });

  return (
    <div className={styles.settingsGrid}>
      <Card index={0}>
        <CardHeader>
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Personalize how Northwind looks on this device.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Theme</span>
              <span className={styles.settingHint}>Switch between light and dark.</span>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Accent color</span>
              <span className={styles.settingHint}>Recolors charts, controls, and highlights.</span>
            </div>
          </div>
          <div className={styles.accentRow}>
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={styles.swatch}
                style={{ background: a.color }}
                data-active={accent === a.id}
                aria-label={a.id}
                onClick={() => setAccent(a.id)}
              >
                {accent === a.id ? (
                  <Check size={14} color="#fff" strokeWidth={3} style={{ position: "absolute", inset: 0, margin: "auto" }} />
                ) : null}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card index={1}>
        <CardHeader>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what lands in your inbox.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {[
            { key: "product" as const, label: "Product updates", hint: "New features and improvements." },
            { key: "billing" as const, label: "Billing alerts", hint: "Receipts, failures, and renewals." },
            { key: "weekly" as const, label: "Weekly digest", hint: "A Monday summary of your metrics." },
            { key: "security" as const, label: "Security", hint: "Sign-ins and sensitive changes." },
          ].map((row) => (
            <div key={row.key} className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{row.label}</span>
                <span className={styles.settingHint}>{row.hint}</span>
              </div>
              <Switch
                checked={notifs[row.key]}
                onCheckedChange={(v) => {
                  setNotifs((n) => ({ ...n, [row.key]: v }));
                  toast({ title: `${row.label} ${v ? "on" : "off"}`, variant: v ? "success" : "default", duration: 2200 });
                }}
                aria-label={row.label}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card index={2}>
        <CardHeader>
          <div>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Danger zone — these actions are hard to undo.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Delete workspace</span>
              <span className={styles.settingHint}>Permanently remove Northwind and all its data.</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="danger" size="sm">
                  <Trash2 size={15} strokeWidth={2} /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent title="Delete workspace?" description="This removes all projects, members, and billing history. This cannot be undone.">
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <DialogClose asChild>
                    <Button variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="danger" size="sm" onClick={() => toast({ title: "Workspace deletion scheduled", description: "You have 24 hours to undo.", variant: "danger" })}>
                      Yes, delete
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
