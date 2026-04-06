"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import type { Panel, PanelFilters } from "@/lib/types";

interface CreatePanelModalProps {
  existingGroups: string[];
  ownerEmail: string;
  projectId: string;
  onCreated: (panel: Panel) => void;
  onClose: () => void;
}

export function CreatePanelModal({
  existingGroups,
  ownerEmail,
  projectId,
  onCreated,
  onClose,
}: CreatePanelModalProps) {
  const [name, setName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const filters: PanelFilters = {};
    if (selectedGroups.length > 0) filters.group_names = selectedGroups;

    const slug = generateSlug(name);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("panels")
      .insert({
        name: name.trim(),
        slug,
        filters,
        owner_email: ownerEmail,
        project_id: projectId,
      })
      .select()
      .single();

    if (!error && data) {
      onCreated(data as Panel);
    }
    setLoading(false);
  };

  return (
    <div style={overlayStyle}>
      <div onClick={onClose} style={backdropStyle} />
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Novo Painel</h2>
          <button onClick={onClose} style={closeBtnStyle}>
            ✕
          </button>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Cronograma de Projetos..."
            style={inputStyle}
            autoFocus
          />
        </label>

        <div style={fieldStyle}>
          <span style={labelStyle}>Filtrar por grupo</span>
          <p style={hintStyle}>
            Selecione os grupos que devem aparecer neste painel.
            Se nenhum for selecionado, todas as tarefas aparecem.
          </p>
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
                Nenhum grupo encontrado. Crie tarefas primeiro.
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          style={{
            ...createBtnStyle,
            opacity: loading || !name.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Criando..." : "Criar Painel"}
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

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--stone)",
  lineHeight: 1.4,
  margin: 0,
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
