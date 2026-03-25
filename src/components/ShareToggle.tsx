"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/timelines";
import type { Timeline } from "@/lib/types";

interface ShareToggleProps {
  timeline: Timeline;
}

export function ShareToggle({ timeline }: ShareToggleProps) {
  const [isPublic, setIsPublic] = useState(timeline.is_public);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const supabase = createClient();
    const newVal = !isPublic;
    const { error } = await supabase
      .from("timelines")
      .update({ is_public: newVal, updated_at: new Date().toISOString() })
      .eq("id", timeline.id);

    if (!error) {
      setIsPublic(newVal);
    }
    setLoading(false);
  };

  const copyLink = async () => {
    const url = getPublicUrl(timeline.slug);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={toggle}
        disabled={loading}
        style={toggleBtnStyle}
        title={isPublic ? "Tornar privada" : "Tornar pública"}
      >
        <div
          style={{
            ...trackStyle,
            background: isPublic ? "var(--dark)" : "var(--sand)",
          }}
        >
          <div
            style={{
              ...thumbStyle,
              transform: isPublic ? "translateX(14px)" : "translateX(0)",
            }}
          />
        </div>
        <span style={toggleLabelStyle}>
          {isPublic ? "Pública" : "Privada"}
        </span>
      </button>

      {isPublic && (
        <button onClick={copyLink} style={copyBtnStyle}>
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const toggleBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

const trackStyle: React.CSSProperties = {
  width: 30,
  height: 16,
  borderRadius: 8,
  position: "relative",
  transition: "background 0.2s ease",
};

const thumbStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "#fff",
  position: "absolute",
  top: 2,
  left: 2,
  transition: "transform 0.2s ease",
};

const toggleLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const copyBtnStyle: React.CSSProperties = {
  padding: "4px 12px",
  background: "transparent",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--stone)",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "all 0.15s ease",
};
