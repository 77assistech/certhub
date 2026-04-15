"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/client";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#808080",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.1)", redBorder:"rgba(239,68,68,0.25)",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.1)",
  blue:"#38BDF8", blueBg:"rgba(56,189,248,0.1)",
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

const Ic = {
  Check:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Block:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

type StatusContador = "pending" | "active" | "blocked";

interface Parceiro {
  id: string;
  name: string;
  email: string;
  crc: string;
  phone: string | null;
  status: StatusContador;
  joined_at: string;
  total_assinaturas: number;
  total_comissoes: number;
}

const STATUS_CFG: Record<StatusContador, { label: string; color: string; bg: string }> = {
  pending: { label:"Pendente", color:B.amber,  bg:B.amberBg },
  active:  { label:"Ativo",    color:B.green,  bg:B.greenBg },
  blocked: { label:"Bloqueado",color:B.red,    bg:B.redBg   },
};

export function ParceirosTab() {
  const [parceiros, setParceiros]   = useState<Parceiro[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filtro, setFiltro]         = useState<StatusContador | "all">("all");

  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    const { data: contadores } = await sb
      .from("contadores")
      .select("id, name, email, crc, phone, status, joined_at")
      .order("joined_at", { ascending: false });

    if (!contadores) { setLoading(false); return; }

    // Busca assinaturas e comissões em paralelo
    const [{ data: assinaturas }, { data: comissoes }] = await Promise.all([
      sb.from("assinaturas").select("id, contador_id"),
      sb.from("comissoes").select("id, contador_id, valor"),
    ]);

    const assMap: Record<string, number> = {};
    (assinaturas ?? []).forEach(a => {
      assMap[a.contador_id] = (assMap[a.contador_id] ?? 0) + 1;
    });

    const commMap: Record<string, number> = {};
    (comissoes ?? []).forEach(c => {
      commMap[c.contador_id] = (commMap[c.contador_id] ?? 0) + Number(c.valor);
    });

    const mapped: Parceiro[] = contadores.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      crc: c.crc,
      phone: c.phone,
      status: c.status as StatusContador,
      joined_at: c.joined_at,
      total_assinaturas: assMap[c.id] ?? 0,
      total_comissoes: commMap[c.id] ?? 0,
    }));

    setParceiros(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function mudarStatus(id: string, novoStatus: StatusContador) {
    setSaving(id);
    const sb = createClient();
    await sb.from("contadores").update({ status: novoStatus }).eq("id", id);
    setParceiros(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    setSaving(null);
  }

  const filtrados = parceiros.filter(p => {
    if (filtro !== "all" && p.status !== filtro) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || p.crc.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPendentes = parceiros.filter(p => p.status === "pending").length;
  const totalAtivos    = parceiros.filter(p => p.status === "active").length;
  const totalBloqueados= parceiros.filter(p => p.status === "blocked").length;

  const inp: React.CSSProperties = { padding:"8px 12px", borderRadius:8, border:`1px solid ${B.border}`, background:B.surfaceRaised, fontSize:13, color:B.textPrimary, outline:"none", cursor:"pointer" };

  return (
    <div>
      {/* Alerta de pendentes */}
      {totalPendentes > 0 && (
        <div style={{ marginBottom:16, padding:"11px 16px", borderRadius:10, background:B.amberBg, border:`1px solid rgba(245,158,11,0.25)`, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, fontWeight:700, color:B.amber }}>
            ⚠ {totalPendentes} cadastro{totalPendentes !== 1 ? "s" : ""} aguardando aprovação
          </span>
        </div>
      )}

      {/* Cards de resumo */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { l:"Total",      v:String(parceiros.length), c:B.blue  },
          { l:"Pendentes",  v:String(totalPendentes),   c:B.amber },
          { l:"Ativos",     v:String(totalAtivos),      c:B.green },
          { l:"Bloqueados", v:String(totalBloqueados),  c:B.red   },
        ].map(card => (
          <div key={card.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:7 }}>{card.l}</div>
            <div style={{ fontSize:24, fontWeight:700, color:card.c, fontFamily:"'Rajdhani',sans-serif" }}>{card.v}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`${card.c}30` }}/>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:9, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 220px" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555" }}><Ic.Search/></span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nome, e-mail ou CRC…"
            style={{ ...inp, paddingLeft:32, width:"100%" }}/>
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value as StatusContador | "all")} style={inp}>
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <button onClick={carregar} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          <Ic.Refresh/> Atualizar
        </button>
        <span style={{ fontSize:12, color:"#444", whiteSpace:"nowrap" }}>{filtrados.length} parceiro{filtrados.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ padding:"48px", textAlign:"center", color:"#444", fontSize:14 }}>Carregando…</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtrados.map(p => {
            const cfg = STATUS_CFG[p.status];
            const initials = p.name.split(" ").map(w => w[0]).slice(0, 2).join("");
            const isSaving = saving === p.id;

            return (
              <div key={p.id} style={{ background:B.surface, border:`1px solid ${p.status === "pending" ? "rgba(245,158,11,0.25)" : B.border}`, borderRadius:13, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>

                {/* Avatar */}
                <div style={{ width:44, height:44, borderRadius:"50%", background:p.status === "active" ? `linear-gradient(135deg,${B.orange},${B.orangeLight})` : cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:p.status === "active" ? B.black : cfg.color, flexShrink:0, fontFamily:"'Rajdhani',sans-serif" }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:2 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                  </div>
                  <div style={{ fontSize:11.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{p.crc}</div>
                  <div style={{ fontSize:12, color:"#444" }}>{p.email}{p.phone ? ` · ${p.phone}` : ""}</div>
                </div>

                {/* Stats */}
                <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                  {[
                    { l:"Indicações",  v:String(p.total_assinaturas),                            c:B.textPrimary },
                    { l:"Comissões",   v:`R$ ${p.total_comissoes.toFixed(2).replace(".",",")}`,   c:B.orange      },
                    { l:"Membro desde",v:fmtDate(p.joined_at),                                   c:B.textSec     },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:10, color:"#444", marginBottom:2, fontFamily:"'JetBrains Mono',monospace" }}>{s.l}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:s.c, fontFamily:"'Rajdhani',sans-serif" }}>{s.v}</div>
                    </div>
                  ))}

                  {/* Ações */}
                  <div style={{ display:"flex", gap:6 }}>
                    {p.status === "pending" && (
                      <button onClick={() => mudarStatus(p.id, "active")} disabled={isSaving}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:8, background:B.greenBg, border:`1px solid ${B.greenBorder}`, color:B.green, fontWeight:700, fontSize:12.5, cursor:"pointer", opacity:isSaving?0.6:1 }}>
                        <Ic.Check/> Aprovar
                      </button>
                    )}
                    {p.status === "active" && (
                      <button onClick={() => mudarStatus(p.id, "blocked")} disabled={isSaving}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:8, background:B.redBg, border:`1px solid ${B.redBorder}`, color:B.red, fontWeight:700, fontSize:12.5, cursor:"pointer", opacity:isSaving?0.6:1 }}>
                        <Ic.Block/> Bloquear
                      </button>
                    )}
                    {p.status === "blocked" && (
                      <button onClick={() => mudarStatus(p.id, "active")} disabled={isSaving}
                        style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:8, background:B.greenBg, border:`1px solid ${B.greenBorder}`, color:B.green, fontWeight:700, fontSize:12.5, cursor:"pointer", opacity:isSaving?0.6:1 }}>
                        <Ic.Check/> Reativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && !loading && (
            <div style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>
              Nenhum parceiro encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
