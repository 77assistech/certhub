"use client";

import { useState, useEffect } from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const B = {
  orange:       "#F07800",
  orangeLight:  "#FF9A2E",
  orangeGlow:   "rgba(240,120,0,0.18)",
  orangeBorder: "rgba(240,120,0,0.3)",
  black:        "#111111",
  dark:         "#181818",
  surface:      "#222222",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(240,120,0,0.4)",
  white:        "#FFFFFF",
  textPrimary:  "#F0F0F0",
  textSec:      "#909090",
  silver:       "#C8C8C8",
  green:        "#22C55E",
};

const WA = `https://wa.me/5577988160268?text=${encodeURIComponent("Olá! Vim pelo site e quero emitir um certificado digital. Pode me orientar?")}`;

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
function Logo77({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* outer circle */}
      <circle cx="40" cy="40" r="37" stroke="#555" strokeWidth="2.5" fill="#1A1A1A"/>
      {/* diagonal slash */}
      <line x1="52" y1="10" x2="28" y2="70" stroke="#F07800" strokeWidth="2" strokeLinecap="round"/>
      {/* silver 7 left */}
      <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#silv)" />
      {/* orange 7 right */}
      <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#org)" />
      <defs>
        <linearGradient id="silv" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF"/>
          <stop offset="1" stopColor="#888"/>
        </linearGradient>
        <linearGradient id="org" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A2E"/>
          <stop offset="1" stopColor="#C05E00"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function LogoFull({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Logo77 size={size} />
      <div>
        <div style={{ fontFamily: "'Rajdhani','Barlow Condensed',sans-serif", fontWeight: 700, fontSize: size * 0.55, lineHeight: 1, letterSpacing: "1px", color: B.white }}>
          <span style={{ color: B.orange }}>77 </span>ASSISTECH
        </div>
        <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 500, fontSize: size * 0.2, letterSpacing: "2px", color: B.textSec, textTransform: "uppercase", lineHeight: 1.2 }}>
          Tecnologia e Suporte Inteligente
        </div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Shield: (s=20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Arrow: (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Chevron: (open: boolean) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition:"transform 0.3s", transform: open?"rotate(180deg)":"rotate(0)" }}><polyline points="6 9 12 15 18 9"/></svg>,
  WA: (s=18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.524 5.84L.057 23.882l6.197-1.424A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.214-3.727.857.882-3.607-.235-.37A9.818 9.818 0 1112 21.818z"/></svg>,
  Clock: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#F07800" stroke="#F07800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Percent: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Link: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Trend: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "a1", name: "Certificado A1", sub: "Pessoa Física ou Jurídica",
    price: 109.90, validity: "1 ano", storage: "Arquivo digital",
    color: "#38BDF8", colorBg: "rgba(56,189,248,0.08)", colorBorder: "rgba(56,189,248,0.2)",
    badge: null,
    desc: "Certificado digital em arquivo instalado no computador. Ideal para uso diário em NF-e, e-Social e Receita Federal.",
    features: ["Instalado no computador","Ativação no mesmo dia","NF-e, e-Social, Receita Federal","Suporte na instalação incluso"],
  },
  {
    id: "a3s", name: "Certificado A3", sub: "Sem Token",
    price: 149.90, validity: "3 anos", storage: "Nuvem / Cartão",
    color: "#F07800", colorBg: "rgba(240,120,0,0.08)", colorBorder: "rgba(240,120,0,0.35)",
    badge: "Mais vendido",
    desc: "Alta segurança, validade de 3 anos e portabilidade total. Use em qualquer dispositivo via nuvem ou cartão inteligente.",
    features: ["Validade de 3 anos","Portabilidade total","Sefaz, e-CAC, DETRAN","Máxima segurança"],
  },
  {
    id: "a3c", name: "Certificado A3", sub: "Com Token Incluso",
    price: 229.90, validity: "3 anos", storage: "Token USB",
    color: "#22C55E", colorBg: "rgba(34,197,94,0.08)", colorBorder: "rgba(34,197,94,0.2)",
    badge: "Kit completo",
    desc: "Tudo em um pacote. Token USB incluso. Plug and play — é só plugar e assinar.",
    features: ["Token USB incluso","Plug and play","Validade de 3 anos","Compatível com todos os sistemas"],
  },
];

const FAQS = [
  { q: "Qual a diferença entre certificado A1 e A3?", a: "O A1 é um arquivo digital instalado no computador, com validade de 1 ano. O A3 fica em dispositivo físico (token/cartão) ou na nuvem, validade de 3 anos, maior segurança e portabilidade entre dispositivos." },
  { q: "Como recebo meu certificado após a compra?", a: "Após confirmação do pagamento, nossa equipe entra em contato em até 1 hora útil para agendar a validação por videoconferência. O certificado é emitido no mesmo dia para quem paga via Pix." },
  { q: "Quais documentos são necessários?", a: "Para PF: RG ou CNH válidos e CPF. Para PJ: contrato social e documentos do responsável legal. A 77 Assistech orienta todo o processo." },
  { q: "O certificado é aceito para NF-e?", a: "Sim. Aceito em todos os sistemas ICP-Brasil: NF-e, NFS-e, e-Social, SPED, Receita Federal, e-CAC, DETRAN, portais bancários e muito mais." },
  { q: "Quais as formas de pagamento?", a: "Pix (aprovação imediata, emissão no mesmo dia), cartão de crédito em até 12x e boleto bancário. Pix é a forma mais rápida." },
];

const TESTIMONIALS = [
  { name: "Carlos Mendes", role: "Contador · CRC-SP", text: "Atendimento ágil e sem burocracia. Emiti o certificado dos meus clientes no mesmo dia. Já são mais de 30 emissões.", stars: 5 },
  { name: "Fernanda Lima", role: "Diretora Financeira", text: "A 77 Assistech resolveu em menos de 2 horas. Equipe técnica que entende o que está fazendo.", stars: 5 },
  { name: "Roberto Alves", role: "MEI · Rio de Janeiro", text: "Preço justo e suporte pelo WhatsApp mesmo depois da emissão. Recomendo sem hesitar.", stars: 5 },
  { name: "Ana Paula Costa", role: "Advogada · BH", text: "Renovei meu A3 em 1 hora. Processo simples, orientação completa em cada etapa.", stars: 5 },
];

// ─── Components ───────────────────────────────────────────────────────────────
function BuyModal({ product, onClose }: { product: typeof PRODUCTS[0] | null; onClose: () => void }) {
  if (!product) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:B.surface, border:`1px solid ${product.colorBorder}`, borderRadius:20, padding:"28px 26px", maxWidth:420, width:"100%", boxShadow:`0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${product.color}15` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:product.color, letterSpacing:"2px", textTransform:"uppercase", marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>Finalizar compra</div>
            <h3 style={{ fontSize:20, fontWeight:800, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>{product.name}</h3>
            <p style={{ fontSize:13, color:B.textSec, margin:"3px 0 0" }}>{product.sub}</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.07)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>×</button>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, borderRadius:12, padding:"14px 16px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div><span style={{ fontSize:11, color:B.textSec, display:"block" }}>Valor total</span><span style={{ fontSize:28, fontWeight:900, color:B.white, letterSpacing:"-1px", fontFamily:"'Rajdhani',sans-serif" }}>R$ {product.price.toFixed(2).replace(".",",")}</span></div>
          <div style={{ textAlign:"right" }}><span style={{ fontSize:11, color:B.textSec, display:"block", marginBottom:2 }}>Validade</span><span style={{ fontWeight:800, color:product.color, fontSize:14 }}>{product.validity}</span></div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => alert("Integrando com gateway... (Pix / Cartão / Boleto)")} style={{ padding:"13px", borderRadius:11, background:`linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>
            Pagar online — Pix / Cartão / Boleto
          </button>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:11, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:B.green, fontWeight:700, fontSize:15, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>
            {Ic.WA(17)} Finalizar pelo WhatsApp
          </a>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:14 }}>
          <Logo77 size={18} />
          <span style={{ fontSize:11, color:B.textMuted ?? "#444", fontFamily:"'Rajdhani',sans-serif" }}>77 Assistech — Certificado ICP-Brasil</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage77() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number|null>(null);
  const [buyProduct, setBuyProduct] = useState<typeof PRODUCTS[0]|null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <div style={{ background:B.dark, minHeight:"100vh", fontFamily:"'Barlow',-apple-system,sans-serif", color:B.textSec, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box}
        ::selection{background:rgba(240,120,0,0.35);color:#fff}
        html{scroll-behavior:smooth}
        @keyframes pulse77{0%,100%{box-shadow:0 0 8px #F07800}50%{box-shadow:0 0 18px #F07800}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gridMove{from{background-position:0 0}to{background-position:60px 60px}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background: scrolled?"rgba(17,17,17,0.95)":"transparent", backdropFilter: scrolled?"blur(16px)":"none", borderBottom: scrolled?`1px solid ${B.border}`:"1px solid transparent", padding:"0 clamp(16px,5vw,48px)", transition:"all 0.3s" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <LogoFull size={38} />
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:9, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:B.green, fontWeight:700, fontSize:13.5, textDecoration:"none" }}>
              {Ic.WA(15)} WhatsApp
            </a>
            <button onClick={() => scroll("produtos")} style={{ padding:"8px 20px", borderRadius:9, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:14, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>
              Comprar agora
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:"relative", padding:"80px clamp(16px,5vw,48px) 100px", overflow:"hidden" }}>
        {/* animated grid bg */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${B.border} 1px,transparent 1px),linear-gradient(90deg,${B.border} 1px,transparent 1px)`, backgroundSize:"60px 60px", opacity:0.6, pointerEvents:"none" }}/>
        {/* orange glow */}
        <div style={{ position:"absolute", top:-160, right:-120, width:560, height:560, borderRadius:"50%", background:`radial-gradient(circle,${B.orangeGlow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-80, left:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>

        <div style={{ maxWidth:1160, margin:"0 auto", position:"relative", zIndex:1 }}>
          {/* badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, borderRadius:100, padding:"5px 16px", marginBottom:26 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:B.orange, animation:"pulse77 2s infinite" }}/>
            <span style={{ fontSize:12, color:B.orange, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.5px" }}>
              Certificados ICP-Brasil · Emissão no mesmo dia
            </span>
          </div>

          <h1 style={{ fontSize:"clamp(36px,6vw,68px)", fontWeight:700, lineHeight:1.05, letterSpacing:"-1px", color:B.white, maxWidth:700, marginBottom:20, fontFamily:"'Rajdhani',sans-serif" }}>
            Seu certificado digital<br />
            <span style={{ color:B.orange }}>com quem entende de tecnologia.</span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:B.textSec, maxWidth:500, lineHeight:1.75, marginBottom:38 }}>
            A 77 Assistech emite seu A1 ou A3 com suporte especializado, preço justo e processo 100% digital. Mais de 5.000 certificados emitidos.
          </p>

          <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:60 }}>
            <button onClick={() => scroll("produtos")} style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:16, border:"none", cursor:"pointer", boxShadow:`0 0 40px ${B.orangeGlow}`, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>
              Ver certificados {Ic.Arrow(17)}
            </button>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:11, background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, color:B.silver, fontWeight:600, fontSize:16, textDecoration:"none" }}>
              {Ic.WA(18)} Falar com especialista
            </a>
          </div>

          {/* stats */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"20px 52px" }}>
            {[{v:"+5.000",l:"Certificados emitidos"},{v:"< 1h",l:"Tempo de emissão"},{v:"4.9 ★",l:"Satisfação"},{v:"5 anos",l:"No mercado"}].map(s => (
              <div key={s.l}>
                <div style={{ fontSize:"clamp(20px,2.5vw,28px)", fontWeight:700, color:B.white, letterSpacing:"-0.5px", fontFamily:"'Rajdhani',sans-serif" }}>{s.v}</div>
                <div style={{ fontSize:12.5, color:B.textMuted ?? "#555", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ borderTop:`1px solid ${B.border}`, borderBottom:`1px solid ${B.border}`, background:"rgba(255,255,255,0.02)", padding:"13px clamp(16px,5vw,48px)" }}>
        <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"10px 40px" }}>
          {[{icon:Ic.Shield(16), txt:"ICP-Brasil homologado"},{icon:Ic.Clock(), txt:"Emissão no mesmo dia"},{icon:Ic.WA(16), txt:"Suporte via WhatsApp"},{icon:Ic.Check(15), txt:"Aceito em todos os sistemas"}].map(i => (
            <div key={i.txt} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13.5, color:"#666", fontWeight:500 }}>
              <span style={{ color:B.orange }}>{i.icon}</span> {i.txt}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <section id="produtos" style={{ padding:"80px clamp(16px,5vw,48px)" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ marginBottom:48 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>Produtos</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:700, color:B.white, letterSpacing:"-1px", margin:"8px 0 10px", fontFamily:"'Rajdhani',sans-serif" }}>
              Escolha seu certificado.
            </h2>
            <p style={{ color:B.textSec, fontSize:16 }}>Todos ICP-Brasil. Emissão no mesmo dia. Suporte incluso.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {PRODUCTS.map(p => (
              <div key={p.id}
                style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:"26px 24px", display:"flex", flexDirection:"column", position:"relative", transition:"all 0.3s", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.border=`1px solid ${p.colorBorder}`; e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow=`0 20px 60px ${p.color}14`; }}
                onMouseLeave={e => { e.currentTarget.style.border=`1px solid ${B.border}`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
              >
                {p.badge && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background: p.id==="a3s"?B.orange:p.color, color:B.black, fontSize:11, fontWeight:800, padding:"3px 14px", borderRadius:100, whiteSpace:"nowrap", letterSpacing:"0.8px", textTransform:"uppercase", fontFamily:"'Rajdhani',sans-serif" }}>{p.badge}</div>}

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:p.color, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>{p.validity} · {p.storage}</div>
                    <h3 style={{ fontSize:21, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>{p.name}</h3>
                    <p style={{ fontSize:13, color:B.textSec, margin:"2px 0 0" }}>{p.sub}</p>
                  </div>
                  <div style={{ width:42, height:42, borderRadius:11, background:p.colorBg, border:`1px solid ${p.colorBorder}`, display:"flex", alignItems:"center", justifyContent:"center", color:p.color, flexShrink:0 }}>
                    {Ic.Shield(20)}
                  </div>
                </div>

                <p style={{ fontSize:14, color:B.textSec, lineHeight:1.65, marginBottom:18 }}>{p.desc}</p>

                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13.5, color:B.silver }}>
                      <span style={{ color:p.color, flexShrink:0 }}>{Ic.Check(14)}</span>{f}
                    </div>
                  ))}
                </div>

                <div style={{ borderTop:`1px solid ${B.border}`, paddingTop:20, marginTop:"auto" }}>
                  <span style={{ fontSize:11, color:"#555", display:"block", marginBottom:3 }}>A partir de</span>
                  <span style={{ fontSize:34, fontWeight:700, color:B.white, letterSpacing:"-1.5px", lineHeight:1, fontFamily:"'Rajdhani',sans-serif" }}>
                    R$ {p.price.toFixed(2).replace(".",",")}
                  </span>
                  <button onClick={() => setBuyProduct(p)} style={{ display:"block", width:"100%", padding:"12px", borderRadius:11, background:`linear-gradient(135deg,${p.id==="a3s"?B.orange:p.color},${p.id==="a3s"?B.orangeLight:p.color+"CC"})`, color: p.id==="a3s"||p.id==="a3c"?B.black:B.black, fontWeight:800, fontSize:15, border:"none", cursor:"pointer", marginTop:14, fontFamily:"'Rajdhani',sans-serif", letterSpacing:"0.5px" }}>
                    Comprar agora
                  </button>
                  <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginTop:9, fontSize:13, fontWeight:600, color:B.green, textDecoration:"none" }}>
                    {Ic.WA(14)} Comprar via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:28, padding:"18px 22px", borderRadius:14, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:14 }}>
            <div>
              <span style={{ fontWeight:700, fontSize:15, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>Não sabe qual escolher?</span>
              <span style={{ fontSize:14, color:B.textSec, marginLeft:10 }}>A 77 Assistech te orienta na escolha certa.</span>
            </div>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:10, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:B.green, fontWeight:700, fontSize:14, textDecoration:"none" }}>
              {Ic.WA(16)} Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:"80px clamp(16px,5vw,48px)", borderTop:`1px solid ${B.border}`, background:"rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ marginBottom:48 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>Como funciona</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:B.white, letterSpacing:"-1px", margin:"8px 0 0", fontFamily:"'Rajdhani',sans-serif" }}>4 passos. Tudo online.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:2 }}>
            {[
              {n:"01",t:"Escolha o certificado",d:"A1 para uso diário ou A3 para máxima segurança e portabilidade entre dispositivos."},
              {n:"02",t:"Faça o pagamento",d:"Pix com aprovação imediata. Cartão em até 12x ou boleto bancário."},
              {n:"03",t:"Validação de identidade",d:"Videoconferência rápida agendada pela equipe 77 Assistech."},
              {n:"04",t:"Certificado ativo",d:"Emitido e pronto para uso no mesmo dia do pagamento via Pix."},
            ].map((s, i) => (
              <div key={s.n} style={{ padding:"26px 28px", borderLeft: i>0?`1px solid ${B.border}`:"none" }}>
                <div style={{ fontSize:44, fontWeight:700, color:B.orangeGlow, lineHeight:1, letterSpacing:"-3px", marginBottom:14, fontFamily:"'Rajdhani',sans-serif", WebkitTextStrokeWidth:"1px", WebkitTextStrokeColor:B.orangeBorder }}>{s.n}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:B.white, margin:"0 0 8px", fontFamily:"'Rajdhani',sans-serif" }}>{s.t}</h3>
                <p style={{ fontSize:14, color:B.textSec, lineHeight:1.65, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="parceiros" style={{ padding:"80px clamp(16px,5vw,48px)", borderTop:`1px solid ${B.border}`, background:`linear-gradient(160deg,rgba(240,120,0,0.04) 0%,transparent 60%)`, position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(32px,6vw,80px)", alignItems:"center" }}>
            <div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>Para contadores</span>
              <h2 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:700, color:B.white, letterSpacing:"-1px", margin:"10px 0 14px", lineHeight:1.05, fontFamily:"'Rajdhani',sans-serif" }}>
                Venda certificados.<br /><span style={{ color:B.orange }}>Ganhe comissão.</span>
              </h2>
              <p style={{ fontSize:16, color:B.textSec, lineHeight:1.75, marginBottom:32 }}>
                Parceria 77 Assistech: você define o preço, nós cuidamos da emissão e suporte. Receba comissão mensal automaticamente.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:18, marginBottom:32 }}>
                {[
                  { icon: Ic.Percent(), color:B.orange,  t:"Defina sua margem",       d:"Preço de venda entre o mínimo e o público. A diferença é sua comissão, paga mensalmente." },
                  { icon: Ic.Link(),    color:"#38BDF8",  t:"Link exclusivo rastreável",d:"Cada venda pelo seu link é registrada e vinculada automaticamente à sua conta." },
                  { icon: Ic.Trend(),   color:"#22C55E",  t:"Dashboard em tempo real",  d:"Acompanhe vendas, pedidos e comissões num painel completo." },
                ].map(i => (
                  <div key={i.t} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ width:38, height:38, borderRadius:9, background:`${i.color}12`, border:`1px solid ${i.color}25`, display:"flex", alignItems:"center", justifyContent:"center", color:i.color, flexShrink:0 }}>{i.icon}</div>
                    <div><p style={{ fontWeight:700, fontSize:15, color:B.white, margin:"0 0 3px", fontFamily:"'Rajdhani',sans-serif" }}>{i.t}</p><p style={{ fontSize:13.5, color:B.textSec, margin:0, lineHeight:1.6 }}>{i.d}</p></div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={() => alert("Cadastro de parceiro")} style={{ padding:"12px 26px", borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif" }}>
                  Quero ser parceiro
                </button>
                <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:7, padding:"11px 20px", borderRadius:11, background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, color:B.silver, fontWeight:600, fontSize:15, textDecoration:"none" }}>
                  {Ic.WA(16)} Saiba mais
                </a>
              </div>
            </div>

            {/* commission simulator */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${B.border}`, borderRadius:18, padding:26 }}>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", margin:"0 0 20px" }}>Simulação de comissão</p>
              {[{n:"A1 PF/PJ",base:99,max:109.90,c:"#38BDF8"},{n:"A3 Sem Token",base:119,max:149.90,c:B.orange},{n:"A3 Com Token",base:189,max:229.90,c:"#22C55E"}].map((i,idx,arr) => {
                const comm = i.max - i.base;
                const pct = (comm/i.max)*100;
                return (
                  <div key={i.n} style={{ marginBottom:idx<arr.length-1?20:0, paddingBottom:idx<arr.length-1?20:0, borderBottom:idx<arr.length-1?`1px solid ${B.border}`:"none" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:B.silver, fontFamily:"'Barlow',sans-serif" }}>{i.n}</span>
                      <span style={{ fontSize:14, fontWeight:800, color:i.c, fontFamily:"'Rajdhani',sans-serif" }}>até R$ {comm.toFixed(2).replace(".",",")} / cert.</span>
                    </div>
                    <div style={{ height:4, borderRadius:100, background:"rgba(255,255,255,0.06)" }}>
                      <div style={{ height:"100%", borderRadius:100, background:i.c, width:`${pct}%` }}/>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop:20, padding:"14px 16px", background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, borderRadius:10 }}>
                <p style={{ fontSize:12, color:B.orange, fontWeight:700, margin:"0 0 4px", fontFamily:"'JetBrains Mono',monospace" }}>Exemplo — 10 vendas A3/mês</p>
                <p style={{ fontSize:22, fontWeight:700, color:B.white, letterSpacing:"-0.5px", margin:"0 0 2px", fontFamily:"'Rajdhani',sans-serif" }}>R$ 309,00 de comissão</p>
                <p style={{ fontSize:12, color:"#555", margin:0 }}>Pago mensalmente, sem custo de ativação.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:"80px clamp(16px,5vw,48px)", borderTop:`1px solid ${B.border}` }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ marginBottom:44 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>Depoimentos</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:B.white, letterSpacing:"-1px", margin:"8px 0 0", fontFamily:"'Rajdhani',sans-serif" }}>Quem usa, recomenda.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:16, marginBottom:44 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:16, padding:"22px 20px" }}>
                <div style={{ display:"flex", gap:2, marginBottom:10 }}>{Array.from({length:t.stars}).map((_,i)=><span key={i}>{Ic.Star()}</span>)}</div>
                <p style={{ fontSize:14, color:"#888", lineHeight:1.7, margin:"0 0 16px" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:B.black, fontFamily:"'Rajdhani',sans-serif" }}>
                    {t.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                  </div>
                  <div><p style={{ fontWeight:700, fontSize:14, color:B.white, margin:0 }}>{t.name}</p><p style={{ fontSize:12, color:"#555", margin:"2px 0 0" }}>{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:11, color:"#333", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:16, fontFamily:"'JetBrains Mono',monospace" }}>Aceito e homologado por</p>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:10 }}>
              {["ICP-Brasil","Receita Federal","e-CAC","NF-e","eSocial","SEFAZ","DETRAN","OAB"].map(b => (
                <div key={b} style={{ padding:"6px 14px", borderRadius:7, background:"rgba(255,255,255,0.03)", border:`1px solid ${B.border}`, color:"#444", fontWeight:600, fontSize:12.5 }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"80px clamp(16px,5vw,48px)", borderTop:`1px solid ${B.border}`, background:"rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth:740, margin:"0 auto" }}>
          <div style={{ marginBottom:44 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:B.orange, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase" }}>FAQ</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:700, color:B.white, letterSpacing:"-1px", margin:"8px 0 0", fontFamily:"'Rajdhani',sans-serif" }}>Perguntas frequentes.</h2>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ border:`1px solid ${openFaq===i?B.orangeBorder:B.border}`, borderRadius:13, background: openFaq===i?B.orangeGlow:"transparent", overflow:"hidden", transition:"all 0.2s" }}>
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", textAlign:"left", gap:14 }}>
                  <span style={{ fontSize:15, fontWeight:600, color: openFaq===i?B.white:B.silver, lineHeight:1.4 }}>{f.q}</span>
                  <span style={{ color: openFaq===i?B.orange:"#555", flexShrink:0 }}>{Ic.Chevron(openFaq===i)}</span>
                </button>
                {openFaq===i && <p style={{ padding:"0 20px 16px", fontSize:14.5, color:B.textSec, lineHeight:1.75, margin:0 }}>{f.a}</p>}
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:36 }}>
            <p style={{ color:"#444", fontSize:14, marginBottom:14 }}>Não encontrou sua dúvida?</p>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 22px", borderRadius:11, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:B.green, fontWeight:700, fontSize:15, textDecoration:"none" }}>
              {Ic.WA(17)} Falar com a 77 Assistech
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:"80px clamp(16px,5vw,48px)", borderTop:`1px solid ${B.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at center,${B.orangeGlow} 0%,transparent 65%)`, pointerEvents:"none" }}/>
        <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}><Logo77 size={56} /></div>
          <h2 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:700, color:B.white, letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:14, fontFamily:"'Rajdhani',sans-serif" }}>
            Pronto para emitir<br /><span style={{ color:B.orange }}>seu certificado?</span>
          </h2>
          <p style={{ color:B.textSec, fontSize:16, lineHeight:1.7, marginBottom:32 }}>Processo 100% digital, suporte completo da 77 Assistech e emissão no mesmo dia.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => scroll("produtos")} style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 30px", borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:16, border:"none", cursor:"pointer", boxShadow:`0 0 40px ${B.orangeGlow}`, fontFamily:"'Rajdhani',sans-serif" }}>
              Ver certificados {Ic.Arrow(17)}
            </button>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 24px", borderRadius:11, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:B.green, fontWeight:700, fontSize:16, textDecoration:"none" }}>
              {Ic.WA(18)} WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${B.border}`, padding:"40px clamp(16px,5vw,48px) 24px", background:"rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:32, marginBottom:32 }}>
            <div>
              <LogoFull size={34} />
              <p style={{ color:"#333", fontSize:13, maxWidth:240, lineHeight:1.65, marginTop:14 }}>Certificados digitais ICP-Brasil com agilidade, segurança e suporte especializado.</p>
            </div>
            <div style={{ display:"flex", gap:44, flexWrap:"wrap" }}>
              {[{t:"Produtos",ls:["Certificado A1","A3 Sem Token","A3 Com Token"]},{t:"Empresa",ls:["Sobre a 77 Assistech","Parceiros","Blog"]},{t:"Suporte",ls:["FAQ","WhatsApp","E-mail"]}].map(col=>(
                <div key={col.t}>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#333", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", margin:"0 0 12px" }}>{col.t}</p>
                  {col.ls.map(l=><p key={l} style={{ fontSize:14, color:"#2A2A2A", margin:"0 0 8px", cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.color="#666"} onMouseLeave={e=>e.currentTarget.style.color="#2A2A2A"}>{l}</p>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:`1px solid ${B.border}`, paddingTop:18, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <p style={{ fontSize:13, color:"#2A2A2A", margin:0 }}>© 2025 77 Assistech — Tecnologia e Suporte Inteligente. Todos os direitos reservados.</p>
            <p style={{ fontSize:13, color:"#2A2A2A", margin:0 }}>CNPJ: 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>

      {/* floating WA */}
      <a href={WA} target="_blank" rel="noreferrer" style={{ position:"fixed", bottom:24, right:24, zIndex:200, width:52, height:52, borderRadius:"50%", background:"#16A34A", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 24px rgba(22,163,74,0.5)", textDecoration:"none", transition:"transform 0.2s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
      >
        {Ic.WA(24)}
      </a>

      <BuyModal product={buyProduct} onClose={()=>setBuyProduct(null)} />
    </div>
  );
}