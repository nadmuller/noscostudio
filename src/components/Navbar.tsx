"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ProfileDropdown } from "./ProfileDropdown";
import type { Timeline } from "@/lib/types";

interface NavbarProps {
  timelines: Timeline[];
  userEmail: string;
}

export function Navbar({ timelines, userEmail }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link href="/" style={logoStyle}>
          Nosco Studio
        </Link>
        <div style={dividerStyle} />
        <div style={tabsStyle}>
          <Link
            href="/"
            style={{
              ...tabStyle,
              ...(pathname === "/" ? activeTabStyle : {}),
            }}
          >
            Painel
          </Link>
          {timelines.map((tl) => (
            <Link
              key={tl.id}
              href={`/timeline/${tl.slug}`}
              style={{
                ...tabStyle,
                ...(pathname === `/timeline/${tl.slug}` ? activeTabStyle : {}),
              }}
            >
              {tl.name}
            </Link>
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

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "var(--sand)",
  margin: "0 24px",
};

const tabsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
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
