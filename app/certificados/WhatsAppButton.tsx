"use client";

import { useState } from "react";
import { buildWaUrl, type WaMsgParams } from "./whatsapp";

// ─── Ícone oficial do WhatsApp ────────────────────────────────────────────────
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.853L.057 23.571a.5.5 0 0 0 .612.612l5.765-1.47A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.938 9.938 0 0 1-5.174-1.448l-.37-.22-3.822.975.997-3.735-.242-.385A9.936 9.936 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  );
}

// ─── Paleta WhatsApp ──────────────────────────────────────────────────────────
const WA = {
  green:    "#25D366",
  greenDark:"#1EBC5A",
  greenBg:  "rgba(37,211,102,0.12)",
  greenBorder:"rgba(37,211,102,0.35)",
  black:    "#0F0F0F",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface WhatsAppButtonProps extends WaMsgParams {
  /** Texto exibido no botão. Padrão: "Falar com especialista no WhatsApp" */
  label?: string;
  /** "primary" = fundo verde sólido | "outline" = borda verde transparente */
  variant?: "primary" | "outline";
  fullWidth?: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function WhatsAppButton({
  label    = "Falar com especialista no WhatsApp",
  variant  = "primary",
  fullWidth = false,
  ...msgParams
}: WhatsAppButtonProps) {
  const [hovered, setHovered] = useState(false);

  const url = buildWaUrl(msgParams);

  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            10,
    padding:        "14px 28px",
    borderRadius:   12,
    fontFamily:     "'Barlow', -apple-system, sans-serif",
    fontSize:       15,
    fontWeight:     800,
    textDecoration: "none",
    cursor:         "pointer",
    transition:     "all 0.18s ease",
    width:          fullWidth ? "100%" : undefined,
    whiteSpace:     "nowrap",
  };

  const styles: Record<"primary" | "outline", React.CSSProperties> = {
    primary: {
      background:  hovered ? WA.greenDark : WA.green,
      color:       WA.black,
      border:      "none",
      boxShadow:   hovered
        ? `0 6px 24px rgba(37,211,102,0.35), 0 2px 8px rgba(0,0,0,0.3)`
        : `0 4px 16px rgba(37,211,102,0.2)`,
      transform:   hovered ? "translateY(-1px)" : "translateY(0)",
    },
    outline: {
      background:  hovered ? WA.greenBg : "transparent",
      color:       WA.green,
      border:      `1.5px solid ${hovered ? WA.green : WA.greenBorder}`,
      boxShadow:   "none",
    },
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...base, ...styles[variant] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
    >
      <WhatsAppIcon size={variant === "primary" ? 20 : 18} />
      {label}
    </a>
  );
}
