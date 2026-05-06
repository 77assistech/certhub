"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const B = {
  black:"#0F0F0F", surface:"#1E1E1E", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textSec:"#707070",
  orange:"#F07800", orangeLight:"#FF9A2E",
  red:"#EF4444", redBg:"rgba(239,68,68,0.08)",
};

function ErroPage() {
  const params   = useSearchParams();
  const pedidoId = params.get("pedido") ?? "";
  const shortId  = pedidoId.slice(0, 8).toUpperCase();

  const waUrl = `https://wa.me/5577988160268?text=${encodeURIComponent(
    `Olá! Tive um problema ao finalizar o pagamento.\n\n📋 Pedido: ${shortId || "—"}\n\nPoderia me ajudar?`
  )}`;

  return (
    <div style={{ minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Barlow:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      <div style={{ width:"100%", maxWidth:480, textAlign:"center" }}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:B.redBg, border:`2px solid rgba(239,68,68,0.3)`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:34, marginBottom:24 }}>
          ✕
        </div>
        <h1 style={{ fontSize:26, fontWeight:700, color:B.red, fontFamily:"'Rajdhani',sans-serif", marginBottom:8 }}>
          Pagamento não aprovado
        </h1>
        <p style={{ fontSize:14, color:B.textSec, lineHeight:1.7, marginBottom:12 }}>
          Não conseguimos processar seu pagamento desta vez.
        </p>
        {shortId && (
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#444", marginBottom:24 }}>
            Pedido: {shortId}
          </div>
        )}
        <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:12, padding:"16px 20px", marginBottom:28, textAlign:"left" }}>
          <div style={{ fontSize:13, fontWeight:700, color:B.white, marginBottom:10, fontFamily:"'Rajdhani',sans-serif" }}>
            O que pode ter acontecido:
          </div>
          {[
            "Saldo insuficiente no cartão",
            "Dados do cartão incorretos",
            "Limite de crédito atingido",
            "Transação bloqueada pelo banco",
          ].map(item => (
            <div key={item} style={{ fontSize:13, color:B.textSec, paddingBlock:5, borderBottom:`1px solid ${B.border}` }}>
              · {item}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, flexDirection:"column" }}>
          <a href="/certificados"
            style={{ display:"block", padding:"13px", borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:14, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>
            Tentar novamente
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ display:"block", padding:"11px", borderRadius:11, background:"#25D366", color:B.black, fontWeight:700, fontSize:13, textDecoration:"none" }}>
            💬 Preciso de ajuda
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><ErroPage/></Suspense>;
}
