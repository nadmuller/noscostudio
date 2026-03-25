"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  email: string;
}

export function ProfileDropdown({ email }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={avatarStyle}>
        {initials}
      </button>
      {open && (
        <div style={dropdownStyle}>
          <div style={emailStyle}>{email}</div>
          <div style={sepStyle} />
          <button onClick={handleLogout} style={logoutStyle}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

const avatarStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "var(--dark)",
  color: "var(--cream)",
  border: "none",
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.1em",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  background: "#fff",
  border: "1px solid var(--sand)",
  borderRadius: 6,
  padding: "12px 0",
  minWidth: 200,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  zIndex: 100,
};

const emailStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.06em",
  color: "var(--stone)",
  padding: "4px 16px 8px",
};

const sepStyle: React.CSSProperties = {
  height: 1,
  background: "var(--sand)",
  margin: "0 0 4px",
};

const logoutStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  padding: "8px 16px",
  fontSize: 10,
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dark)",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
