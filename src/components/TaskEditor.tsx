"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

interface TaskEditorProps {
  task: Task | null;
  projectId?: string;
  existingGroups?: string[];
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClose: () => void;
}

export function TaskEditor({ task, projectId, existingGroups = [], onSave, onDelete, onClose }: TaskEditorProps) {
  const isNew = !task;
  const [name, setName] = useState(task?.name || "");
  const [groupName, setGroupName] = useState(task?.group_name || "");
  const [groups, setGroups] = useState(existingGroups);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [returnDate, setReturnDate] = useState(task?.return_date || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "pending");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleGroupChange = (value: string) => {
    if (value === "__new__") {
      setShowNewGroup(true);
    } else {
      setShowNewGroup(false);
      setNewGroupName("");
      setGroupName(value);
    }
  };

  const handleNewGroupConfirm = () => {
    const trimmed = newGroupName.trim().toUpperCase();
    if (trimmed) {
      if (!groups.includes(trimmed)) {
        setGroups((prev) => [...prev, trimmed]);
      }
      setGroupName(trimmed);
      setShowNewGroup(false);
      setNewGroupName("");
    }
  };

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

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
          return_date: returnDate || null,
          status,
          sort_order: 0,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) {
        alert("Erro ao criar tarefa. Verifique os campos e tente novamente.");
      } else if (data) {
        onSave(data as Task);
      }
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          group_name: groupName.trim().toUpperCase(),
          name: name.trim(),
          due_date: dueDate,
          return_date: returnDate || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .select()
        .single();

      if (error) {
        alert("Erro ao salvar tarefa. Verifique os campos e tente novamente.");
      } else if (data) {
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

    if (error) {
      alert("Erro ao excluir tarefa.");
    } else {
      onDelete(task.id);
    }
    setLoading(false);
  };

  const statusOptions: { value: Task["status"]; label: string; color: string }[] = [
    { value: "pending", label: "Não iniciado", color: "transparent" },
    { value: "progress", label: "Em andamento", color: "var(--stone)" },
    { value: "done", label: "Concluída", color: "var(--dark)" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(34,34,30,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        ref={panelRef}
        style={{
          position: "relative",
          width: 480,
          maxWidth: "calc(100vw - 48px)",
          maxHeight: "calc(100vh - 80px)",
          background: "#fff",
          borderRadius: 12,
          padding: "36px 40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          overflowY: "auto",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          boxShadow: "0 20px 60px rgba(34,34,30,0.15), 0 1px 3px rgba(34,34,30,0.08)",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--dark)",
            }}
          >
            {isNew ? "Nova Tarefa" : "Editar Tarefa"}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--stone)",
              padding: "4px 8px",
              borderRadius: 6,
              lineHeight: 1,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            &times;
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--sand)", margin: "-8px 0 0" }} />

        {/* Task name */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Nome da tarefa</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Imagens 3D"
            style={inputStyle}
            autoFocus={isNew}
          />
        </label>

        {/* Group dropdown */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Grupo</span>
          {!showNewGroup ? (
            <select
              value={groupName}
              onChange={(e) => handleGroupChange(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
            >
              <option value="" disabled>
                Selecione um grupo
              </option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="__new__">+ Criar novo grupo</option>
            </select>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNewGroupConfirm();
                  if (e.key === "Escape") {
                    setShowNewGroup(false);
                    setNewGroupName("");
                  }
                }}
                placeholder="Nome do novo grupo"
                style={{ ...inputStyle, flex: 1 }}
                autoFocus
              />
              <button
                onClick={handleNewGroupConfirm}
                style={{
                  padding: "0 16px",
                  background: "var(--dark)",
                  color: "var(--cream)",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowNewGroup(false);
                  setNewGroupName("");
                  setGroupName(task?.group_name || "");
                }}
                style={{
                  padding: "0 12px",
                  background: "transparent",
                  color: "var(--stone)",
                  border: "1px solid var(--sand)",
                  borderRadius: 6,
                  fontSize: 10,
                  cursor: "pointer",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </label>

        {/* Dates row */}
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ ...labelStyle, flex: 1 }}>
            <span style={labelTextStyle}>Data de entrega</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ ...labelStyle, flex: 1 }}>
            <span style={labelTextStyle}>Data de retorno</span>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        {/* Status */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Status</span>
          <div style={{ display: "flex", gap: 8 }}>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 6,
                  border: status === opt.value
                    ? "2px solid var(--dark)"
                    : "1px solid var(--sand)",
                  background: status === opt.value ? "var(--cream)" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 11,
                  fontWeight: status === opt.value ? 500 : 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: status === opt.value ? "var(--dark)" : "var(--stone)",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: opt.color,
                    border: opt.value === "pending" ? "1.5px solid var(--stone)" : "none",
                    flexShrink: 0,
                  }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </label>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--sand)", margin: "4px 0 0" }} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
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
  gap: 8,
};

const labelTextStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--stone)",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  border: "1px solid var(--sand)",
  borderRadius: 6,
  background: "#fff",
  fontSize: 15,
  color: "var(--dark)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const saveBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  background: "var(--dark)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "opacity 0.15s ease",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "12px 24px",
  background: "transparent",
  color: "#c0392b",
  border: "1px solid #e8c4c0",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "all 0.15s ease",
};
