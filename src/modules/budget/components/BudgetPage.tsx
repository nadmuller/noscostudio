"use client";

import { useState } from "react";
import type { BudgetItem } from "../types";

interface BudgetPageProps {
  projectId: string;
}

export function BudgetPage({ projectId }: BudgetPageProps) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      descricao: "",
      unidade: "un",
      quantidade: 1,
      valor_unitario: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    if (!confirm("Remover este item?")) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const totalGeral = items.reduce(
    (sum, item) => sum + item.quantidade * item.valor_unitario,
    0
  );

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

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Descrição</th>
              <th style={{ ...thStyle, width: 100 }}>Unidade</th>
              <th style={{ ...thStyle, width: 110 }}>Quantidade</th>
              <th style={{ ...thStyle, width: 140 }}>Valor Unitário</th>
              <th style={{ ...thStyle, width: 140 }}>Total</th>
              <th style={{ ...thStyle, width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const itemTotal = item.quantidade * item.valor_unitario;

              return (
                <tr
                  key={item.id}
                  style={rowStyle}
                  onClick={() => setEditingId(item.id)}
                >
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => updateItem(item.id, "descricao", e.target.value)}
                        placeholder="Descrição do item"
                        style={cellInputStyle}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span style={{ color: item.descricao ? "var(--dark)" : "var(--stone)" }}>
                        {item.descricao || "Sem descrição"}
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <select
                        value={item.unidade}
                        onChange={(e) => updateItem(item.id, "unidade", e.target.value)}
                        style={{ ...cellInputStyle, cursor: "pointer" }}
                        onClick={(e) => e.stopPropagation()}
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
                    ) : (
                      <span style={unitBadgeStyle}>{item.unidade}</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) =>
                          updateItem(item.id, "quantidade", parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="any"
                        style={{ ...cellInputStyle, textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{item.quantidade}</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.valor_unitario}
                        onChange={(e) =>
                          updateItem(item.id, "valor_unitario", parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        step="0.01"
                        style={{ ...cellInputStyle, textAlign: "right" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{formatCurrency(item.valor_unitario)}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: "var(--dark)" }}>
                    {formatCurrency(itemTotal)}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
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
  padding: "14px 20px",
  borderBottom: "1px solid #f0efed",
  fontSize: 14,
  color: "var(--stone)",
  verticalAlign: "middle",
};

const rowStyle: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 0.1s ease",
};

const cellInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  fontSize: 14,
  color: "var(--dark)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none",
  background: "#fff",
  transition: "border-color 0.15s ease",
};

const unitBadgeStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dark)",
  background: "#edecea",
  padding: "4px 10px",
  borderRadius: 3,
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
