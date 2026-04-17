"use client";

import { useState } from "react";
import type { PedidoRow, OrderStatus } from "./useContadorData";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070", silver:"#B8B8B8",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", red:"#EF4444",
  blue:"#38BDF8", purple:"#A78BFA", amber:"#F59E0B",
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Aguard. pagamento", color: B.amber,  bg: "rgba(245,158,11,0.1)"  },
  paid:            { label: "Pago",              color: B.blue,   bg: "rgba(56,189,248,0.1)"  },
  processing:      { label: "Em processamento",  color: B.purple, bg: "rgba(167,139,250,0.1)" },
  issued:          { label: "Emitido",           color: B.green,  bg: "rgba(34,197,94,0.1)"   },
  cancelled:       { label: "Cancelado",         color: B.red,    bg: "rgba(239,68,68,0.1)"   },
};

// Product color map for badges
const PRODUCT_COLOR: Record<string, { color: string; bg: string }> = {
  a1:        { color: "#38BDF8", bg: "rgba(56,189,248,0.08)"  },
  a1_pf:     { color: "#38BDF8", bg: "rgba(56,189,248,0.08)"  },
  a1_pj:     { color: "#38BDF8", bg: "rgba(56,189,248,0.08)"  },
  a3_sem:    { color: B.orange,  bg: "rgba(240,120,0,0.08)"   },
  a3_pf_sem: { color: B.orange,  bg: "rgba(240,120,0,0.08)"   },
  a3_pj_sem: { color: B.orange,  bg: "rgba(240,120,0,0.08)"   },
  a3_com:    { color: B.green,   bg: "rgba(34,197,94,0.08)"   },
  a3_pf_com: { color: B.green,   bg: "rgba(34,197,94,0.08)"   },
  a3_pj_com: { color: B.green,   bg: "rgba(34,197,94,0.08)"   },
};

const DEFAULT_PRODUCT_COLOR = { color: B.silver, bg: "rgba(255,255,255,0.05)" };

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ s }: { s: OrderStatus }) {
  const c = STATUS[s];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:100, background:c.bg, color:c.color, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.color, display:"block" }}/>
      {c.label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  orders: PedidoRow[];
  loading: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PedidosContadorTab({ orders, loading }: Props) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.client.toLowerCase().includes(q) ||
        o.document.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        o.document.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 13px", borderRadius: 8,
    border: `1px solid ${B.border}`, background: B.surface,
    fontSize: 13.5, color: B.textPrimary, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.white, margin: "0 0 2px", fontFamily: "'Rajdhani',sans-serif" }}>
          Meus pedidos
        </h2>
        <p style={{ fontSize: 13, color: B.textSec, margin: 0 }}>
          {loading ? "Carregando…" : `${filtered.length} pedido${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 13 }}>
        {([["all", "Todos"]] as [string, string][])
          .concat(Object.entries(STATUS).map(([k, v]) => [k, v.label]))
          .map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k as OrderStatus | "all")}
              style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${filter === k ? B.orange : B.border}`, background: filter === k ? B.orangeGlow : "transparent", color: filter === k ? B.orange : B.textSec, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              {l}
            </button>
          ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 13 }}>
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#444" }}>
          <SearchIcon/>
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou documento…"
          style={{ ...inp, paddingLeft: 34 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 13, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: B.dark, borderBottom: `1px solid ${B.border}` }}>
                {["ID", "Cliente", "Produto", "Preço venda", "Comissão", "Status", "Data"].map(h => (
                  <th key={h} style={{ padding: "10px 13px", fontSize: 9.5, fontWeight: 700, color: "#444", textAlign: "left", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: "'JetBrains Mono',monospace" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: B.textSec, fontSize: 13 }}>
                    Carregando pedidos…
                  </td>
                </tr>
              )}
              {!loading && filtered.map((o, i) => {
                const pc = PRODUCT_COLOR[o.productId] ?? DEFAULT_PRODUCT_COLOR;
                const isCancelled = o.status === "cancelled";
                return (
                  <tr key={o.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* ID */}
                    <td style={{ padding: "11px 13px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: B.orange, fontFamily: "'JetBrains Mono',monospace" }}>
                        {o.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: B.textPrimary }}>{o.client}</div>
                      <div style={{ fontSize: 10.5, color: "#444", fontFamily: "'JetBrains Mono',monospace" }}>{o.document}</div>
                    </td>

                    {/* Produto */}
                    <td style={{ padding: "11px 13px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 5, background: pc.bg, color: pc.color }}>
                        {o.product}
                      </span>
                    </td>

                    {/* Preço venda */}
                    <td style={{ padding: "11px 13px", fontSize: 13, fontWeight: 700, color: B.textPrimary, whiteSpace: "nowrap", fontFamily: "'Rajdhani',sans-serif" }}>
                      {fmt(o.salePrice)}
                    </td>

                    {/* Comissão */}
                    <td style={{ padding: "11px 13px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: isCancelled ? B.red : o.status === "issued" ? B.orange : "#555", fontFamily: "'Rajdhani',sans-serif" }}>
                        {isCancelled ? "—" : fmt(o.commission)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "11px 13px" }}>
                      <StatusBadge s={o.status}/>
                    </td>

                    {/* Data */}
                    <td style={{ padding: "11px 13px", fontSize: 12.5, color: "#444", whiteSpace: "nowrap" }}>
                      {o.date}
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: 13 }}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
