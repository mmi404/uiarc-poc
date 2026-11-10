"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/arc/card/card";
import { DataTable } from "@/components/arc/table/table";
import type { Column } from "@/components/arc/table/table";
import { Badge } from "@/components/arc/badge/badge";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Button } from "@/components/arc/button/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/arc/tabs/tabs";
import { AnimatedNumber } from "@/components/arc/number/animated-number";
import { STATUS_TONE, transactions } from "@/data";
import type { Transaction } from "@/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/arc/toast/toast";
import styles from "@/App.module.css";

type Filter = "all" | "Paid" | "Pending" | "Failed";

const columns: Column<Transaction>[] = [
  {
    key: "id",
    header: "Invoice",
    sortable: true,
    sortValue: (r) => r.id,
    render: (r) => <span className={styles.activityWho}>{r.id}</span>,
  },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    sortValue: (r) => r.customer,
    render: (r) => (
      <span className="tableCustomer" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
        <Avatar name={r.customer} size={26} />
        {r.customer}
      </span>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    sortable: true,
    sortValue: (r) => r.plan,
    render: (r) => <Badge tone="neutral">{r.plan}</Badge>,
  },
  {
    key: "date",
    header: "Date",
    render: (r) => r.date,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sortValue: (r) => r.status,
    render: (r) => (
      <Badge tone={STATUS_TONE[r.status]} dot>
        {r.status}
      </Badge>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    sortValue: (r) => r.amount,
    render: (r) => formatCurrency(r.amount),
  },
];

export function TransactionsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => (filter === "all" ? transactions : transactions.filter((t) => t.status === filter)), [filter]);

  const totalPaid = transactions.filter((t) => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const pending = transactions.filter((t) => t.status === "Pending").length;

  return (
    <>
      <div className={styles.kpiRow} style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <Card index={0}>
          <CardContent style={{ padding: "1.25rem" }}>
            <div className={styles.settingHint}>Collected (paid)</div>
            <div className={styles.bigNumberValue} style={{ marginTop: 6 }}>
              <AnimatedNumber value={totalPaid} format={(v) => formatCurrency(v)} startOnView={false} />
            </div>
          </CardContent>
        </Card>
        <Card index={1}>
          <CardContent style={{ padding: "1.25rem" }}>
            <div className={styles.settingHint}>Invoices</div>
            <div className={styles.bigNumberValue} style={{ marginTop: 6 }}>
              <AnimatedNumber value={transactions.length} format={(v) => formatNumber(v)} startOnView={false} />
            </div>
          </CardContent>
        </Card>
        <Card index={2}>
          <CardContent style={{ padding: "1.25rem" }}>
            <div className={styles.settingHint}>Awaiting payment</div>
            <div className={styles.bigNumberValue} style={{ marginTop: 6 }}>
              <AnimatedNumber value={pending} format={(v) => formatNumber(v)} startOnView={false} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card index={0}>
        <CardHeader>
          <div className={styles.cardHeadRow} style={{ width: "100%" }}>
            <CardTitle>Transactions</CardTitle>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Paid">Paid</TabsTrigger>
                  <TabsTrigger value="Pending">Pending</TabsTrigger>
                  <TabsTrigger value="Failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" variant="secondary" onClick={() => toast({ title: "Export started", description: "Your CSV will be emailed shortly.", variant: "success" })}>
                <Download size={15} strokeWidth={2.1} /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ paddingTop: 0 }}>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} initialSort={{ key: "amount", dir: "desc" }} />
        </CardContent>
      </Card>
    </>
  );
}

export default TransactionsPage;
