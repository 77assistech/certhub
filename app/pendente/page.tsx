"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.08)",
};

function PendentePage() {
  const params   = useSearchParams();
  const pedidoId = params.get("pedido") ?? "";
  const shortId  = pedidoId.slice(0, 8).toUpperCase();

  const waUrl = `https://wa.me/5577988160268?text=${encodeURIComponent(
    `Olá! Realizei um pagamento que está em análise.\n\n📋 Pedido: ${shortId || "—"}\n\nPoderia me ajudar?`
  )}`;

  return (
    <div style={{ minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Barlow:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      <div style={{ width:"100%", maxWidth:480, textAlign:"center" }}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:B.amberBg, border:`2px solid rgba(245,158,11,0.35)`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:34, marginBottom:24 }}>
          ⏳
        </div>
        <h1 style={{ fontSize:26, fontWeight:700, color:B.amber, fontFamily:"'Rajdhani',sans-serif", marginBottom:8 }}>
          Pagamento em análise
        </h1>
        <p style={{ fontSize:14, color:B.textSec, lineHeight:1.7, marginBottom:12 }}>
          Seu pagamento está sendo processado. Isso pode levar alguns minutos.
        </p>
        {shortId && (
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#444", marginBottom:28 }}>
            Pedido: {shortId}
          </div>
        )}
        <p style={{ fontSize:13, color:B.textSec, marginBottom:28, lineHeight:1.6 }}>
          Você receberá uma confirmação assim que o pagamento for aprovado. Se preferir, fale conosco pelo WhatsApp.
        </p>
        <div style={{ display:"flex", gap:10, flexDirection:"column" }}>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ display:"block", padding:"13px", borderRadius:11, background:"#25D366", color:B.black, fontWeight:800, fontSize:14, textDecoration:"none", fontFamily:"'Rajdhani',sans-serif" }}>
            💬 Falar no WhatsApp
          </a>
          <a href="/certificados"
            style={{ display:"block", padding:"11px", borderRadius:11, background:"transparent", border:`1px solid ${B.border}`, color:B.textSec, fontWeight:600, fontSize:13, textDecoration:"none" }}>
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <Suspense><PendentePage/></Suspense>;
}
