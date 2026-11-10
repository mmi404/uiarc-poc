import type { BadgeTone } from "@/components/arc/badge/badge";
import type { KanbanColumn, KanbanTask } from "@/components/arc/kanban/kanban";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const revenueThisYear = [58, 62, 71, 68, 83, 91, 97, 104, 112, 121, 134, 148].map((v) => v * 1000);
export const revenueLastYear = [41, 46, 49, 52, 57, 61, 64, 69, 73, 78, 84, 92].map((v) => v * 1000);

export interface Kpi {
  id: string;
  label: string;
  value: number;
  delta: number;
  deltaNote?: string;
  trend: number[];
  format: "currency" | "number" | "percent";
}

export const kpis: Kpi[] = [
  {
    id: "mrr",
    label: "Monthly recurring revenue",
    value: 148320,
    delta: 12.4,
    deltaNote: "MoM",
    trend: [97, 104, 100, 112, 121, 118, 134, 148],
    format: "currency",
  },
  {
    id: "users",
    label: "Active users",
    value: 38492,
    delta: 8.1,
    deltaNote: "MoM",
    trend: [22, 24, 27, 29, 31, 33, 36, 38],
    format: "number",
  },
  {
    id: "conversion",
    label: "Conversion rate",
    value: 4.7,
    delta: -1.3,
    deltaNote: "MoM",
    trend: [5.4, 5.2, 5.1, 4.9, 5.0, 4.8, 4.9, 4.7],
    format: "percent",
  },
  {
    id: "churn",
    label: "Net revenue retention",
    value: 113,
    delta: 2.6,
    deltaNote: "MoM",
    trend: [104, 106, 108, 107, 110, 111, 112, 113],
    format: "percent",
  },
];

export interface Channel {
  label: string;
  value: number;
}

export const channels: Channel[] = [
  { label: "Organic", value: 14200 },
  { label: "Referral", value: 9800 },
  { label: "Paid", value: 7600 },
  { label: "Social", value: 5400 },
  { label: "Email", value: 4100 },
  { label: "Direct", value: 3200 },
];

export const planMix = [
  { label: "Enterprise", value: 42 },
  { label: "Business", value: 31 },
  { label: "Pro", value: 18 },
  { label: "Free", value: 9 },
];

export const kanbanColumns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", tone: "var(--text-muted)" },
  { id: "progress", title: "In Progress", tone: "var(--info)" },
  { id: "review", title: "Review", tone: "var(--warning)" },
  { id: "done", title: "Done", tone: "var(--success)" },
];

export const kanbanTasks: KanbanTask[] = [
  { id: "t1", column: "backlog", title: "Design new onboarding flow", tag: "Design", tagTone: "orchid", priority: "High", assignees: ["Ava Chen", "Liam Ford"] },
  { id: "t2", column: "backlog", title: "Audit SSO edge cases", tag: "Security", tagTone: "rose", priority: "Medium", assignees: ["Noah Park"] },
  { id: "t3", column: "progress", title: "Ship usage-based billing", tag: "Billing", tagTone: "teal", priority: "High", assignees: ["Mia Rivera", "Ava Chen"] },
  { id: "t4", column: "progress", title: "Instrument funnel events", tag: "Data", tagTone: "sky", priority: "Medium", assignees: ["Ethan Cole"] },
  { id: "t5", column: "review", title: "Refine dark theme contrast", tag: "Design", tagTone: "orchid", priority: "Low", assignees: ["Liam Ford"] },
  { id: "t6", column: "review", title: "Rate-limit public API", tag: "Platform", tagTone: "amber", priority: "High", assignees: ["Noah Park", "Mia Rivera"] },
  { id: "t7", column: "done", title: "Launch referral program", tag: "Growth", tagTone: "green", priority: "Medium", assignees: ["Ava Chen"] },
  { id: "t8", column: "done", title: "Migrate to Vite 8", tag: "Platform", tagTone: "amber", priority: "Low", assignees: ["Ethan Cole", "Noah Park"] },
];

export type TxStatus = "Paid" | "Pending" | "Refunded" | "Failed";

export interface Transaction {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: TxStatus;
  date: string;
}

export const STATUS_TONE: Record<TxStatus, BadgeTone> = {
  Paid: "success",
  Pending: "warning",
  Refunded: "info",
  Failed: "danger",
};

export const transactions: Transaction[] = [
  { id: "INV-2048", customer: "Aurora Labs", plan: "Enterprise", amount: 4800, status: "Paid", date: "Nov 09" },
  { id: "INV-2047", customer: "Monzo Studio", plan: "Business", amount: 1299, status: "Paid", date: "Nov 09" },
  { id: "INV-2046", customer: "Fable & Co.", plan: "Pro", amount: 348, status: "Pending", date: "Nov 08" },
  { id: "INV-2045", customer: "Helix Robotics", plan: "Enterprise", amount: 6200, status: "Paid", date: "Nov 08" },
  { id: "INV-2044", customer: "Driftwood Media", plan: "Business", amount: 1299, status: "Refunded", date: "Nov 07" },
  { id: "INV-2043", customer: "Northstar AI", plan: "Enterprise", amount: 5400, status: "Paid", date: "Nov 07" },
  { id: "INV-2042", customer: "Pixel Forge", plan: "Pro", amount: 348, status: "Failed", date: "Nov 06" },
  { id: "INV-2041", customer: "Greenfield IO", plan: "Business", amount: 1299, status: "Paid", date: "Nov 06" },
  { id: "INV-2040", customer: "Lumen Health", plan: "Enterprise", amount: 7100, status: "Pending", date: "Nov 05" },
  { id: "INV-2039", customer: "Cobalt Bank", plan: "Enterprise", amount: 8900, status: "Paid", date: "Nov 05" },
];

export const activity = [
  { id: "a1", who: "Mia Rivera", what: "closed the deal with Cobalt Bank", amount: "$8,900", when: "12m ago", tone: "green" as BadgeTone },
  { id: "a2", who: "System", what: "flagged a failed payment from Pixel Forge", amount: "", when: "48m ago", tone: "rose" as BadgeTone },
  { id: "a3", who: "Ava Chen", what: "shipped the referral program", amount: "", when: "2h ago", tone: "sky" as BadgeTone },
  { id: "a4", who: "Lumen Health", what: "upgraded to Enterprise", amount: "$7,100", when: "5h ago", tone: "teal" as BadgeTone },
];
