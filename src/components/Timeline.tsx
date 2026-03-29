"use client";

import { useEffect, useRef, useCallback, useState, type ReactNode } from "react";
import { renderTimeline } from "@/lib/timeline/renderer";
import { TaskEditor } from "./TaskEditor";
import type { Task } from "@/lib/types";
import "@/styles/timeline.css";

interface TimelineProps {
  tasks: Task[];
  readOnly?: boolean;
  timelineName?: string;
  shareToggle?: ReactNode;
  extraHeaderRight?: ReactNode;
}

const STATUS_LABELS: Record<string, string> = {
  done: "Concluída",
  progress: "Em andamento",
  pending: "Não iniciado",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}`;
}

export function Timeline({
  tasks: initialTasks,
  readOnly = false,
  timelineName,
  shareToggle,
  extraHeaderRight,
}: TimelineProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handlePinClick = useCallback(
    (task: Task) => {
      if (readOnly) return;
      setEditingTask(task);
      setIsAdding(false);
    },
    [readOnly]
  );

  useEffect(() => {
    if (!canvasRef.current || !scrollRef.current || !tooltipRef.current) return;
    const result = renderTimeline(
      canvasRef.current,
      scrollRef.current,
      tooltipRef.current,
      tasks,
      readOnly ? undefined : handlePinClick
    );
    return result.cleanup;
  }, [tasks, handlePinClick, readOnly]);

  const handleSave = (savedTask: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTask.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedTask;
        return updated;
      }
      return [...prev, savedTask];
    });
    setEditingTask(null);
    setIsAdding(false);
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setEditingTask(null);
  };

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const title = timelineName
    ? `${timelineName} — Cronograma`
    : "Ortus — Cronograma de Lançamento";

  // Group tasks by group_name for the activity list
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.group_name]) acc[task.group_name] = [];
    acc[task.group_name].push(task);
    return acc;
  }, {});

  return (
    <div className="tl-page">
      <header className="tl-header">
        <div>
          <h1>{title}</h1>
          <div className="sub">
            {tasks.length} tarefas · Atualizado em {dd}/{mm}/{yyyy}
          </div>
        </div>
        <div className="tl-header-right">
          {shareToggle}
          {extraHeaderRight}
          <div className="legend">
            <div className="li">
              <span className="ld ld-done"></span>Concluída
            </div>
            <div className="li">
              <span className="ld ld-progress"></span>Em andamento
            </div>
            <div className="li">
              <span className="ld ld-pending"></span>Não iniciado
            </div>
          </div>
          {!readOnly && (
            <button
              className="add-btn"
              onClick={() => {
                setIsAdding(true);
                setEditingTask(null);
              }}
              title="Adicionar tarefa"
            >
              +
            </button>
          )}
        </div>
      </header>

      <div className="status-tooltip" ref={tooltipRef}></div>

      <div className="tl-scroll" ref={scrollRef}>
        <div className="tl-canvas" ref={canvasRef}></div>
      </div>

      {/* Activity list below timeline */}
      <div className="tl-activities">
        <h2>Atividades</h2>
        {Object.entries(grouped).map(([group, groupTasks]) => (
          <div key={group} className="tl-act-group">
            <div className="tl-act-group-name">{group}</div>
            <ul className="tl-act-list">
              {groupTasks
                .sort((a, b) => a.due_date.localeCompare(b.due_date))
                .map((task) => (
                  <li key={task.id}>
                    <span
                      className="tl-act-dot"
                      style={dotStyle(task.status)}
                    />
                    <span className="tl-act-date">
                      {formatDate(task.due_date)}
                    </span>
                    <span className="tl-act-name">{task.name}</span>
                    <span className="tl-act-status">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="tl-footer">
        <span className="fb">Nosco Studio</span>
        <span className="fm">
          {tasks.length} tarefas · Atualizado em {dd}/{mm}/{yyyy}
        </span>
      </footer>

      {!readOnly && (editingTask || isAdding) && (
        <TaskEditor
          task={editingTask}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setEditingTask(null);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}

function dotStyle(status: string): React.CSSProperties {
  if (status === "done") return { background: "var(--dark)" };
  if (status === "progress") return { background: "var(--stone)" };
  return { background: "var(--cream)", border: "1.5px solid var(--stone)" };
}
