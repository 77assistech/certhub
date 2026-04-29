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

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

const Ic = {
  Check:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Block:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Refresh: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Plus:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  User:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

type StatusContador = "pending" | "active" | "blocked";

interface Parceiro {
  id:                string;
  name:              string;
  email:             string;
  crc:               string;
  phone:             string | null;
  cidade:            string | null;
  estado:            string | null;
  status:            StatusContador;
  joined_at:         string;
  total_assinaturas: number;
  total_comissoes:   number;
}

const STATUS_CFG: Record<StatusContador, { label: string; color: string; bg: string }> = {
  pending: { label:"Pendente",  color:B.amber, bg:B.amberBg },
  active:  { label:"Ativo",     color:B.green, bg:B.greenBg },
  blocked: { label:"Bloqueado", color:B.red,   bg:B.redBg   },
};

// ─── Estilos compartilhados ───────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width:"100%", padding:"9px 13px", borderRadius:8,
  border:`1px solid ${B.border}`, background:B.dark,
  fontSize:13.5, color:B.textPrimary, outline:"none",
};
const lbl: React.CSSProperties = {
  display:"block", fontSize:11.5, fontWeight:600,
  color:B.textSec, marginBottom:5,
};

// ─── Modal: Novo Parceiro ─────────────────────────────────────────────────────
interface NovoParceiroModalProps {
  onClose:   () => void;
  onSuccess: () => void;
}

function NovoParceiroModal({ onClose, onSuccess }: NovoParceiroModalProps) {
  const [form, setForm] = useState({
    name:        "",
    email:       "",
    phone:       "",
    crc:         "",
    cidade:      "",
    estado:      "",
    status:      "pending" as "pending" | "active",
    observacoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErro("");
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);

    try {
      const res = await fetch("/api/admin/contadores", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setErro(json.error ?? "Erro ao cadastrar parceiro.");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:"26px 28px", width:"100%", maxWidth:520, boxShadow:"0 32px 80px rgba(0,0,0,0.5)", maxHeight:"90vh", overflowY:"auto" }}
      >
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>
              Novo parceiro
            </div>
            <h3 style={{ fontSize:20, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif" }}>
              Cadastrar contador
            </h3>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.06)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            ×
          </button>
        </div>

        <form onSubmit={salvar} style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Nome */}
          <div>
            <label style={lbl}>Nome completo *</label>
            <input required value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="Ex: João da Silva" style={inp}/>
          </div>

          {/* E-mail */}
          <div>
            <label style={lbl}>E-mail *</label>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="joao@escritorio.com.br" style={inp}/>
          </div>

          {/* CRC + Telefone lado a lado */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>CRC *</label>
              <input required value={form.crc} onChange={e => set("crc", e.target.value.toUpperCase())}
                placeholder="CRC-SP 123456/O" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Telefone / WhatsApp</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="(11) 9 9999-9999" style={inp}/>
            </div>
          </div>

          {/* Cidade + Estado lado a lado */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
            <div>
              <label style={lbl}>Cidade</label>
              <input value={form.cidade} onChange={e => set("cidade", e.target.value)}
                placeholder="São Paulo" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select value={form.estado} onChange={e => set("estado", e.target.value)}
                style={{ ...inp, width:80, cursor:"pointer" }}>
                <option value="">UF</option>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          {/* Status inicial */}
          <div>
            <label style={lbl}>Status inicial</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              style={{ ...inp, cursor:"pointer" }}>
              <option value="pending">Pendente (aguarda aprovação)</option>
              <option value="active">Ativo (liberar acesso imediatamente)</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label style={lbl}>Observações</label>
            <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)}
              placeholder="Indicação, notas internas, etc."
              rows={3}
              style={{ ...inp, resize:"vertical", fontFamily:"inherit", lineHeight:1.5 }}
            />
          </div>

          {/* Aviso invite */}
          <div style={{ padding:"10px 13px", borderRadius:8, background:"rgba(56,189,248,0.07)", border:"1px solid rgba(56,189,248,0.18)", fontSize:12.5, color:B.textSec, lineHeight:1.55 }}>
            <span style={{ color:"#38BDF8", fontWeight:700 }}>ℹ </span>
            O acesso ao portal será configurado manualmente. Em breve, o convite de senha será disparado automaticamente por e-mail.
          </div>

          {/* Erro */}
          {erro && (
            <div style={{ padding:"10px 13px", borderRadius:8, background:B.redBg, border:"1px solid rgba(239,68,68,0.25)", color:B.red, fontSize:13 }}>
              {erro}
            </div>
          )}

          {/* Ações */}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:"11px", borderRadius:10, background:"transparent", border:`1px solid ${B.border}`, color:B.textSec, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:2, padding:"11px", borderRadius:10, background: loading ? "rgba(240,120,0,0.4)" : `linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:14, border:"none", cursor: loading ? "not-allowed" : "pointer", fontFamily:"'Rajdhani',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {loading ? "Cadastrando…" : <><Ic.User/> Cadastrar parceiro</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function ParceirosTab() {
  const [parceiros, setParceiros]   = useState<Parceiro[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filtro, setFiltro]         = useState<StatusContador | "all">("all");
  const [showModal, setShowModal]   = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const sb = createClient();

    const { data: contadores } = await sb
      .from("contadores")
      .select("id, name, email, crc, phone, cidade, estado, status, joined_at")
      .order("joined_at", { ascending: false });

    if (!contadores) { setLoading(false); return; }

    const [{ data: assinaturas }, { data: comissoes }] = await Promise.all([
      sb.from("assinaturas").select("id, contador_id"),
      sb.from("comissoes").select("id, contador_id, valor"),
    ]);

    const assMap: Record<string, number> = {};
    (assinaturas ?? []).forEach(a => { assMap[a.contador_id] = (assMap[a.contador_id] ?? 0) + 1; });

    const commMap: Record<string, number> = {};
    (comissoes ?? []).forEach(c => { commMap[c.contador_id] = (commMap[c.contador_id] ?? 0) + Number(c.valor); });

    setParceiros(contadores.map(c => ({
      id:                c.id,
      name:              c.name,
      email:             c.email,
      crc:               c.crc,
      phone:             c.phone,
      cidade:            c.cidade ?? null,
      estado:            c.estado ?? null,
      status:            c.status as StatusContador,
      joined_at:         c.joined_at,
      total_assinaturas: assMap[c.id] ?? 0,
      total_comissoes:   commMap[c.id] ?? 0,
    })));
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

  const totalPendentes  = parceiros.filter(p => p.status === "pending").length;
  const totalAtivos     = parceiros.filter(p => p.status === "active").length;
  const totalBloqueados = parceiros.filter(p => p.status === "blocked").length;

  const inpToolbar: React.CSSProperties = {
    padding:"8px 12px", borderRadius:8, border:`1px solid ${B.border}`,
    background:B.surfaceRaised, fontSize:13, color:B.textPrimary, outline:"none", cursor:"pointer",
  };

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
            style={{ ...inpToolbar, paddingLeft:32, width:"100%" }}/>
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value as StatusContador | "all")} style={inpToolbar}>
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="active">Ativos</option>
          <option value="blocked">Bloqueados</option>
        </select>
        <button onClick={carregar}
          style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
          <Ic.Refresh/> Atualizar
        </button>
        <button onClick={() => setShowModal(true)}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontSize:13, fontWeight:800, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", whiteSpace:"nowrap" }}>
          <Ic.Plus/> Novo parceiro
        </button>
        <span style={{ fontSize:12, color:"#444", whiteSpace:"nowrap" }}>
          {filtrados.length} parceiro{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ padding:"48px", textAlign:"center", color:"#444", fontSize:14 }}>Carregando…</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtrados.map(p => {
            const cfg     = STATUS_CFG[p.status];
            const initials = p.name.split(" ").map(w => w[0]).slice(0, 2).join("");
            const isSaving = saving === p.id;
            const localizacao = [p.cidade, p.estado].filter(Boolean).join(" – ");

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
                  <div style={{ fontSize:12, color:"#444" }}>
                    {p.email}{p.phone ? ` · ${p.phone}` : ""}{localizacao ? ` · ${localizacao}` : ""}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                  {[
                    { l:"Indicações",   v:String(p.total_assinaturas),                          c:B.textPrimary },
                    { l:"Comissões",    v:`R$ ${p.total_comissoes.toFixed(2).replace(".",",")}`, c:B.orange      },
                    { l:"Membro desde", v:fmtDate(p.joined_at),                                 c:B.textSec     },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:10, color:"#444", marginBottom:2, fontFamily:"'JetBrains Mono',monospace" }}>{s.l}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:s.c, fontFamily:"'Rajdhani',sans-serif" }}>{s.v}</div>
                    </div>
                  ))}

                  {/* Ações de status */}
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

      {/* Modal */}
      {showModal && (
        <NovoParceiroModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); carregar(); }}
        />
      )}
    </div>
  );
}
