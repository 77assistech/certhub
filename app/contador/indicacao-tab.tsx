"use client";

import { useState } from "react";
import type { LinkStats } from "./useContadorData";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070", silver:"#B8B8B8",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  blue:"#38BDF8", blueBg:"rgba(56,189,248,0.08)", amber:"#F59E0B",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ExtIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: B.textSec, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: B.white, letterSpacing: "-0.8px", lineHeight: 1, fontFamily: "'Rajdhani',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "#444", marginTop: 4 }}>{sub}</div>}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color}60,transparent)` }}/>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  contadorId: string | null;
  stats: LinkStats;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function IndicacaoTab({ contadorId, stats }: Props) {
  const [copied, setCopied] = useState(false);

  const referralUrl = contadorId
    ? `${typeof window !== "undefined" ? window.location.origin : "https://77assistech.com.br"}/certificados?ref=${contadorId}`
    : null;

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpen = () => {
    if (!referralUrl) return;
    window.open(referralUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.white, margin: "0 0 4px", fontFamily: "'Rajdhani',sans-serif" }}>
          Link de indicação
        </h2>
        <p style={{ fontSize: 14, color: B.textSec, margin: 0 }}>
          Compartilhe seu link exclusivo. Cada certificado vendido é rastreado e vinculado à sua conta.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <StatCard label="Total de pedidos" value={stats.totalPedidos} sub="Via seu link" color={B.orange}/>
        <StatCard label="Pedidos este mês" value={stats.pedidosMes} sub="Mês atual" color={B.blue}/>
        <StatCard label="Certificados emitidos" value={stats.pedidosConvertidos} sub="Status: Emitido" color={B.green}/>
      </div>

      {/* Link card */}
      <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: B.orange, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>
          Seu link exclusivo
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: B.white, marginBottom: 14, fontFamily: "'Rajdhani',sans-serif" }}>
          Link de certificados digitais
        </div>

        {contadorId ? (
          <>
            {/* URL display */}
            <div style={{ background: B.dark, border: `1px solid ${B.border}`, borderRadius: 9, padding: "11px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#666", wordBreak: "break-all", marginBottom: 13, lineHeight: 1.5 }}>
              <span style={{ color: "#444" }}>
                {typeof window !== "undefined" ? window.location.origin : "https://77assistech.com.br"}/certificados?ref=
              </span>
              <span style={{ color: B.orange }}>{contadorId}</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 9, border: `1px solid ${copied ? B.greenBorder : B.orangeBorder}`, background: copied ? B.greenBg : B.orangeGlow, color: copied ? B.green : B.orange, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "'Barlow',sans-serif", transition: "all 0.18s ease" }}>
                {copied ? <><CheckIcon/> Copiado!</> : <><CopyIcon/> Copiar link</>}
              </button>
              <button onClick={handleOpen}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 9, border: `1px solid ${B.border}`, background: "rgba(255,255,255,0.04)", color: B.textSec, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Barlow',sans-serif" }}>
                <ExtIcon/> Abrir
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: B.textSec, fontSize: 14 }}>
            Carregando dados da conta…
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: B.white, marginBottom: 14, fontFamily: "'Rajdhani',sans-serif" }}>
          Como funciona
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { n: "1", title: "Compartilhe", desc: "Envie o link para seus clientes via WhatsApp, e-mail ou redes sociais.", color: B.orange },
            { n: "2", title: "Cliente compra", desc: "O cliente acessa sua página personalizada e realiza o pedido com seus dados.", color: B.blue },
            { n: "3", title: "Você recebe", desc: "A comissão é calculada automaticamente e creditada no fechamento mensal.", color: B.green },
          ].map(step => (
            <div key={step.n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${step.color}18`, border: `1px solid ${step.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 800, color: step.color, fontFamily: "'Rajdhani',sans-serif" }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: B.white, marginBottom: 2, fontFamily: "'Rajdhani',sans-serif" }}>{step.title}</div>
                <div style={{ fontSize: 12.5, color: B.textSec, lineHeight: 1.55 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info notice */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 11, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <span style={{ color: B.amber, flexShrink: 0, marginTop: 1 }}><InfoIcon/></span>
        <p style={{ fontSize: 13, color: B.textSec, margin: 0, lineHeight: 1.65 }}>
          <strong style={{ color: B.white }}>Rastreamento automático:</strong> o parâmetro <code style={{ background: "rgba(255,255,255,0.07)", padding: "1px 6px", borderRadius: 4, fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace" }}>?ref</code> identifica você em cada pedido. Não é necessário que o cliente faça login.
        </p>
      </div>
    </div>
  );
}
