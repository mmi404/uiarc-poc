"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/arc/card/card";
import { Kanban } from "@/components/arc/kanban/kanban";
import type { KanbanTask } from "@/components/arc/kanban/kanban";
import { Button } from "@/components/arc/button/button";
import { Badge } from "@/components/arc/badge/badge";
import { kanbanColumns, kanbanTasks } from "@/data";
import { useToast } from "@/components/arc/toast/toast";
import styles from "@/App.module.css";

export function ProjectsPage() {
  const toast = useToast();

  const onMove = (task: KanbanTask, to: string) => {
    const col = kanbanColumns.find((c) => c.id === to);
    if (to === "done") {
      toast({ title: "Task completed", description: `“${task.title}” moved to Done.`, variant: "success" });
    } else {
      toast({ title: "Task moved", description: `“${task.title}” → ${col?.title}.`, variant: "default" });
    }
  };

  return (
    <Card index={0} animated>
      <CardHeader>
        <div className={styles.cardHeadRow} style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <CardTitle>Q4 Roadmap</CardTitle>
            <Badge tone="accent">{kanbanTasks.length} tasks</Badge>
          </div>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "New task", description: "A task composer would open here.", variant: "info" })}>
            <Plus size={15} strokeWidth={2.2} /> New task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Kanban columns={kanbanColumns} tasks={kanbanTasks} onMove={onMove} />
      </CardContent>
    </Card>
  );
}

export default ProjectsPage;
