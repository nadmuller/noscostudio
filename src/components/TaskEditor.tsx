"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

interface TaskEditorProps {
  task: Task | null;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

export function TaskEditor({ task, onSave, onDelete, onClose }: TaskEditorProps) {
  const isNew = !task;
  const [groupName, setGroupName] = useState(task?.group_name || "");
  const [name, setName] = useState(task?.name || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "pending");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!groupName.trim() || !name.trim() || !dueDate) return;
    setLoading(true);

    const supabase = createClient();

    if (isNew) {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          group_name: groupName.trim().toUpperCase(),
          name: name.trim(),
          due_date: dueDate,
          status,
          sort_order: 0,
        })
        .select()
        .single();

      if (!error && data) {
        onSave(data as Task);
      }
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          group_name: groupName.trim().toUpperCase(),
          name: name.trim(),
          due_date: dueDate,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .select()
        .single();

      if (!error && data) {
        onSave(data as Task);
      }
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!task || !confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);

    if (!error) {
      onDelete(task.id);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(34,34,30,0.3)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: 380,
          background: "var(--cream)",
          borderLeft: "1px solid var(--sand)",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          overflowY: "auto",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--dark)",
            }}
          >
            {isNew ? "Nova Tarefa" : "Editar Tarefa"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--stone)",
              padding: 4,
            }}
          >
            x
          </button>
        </div>

        <label style={labelStyle}>
          <span style={labelTextStyle}>Grupo</span>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Ex: MOSIMANN"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          <span style={labelTextStyle}>Nome da tarefa</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Imagens 3D"
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          <span style={labelTextStyle}>Data</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          <span style={labelTextStyle}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Task["status"])}
            style={inputStyle}
          >
            <option value="pending">Nao iniciado</option>
            <option value="progress">Em andamento</option>
            <option value="done">Concluida</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={handleSave} disabled={loading} style={saveBtnStyle}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
          {!isNew && (
            <button onClick={handleDelete} disabled={loading} style={deleteBtnStyle}>
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelTextStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#a19891",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #cec9c6",
  borderRadius: 4,
  background: "#fff",
  fontSize: 14,
  color: "#22221e",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
};

const saveBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 0",
  background: "#22221e",
  color: "#f3f2f3",
  border: "none",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "transparent",
  color: "#a19891",
  border: "1px solid #cec9c6",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
