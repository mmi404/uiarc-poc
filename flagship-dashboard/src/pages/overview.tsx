"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/arc/card/card";
import { StatCard } from "@/components/arc/stat-card/stat-card";
import { AreaChart } from "@/components/arc/chart/area-chart";
import { BarChart } from "@/components/arc/chart/bar-chart";
import { DonutChart } from "@/components/arc/chart/donut-chart";
import { AnimatedNumber } from "@/components/arc/number/animated-number";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Badge } from "@/components/arc/badge/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/arc/tabs/tabs";
import { activity, channels, kpis, MONTHS, planMix, revenueLastYear, revenueThisYear } from "@/data";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/utils";
import styles from "@/App.module.css";

const KPI_ICONS: Record<string, ReactNode> = {
  mrr: <DollarSign size={16} strokeWidth={2} />,
  users: <Users size={16} strokeWidth={2} />,
  conversion: <Activity size={16} strokeWidth={2} />,
  churn: <CreditCard size={16} strokeWidth={2} />,
};

function kpiFormatter(kind: "currency" | "number" | "percent") {
  if (kind === "currency") return (v: number) => formatCurrency(v);
  if (kind === "percent") return (v: number) => `${v.toFixed(1)}%`;
  return (v: number) => formatNumber(v);
}

type Range = "6m" | "12m" | "ytd";

export function OverviewPage() {
  const reduced = useReducedMotion();
  const [range, setRange] = useState<Range>("12m");

  const chart = useMemo(() => {
    const slice = range === "6m" ? 6 : 12;
    const from = 12 - slice;
    return {
      labels: MONTHS.slice(from),
      thisYear: revenueThisYear.slice(from),
      lastYear: revenueLastYear.slice(from),
    };
  }, [range]);

  const total = chart.thisYear.reduce((a, b) => a + b, 0);

  return (
    <>
      <div className={styles.kpiRow}>
        {kpis.map((kpi, i) => (
          <StatCard
            key={kpi.id}
            index={i}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            deltaNote={kpi.deltaNote}
            icon={KPI_ICONS[kpi.id]}
            trend={kpi.trend}
            format={kpiFormatter(kpi.format)}
          />
        ))}
      </div>

      <div className={styles.chartRow}>
        <Card index={0}>
          <CardHeader>
            <div className={styles.cardHeadRow} style={{ width: "100%" }}>
              <div>
                <CardTitle>Revenue overview</CardTitle>
                <div className={styles.bigNumber}>
                  <span className={styles.bigNumberValue}>
                    <AnimatedNumber value={total} format={(v) => formatCurrency(v)} startOnView={false} />
                  </span>
                  <Badge tone="success" dot>
                    +12.4%
                  </Badge>
                </div>
                <div className={styles.legendInline} style={{ marginTop: "0.75rem" }}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendSwatch} style={{ background: "var(--series-1)" }} /> This year
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendSwatch} style={{ background: "var(--series-2)" }} /> Last year
                  </span>
                </div>
              </div>
              <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
                <TabsList>
                  <TabsTrigger value="6m">6M</TabsTrigger>
                  <TabsTrigger value="12m">12M</TabsTrigger>
                  <TabsTrigger value="ytd">YTD</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              key={range}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <AreaChart
                labels={chart.labels}
                series={[
                  { name: "This year", data: chart.thisYear, color: "var(--series-1)" },
                  { name: "Last year", data: chart.lastYear, color: "var(--series-2)" },
                ]}
                height={280}
                format={(v) => formatCurrency(v)}
              />
            </motion.div>
          </CardContent>
        </Card>

        <Card index={1}>
          <CardHeader>
            <div>
              <CardTitle>Plan mix</CardTitle>
              <CardDescription>Share of active revenue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DonutChart data={planMix} centerLabel="Accounts" format={(v) => `${v}%`} />
          </CardContent>
        </Card>
      </div>

      <div className={styles.splitRow}>
        <Card index={0}>
          <CardHeader>
            <div>
              <CardTitle>Acquisition by channel</CardTitle>
              <CardDescription>New users in the last 30 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart data={channels} height={240} format={(v) => formatCompact(v)} />
          </CardContent>
        </Card>

        <Card index={1}>
          <CardHeader>
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Across your workspace</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.activityList}>
              {activity.map((a) => (
                <div key={a.id} className={styles.activityItem}>
                  {a.who === "System" ? (
                    <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 999, background: "var(--surface-muted)", color: "var(--text-secondary)", flex: "none" }}>
                      <Activity size={15} />
                    </span>
                  ) : (
                    <Avatar name={a.who} size={32} />
                  )}
                  <p className={styles.activityText}>
                    <span className={styles.activityWho}>{a.who}</span> {a.what}
                    {a.amount ? (
                      <>
                        {" "}
                        <Badge tone={a.tone}>{a.amount}</Badge>
                      </>
                    ) : null}
                  </p>
                  <span className={styles.activityWhen}>{a.when}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default OverviewPage;
