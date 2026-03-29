"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProfileDropdown } from "./ProfileDropdown";
import type { Timeline } from "@/lib/types";
import { useState } from "react";

interface NavbarProps {
  timelines: Timeline[];
  userEmail: string;
  projectName: string;
  projectSlug: string;
}

export function Navbar({
  timelines: initialTimelines,
  userEmail,
  projectName,
  projectSlug,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [timelines, setTimelines] = useState(initialTimelines);

  const base = `/project/${projectSlug}`;

  const deleteTimeline = async (e: React.MouseEvent, tl: Timeline) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir a timeline "${tl.name}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("timelines").delete().eq("id", tl.id);
    if (!error) {
      setTimelines((prev) => prev.filter((t) => t.id !== tl.id));
      if (pathname === `${base}/timeline/${tl.slug}`) {
        router.push(base);
      }
      router.refresh();
    }
  };

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link href="/" style={logoStyle}>
          Nosco Studio
        </Link>
        <div style={dividerStyle} />
        <Link href={base} style={projectNameStyle}>
          {projectName}
        </Link>
        <div style={dividerStyle} />
        <div style={tabsStyle}>
          <Link
            href={base}
            style={{
              ...tabStyle,
              ...(pathname === base ? activeTabStyle : {}),
            }}
          >
            Painel
          </Link>
          {timelines.map((tl) => (
            <div key={tl.id} style={tabWrapStyle}>
              <Link
                href={`${base}/timeline/${tl.slug}`}
                style={{
                  ...tabStyle,
                  ...(pathname === `${base}/timeline/${tl.slug}`
                    ? activeTabStyle
                    : {}),
                }}
              >
                {tl.name}
              </Link>
              <button
                onClick={(e) => deleteTimeline(e, tl)}
                style={tabDeleteStyle}
                title="Excluir timeline"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.color = "#c0392b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.4";
                  e.currentTarget.style.color = "var(--stone)";
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <ProfileDropdown email={userEmail} />
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 40px",
  height: 52,
  background: "var(--cream)",
  borderBottom: "1px solid var(--sand)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const leftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 0,
};

const logoStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "var(--dark)",
  textDecoration: "none",
};

const projectNameStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--stone)",
  textDecoration: "none",
  transition: "color 0.15s ease",
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "var(--sand)",
  margin: "0 20px",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const tabWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  position: "relative",
};

const tabStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  textDecoration: "none",
  padding: "6px 14px",
  borderRadius: 20,
  transition: "all 0.15s ease",
};

const activeTabStyle: React.CSSProperties = {
  color: "var(--dark)",
  background: "#e8e6e4",
  fontWeight: 500,
};

const tabDeleteStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 13,
  color: "var(--stone)",
  cursor: "pointer",
  padding: "2px 4px",
  lineHeight: 1,
  opacity: 0.4,
  transition: "opacity 0.15s ease",
  marginLeft: -6,
};
