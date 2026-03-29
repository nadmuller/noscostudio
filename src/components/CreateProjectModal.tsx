"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import type { Project } from "@/lib/types";

interface CreateProjectModalProps {
  ownerEmail: string;
  onCreated: (project: Project) => void;
  onClose: () => void;
}

export function CreateProjectModal({
  ownerEmail,
  onCreated,
  onClose,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

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

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const slug = generateSlug(name);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        slug,
        owner_email: ownerEmail,
      })
      .select()
      .single();

    if (!error && data) {
      onCreated(data as Project);
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
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(34,34,30,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: 420,
          maxWidth: "calc(100vw - 48px)",
          background: "#fff",
          borderRadius: 12,
          padding: "36px 40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          boxShadow:
            "0 20px 60px rgba(34,34,30,0.15), 0 1px 3px rgba(34,34,30,0.08)",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          transform: visible
            ? "scale(1) translateY(0)"
            : "scale(0.97) translateY(8px)",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={titleStyle}>Novo Projeto</h2>
          <button
            onClick={handleClose}
            style={closeBtnStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--cream)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            &times;
          </button>
        </div>

        <div style={{ height: 1, background: "var(--sand)", margin: "-8px 0 0" }} />

        {/* Name */}
        <label style={labelWrapStyle}>
          <span style={labelTextStyle}>Nome do projeto</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alicerce, Vida Pessoal..."
            style={inputStyle}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </label>

        <div style={{ height: 1, background: "var(--sand)", margin: "4px 0 0" }} />

        {/* Actions */}
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          style={{
            ...saveBtnStyle,
            opacity: loading || !name.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Criando..." : "Criar Projeto"}
        </button>
      </div>
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
  color: "var(--stone)",
  padding: "4px 8px",
  borderRadius: 6,
  lineHeight: 1,
  transition: "background 0.15s ease",
};

const labelWrapStyle: React.CSSProperties = {
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
