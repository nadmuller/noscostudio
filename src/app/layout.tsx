import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nosco Studio",
  description: "Gestão de projetos — Nosco Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
