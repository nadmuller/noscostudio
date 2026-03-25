"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import type { Timeline, TimelineFilters } from "@/lib/types";

interface CreateTimelineModalProps {
  existingGroups: string[];
  ownerEmail: string;
  onCreated: (timeline: Timeline) => void;
  onClose: () => void;
}

export function CreateTimelineModal({
  existingGroups,
  ownerEmail,
  onCreated,
  onClose,
}: CreateTimelineModalProps) {
  const [name, setName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleStatus = (s: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const filters: TimelineFilters = {};
    if (selectedGroups.length > 0) filters.group_names = selectedGroups;
    if (selectedStatuses.length > 0)
      filters.statuses = selectedStatuses as TimelineFilters["statuses"];
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;

    const slug = generateSlug(name);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("timelines")
      .insert({
        name: name.trim(),
        slug,
        filters,
        is_public: false,
        owner_email: ownerEmail,
      })
      .select()
      .single();

    if (!error && data) {
      onCreated(data as Timeline);
    }
    setLoading(false);
  };

  const statuses = [
    { value: "done", label: "Concluída" },
    { value: "progress", label: "Em andamento" },
    { value: "pending", label: "Não iniciado" },
  ];

  return (
    <div style={overlayStyle}>
      <div onClick={onClose} style={backdropStyle} />
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Nova Timeline</h2>
          <button onClick={onClose} style={closeBtnStyle}>
            ✕
          </button>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mosimann, Entregas Q2..."
            style={inputStyle}
            autoFocus
          />
        </label>

        <div style={fieldStyle}>
          <span style={labelStyle}>Filtrar por grupo</span>
          <div style={chipContainerStyle}>
            {existingGroups.map((g) => (
              <button
                key={g}
                onClick={() => toggleGroup(g)}
                style={{
                  ...chipStyle,
                  ...(selectedGroups.includes(g) ? chipActiveStyle : {}),
                }}
              >
                {g}
              </button>
            ))}
            {existingGroups.length === 0 && (
              <span style={{ fontSize: 10, color: "var(--stone)" }}>
                Nenhum grupo encontrado
              </span>
            )}
          </div>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Filtrar por status</span>
          <div style={chipContainerStyle}>
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => toggleStatus(s.value)}
                style={{
                  ...chipStyle,
                  ...(selectedStatuses.includes(s.value)
                    ? chipActiveStyle
                    : {}),
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ ...fieldStyle, flex: 1 }}>
            <span style={labelStyle}>Data início</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ ...fieldStyle, flex: 1 }}>
            <span style={labelStyle}>Data fim</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          style={{
            ...createBtnStyle,
            opacity: loading || !name.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Criando..." : "Criar Timeline"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const backdropStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(34,34,30,0.3)",
};

const modalStyle: React.CSSProperties = {
  position: "relative",
  width: 440,
  maxHeight: "80vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 10,
  padding: "32px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
  color: "var(--stone)",
  padding: 4,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  background: "#fff",
  fontSize: 14,
  color: "var(--dark)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
};

const chipContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const chipStyle: React.CSSProperties = {
  padding: "5px 12px",
  border: "1px solid var(--sand)",
  borderRadius: 20,
  background: "transparent",
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--stone)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const chipActiveStyle: React.CSSProperties = {
  background: "var(--dark)",
  color: "var(--cream)",
  borderColor: "var(--dark)",
};

const createBtnStyle: React.CSSProperties = {
  padding: "12px 0",
  background: "var(--dark)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  marginTop: 4,
};
