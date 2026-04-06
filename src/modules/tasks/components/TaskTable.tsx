"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskEditor } from "./TaskEditor";
import type { Task } from "../types";

interface TaskTableProps {
  tasks: Task[];
  projectId: string;
  panelGroupFilter?: string[];
  extraHeaderButton?: React.ReactNode;
}

const STATUS_LABELS: Record<string, string> = {
  done: "Concluída",
  progress: "Em andamento",
  pending: "Não iniciado",
};

export function TaskTable({ tasks: initialTasks, projectId, panelGroupFilter, extraHeaderButton }: TaskTableProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = useCallback((savedTask: Task) => {
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
  }, []);

  const handleDelete = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setEditingTask(null);
  }, []);

  const cycleStatus = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const order: Task["status"][] = ["pending", "progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % 3];
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", task.id)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? (data as Task) : t))
      );
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Tarefas</h1>
          <p style={subtitleStyle}>{tasks.length} tarefas cadastradas</p>
        </div>
        <div style={headerBtnsStyle}>
          {extraHeaderButton}
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingTask(null);
            }}
            style={addBtnStyle}
          >
            + Nova tarefa
          </button>
        </div>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Grupo</th>
              <th style={thStyle}>Tarefa</th>
              <th style={{ ...thStyle, width: 110 }}>Entrega</th>
              <th style={{ ...thStyle, width: 110 }}>Retorno</th>
              <th style={{ ...thStyle, width: 140 }}>Status</th>
              <th style={{ ...thStyle, width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                style={rowStyle}
                onClick={() => {
                  setEditingTask(task);
                  setIsAdding(false);
                }}
              >
                <td style={tdStyle}>
                  <span style={groupBadgeStyle}>{task.group_name}</span>
                </td>
                <td style={{ ...tdStyle, color: "var(--dark)" }}>
                  {task.name}
                </td>
                <td style={tdStyle}>{formatDate(task.due_date)}</td>
                <td style={tdStyle}>
                  {task.return_date ? formatDate(task.return_date) : "—"}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={(e) => cycleStatus(e, task)}
                    style={statusBtnStyle(task.status)}
                  >
                    <span style={statusDotStyle(task.status)} />
                    {STATUS_LABELS[task.status]}
                  </button>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                      setIsAdding(false);
                    }}
                    style={actionBtnStyle}
                    title="Editar"
                  >
                    ✎
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(editingTask || isAdding) && (
        <TaskEditor
          task={editingTask}
          projectId={projectId}
          existingGroups={[...new Set(tasks.map((t) => t.group_name))]}
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

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// ── Styles ──────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: "32px 40px",
  height: "calc(100vh - 52px)",
  overflow: "auto",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: 28,
};

const headerBtnsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const titleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  marginTop: 4,
};

const addBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "var(--dark)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const tableWrapStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  border: "1px solid var(--sand)",
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 20px",
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
  borderBottom: "1px solid var(--sand)",
  background: "var(--cream)",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid #f0efed",
  fontSize: 14,
  color: "var(--stone)",
  verticalAlign: "middle",
};

const rowStyle: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 0.1s ease",
};

const groupBadgeStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dark)",
  background: "#edecea",
  padding: "4px 10px",
  borderRadius: 3,
};

function statusBtnStyle(status: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "none",
    border: "none",
    fontSize: 10,
    fontWeight: 300,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--stone)",
    cursor: "pointer",
    padding: "2px 0",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    whiteSpace: "nowrap",
  };
}

function statusDotStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  };
  if (status === "done") return { ...base, background: "var(--dark)" };
  if (status === "progress") return { ...base, background: "var(--stone)" };
  return { ...base, background: "var(--cream)", border: "1.5px solid var(--stone)" };
}

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 14,
  color: "var(--stone)",
  cursor: "pointer",
  padding: "2px 4px",
  lineHeight: 1,
};
