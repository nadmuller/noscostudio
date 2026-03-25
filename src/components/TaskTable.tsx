"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

interface TaskTableProps {
  tasks: Task[];
}

const STATUS_LABELS: Record<string, string> = {
  done: "Concluída",
  progress: "Em andamento",
  pending: "Não iniciado",
};

export function TaskTable({ tasks: initialTasks }: TaskTableProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [editGroup, setEditGroup] = useState("");
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("pending");
  const [loading, setLoading] = useState(false);

  const startEdit = useCallback((task: Task) => {
    setEditingId(task.id);
    setEditGroup(task.group_name);
    setEditName(task.name);
    setEditDate(task.due_date);
    setEditStatus(task.status);
    setAdding(false);
  }, []);

  const startAdd = useCallback(() => {
    setAdding(true);
    setEditingId(null);
    setEditGroup("");
    setEditName("");
    setEditDate("");
    setEditStatus("pending");
  }, []);

  const cancel = useCallback(() => {
    setEditingId(null);
    setAdding(false);
  }, []);

  const saveEdit = async () => {
    if (!editGroup.trim() || !editName.trim() || !editDate) return;
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({
        group_name: editGroup.trim().toUpperCase(),
        name: editName.trim(),
        due_date: editDate,
        status: editStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId!)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? (data as Task) : t))
      );
    }
    setEditingId(null);
    setLoading(false);
  };

  const saveNew = async () => {
    if (!editGroup.trim() || !editName.trim() || !editDate) return;
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        group_name: editGroup.trim().toUpperCase(),
        name: editName.trim(),
        due_date: editDate,
        status: editStatus,
        sort_order: tasks.length,
      })
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data as Task]);
    }
    setAdding(false);
    setLoading(false);
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Excluir esta tarefa?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const cycleStatus = async (task: Task) => {
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

  // Get unique groups for visual grouping
  const groups = [...new Set(tasks.map((t) => t.group_name))];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Tarefas</h1>
          <p style={subtitleStyle}>{tasks.length} tarefas cadastradas</p>
        </div>
        <button onClick={startAdd} style={addBtnStyle}>
          + Nova tarefa
        </button>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Grupo</th>
              <th style={thStyle}>Tarefa</th>
              <th style={{ ...thStyle, width: 120 }}>Data</th>
              <th style={{ ...thStyle, width: 130 }}>Status</th>
              <th style={{ ...thStyle, width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) =>
              editingId === task.id ? (
                <tr key={task.id} style={editRowStyle}>
                  <td style={tdStyle}>
                    <input
                      value={editGroup}
                      onChange={(e) => setEditGroup(e.target.value)}
                      style={cellInputStyle}
                      placeholder="Grupo"
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={cellInputStyle}
                      placeholder="Nome"
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      style={cellInputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as Task["status"])
                      }
                      style={cellInputStyle}
                    >
                      <option value="pending">Não iniciado</option>
                      <option value="progress">Em andamento</option>
                      <option value="done">Concluída</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        style={actionBtnStyle}
                      >
                        ✓
                      </button>
                      <button onClick={cancel} style={actionBtnStyle}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={task.id}
                  style={rowStyle}
                  onDoubleClick={() => startEdit(task)}
                >
                  <td style={tdStyle}>
                    <span style={groupBadgeStyle}>{task.group_name}</span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--dark)" }}>
                    {task.name}
                  </td>
                  <td style={tdStyle}>{formatDate(task.due_date)}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => cycleStatus(task)}
                      style={statusBtnStyle(task.status)}
                    >
                      <span style={statusDotStyle(task.status)} />
                      {STATUS_LABELS[task.status]}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => startEdit(task)}
                        style={actionBtnStyle}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{ ...actionBtnStyle, color: "#c0392b" }}
                        title="Excluir"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {adding && (
              <tr style={editRowStyle}>
                <td style={tdStyle}>
                  <input
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    style={cellInputStyle}
                    placeholder="Grupo"
                    autoFocus
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={cellInputStyle}
                    placeholder="Nome da tarefa"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    style={cellInputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as Task["status"])
                    }
                    style={cellInputStyle}
                  >
                    <option value="pending">Não iniciado</option>
                    <option value="progress">Em andamento</option>
                    <option value="done">Concluída</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={saveNew}
                      disabled={loading}
                      style={actionBtnStyle}
                    >
                      ✓
                    </button>
                    <button onClick={cancel} style={actionBtnStyle}>
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
  borderBottom: "1px solid var(--sand)",
  background: "var(--cream)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderBottom: "1px solid #f0efed",
  fontSize: 13,
  color: "var(--stone)",
  verticalAlign: "middle",
};

const rowStyle: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 0.1s ease",
};

const editRowStyle: React.CSSProperties = {
  background: "#faf9f8",
};

const cellInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  fontSize: 13,
  color: "var(--dark)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
  background: "#fff",
};

const groupBadgeStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dark)",
  background: "#edecea",
  padding: "3px 8px",
  borderRadius: 3,
};

function statusBtnStyle(status: string): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
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
