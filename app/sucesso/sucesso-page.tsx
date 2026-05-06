"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.08)", greenBorder:"rgba(34,197,94,0.25)",
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

interface PedidoPublico {
  id:            string;
  shortId:       string;
  produto:       string;
  preco:         number;
  status:        string;
  paymentMethod: string | null;
  clienteNome:   string;
}

function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <svg width="32" height="32" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="#444" strokeWidth="2" fill="#181818"/>
        <line x1="52" y1="10" x2="28" y2="70" stroke={B.orange} strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#lss)"/>
        <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#lso)"/>
        <defs>
          <linearGradient id="lss" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF"/><stop offset="1" stopColor="#666"/></linearGradient>
          <linearGradient id="lso" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9A2E"/><stop offset="1" stopColor="#C05E00"/></linearGradient>
        </defs>
      </svg>
      <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:17, color:B.white, letterSpacing:"0.5px" }}>
        <span style={{ color:B.orange }}>77 </span>ASSISTECH
      </div>
    </div>
  );
}

export default function SucessoPage() {
  const params    = useSearchParams();
  const pedidoId  = params.get("pedido");

  const [pedido,  setPedido]  = useState<PedidoPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState(false);

  useEffect(() => {
    if (!pedidoId) { setErro(true); setLoading(false); return; }

    fetch(`/api/pedido/${pedidoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setErro(true); }
        else { setPedido(data); }
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [pedidoId]);

  const waUrl = pedidoId
    ? `https://wa.me/5577988160268?text=${encodeURIComponent(
        `Olá! Acabei de pagar meu certificado digital.\n\n📋 Pedido: ${pedidoId.slice(0,8).toUpperCase()}\n\nGostaria de dar continuidade no atendimento.`
      )}`
    : "https://wa.me/5577988160268";

  return (
    <div style={{ minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif", color:B.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <header style={{ borderBottom:`1px solid ${B.border}`, background:B.dark, padding:"16px 24px" }}>
        <a href="/" style={{ textDecoration:"none" }}><Logo/></a>
      </header>

      <main style={{ maxWidth:560, margin:"0 auto", padding:"48px 24px" }}>

        {loading && (
          <div style={{ textAlign:"center", color:B.textSec, fontSize:14, paddingTop:48 }}>
            Carregando pedido…
          </div>
        )}

        {!loading && erro && (
          <div style={{ textAlign:"center", paddingTop:48 }}>
            <div style={{ fontSize:22, fontWeight:700, color:B.white, marginBottom:8, fontFamily:"'Rajdhani',sans-serif" }}>
              Pedido não encontrado
            </div>
            <p style={{ color:B.textSec, marginBottom:24 }}>
              Se o pagamento foi realizado, entre em contato pelo WhatsApp.
            </p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-block", background:"#25D366", color:B.black, fontWeight:800, fontSize:14, padding:"12px 28px", borderRadius:10, textDecoration:"none" }}>
              💬 Falar no WhatsApp
            </a>
          </div>
        )}

        {!loading && pedido && (
          <div style={{ animation:"fadeIn 0.35s ease both" }}>
            {/* Ícone de sucesso */}
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:B.greenBg, border:`2px solid ${B.green}`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>
                ✓
              </div>
            </div>

            <h1 style={{ fontSize:30, fontWeight:700, color:B.green, fontFamily:"'Rajdhani',sans-serif", textAlign:"center", marginBottom:8 }}>
              Pagamento confirmado!
            </h1>
            <p style={{ fontSize:15, color:B.textSec, textAlign:"center", lineHeight:1.6, marginBottom:32 }}>
              Olá, <strong style={{ color:B.textPrimary }}>{pedido.clienteNome}</strong>!<br/>
              Recebemos seu pagamento. Nossa equipe entrará em contato em breve.
            </p>

            {/* Resumo */}
            <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, padding:"20px 22px", marginBottom:24 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", fontFamily:"'JetBrains Mono',monospace", marginBottom:14 }}>
                Resumo do pedido
              </div>
              {[
                { l:"Nº do pedido", v:pedido.shortId, mono:true },
                { l:"Produto",      v:pedido.produto,  mono:false },
                { l:"Valor pago",   v:fmt(pedido.preco), highlight:true },
              ].map(row => (
                <div key={row.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBlock:8, borderBottom:`1px solid ${B.border}` }}>
                  <span style={{ fontSize:13, color:B.textSec }}>{row.l}</span>
                  <span style={{ fontSize: row.highlight ? 15 : 13, fontWeight: row.highlight ? 800 : 600, color: row.highlight ? B.orange : B.textPrimary, fontFamily: row.mono ? "'JetBrains Mono',monospace" : "inherit" }}>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>

            {/* Próximos passos */}
            <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, padding:"20px 22px", marginBottom:28 }}>
              <div style={{ fontSize:13, fontWeight:700, color:B.white, marginBottom:14, fontFamily:"'Rajdhani',sans-serif" }}>
                Próximos passos
              </div>
              {[
                { n:"1", t:"Aguarde o contato", d:"Nossa equipe entrará em contato em até 1 dia útil para agendar o atendimento." },
                { n:"2", t:"Validação de identidade", d:"Você receberá instruções para validação presencial ou por videoconferência." },
                { n:"3", t:"Certificado emitido", d:"Após a validação, o certificado é gerado e entregue digitalmente." },
              ].map(step => (
                <div key={step.n} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:`${B.orange}18`, border:`1px solid ${B.orange}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, fontWeight:800, color:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>
                    {step.n}
                  </div>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:B.white, marginBottom:2, fontFamily:"'Rajdhani',sans-serif" }}>{step.t}</div>
                    <div style={{ fontSize:12.5, color:B.textSec, lineHeight:1.55 }}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA WhatsApp */}
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", padding:"14px", borderRadius:12, background:"#25D366", color:B.black, fontWeight:800, fontSize:15, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.853L.057 23.571a.5.5 0 0 0 .612.612l5.765-1.47A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.938 9.938 0 0 1-5.174-1.448l-.37-.22-3.822.975.997-3.735-.242-.385A9.936 9.936 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Falar com nossa equipe
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
