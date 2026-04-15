"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/client";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#808080",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.1)",
  blue:"#38BDF8", blueBg:"rgba(56,189,248,0.1)",
  purple:"#A78BFA", purpleBg:"rgba(167,139,250,0.1)",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.1)",
};
const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

const Ic = {
  Check:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Money:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

type StatusComissao = "pending" | "approved" | "paid" | "cancelled";
type TipoComissao   = "sistema" | "certificado";
type FiltroStatus   = StatusComissao | "all";

interface Comissao {
  id: string;
  tipo: TipoComissao;
  valor: number;
  status: StatusComissao;
  created_at: string;
  paid_at: string | null;
  // Contador
  contador_id: string;
  contador_name: string;
  contador_crc: string;
  // Contexto (sistema ou certificado)
  descricao: string;   // ex: "PDV Express — Pro" ou "A3 Sem Token"
  cliente_name: string;
}

// ─── Badge de status ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<StatusComissao, { label: string; color: string; bg: string }> = {
  pending:   { label:"Pendente",  color:B.amber,  bg:B.amberBg  },
  approved:  { label:"Aprovada",  color:B.blue,   bg:B.blueBg   },
  paid:      { label:"Paga",      color:B.green,  bg:B.greenBg  },
  cancelled: { label:"Cancelada", color:B.red,    bg:B.redBg    },
};

function StatusBadge({ s }: { s: StatusComissao }) {
  const c = STATUS_CFG[s];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:100, background:c.bg, color:c.color, fontSize:11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:c.color,display:"block" }}/>
      {c.label}
    </span>
  );
}

// ─── Aba principal ────────────────────────────────────────────────────────────
export function ComissoesTab() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("all");
  const [filtroTipo, setFiltroTipo]     = useState<TipoComissao | "all">("all");
  const [filtroContador, setFiltroContador] = useState("all");

  // ── Query principal ───────────────────────────────────────────────────────
  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    const { data, error } = await sb
      .from("comissoes")
      .select(`
        id, tipo, valor, status, created_at, paid_at,
        contador_id,
        contadores(name, crc),
        assinaturas(
          planos(system_name, plan_name),
          clientes(name)
        ),
        pedidos_certificados(
          produto,
          clientes(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) { setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: Comissao[] = (data ?? []).map((r: any) => {
      const isSistema = r.tipo === "sistema";
      const descricao = isSistema
        ? `${r.assinaturas?.planos?.system_name ?? "—"} — ${r.assinaturas?.planos?.plan_name ?? ""}`
        : labelProduto(r.pedidos_certificados?.produto ?? "");
      const clienteName = isSistema
        ? (r.assinaturas?.clientes?.name ?? "—")
        : (r.pedidos_certificados?.clientes?.name ?? "—");

      return {
        id: r.id,
        tipo: r.tipo,
        valor: Number(r.valor),
        status: r.status,
        created_at: r.created_at,
        paid_at: r.paid_at,
        contador_id: r.contador_id,
        contador_name: r.contadores?.name ?? "—",
        contador_crc: r.contadores?.crc ?? "",
        descricao,
        cliente_name: clienteName,
      };
    });

    setComissoes(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function aprovar(id: string) {
    setSaving(id);
    const sb = createClient();
    await sb.from("comissoes").update({ status: "approved" }).eq("id", id);
    setComissoes(prev => prev.map(c => c.id === id ? { ...c, status: "approved" } : c));
    setSaving(null);
  }

  async function pagar(id: string) {
    setSaving(id);
    const sb = createClient();
    await sb.from("comissoes")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    setComissoes(prev => prev.map(c => c.id === id ? { ...c, status: "paid", paid_at: new Date().toISOString() } : c));
    setSaving(null);
  }

  // ── Filtros ───────────────────────────────────────────────────────────────
  const contadoresUnicos = Array.from(
    new Map(comissoes.map(c => [c.contador_id, { id: c.contador_id, name: c.contador_name }])).values()
  );

  const filtradas = comissoes.filter(c => {
    if (filtroStatus  !== "all" && c.status !== filtroStatus)   return false;
    if (filtroTipo    !== "all" && c.tipo   !== filtroTipo)     return false;
    if (filtroContador !== "all" && c.contador_id !== filtroContador) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.contador_name.toLowerCase().includes(q)
        || c.cliente_name.toLowerCase().includes(q)
        || c.descricao.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Totais ────────────────────────────────────────────────────────────────
  const totalPendente  = comissoes.filter(c => c.status === "pending").reduce((s,c)=>s+c.valor,0);
  const totalAprovado  = comissoes.filter(c => c.status === "approved").reduce((s,c)=>s+c.valor,0);
  const totalPago      = comissoes.filter(c => c.status === "paid").reduce((s,c)=>s+c.valor,0);
  const totalGeral     = comissoes.reduce((s,c)=>s+c.valor,0);

  const inp: React.CSSProperties = { padding:"8px 12px", borderRadius:8, border:`1px solid ${B.border}`, background:B.surfaceRaised, fontSize:13, color:B.textPrimary, outline:"none", cursor:"pointer" };

  return (
    <div>
      {/* Cards de resumo */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { l:"Pendentes",       v:fmt(totalPendente), c:B.amber  },
          { l:"Aprovadas",       v:fmt(totalAprovado), c:B.blue   },
          { l:"Pagas",           v:fmt(totalPago),     c:B.green  },
          { l:"Total gerado",    v:fmt(totalGeral),    c:B.orange },
        ].map(card=>(
          <div key={card.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:7 }}>{card.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:card.c, fontFamily:"'Rajdhani',sans-serif" }}>{card.v}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`${card.c}30` }}/>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:9, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
        {/* Busca */}
        <div style={{ position:"relative", flex:"1 1 220px" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555" }}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Buscar contador, cliente ou produto…"
            style={{ ...inp, paddingLeft:32, width:"100%" }}/>
        </div>

        {/* Filtro status */}
        <select value={filtroStatus} onChange={e=>setFiltroStatus(e.target.value as FiltroStatus)} style={inp}>
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovada</option>
          <option value="paid">Paga</option>
          <option value="cancelled">Cancelada</option>
        </select>

        {/* Filtro tipo */}
        <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value as TipoComissao | "all")} style={inp}>
          <option value="all">Todos os tipos</option>
          <option value="sistema">Sistemas</option>
          <option value="certificado">Certificados</option>
        </select>

        {/* Filtro contador */}
        <select value={filtroContador} onChange={e=>setFiltroContador(e.target.value)} style={inp}>
          <option value="all">Todos os contadores</option>
          {contadoresUnicos.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button onClick={carregar} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          <Ic.Refresh/> Atualizar
        </button>

        <span style={{ fontSize:12, color:"#444", whiteSpace:"nowrap" }}>{filtradas.length} comissão{filtradas.length!==1?"ões":""}</span>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ padding:"48px", textAlign:"center", color:"#444", fontSize:14 }}>Carregando…</div>
      ) : (
        <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:B.dark, borderBottom:`1px solid ${B.border}` }}>
                  {["Contador","Cliente","Produto / Plano","Tipo","Valor","Status","Gerada em","Paga em","Ação"].map(h=>(
                    <th key={h} style={{ padding:"11px 13px", fontSize:10, fontWeight:700, color:"#444", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((c, i) => (
                  <tr key={c.id}
                    style={{ borderBottom:i<filtradas.length-1?`1px solid rgba(255,255,255,0.03)`:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    {/* Contador */}
                    <td style={{ padding:"11px 13px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.orange }}>{c.contador_name}</div>
                      <div style={{ fontSize:10.5, color:"#444" }}>{c.contador_crc}</div>
                    </td>

                    {/* Cliente */}
                    <td style={{ padding:"11px 13px", fontSize:13, color:B.textPrimary }}>{c.cliente_name}</td>

                    {/* Produto / Plano */}
                    <td style={{ padding:"11px 13px" }}>
                      <div style={{ fontSize:12.5, color:B.white }}>{c.descricao}</div>
                    </td>

                    {/* Tipo */}
                    <td style={{ padding:"11px 13px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100,
                        background:c.tipo==="sistema"?B.purpleBg:B.blueBg,
                        color:c.tipo==="sistema"?B.purple:B.blue }}>
                        {c.tipo==="sistema"?"Sistema":"Certificado"}
                      </span>
                    </td>

                    {/* Valor */}
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <span style={{ fontSize:15, fontWeight:800, color:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(c.valor)}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding:"11px 13px" }}><StatusBadge s={c.status}/></td>

                    {/* Gerada em */}
                    <td style={{ padding:"11px 13px", fontSize:12, color:"#444", whiteSpace:"nowrap" }}>{fmtDate(c.created_at)}</td>

                    {/* Paga em */}
                    <td style={{ padding:"11px 13px", fontSize:12, color:c.paid_at?B.green:"#333", whiteSpace:"nowrap" }}>{fmtDate(c.paid_at)}</td>

                    {/* Ação */}
                    <td style={{ padding:"11px 13px" }}>
                      <div style={{ display:"flex", gap:5 }}>
                        {c.status === "pending" && (
                          <button onClick={()=>aprovar(c.id)} disabled={saving===c.id}
                            style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, background:B.blueBg, border:`1px solid rgba(56,189,248,0.25)`, color:B.blue, fontSize:11.5, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", opacity:saving===c.id?0.6:1 }}>
                            <Ic.Check/> Aprovar
                          </button>
                        )}
                        {c.status === "approved" && (
                          <button onClick={()=>pagar(c.id)} disabled={saving===c.id}
                            style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 10px", borderRadius:7, background:B.greenBg, border:`1px solid ${B.greenBorder}`, color:B.green, fontSize:11.5, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", opacity:saving===c.id?0.6:1 }}>
                            <Ic.Money/> Marcar paga
                          </button>
                        )}
                        {(c.status === "paid" || c.status === "cancelled") && (
                          <span style={{ fontSize:12, color:"#333" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr><td colSpan={9} style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>
                    Nenhuma comissão encontrada.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function labelProduto(id: string): string {
  const map: Record<string, string> = {
    a1: "A1 PF/PJ", a3_sem: "A3 Sem Token", a3_com: "A3 Com Token",
  };
  return map[id] ?? id;
}
