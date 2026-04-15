"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#808080", silver:"#C0C0C0",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.1)",
  blue:"#38BDF8", blueBg:"rgba(56,189,248,0.1)",
  purple:"#A78BFA", purpleBg:"rgba(167,139,250,0.1)",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.1)",
};

const fmt     = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "pending_payment"|"paid"|"processing"|"issued"|"cancelled";

const STATUS: Record<OrderStatus, { label:string; color:string; bg:string; next:OrderStatus[] }> = {
  pending_payment: { label:"Aguard. pagamento", color:B.amber,  bg:B.amberBg,  next:["paid","cancelled"] },
  paid:            { label:"Pago",              color:B.blue,   bg:B.blueBg,   next:["processing","cancelled"] },
  processing:      { label:"Em processamento",  color:B.purple, bg:B.purpleBg, next:["issued","cancelled"] },
  issued:          { label:"Emitido",           color:B.green,  bg:B.greenBg,  next:[] },
  cancelled:       { label:"Cancelado",         color:B.red,    bg:B.redBg,    next:[] },
};

const PRODUTO_LABEL: Record<string, string> = {
  a1: "A1 PF/PJ",
  a3_sem: "A3 Sem Token",
  a3_com: "A3 Com Token",
};

const PAYMENT_LABEL: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de crédito",
  boleto: "Boleto bancário",
};

interface PedidoRow {
  id: string;
  produto: string;
  preco_venda: number;
  comissao: number;
  status: OrderStatus;
  payment_method: string | null;
  created_at: string;
  contador_id: string | null;
  cliente_nome: string;
  cliente_document: string;
  cliente_email: string | null;
  contador_nome: string | null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Arrow:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Eye:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  X:       ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ s }: { s: OrderStatus }) {
  const c = STATUS[s];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:100, background:c.bg, color:c.color, fontSize:11.5, fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.color, display:"block", flexShrink:0 }}/>
      {c.label}
    </span>
  );
}

// ─── Drawer helpers ───────────────────────────────────────────────────────────
function DrawerSection({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>{title}</div>
      <div style={{ background:B.dark, borderRadius:11, border:`1px solid ${B.border}`, overflow:"hidden" }}>{children}</div>
    </div>
  );
}

function DrawerRow({ l, v, bold, mono }: { l:string; v:string; bold?:boolean; mono?:boolean }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", borderBottom:`1px solid ${B.border}` }}>
      <span style={{ fontSize:13, color:B.textSec }}>{l}</span>
      <span style={{ fontSize:13, color:B.textPrimary, fontWeight:bold?700:500, fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}>{v}</span>
    </div>
  );
}

// ─── Side Drawer ──────────────────────────────────────────────────────────────
function PedidoDrawer({
  pedido, onClose, onStatusChange, saving,
}: {
  pedido: PedidoRow;
  onClose: () => void;
  onStatusChange: (id: string, s: OrderStatus) => void;
  saving: boolean;
}) {
  const cfg = STATUS[pedido.status];
  const steps: OrderStatus[] = ["pending_payment","paid","processing","issued"];
  const currentIdx = steps.indexOf(pedido.status);
  const temContador = !!pedido.contador_id;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)" }}/>
      <div style={{ width:460, background:B.surface, height:"100%", overflowY:"auto", boxShadow:"-8px 0 48px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column" }}>

        {/* header */}
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${B.border}`, background:B.dark, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>Pedido</div>
            <div style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1px" }}>{pedido.id.slice(0,8).toUpperCase()}</div>
            <div style={{ marginTop:6 }}><StatusBadge s={pedido.status}/></div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:7, background:"rgba(255,255,255,0.07)", border:`1px solid ${B.border}`, color:B.textSec, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Ic.X/>
          </button>
        </div>

        <div style={{ flex:1, padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* stepper */}
          {pedido.status !== "cancelled" && (
            <div style={{ padding:"14px 16px", background:B.dark, borderRadius:11, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>Progresso do pedido</div>
              <div style={{ display:"flex", alignItems:"center" }}>
                {steps.map((s,i) => {
                  const done=i<currentIdx; const active=i===currentIdx; const c=STATUS[s];
                  return (
                    <div key={s} style={{ display:"flex", alignItems:"center" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:done?"#22C55E":active?c.color:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {done
                            ? <span style={{ color:"#fff", fontSize:11 }}>✓</span>
                            : <span style={{ width:7, height:7, borderRadius:"50%", background:active?"white":"rgba(255,255,255,0.15)", display:"block" }}/>}
                        </div>
                        <span style={{ fontSize:8, fontWeight:700, color:active?c.color:done?"#22C55E":"#333", whiteSpace:"nowrap" }}>
                          {s==="pending_payment"?"Pend.":s==="paid"?"Pago":s==="processing"?"Process.":"Emitido"}
                        </span>
                      </div>
                      {i<steps.length-1 && <div style={{ width:24, height:2, background:done?"#22C55E":"rgba(255,255,255,0.07)", marginBottom:14 }}/>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* cliente */}
          <DrawerSection title="Cliente">
            <DrawerRow l="Nome" v={pedido.cliente_nome} bold/>
            <DrawerRow l="Documento" v={pedido.cliente_document} mono/>
            {pedido.cliente_email && <DrawerRow l="E-mail" v={pedido.cliente_email}/>}
          </DrawerSection>

          {/* produto */}
          <DrawerSection title="Produto & Canal">
            <DrawerRow l="Certificado" v={PRODUTO_LABEL[pedido.produto] ?? pedido.produto} bold/>
            <DrawerRow l="Canal" v={temContador ? `Parceiro — ${pedido.contador_nome}` : "Venda direta"}/>
            {pedido.payment_method && <DrawerRow l="Pagamento" v={PAYMENT_LABEL[pedido.payment_method] ?? pedido.payment_method}/>}
            <DrawerRow l="Data" v={fmtDate(pedido.created_at)}/>
          </DrawerSection>

          {/* financeiro */}
          <div style={{ background:B.dark, borderRadius:11, border:`1px solid ${B.border}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>Financeiro</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { l:"Preço venda", v:fmt(pedido.preco_venda), c:B.white },
                { l:"Comissão parceiro", v:temContador ? fmt(pedido.comissao) : "—", c:temContador?B.orange:B.textSec },
              ].map(f => (
                <div key={f.l} style={{ textAlign:"center", padding:"10px 6px", background:B.surfaceRaised, borderRadius:8, border:`1px solid ${B.border}` }}>
                  <div style={{ fontSize:10, color:"#555", marginBottom:4, fontWeight:600 }}>{f.l}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:f.c, fontFamily:"'Rajdhani',sans-serif" }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ações */}
          {cfg.next.length > 0 && (
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>Avançar status</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {cfg.next.map(next => {
                  const nc = STATUS[next]; const isCancel = next==="cancelled";
                  return (
                    <button key={next}
                      onClick={() => { onStatusChange(pedido.id, next); onClose(); }}
                      disabled={saving}
                      style={{ width:"100%", padding:"10px 16px", borderRadius:9, background:isCancel?B.redBg:nc.bg, border:`1px solid ${isCancel?"rgba(239,68,68,0.25)":nc.color+"30"}`, color:nc.color, fontWeight:700, fontSize:14, cursor:saving?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", opacity:saving?0.6:1, fontFamily:"'Barlow',sans-serif" }}>
                      <span>Marcar como {nc.label}</span>
                      {isCancel ? <Ic.X/> : <Ic.Arrow/>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* estado final */}
          {(pedido.status==="issued" || pedido.status==="cancelled") && (
            <div style={{ padding:"11px 14px", borderRadius:9, background:pedido.status==="issued"?B.greenBg:B.redBg, border:`1px solid ${pedido.status==="issued"?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:pedido.status==="issued"?B.green:B.red }}>
                {pedido.status==="issued"
                  ? temContador
                    ? "✓ Emitido — comissão gerada automaticamente."
                    : "✓ Emitido — venda direta, sem comissão."
                  : "✕ Cancelado — comissão não gerada."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
export function PedidosTab() {
  const [pedidos, setPedidos]   = useState<PedidoRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [sf, setSf]             = useState<OrderStatus|"all">("all");
  const [selected, setSelected] = useState<PedidoRow|null>(null);
  const [flashing, setFlashing] = useState<string|null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    const { data } = await sb
      .from("pedidos_certificados")
      .select(`
        id, produto, preco_venda, comissao, status, payment_method, created_at, contador_id,
        clientes!cliente_id(name, document, email),
        contadores!contador_id(name)
      `)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: PedidoRow[] = (data as any[]).map(d => ({
      id:               d.id,
      produto:          d.produto,
      preco_venda:      Number(d.preco_venda),
      comissao:         Number(d.comissao),
      status:           d.status as OrderStatus,
      payment_method:   d.payment_method,
      created_at:       d.created_at,
      contador_id:      d.contador_id,
      cliente_nome:     d.clientes?.name     ?? "—",
      cliente_document: d.clientes?.document ?? "—",
      cliente_email:    d.clientes?.email    ?? null,
      contador_nome:    d.contadores?.name   ?? null,
    }));

    setPedidos(rows);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function mudarStatus(id: string, novoStatus: OrderStatus) {
    setSaving(id);
    const sb = createClient();
    await sb
      .from("pedidos_certificados")
      .update({ status: novoStatus })
      .eq("id", id);

    // Atualiza UI — o trigger do banco cuida de gerar a comissão ao emitir
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    setSelected(prev => prev?.id === id ? { ...prev, status: novoStatus } : prev);
    setSaving(null);
    setFlashing(id);
    setTimeout(() => setFlashing(null), 1500);
  }

  const filtered = useMemo(() => pedidos.filter(p => {
    if (sf !== "all" && p.status !== sf) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.cliente_nome.toLowerCase().includes(q) ||
        p.cliente_document.includes(q) ||
        (p.contador_nome ?? "").toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return true;
  }), [pedidos, sf, search]);

  const inp: React.CSSProperties = {
    width:"100%", padding:"8px 12px 8px 32px", borderRadius:8,
    border:`1px solid ${B.border}`, background:B.surfaceRaised,
    fontSize:13.5, color:B.textPrimary, outline:"none",
  };

  return (
    <div>
      {/* toolbar */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
        <div style={{ position:"relative", flex:"1 1 260px", minWidth:200 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555" }}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Buscar cliente, CPF/CNPJ, parceiro ou ID…" style={inp}/>
        </div>

        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {(([["all","Todos"]] as [string,string][]).concat(
            Object.entries(STATUS).map(([k,v]) => [k, v.label])
          )).map(([k,l]) => (
            <button key={k} onClick={() => setSf(k as OrderStatus|"all")}
              style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${sf===k?B.orange:B.border}`, background:sf===k?B.orangeGlow:"transparent", color:sf===k?B.orange:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={carregar}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          <Ic.Refresh/> Atualizar
        </button>

        <span style={{ fontSize:12, color:"#444", whiteSpace:"nowrap" }}>
          {filtered.length} pedido{filtered.length!==1?"s":""}
        </span>
      </div>

      {/* conteúdo */}
      {loading ? (
        <div style={{ padding:"48px", textAlign:"center", color:"#444", fontSize:14 }}>Carregando…</div>
      ) : (
        <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:B.dark, borderBottom:`1px solid ${B.border}` }}>
                  {["ID","Cliente","Produto","Canal","Venda","Comissão","Status","Ação"].map(h => (
                    <th key={h} style={{ padding:"11px 13px", fontSize:10, fontWeight:700, color:"#444", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const nextFwd  = STATUS[p.status].next.filter(s => s!=="cancelled")[0];
                  const isFlash  = flashing===p.id;
                  const isSaving = saving===p.id;
                  return (
                    <tr key={p.id}
                      onClick={() => setSelected(p)}
                      style={{ borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.03)`:"none", cursor:"pointer", background:isFlash?B.greenBg:"transparent", transition:"background 0.4s" }}
                      onMouseEnter={e => { if(!isFlash) e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
                      onMouseLeave={e => { if(!isFlash) e.currentTarget.style.background="transparent"; }}
                    >
                      {/* ID + data */}
                      <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:B.orange, fontFamily:"'JetBrains Mono',monospace" }}>{p.id.slice(0,8).toUpperCase()}</div>
                        <div style={{ fontSize:10, color:"#333", marginTop:1 }}>{fmtDate(p.created_at)}</div>
                      </td>
                      {/* cliente */}
                      <td style={{ padding:"11px 13px" }}>
                        <div style={{ fontSize:13, fontWeight:600, color:B.textPrimary, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.cliente_nome}</div>
                        <div style={{ fontSize:10.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{p.cliente_document}</div>
                      </td>
                      {/* produto */}
                      <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                        <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 8px", borderRadius:5, background:"rgba(255,255,255,0.05)", color:B.silver }}>
                          {PRODUTO_LABEL[p.produto] ?? p.produto}
                        </span>
                      </td>
                      {/* canal */}
                      <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                        {p.contador_id
                          ? <div>
                              <div style={{ fontSize:11.5, fontWeight:600, color:B.orange }}>Parceiro</div>
                              <div style={{ fontSize:10.5, color:"#444" }}>{p.contador_nome}</div>
                            </div>
                          : <span style={{ fontSize:11.5, fontWeight:600, color:B.blue }}>Direto</span>
                        }
                      </td>
                      {/* venda */}
                      <td style={{ padding:"11px 13px", fontSize:13, fontWeight:700, color:B.textPrimary, whiteSpace:"nowrap", fontFamily:"'Rajdhani',sans-serif" }}>
                        {fmt(p.preco_venda)}
                      </td>
                      {/* comissão */}
                      <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                        {p.contador_id
                          ? <span style={{ fontSize:13, fontWeight:800, color:p.status==="cancelled"?B.red:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>
                              {p.status==="cancelled" ? "—" : fmt(p.comissao)}
                            </span>
                          : <span style={{ fontSize:12, color:"#333" }}>—</span>
                        }
                      </td>
                      {/* status */}
                      <td style={{ padding:"11px 13px" }}><StatusBadge s={p.status}/></td>
                      {/* ação */}
                      <td style={{ padding:"11px 13px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", gap:4 }}>
                          {nextFwd && (
                            <button
                              onClick={e => { e.stopPropagation(); mudarStatus(p.id, nextFwd); }}
                              disabled={isSaving}
                              style={{ display:"flex", alignItems:"center", gap:3, padding:"4px 9px", borderRadius:6, background:STATUS[nextFwd].bg, border:`1px solid ${STATUS[nextFwd].color}30`, color:STATUS[nextFwd].color, fontSize:11, fontWeight:700, cursor:isSaving?"not-allowed":"pointer", whiteSpace:"nowrap", opacity:isSaving?0.5:1 }}>
                              <Ic.Arrow/> {STATUS[nextFwd].label.split(" ")[0]}
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(p); }}
                            style={{ padding:"4px 8px", borderRadius:6, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:"#555", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                            <Ic.Eye/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && (
                  <tr>
                    <td colSpan={8} style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <PedidoDrawer
          pedido={selected}
          onClose={() => setSelected(null)}
          onStatusChange={mudarStatus}
          saving={saving===selected.id}
        />
      )}
    </div>
  );
}
