"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { WhatsAppButton } from "./WhatsAppButton";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.25)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.08)",
  blue:"#38BDF8",
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

// ─── Catálogo de produtos ─────────────────────────────────────────────────────
interface Produto {
  id: string;
  label: string;
  subtipo: string;
  desc: string;
  validade: string;
  preco: number;
  comissao: number; // valor fixo quando vier via parceiro
  tag?: string;
}

const PRODUTOS: Produto[] = [
  {
    id:"a1_pf", label:"A1 Pessoa Física", subtipo:"CPF", validade:"1 ano",
    desc:"Certificado digital para pessoa física. Instalado no computador, sem necessidade de hardware adicional.",
    preco:109.90, comissao:15.00,
  },
  {
    id:"a1_pj", label:"A1 Pessoa Jurídica", subtipo:"CNPJ", validade:"1 ano",
    desc:"Certificado digital para empresas. Ideal para assinatura de NF-e, contratos e processos eletrônicos.",
    preco:139.90, comissao:15.00,
  },
  {
    id:"a3_pf_sem", label:"A3 Pessoa Física", subtipo:"CPF – Sem Token", validade:"3 anos",
    desc:"Certificado A3 para pessoa física armazenado em cartão inteligente. Maior segurança e validade.",
    preco:149.90, comissao:25.00,
  },
  {
    id:"a3_pj_sem", label:"A3 Pessoa Jurídica", subtipo:"CNPJ – Sem Token", validade:"3 anos",
    desc:"Certificado A3 para empresas armazenado em cartão inteligente. Três anos de validade.",
    preco:189.90, comissao:25.00, tag:"Popular",
  },
  {
    id:"a3_pf_com", label:"A3 Pessoa Física", subtipo:"CPF – Com Token", validade:"3 anos",
    desc:"Certificado A3 para pessoa física com token USB incluso. Kit completo, plug & play.",
    preco:229.90, comissao:35.00,
  },
  {
    id:"a3_pj_com", label:"A3 Pessoa Jurídica", subtipo:"CNPJ – Com Token", validade:"3 anos",
    desc:"Certificado A3 para empresas com token USB incluso. Kit completo, ideal para escritórios.",
    preco:269.90, comissao:35.00,
  },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width="34" height="34" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="#444" strokeWidth="2" fill="#181818"/>
        <line x1="52" y1="10" x2="28" y2="70" stroke={B.orange} strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#lcs)"/>
        <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#lco)"/>
        <defs>
          <linearGradient id="lcs" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF"/><stop offset="1" stopColor="#666"/></linearGradient>
          <linearGradient id="lco" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9A2E"/><stop offset="1" stopColor="#C05E00"/></linearGradient>
        </defs>
      </svg>
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:18, color:B.white, letterSpacing:"0.5px", lineHeight:1 }}>
          <span style={{ color:B.orange }}>77 </span>ASSISTECH
        </div>
        <div style={{ fontSize:9, color:"#444", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          Certificados Digitais
        </div>
      </div>
    </div>
  );
}

// ─── Card de produto ──────────────────────────────────────────────────────────
function ProdutoCard({
  produto, selected, onClick,
}: {
  produto: Produto; selected: boolean; onClick: () => void;
}) {
  const isA3 = produto.id.startsWith("a3");
  return (
    <button onClick={onClick}
      style={{
        width:"100%", textAlign:"left", cursor:"pointer", padding:"18px 20px", borderRadius:14,
        border:`2px solid ${selected ? B.orange : B.border}`,
        background: selected ? B.orangeGlow : B.surface,
        transition:"all 0.18s", position:"relative", outline:"none",
        boxShadow: selected ? `0 0 0 1px ${B.orangeBorder}` : "none",
      }}>
      {/* tag */}
      {produto.tag && (
        <span style={{ position:"absolute", top:12, right:12, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, background:B.orange, color:B.black }}>
          {produto.tag}
        </span>
      )}

      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        {/* indicador A1/A3 */}
        <div style={{ width:40, height:40, borderRadius:10, background: isA3 ? `linear-gradient(135deg,${B.orange},${B.orangeLight})` : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:800, color: isA3 ? B.black : B.textSec, fontFamily:"'Rajdhani',sans-serif" }}>
          {isA3 ? "A3" : "A1"}
        </div>

        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif", marginBottom:1 }}>{produto.label}</div>
          <div style={{ fontSize:11.5, color:B.orange, fontWeight:600, marginBottom:6 }}>{produto.subtipo}</div>
          <div style={{ fontSize:12, color:B.textSec, lineHeight:1.5 }}>{produto.desc}</div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:`1px solid ${selected ? "rgba(240,120,0,0.2)" : B.border}` }}>
        <span style={{ fontSize:11, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>Validade: {produto.validade}</span>
        <span style={{ fontSize:20, fontWeight:800, color: selected ? B.orange : B.textPrimary, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(produto.preco)}</span>
      </div>

      {selected && (
        <div style={{ position:"absolute", top:14, left:-1, width:3, height:"calc(100% - 28px)", borderRadius:"0 2px 2px 0", background:B.orange }}/>
      )}
    </button>
  );
}

// ─── Formatação de documento ──────────────────────────────────────────────────
function soDigitos(v: string) {
  return v.replace(/\D/g, "");
}
function formatarDoc(raw: string, tipo: "cpf"|"cnpj") {
  const d = soDigitos(raw);
  if (tipo === "cpf") {
    return d.replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
  }
  return d.replace(/(\d{2})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1/$2")
          .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
          .slice(0, 18);
}
function formatarTel(raw: string) {
  const d = soDigitos(raw);
  return d.replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d{4})$/, "$1-$2")
          .slice(0, 15);
}

// ─── Tela de sucesso ──────────────────────────────────────────────────────────
interface SucessoProps {
  pedidoId: string;
  nome: string;
  produto: Produto;
  onNovo: () => void;
}

function Sucesso({ pedidoId, nome, produto, onNovo }: SucessoProps) {
  const produtoLabel = `${produto.label} – ${produto.subtipo}`;

  return (
    <div style={{ textAlign:"center", padding:"56px 24px", maxWidth:540, margin:"0 auto" }}>

      {/* ícone de confirmação */}
      <div style={{ width:76, height:76, borderRadius:"50%", background:B.greenBg, border:`2px solid ${B.greenBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:34 }}>
        ✓
      </div>

      <h2 style={{ fontSize:28, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif", marginBottom:8 }}>
        Pedido recebido!
      </h2>
      <p style={{ fontSize:14, color:B.textSec, lineHeight:1.6, marginBottom:28 }}>
        Seu pedido de <strong style={{ color:B.textPrimary }}>{produtoLabel}</strong> foi registrado.
        O próximo passo é iniciar o atendimento — fale agora com um especialista.
      </p>

      {/* CTA principal — WhatsApp */}
      <div style={{ marginBottom:20 }}>
        <WhatsAppButton
          pedidoId={pedidoId}
          nome={nome}
          produto={produtoLabel}
          fullWidth
        />
      </div>

      {/* resumo colapsado abaixo do CTA */}
      <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:12, padding:"16px 20px", marginBottom:24, textAlign:"left" }}>
        <div style={{ fontSize:10, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}>
          Resumo do pedido
        </div>
        {[
          { l:"Cliente",    v: nome },
          { l:"Produto",    v: produto.label },
          { l:"Tipo",       v: produto.subtipo },
          { l:"Valor",      v: fmt(produto.preco), highlight: true },
          { l:"Nº do pedido", v: pedidoId.slice(0,8).toUpperCase(), mono: true },
        ].map(row => (
          <div key={row.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBlock:6, borderBottom:`1px solid ${B.border}` }}>
            <span style={{ fontSize:13, color:B.textSec }}>{row.l}</span>
            <span style={{
              fontSize: row.highlight ? 14 : 13,
              fontWeight: row.highlight ? 800 : 600,
              color: row.highlight ? B.orange : B.textPrimary,
              fontFamily: row.mono ? "'JetBrains Mono',monospace" : "inherit",
            }}>
              {row.v}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize:12, color:"#383838", marginBottom:20, lineHeight:1.5 }}>
        Você também pode aguardar — entraremos em contato pelo e-mail ou telefone informados.
      </p>

      {/* ação secundária */}
      <button onClick={onNovo}
        style={{ padding:"10px 24px", borderRadius:10, background:"transparent", border:`1px solid ${B.border}`, color:B.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>
        Fazer novo pedido
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CertificadosPage() {
  const params = useSearchParams();
  const refId  = params.get("ref"); // ?ref=CONTADOR_ID para indicação

  const [produtoId, setProdutoId]       = useState<string | null>(null);
  const [nome, setNome]                 = useState("");
  const [documento, setDocumento]       = useState("");
  const [docTipo, setDocTipo]           = useState<"cpf"|"cnpj">("cpf");
  const [email, setEmail]               = useState("");
  const [telefone, setTelefone]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [erro, setErro]                 = useState("");
  const [pedidoId, setPedidoId]         = useState<string | null>(null);
  const [contadorNome, setContadorNome] = useState<string | null>(null);

  const produto = PRODUTOS.find(p => p.id === produtoId) ?? null;

  // Busca nome do contador se vier com link de referência
  useEffect(() => {
    if (!refId) return;
    createClient()
      .from("contadores")
      .select("name")
      .eq("id", refId)
      .eq("status", "active")
      .single()
      .then(({ data }) => {
        if (data) setContadorNome(data.name);
      });
  }, [refId]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!produto) return;
    setErro(""); setLoading(true);

    const sb  = createClient();
    const doc = soDigitos(documento);

    // Toda a lógica de upsert de cliente + criação do pedido roda
    // server-side via stored function SECURITY DEFINER.
    // O anônimo nunca toca diretamente nas tabelas.
    const { data, error } = await sb.rpc("criar_pedido_certificado", {
      p_nome:        nome,
      p_document:    doc,
      p_email:       email,
      p_phone:       telefone,
      p_produto:     produto.id,
      p_preco_venda: produto.preco,
      p_comissao:    produto.comissao,
      p_contador_id: refId ?? null,
    });

    if (error || !data) {
      setErro("Erro ao registrar pedido. Tente novamente.");
      setLoading(false);
      return;
    }

    setPedidoId((data as { pedido_id: string }).pedido_id);
    setLoading(false);
  }

  function resetar() {
    setPedidoId(null);
    setProdutoId(null);
    setNome(""); setDocumento(""); setEmail(""); setTelefone("");
    setErro("");
  }

  const inp: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:9,
    border:`1px solid ${B.border}`, background:B.dark,
    fontSize:14, color:B.textPrimary, outline:"none",
  };
  const lbl: React.CSSProperties = {
    display:"block", fontSize:12, fontWeight:600, color:B.textSec, marginBottom:6,
  };

  return (
    <div style={{ minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif", color:B.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus,select:focus{border-color:${B.orange} !important;outline:none}
        button:focus-visible{outline:2px solid ${B.orange};outline-offset:2px}
      `}</style>

      {/* ── Header ── */}
      <header style={{ borderBottom:`1px solid ${B.border}`, background:B.dark }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="/" style={{ textDecoration:"none" }}><Logo/></a>
          <a href="/" style={{ fontSize:13, color:B.textSec, textDecoration:"none", fontWeight:600 }}>← Voltar ao site</a>
        </div>
      </header>

      {pedidoId && produto ? (
        // ── Tela de sucesso ──
        <Sucesso pedidoId={pedidoId} nome={nome} produto={produto} onNovo={resetar}/>
      ) : (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px 60px" }}>

          {/* ── Hero ── */}
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:11, fontWeight:700, color:B.orange, letterSpacing:"2.5px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}>ICP-Brasil</div>
            <h1 style={{ fontSize:38, fontWeight:800, color:B.white, fontFamily:"'Rajdhani',sans-serif", marginBottom:10, lineHeight:1.1 }}>
              Certificado Digital
            </h1>
            <p style={{ fontSize:15, color:B.textSec, maxWidth:520, margin:"0 auto", lineHeight:1.6 }}>
              Adquira seu certificado digital com segurança e agilidade. Selecione o modelo ideal e preencha seus dados para iniciar.
            </p>

            {/* Banner de indicação */}
            {contadorNome && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:18, padding:"8px 18px", borderRadius:100, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}` }}>
                <span style={{ fontSize:13, fontWeight:600, color:B.orange }}>
                  Indicado por {contadorNome}
                </span>
              </div>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:28, alignItems:"start" }}>

            {/* ── Coluna esquerda: produtos ── */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"'JetBrains Mono',monospace", marginBottom:14 }}>
                1. Escolha o produto
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {PRODUTOS.map(p => (
                  <ProdutoCard
                    key={p.id}
                    produto={p}
                    selected={produtoId === p.id}
                    onClick={() => setProdutoId(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* ── Coluna direita: formulário ── */}
            <div style={{ position:"sticky", top:20 }}>
              <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:16, padding:"24px 22px" }}>

                <div style={{ fontSize:10, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.5px", fontFamily:"'JetBrains Mono',monospace", marginBottom:16 }}>
                  2. Seus dados
                </div>

                {/* Resumo do produto selecionado */}
                {produto ? (
                  <div style={{ padding:"12px 14px", background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, borderRadius:10, marginBottom:18 }}>
                    <div style={{ fontSize:12, color:B.orange, fontWeight:700, marginBottom:1 }}>{produto.label}</div>
                    <div style={{ fontSize:11.5, color:"#888" }}>{produto.subtipo} · {produto.validade}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:B.orange, fontFamily:"'Rajdhani',sans-serif", marginTop:6 }}>{fmt(produto.preco)}</div>
                  </div>
                ) : (
                  <div style={{ padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:`1px solid ${B.border}`, borderRadius:10, marginBottom:18, textAlign:"center" }}>
                    <span style={{ fontSize:13, color:"#444" }}>← Selecione um produto</span>
                  </div>
                )}

                <form onSubmit={enviar} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {/* Nome */}
                  <div>
                    <label style={lbl}>Nome completo</label>
                    <input type="text" required value={nome} onChange={e=>setNome(e.target.value)}
                      placeholder="Seu nome completo" style={inp}/>
                  </div>

                  {/* Documento */}
                  <div>
                    <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                      <label style={{ ...lbl, marginBottom:0 }}>Documento</label>
                      <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
                        {(["cpf","cnpj"] as const).map(t => (
                          <button key={t} type="button" onClick={() => { setDocTipo(t); setDocumento(""); }}
                            style={{ padding:"2px 8px", borderRadius:5, border:`1px solid ${docTipo===t?B.orange:B.border}`, background:docTipo===t?B.orangeGlow:"transparent", color:docTipo===t?B.orange:B.textSec, fontSize:11, fontWeight:700, cursor:"pointer" }}>
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input type="text" required inputMode="numeric"
                      value={documento}
                      onChange={e => setDocumento(formatarDoc(e.target.value, docTipo))}
                      placeholder={docTipo==="cpf" ? "000.000.000-00" : "00.000.000/0001-00"}
                      style={{ ...inp, fontFamily:"'JetBrains Mono',monospace" }}/>
                  </div>

                  {/* E-mail */}
                  <div>
                    <label style={lbl}>E-mail</label>
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="seu@email.com" style={inp}/>
                  </div>

                  {/* Telefone */}
                  <div>
                    <label style={lbl}>Telefone / WhatsApp</label>
                    <input type="tel" required value={telefone}
                      onChange={e => setTelefone(formatarTel(e.target.value))}
                      placeholder="(00) 00000-0000" style={{ ...inp, fontFamily:"'JetBrains Mono',monospace" }}/>
                  </div>

                  {/* Erro */}
                  {erro && (
                    <div style={{ padding:"10px 13px", borderRadius:8, background:B.redBg, border:"1px solid rgba(239,68,68,0.2)", color:B.red, fontSize:13 }}>
                      {erro}
                    </div>
                  )}

                  {/* CTA */}
                  <button type="submit" disabled={loading || !produto}
                    style={{ width:"100%", padding:"13px", borderRadius:11, background: produto ? `linear-gradient(135deg,${B.orange},${B.orangeLight})` : "rgba(255,255,255,0.05)", color: produto ? B.black : "#444", fontWeight:800, fontSize:15, border:"none", cursor: produto && !loading ? "pointer" : "not-allowed", fontFamily:"'Rajdhani',sans-serif", opacity:loading?0.7:1, marginTop:4, transition:"all 0.18s" }}>
                    {loading ? "Enviando…" : "Solicitar certificado"}
                  </button>

                  <p style={{ fontSize:11.5, color:"#333", textAlign:"center", lineHeight:1.5 }}>
                    Após o envio, nossa equipe entrará em contato para agendar a validação presencial ou por videoconferência.
                  </p>
                </form>
              </div>

              {/* selos */}
              <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"center", flexWrap:"wrap" }}>
                {["ICP-Brasil","Dados seguros","Suporte especializado"].map(s => (
                  <span key={s} style={{ fontSize:11, color:"#333", padding:"4px 10px", borderRadius:100, border:`1px solid rgba(255,255,255,0.05)` }}>✓ {s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
