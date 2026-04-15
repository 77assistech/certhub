"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ─── Brand (espelha admin-panel) ──────────────────────────────────────────────
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
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

// ─── Ícones ───────────────────────────────────────────────────────────────────
const Ic = {
  Plus:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Money:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Plano {
  id: string;
  system_name: string;
  plan_name: string;
  category: string;
  monthly_price: number;
  commission_value: number;
}

interface Contador {
  id: string;
  name: string;
  email: string;
  crc: string;
}

interface Cliente {
  id: string;
  name: string;
  document: string;
}

interface Pagamento {
  id: string;
  numero_mensalidade: number;
  valor: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paid_at: string | null;
}

interface Assinatura {
  id: string;
  status: "active" | "cancelled" | "suspended";
  started_at: string;
  cancelled_at: string | null;
  plano: Plano;
  cliente: Cliente;
  contador: Contador | null;
  pagamentos: Pagamento[];
  comissao_gerada: boolean;
  comissao_status: string | null;
}

// ─── Modal: Nova Assinatura ───────────────────────────────────────────────────
function ModalNovaAssinatura({
  planos, contadores, onClose, onSaved,
}: {
  planos: Plano[];
  contadores: Contador[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    clienteName: "", clienteDoc: "", clienteEmail: "",
    planoId: planos[0]?.id ?? "",
    contadorId: "",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const planoSel = planos.find(p => p.id === form.planoId);

  async function salvar() {
    if (!form.clienteName.trim() || !form.clienteDoc.trim() || !form.planoId) {
      setErro("Nome, documento e plano são obrigatórios."); return;
    }
    setSaving(true); setErro("");
    const sb = createClient();

    // 1. Cria ou reutiliza cliente
    const { data: cli, error: eCli } = await sb
      .from("clientes")
      .insert({ name: form.clienteName.trim(), document: form.clienteDoc.trim(), email: form.clienteEmail.trim() || null, contador_id: form.contadorId || null })
      .select("id").single();

    if (eCli) { setErro(eCli.message); setSaving(false); return; }

    // 2. Cria assinatura
    const { error: eAss } = await sb.from("assinaturas").insert({
      cliente_id: cli.id,
      plano_id: form.planoId,
      contador_id: form.contadorId || null,
    });

    if (eAss) { setErro(eAss.message); setSaving(false); return; }

    onSaved(); onClose();
  }

  const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${B.border}`, background:B.dark, fontSize:13.5, color:B.textPrimary, outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:B.textSec, marginBottom:5 };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:26, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>Nova assinatura</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif" }}>Cadastrar cliente</h3>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.07)",border:`1px solid ${B.border}`,color:B.textSec,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>

        {/* Dados do cliente */}
        <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>Dados do cliente</div>
        {[
          { k:"clienteName", l:"Nome completo *", ph:"João da Silva" },
          { k:"clienteDoc",  l:"CPF / CNPJ *",   ph:"000.000.000-00" },
          { k:"clienteEmail",l:"E-mail",          ph:"joao@empresa.com" },
        ].map(f=>(
          <div key={f.k} style={{ marginBottom:13 }}>
            <label style={lbl}>{f.l}</label>
            <input placeholder={f.ph} value={form[f.k as keyof typeof form]}
              onChange={e=>setForm(fr=>({...fr,[f.k]:e.target.value}))} style={inp}/>
          </div>
        ))}

        {/* Plano */}
        <div style={{ marginBottom:13 }}>
          <label style={lbl}>Plano *</label>
          <select value={form.planoId} onChange={e=>setForm(f=>({...f,planoId:e.target.value}))}
            style={{ ...inp, cursor:"pointer" }}>
            {planos.map(p=>(
              <option key={p.id} value={p.id}>{p.system_name} — {p.plan_name} ({fmt(p.monthly_price)}/mês)</option>
            ))}
          </select>
        </div>

        {/* Contador */}
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>Contador indicador (opcional)</label>
          <select value={form.contadorId} onChange={e=>setForm(f=>({...f,contadorId:e.target.value}))}
            style={{ ...inp, cursor:"pointer" }}>
            <option value="">— Venda direta (sem contador)</option>
            {contadores.map(c=>(
              <option key={c.id} value={c.id}>{c.name} — {c.crc}</option>
            ))}
          </select>
        </div>

        {/* Preview da comissão */}
        {planoSel && form.contadorId && (
          <div style={{ background:B.dark, border:`1px solid ${B.orangeBorder}`, borderRadius:11, padding:"13px 15px", marginBottom:18 }}>
            <div style={{ fontSize:11, color:"#444", marginBottom:6 }}>Comissão que será gerada na 2ª mensalidade:</div>
            <div style={{ fontSize:24, fontWeight:700, color:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(planoSel.commission_value)}</div>
            <div style={{ fontSize:11, color:B.textSec, marginTop:4 }}>Paga uma única vez ao contador após 2ª mens. confirmada</div>
          </div>
        )}

        {erro && <div style={{ marginBottom:14, padding:"9px 13px", borderRadius:8, background:B.redBg, color:B.red, fontSize:13 }}>{erro}</div>}

        <button onClick={salvar} disabled={saving}
          style={{ width:"100%", padding:13, borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:"'Rajdhani',sans-serif", opacity:saving?0.7:1 }}>
          {saving ? "Salvando…" : "Criar assinatura"}
        </button>
      </div>
    </div>
  );
}

// ─── Modal: Registrar Pagamento ───────────────────────────────────────────────
function ModalPagamento({
  assinatura, onClose, onSaved,
}: {
  assinatura: Assinatura;
  onClose: () => void;
  onSaved: () => void;
}) {
  const proxNumero = (assinatura.pagamentos.filter(p=>p.status==="paid").length) + 1;
  const [form, setForm] = useState({
    numero: String(proxNumero),
    valor: String(assinatura.plano.monthly_price),
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const vai2aMens = proxNumero === 2 && assinatura.contador !== null;

  async function registrar() {
    const numero = parseInt(form.numero);
    const valor = parseFloat(form.valor);
    if (!numero || numero < 1 || !valor || valor <= 0) { setErro("Número e valor são obrigatórios."); return; }

    setSaving(true); setErro("");
    const sb = createClient();

    // Upsert do pagamento (cria se não existe, ou marca como paid)
    const { data: pag, error: ePag } = await sb
      .from("pagamentos")
      .upsert({
        assinatura_id: assinatura.id,
        numero_mensalidade: numero,
        valor,
        status: "pending",
      }, { onConflict: "assinatura_id,numero_mensalidade" })
      .select("id").single();

    if (ePag) { setErro(ePag.message); setSaving(false); return; }

    // Marca como pago — o trigger dispara aqui na 2ª mensalidade
    const { error: eUpd } = await sb
      .from("pagamentos")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", pag.id);

    if (eUpd) { setErro(eUpd.message); setSaving(false); return; }

    onSaved(); onClose();
  }

  const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${B.border}`, background:B.dark, fontSize:13.5, color:B.textPrimary, outline:"none" };
  const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:B.textSec, marginBottom:5 };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:26, width:"100%", maxWidth:420, boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>Registrar pagamento</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif" }}>{assinatura.cliente.name}</h3>
            <div style={{ fontSize:12, color:B.textSec, marginTop:2 }}>{assinatura.plano.system_name} — {assinatura.plano.plan_name}</div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.07)",border:`1px solid ${B.border}`,color:B.textSec,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>

        {/* Histórico de pagamentos */}
        {assinatura.pagamentos.length > 0 && (
          <div style={{ marginBottom:18, background:B.dark, border:`1px solid ${B.border}`, borderRadius:11, overflow:"hidden" }}>
            <div style={{ padding:"8px 13px", fontSize:10, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1px", fontFamily:"'JetBrains Mono',monospace", borderBottom:`1px solid ${B.border}` }}>Mensalidades anteriores</div>
            {assinatura.pagamentos.map(p=>(
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 13px", borderBottom:`1px solid rgba(255,255,255,0.03)` }}>
                <span style={{ fontSize:12.5, color:B.textSec }}>Mensalidade {p.numero_mensalidade}</span>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:B.textPrimary, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(p.valor)}</span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100,
                    background:p.status==="paid"?B.greenBg:B.amberBg,
                    color:p.status==="paid"?B.green:B.amber }}>
                    {p.status==="paid"?"Pago":"Pendente"}
                  </span>
                  {p.paid_at && <span style={{ fontSize:10, color:"#444" }}>{fmtDate(p.paid_at)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {vai2aMens && (
          <div style={{ marginBottom:16, padding:"11px 14px", borderRadius:10, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:B.orange }}>⚡ Esta é a 2ª mensalidade!</div>
            <div style={{ fontSize:12, color:B.textSec, marginTop:3 }}>Ao confirmar, a comissão de <strong style={{color:B.orange}}>{fmt(assinatura.plano.commission_value)}</strong> será gerada automaticamente para {assinatura.contador?.name}.</div>
          </div>
        )}

        <div style={{ marginBottom:13 }}>
          <label style={lbl}>Número da mensalidade</label>
          <input type="number" min="1" value={form.numero}
            onChange={e=>setForm(f=>({...f,numero:e.target.value}))} style={inp}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Valor pago (R$)</label>
          <input type="number" step="0.01" min="0.01" value={form.valor}
            onChange={e=>setForm(f=>({...f,valor:e.target.value}))} style={inp}/>
        </div>

        {erro && <div style={{ marginBottom:14, padding:"9px 13px", borderRadius:8, background:B.redBg, color:B.red, fontSize:13 }}>{erro}</div>}

        <button onClick={registrar} disabled={saving}
          style={{ width:"100%", padding:13, borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:saving?"not-allowed":"pointer", fontFamily:"'Rajdhani',sans-serif", opacity:saving?0.7:1 }}>
          {saving ? "Registrando…" : "Confirmar pagamento"}
        </button>
      </div>
    </div>
  );
}

// ─── Aba principal ────────────────────────────────────────────────────────────
export function AssinaturasTab() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [contadores, setContadores] = useState<Contador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalNova, setModalNova] = useState(false);
  const [modalPag, setModalPag] = useState<Assinatura | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    // Assinaturas com joins
    const { data: rows } = await sb
      .from("assinaturas")
      .select(`
        id, status, started_at, cancelled_at,
        planos(id, system_name, plan_name, category, monthly_price, commission_value),
        clientes(id, name, document),
        contadores(id, name, email, crc),
        pagamentos(id, numero_mensalidade, valor, status, paid_at)
      `)
      .order("started_at", { ascending: false });

    // Comissões geradas por assinatura
    const { data: comissoes } = await sb
      .from("comissoes")
      .select("assinatura_id, status")
      .eq("tipo", "sistema");

    const comissaoMap: Record<string, string> = {};
    (comissoes ?? []).forEach(c => { comissaoMap[c.assinatura_id] = c.status; });

    const mapped: Assinatura[] = (rows ?? []).map((r: any) => ({
      id: r.id,
      status: r.status,
      started_at: r.started_at,
      cancelled_at: r.cancelled_at,
      plano: r.planos,
      cliente: r.clientes,
      contador: r.contadores ?? null,
      pagamentos: (r.pagamentos ?? []).sort((a: Pagamento, b: Pagamento) => a.numero_mensalidade - b.numero_mensalidade),
      comissao_gerada: !!comissaoMap[r.id],
      comissao_status: comissaoMap[r.id] ?? null,
    }));

    setAssinaturas(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
    // Planos e contadores para os modais
    const sb = createClient();
    sb.from("planos").select("*").eq("active", true).order("category").then(({ data }) => setPlanos(data ?? []));
    sb.from("contadores").select("id, name, email, crc").eq("status", "active").then(({ data }) => setContadores(data ?? []));
  }, [carregar]);

  const filtradas = assinaturas.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.cliente.name.toLowerCase().includes(q)
      || a.cliente.document.includes(q)
      || a.plano.system_name.toLowerCase().includes(q)
      || (a.contador?.name ?? "").toLowerCase().includes(q);
  });

  const totalAtivas = assinaturas.filter(a => a.status === "active").length;
  const totalComGerada = assinaturas.filter(a => a.comissao_gerada).length;
  const mensalidadesPagas = assinaturas.reduce((s, a) => s + a.pagamentos.filter(p => p.status === "paid").length, 0);

  function statusComissaoBadge(a: Assinatura) {
    if (!a.contador) return <span style={{ fontSize:11, color:"#444" }}>Sem contador</span>;
    if (!a.comissao_gerada) {
      const pagas = a.pagamentos.filter(p => p.status === "paid").length;
      return (
        <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:100, background:B.amberBg, color:B.amber }}>
          {pagas === 0 ? "Aguard. 1ª mens." : "Aguard. 2ª mens."}
        </span>
      );
    }
    const cor = a.comissao_status === "paid" ? B.green : a.comissao_status === "approved" ? B.blue : B.orange;
    const bgCor = a.comissao_status === "paid" ? B.greenBg : a.comissao_status === "approved" ? B.blueBg : B.orangeGlow;
    const label = a.comissao_status === "paid" ? "Comissão paga" : a.comissao_status === "approved" ? "Comissão aprovada" : "Comissão gerada";
    return <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100, background:bgCor, color:cor }}>{label}</span>;
  }

  const inp: React.CSSProperties = { width:"100%", padding:"8px 12px 8px 32px", borderRadius:8, border:`1px solid ${B.border}`, background:B.surfaceRaised, fontSize:13.5, color:B.textPrimary, outline:"none" };

  return (
    <div>
      {/* Cards de resumo */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { l:"Assinaturas ativas",  v:String(totalAtivas),       c:B.green },
          { l:"Comissões geradas",   v:String(totalComGerada),    c:B.orange },
          { l:"Mensalidades pagas",  v:String(mensalidadesPagas), c:B.blue },
          { l:"Total assinaturas",   v:String(assinaturas.length),c:B.purple },
        ].map(card=>(
          <div key={card.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:7 }}>{card.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:card.c, fontFamily:"'Rajdhani',sans-serif" }}>{card.v}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`${card.c}30` }}/>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 260px" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555" }}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente, documento, plano ou contador…" style={inp}/>
        </div>
        <button onClick={carregar} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          <Ic.Refresh/> Atualizar
        </button>
        <button onClick={()=>setModalNova(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:13.5, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif" }}>
          <Ic.Plus/> Nova assinatura
        </button>
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
                  {["Cliente","Plano","Contador","Mensalidades","Comissão","Status","Ação"].map(h=>(
                    <th key={h} style={{ padding:"11px 13px", fontSize:10, fontWeight:700, color:"#444", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((a, i) => {
                  const pagas = a.pagamentos.filter(p => p.status === "paid").length;
                  return (
                    <tr key={a.id} style={{ borderBottom:i<filtradas.length-1?`1px solid rgba(255,255,255,0.03)`:"none" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      {/* Cliente */}
                      <td style={{ padding:"11px 13px" }}>
                        <div style={{ fontSize:13, fontWeight:600, color:B.textPrimary }}>{a.cliente.name}</div>
                        <div style={{ fontSize:10.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{a.cliente.document}</div>
                      </td>

                      {/* Plano */}
                      <td style={{ padding:"11px 13px" }}>
                        <div style={{ fontSize:12.5, fontWeight:600, color:B.white }}>{a.plano.system_name}</div>
                        <div style={{ fontSize:11, color:B.textSec }}>{a.plano.plan_name} · {fmt(a.plano.monthly_price)}/mês</div>
                      </td>

                      {/* Contador */}
                      <td style={{ padding:"11px 13px" }}>
                        {a.contador
                          ? <div><div style={{ fontSize:12.5, color:B.orange, fontWeight:600 }}>{a.contador.name}</div><div style={{ fontSize:10.5, color:"#444" }}>{a.contador.crc}</div></div>
                          : <span style={{ fontSize:12, color:"#333" }}>Direto</span>
                        }
                      </td>

                      {/* Mensalidades */}
                      <td style={{ padding:"11px 13px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:16, fontWeight:700, color:pagas>=2?B.green:B.textPrimary, fontFamily:"'Rajdhani',sans-serif" }}>{pagas}</span>
                          <span style={{ fontSize:11, color:"#444" }}>paga{pagas!==1?"s":""}</span>
                          {pagas < 2 && a.status === "active" && (
                            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background:B.amberBg, color:B.amber, fontWeight:700 }}>
                              falta {2 - pagas}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Comissão */}
                      <td style={{ padding:"11px 13px" }}>{statusComissaoBadge(a)}</td>

                      {/* Status assinatura */}
                      <td style={{ padding:"11px 13px" }}>
                        <span style={{ fontSize:11.5, fontWeight:700, padding:"3px 9px", borderRadius:100,
                          background:a.status==="active"?B.greenBg:a.status==="suspended"?B.amberBg:B.redBg,
                          color:a.status==="active"?B.green:a.status==="suspended"?B.amber:B.red }}>
                          {a.status==="active"?"Ativa":a.status==="suspended"?"Suspensa":"Cancelada"}
                        </span>
                      </td>

                      {/* Ação */}
                      <td style={{ padding:"11px 13px" }}>
                        {a.status === "active" && !a.comissao_gerada && (
                          <button onClick={()=>setModalPag(a)}
                            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, color:B.orange, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                            <Ic.Money/> Registrar pgto
                          </button>
                        )}
                        {a.comissao_gerada && (
                          <span style={{ fontSize:12, color:B.green, display:"flex", alignItems:"center", gap:4, fontWeight:700 }}>
                            <Ic.Check/> Concluído
                          </span>
                        )}
                        {a.status !== "active" && !a.comissao_gerada && (
                          <span style={{ fontSize:12, color:"#444" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtradas.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>
                    {loading ? "Carregando…" : "Nenhuma assinatura encontrada."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais */}
      {modalNova && (
        <ModalNovaAssinatura
          planos={planos} contadores={contadores}
          onClose={()=>setModalNova(false)}
          onSaved={carregar}
        />
      )}
      {modalPag && (
        <ModalPagamento
          assinatura={modalPag}
          onClose={()=>setModalPag(null)}
          onSaved={carregar}
        />
      )}
    </div>
  );
}
