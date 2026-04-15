"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/client";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.1)",
  blue:"#38BDF8", blueBg:"rgba(56,189,248,0.1)",
  purple:"#A78BFA", purpleBg:"rgba(167,139,250,0.1)",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.1)",
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type StatusComissao = "pending" | "approved" | "paid" | "cancelled" | null;

interface AssinaturaContador {
  id: string;
  status: "active" | "cancelled" | "suspended";
  started_at: string;
  cliente_name: string;
  cliente_doc: string;
  plano_system: string;
  plano_name: string;
  plano_price: number;
  commission_value: number;
  mensalidades_pagas: number;
  comissao_status: StatusComissao;
  comissao_valor: number | null;
  comissao_paid_at: string | null;
}

// ─── DEV_CONTADOR_ID — mesmo do useContadorData ───────────────────────────────
// Quando auth estiver pronto, virá do session
const DEV_CONTADOR_ID = "8384b414-91a4-4652-99bf-11f08a9f78a4";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function statusComissaoInfo(a: AssinaturaContador): { label: string; color: string; bg: string } {
  if (a.comissao_status === "paid")     return { label:"Comissão paga",      color:B.green,  bg:B.greenBg  };
  if (a.comissao_status === "approved") return { label:"Comissão aprovada",   color:B.blue,   bg:B.blueBg   };
  if (a.comissao_status === "pending")  return { label:"Comissão gerada",     color:B.orange, bg:B.orangeGlow };
  if (a.mensalidades_pagas === 0)       return { label:"Aguard. 1ª mensalidade", color:B.amber, bg:B.amberBg };
  return { label:"Aguard. 2ª mensalidade", color:B.amber, bg:B.amberBg };
}

// ─── Barra de progresso de mensalidades ──────────────────────────────────────
function ProgressoMensalidades({ pagas }: { pagas: number }) {
  const total = 2; // comissão gerada na 2ª
  const pct = Math.min((pagas / total) * 100, 100);
  const cor = pagas >= total ? B.green : B.orange;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:B.textSec }}>{pagas} de {total} pagas</span>
        {pagas >= total && <span style={{ fontSize:11, color:B.green, fontWeight:700 }}>✓ Completo</span>}
      </div>
      <div style={{ height:4, borderRadius:100, background:"rgba(255,255,255,0.07)" }}>
        <div style={{ height:"100%", borderRadius:100, background:cor, width:`${pct}%`, transition:"width 0.4s" }}/>
      </div>
    </div>
  );
}

// ─── Aba principal ────────────────────────────────────────────────────────────
export function AssinaturasContadorTab() {
  const [assinaturas, setAssinaturas] = useState<AssinaturaContador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"all" | "pending_comm" | "comm_done">("all");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    const sb = createClient();

    // Resolve contadorId
    let contadorId: string | null = DEV_CONTADOR_ID;
    if (!contadorId) {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: cnt } = await sb.from("contadores").select("id").eq("user_id", user.id).single();
        contadorId = cnt?.id ?? null;
      }
    }

    if (!contadorId) {
      setAssinaturas([]);
      setLoading(false);
      return;
    }

    // Query principal
    const { data, error } = await sb
      .from("assinaturas")
      .select(`
        id, status, started_at,
        clientes(name, document),
        planos(system_name, plan_name, monthly_price, commission_value),
        pagamentos(id, status),
        comissoes(status, valor, paid_at)
      `)
      .eq("contador_id", contadorId)
      .order("started_at", { ascending: false });

    if (error) { setErro(error.message); setLoading(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: AssinaturaContador[] = (data ?? []).map((r: any) => {
      const pagamentos: { status: string }[] = r.pagamentos ?? [];
      const mensalidades_pagas = pagamentos.filter(p => p.status === "paid").length;

      // Pode haver mais de uma comissao (edge case), pega a primeira
      const comissao = (r.comissoes ?? [])[0] ?? null;

      return {
        id: r.id,
        status: r.status,
        started_at: r.started_at,
        cliente_name: r.clientes?.name ?? "—",
        cliente_doc: r.clientes?.document ?? "—",
        plano_system: r.planos?.system_name ?? "—",
        plano_name: r.planos?.plan_name ?? "—",
        plano_price: Number(r.planos?.monthly_price ?? 0),
        commission_value: Number(r.planos?.commission_value ?? 0),
        mensalidades_pagas,
        comissao_status: comissao?.status ?? null,
        comissao_valor: comissao ? Number(comissao.valor) : null,
        comissao_paid_at: comissao?.paid_at ?? null,
      };
    });

    setAssinaturas(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtradas = assinaturas.filter(a => {
    if (filtro === "pending_comm") return !a.comissao_status && a.status === "active";
    if (filtro === "comm_done")   return !!a.comissao_status;
    return true;
  });

  // ── Totais para cards ─────────────────────────────────────────────────────
  const totalAtivas   = assinaturas.filter(a => a.status === "active").length;
  const commGeradas   = assinaturas.filter(a => a.comissao_status).length;
  const commPagas     = assinaturas.filter(a => a.comissao_status === "paid").length;
  const totalAReceber = assinaturas
    .filter(a => a.comissao_status === "pending" || a.comissao_status === "approved")
    .reduce((s, a) => s + (a.comissao_valor ?? 0), 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom:4 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:B.white, margin:"0 0 4px", fontFamily:"'Rajdhani',sans-serif" }}>Minhas indicações</h2>
        <p style={{ fontSize:14, color:B.textSec, margin:0 }}>Acompanhe os sistemas indicados e o status da sua comissão.</p>
      </div>

      {/* Cards de resumo */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:12 }}>
        {[
          { l:"Indicações ativas",   v:String(totalAtivas),  c:B.green  },
          { l:"Comissões geradas",   v:String(commGeradas),  c:B.orange },
          { l:"Comissões pagas",     v:String(commPagas),    c:B.blue   },
          { l:"A receber",           v:fmt(totalAReceber),   c:B.amber  },
        ].map(card=>(
          <div key={card.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"15px 17px", position:"relative", overflow:"hidden" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:7 }}>{card.l}</div>
            <div style={{ fontSize:20, fontWeight:700, color:card.c, fontFamily:"'Rajdhani',sans-serif" }}>{card.v}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`${card.c}30` }}/>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:7 }}>
        {([
          ["all",          "Todas"],
          ["pending_comm", "Aguardando comissão"],
          ["comm_done",    "Comissão gerada"],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={()=>setFiltro(k)}
            style={{ padding:"5px 13px", borderRadius:7, border:`1px solid ${filtro===k?B.orange:B.border}`, background:filtro===k?B.orangeGlow:"transparent", color:filtro===k?B.orange:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Estado de loading / erro */}
      {loading && <div style={{ padding:"40px", textAlign:"center", color:"#444", fontSize:14 }}>Carregando…</div>}
      {erro    && <div style={{ padding:"12px 15px", borderRadius:9, background:B.redBg, color:B.red, fontSize:13 }}>Erro: {erro}</div>}

      {/* Lista de assinaturas */}
      {!loading && !erro && filtradas.length === 0 && (
        <div style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>
          {assinaturas.length === 0 ? "Você ainda não tem indicações cadastradas." : "Nenhuma indicação encontrada com esse filtro."}
        </div>
      )}

      {!loading && filtradas.map(a => {
        const commInfo = statusComissaoInfo(a);
        return (
          <div key={a.id} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>

            {/* Linha 1: cliente + status assinatura */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{a.cliente_name}</div>
                <div style={{ fontSize:11.5, color:"#444", fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>{a.cliente_doc}</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:100,
                  background:a.status==="active"?B.greenBg:a.status==="suspended"?B.amberBg:B.redBg,
                  color:a.status==="active"?B.green:a.status==="suspended"?B.amber:B.red }}>
                  {a.status==="active"?"Ativa":a.status==="suspended"?"Suspensa":"Cancelada"}
                </span>
                {/* Badge comissão */}
                <span style={{ fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:100, background:commInfo.bg, color:commInfo.color }}>
                  {commInfo.label}
                </span>
              </div>
            </div>

            {/* Linha 2: plano + valor + comissão + progresso */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, alignItems:"center" }}>

              {/* Plano */}
              <div style={{ background:B.dark, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#444", fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>Plano</div>
                <div style={{ fontSize:14, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{a.plano_system}</div>
                <div style={{ fontSize:12, color:B.textSec }}>{a.plano_name} · {fmt(a.plano_price)}/mês</div>
                <div style={{ fontSize:10.5, color:"#444", marginTop:3 }}>Desde {fmtDate(a.started_at)}</div>
              </div>

              {/* Comissão */}
              <div style={{ background:B.dark, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#444", fontWeight:600, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>Comissão</div>
                <div style={{ fontSize:22, fontWeight:700, color:a.comissao_status?B.orange:"#444", fontFamily:"'Rajdhani',sans-serif" }}>
                  {fmt(a.comissao_valor ?? a.commission_value)}
                </div>
                {a.comissao_status === "paid" && a.comissao_paid_at && (
                  <div style={{ fontSize:11, color:B.green, marginTop:3 }}>Paga em {fmtDate(a.comissao_paid_at)}</div>
                )}
                {!a.comissao_status && (
                  <div style={{ fontSize:11, color:"#444", marginTop:3 }}>Gerada na 2ª mensalidade</div>
                )}
              </div>

              {/* Progresso mensalidades */}
              <div style={{ background:B.dark, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:10, color:"#444", fontWeight:600, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>Mensalidades</div>
                <ProgressoMensalidades pagas={a.mensalidades_pagas}/>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info box */}
      <div style={{ display:"flex", gap:9, alignItems:"flex-start", padding:"13px 15px", borderRadius:11, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}` }}>
        <span style={{ color:B.orange, marginTop:1, flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <p style={{ fontSize:13, color:B.textSec, margin:0, lineHeight:1.65 }}>
          <strong style={{ color:B.white }}>Como funciona:</strong> a comissão é gerada automaticamente quando o cliente paga a 2ª mensalidade. Após gerada, ela passa para <em>aprovada</em> e depois <em>paga</em> pelo time da 77 Assistech.
        </p>
      </div>
    </div>
  );
}
