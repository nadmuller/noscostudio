"use client";

import { useState } from "react";
import type { BudgetItem } from "../types";

interface BudgetPageProps {
  projectId: string;
}

export function BudgetPage({ projectId }: BudgetPageProps) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [areaTotal, setAreaTotal] = useState<number>(0);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      descricao: "",
      unidade: "un",
      quantidade: 1,
      valor_unitario: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    if (!confirm("Remover este item?")) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalGeral = items.reduce(
    (sum, item) => sum + item.quantidade * item.valor_unitario,
    0
  );

  const custoPorM2 = areaTotal > 0 ? totalGeral / areaTotal : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Orçamento</h1>
          <p style={subtitleStyle}>
            {items.length} {items.length === 1 ? "item cadastrado" : "itens cadastrados"}
          </p>
        </div>
        <button onClick={addItem} style={addBtnStyle}>
          + Adicionar item
        </button>
      </div>

      {/* Resumo */}
      <div style={summaryRowStyle}>
        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Custo total</span>
          <span style={summaryValueStyle}>{formatCurrency(totalGeral)}</span>
        </div>
        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Área total (m²)</span>
          <input
            type="number"
            value={areaTotal || ""}
            onChange={(e) => setAreaTotal(parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            step="any"
            style={summaryInputStyle}
          />
        </div>
        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Custo por m²</span>
          <span style={summaryValueStyle}>
            {areaTotal > 0 ? formatCurrency(custoPorM2) : "—"}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div style={tableWrapStyle} className="budget-table">
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Descrição</th>
              <th style={{ ...thStyle, width: 100 }}>Unidade</th>
              <th style={{ ...thStyle, width: 120, textAlign: "right" }}>Quantidade</th>
              <th style={{ ...thStyle, width: 150, textAlign: "right" }}>Valor Unitário</th>
              <th style={{ ...thStyle, width: 140, textAlign: "right" }}>Total</th>
              <th style={{ ...thStyle, width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemTotal = item.quantidade * item.valor_unitario;

              return (
                <tr key={item.id} style={rowStyle}>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, "descricao", e.target.value)}
                      placeholder="Descrição do item"
                      style={cellInputStyle}
                    />
                  </td>
                  <td style={tdStyle}>
                    <select
                      value={item.unidade}
                      onChange={(e) => updateItem(item.id, "unidade", e.target.value)}
                      style={{ ...cellInputStyle, cursor: "pointer" }}
                    >
                      <option value="un">un</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="ml">ml</option>
                      <option value="hr">hr</option>
                      <option value="diária">diária</option>
                      <option value="vb">vb</option>
                      <option value="kg">kg</option>
                      <option value="pç">pç</option>
                    </select>
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      value={item.quantidade || ""}
                      onChange={(e) =>
                        updateItem(item.id, "quantidade", parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="any"
                      style={{ ...cellInputStyle, textAlign: "right" }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      value={item.valor_unitario || ""}
                      onChange={(e) =>
                        updateItem(item.id, "valor_unitario", parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      style={{ ...cellInputStyle, textAlign: "right" }}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500, color: "var(--dark)" }}>
                    {formatCurrency(itemTotal)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={deleteBtnStyle}
                      title="Remover"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={emptyStyle}>
                  Nenhum item adicionado
                </td>
              </tr>
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} style={totalLabelStyle}>
                  Total Geral
                </td>
                <td style={totalValueStyle}>{formatCurrency(totalGeral)}</td>
                <td style={totalValueStyle}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  padding: "32px 40px",
  height: "calc(100vh - 52px)",
  overflow: "auto",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: 28,
};

const titleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  marginTop: 4,
};

const addBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "var(--dark)",
  color: "var(--cream)",
  border: "none",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 24,
};

const summaryCardStyle: React.CSSProperties = {
  flex: 1,
  background: "#fff",
  border: "1px solid var(--sand)",
  borderRadius: 8,
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--stone)",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "var(--dark)",
};

const summaryInputStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: "var(--dark)",
  border: "none",
  borderBottom: "1px solid var(--sand)",
  outline: "none",
  background: "transparent",
  padding: "0 0 4px",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  width: "100%",
};

const tableWrapStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  border: "1px solid var(--sand)",
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 20px",
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
  borderBottom: "1px solid var(--sand)",
  background: "var(--cream)",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #f0efed",
  fontSize: 14,
  color: "var(--stone)",
  verticalAlign: "middle",
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.1s ease",
};

const cellInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid transparent",
  borderRadius: 4,
  fontSize: 14,
  color: "var(--dark)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
  background: "transparent",
  transition: "border-color 0.15s ease, background 0.15s ease",
};

const deleteBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 18,
  color: "var(--stone)",
  cursor: "pointer",
  padding: "2px 6px",
  lineHeight: 1,
  transition: "color 0.15s ease",
};

const emptyStyle: React.CSSProperties = {
  padding: "40px 20px",
  textAlign: "center",
  fontSize: 12,
  color: "var(--stone)",
  letterSpacing: "0.1em",
};

const totalLabelStyle: React.CSSProperties = {
  padding: "16px 20px",
  textAlign: "right",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--dark)",
  borderTop: "2px solid var(--sand)",
  background: "var(--cream)",
};

const totalValueStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--dark)",
  borderTop: "2px solid var(--sand)",
  background: "var(--cream)",
};
