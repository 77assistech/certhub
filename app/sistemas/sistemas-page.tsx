"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Brand (mesmo do sistema atual) ──────────────────────────────────────────
const B = {
  orange: "#F07800", orangeLight: "#FF9A2E",
  orangeGlow: "rgba(240,120,0,0.12)", orangeBorder: "rgba(240,120,0,0.28)",
  black: "#111111", dark: "#181818", surface: "#222222", surfaceRaised: "#2A2A2A",
  border: "rgba(255,255,255,0.07)", borderHover: "rgba(240,120,0,0.35)",
  white: "#FFFFFF", textPrimary: "#F0F0F0", textSec: "#909090", silver: "#C8C8C8",
  green: "#22C55E", greenBg: "rgba(34,197,94,0.1)", greenBorder: "rgba(34,197,94,0.25)",
  blue: "#38BDF8", blueBg: "rgba(56,189,248,0.1)",
  purple: "#A78BFA", purpleBg: "rgba(167,139,250,0.1)",
  red: "#EF4444",
};

const WA = `https://wa.me/5577988160268?text=${encodeURIComponent("Olá! Tenho interesse em um sistema empresarial. Pode me ajudar?")}`;

// ─── Logo (reutilizada do sistema atual) ─────────────────────────────────────
function Logo77({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="37" stroke="#555" strokeWidth="2.5" fill="#1A1A1A" />
      <line x1="52" y1="10" x2="28" y2="70" stroke="#F07800" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#silv2)" />
      <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#org2)" />
      <defs>
        <linearGradient id="silv2" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF" /><stop offset="1" stopColor="#888" />
        </linearGradient>
        <linearGradient id="org2" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A2E" /><stop offset="1" stopColor="#C05E00" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  WA: (s = 17) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.524 5.84L.057 23.882l6.197-1.424A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.214-3.727.857.882-3.607-.235-.37A9.818 9.818 0 1112 21.818z" /></svg>,
  Arrow: (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Monitor: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  ShoppingCart: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
  BarChart: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
  Receipt: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2l-3 2-2-2-2 2-2-2-2 2z" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /></svg>,
  Zap: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#F07800" stroke="#F07800" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Percent: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>,
  Refresh: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
  Play: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>,
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  basePrice: number;
  publicPrice: number;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

interface SystemProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "PDV" | "ERP" | "Fiscal" | "Financeiro";
  supplier: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  icon: React.ReactNode;
  plans: Plan[];
  useCases: string[];
  badge?: string;
}

// ─── Product Catalog ──────────────────────────────────────────────────────────
const SYSTEMS: SystemProduct[] = [
  {
    id: "pdv-express",
    name: "PDV Express",
    tagline: "Venda mais rápido, controle melhor.",
    description: "Sistema de ponto de venda completo para comércio varejista. Emite NFC-e, controla estoque, aceita múltiplas formas de pagamento e funciona offline.",
    category: "PDV",
    supplier: "Cervantes Tecnologia",
    color: "#F07800",
    colorBg: "rgba(240,120,0,0.08)",
    colorBorder: "rgba(240,120,0,0.3)",
    icon: <Ic.ShoppingCart />,
    badge: "Mais popular",
    plans: [
      { id: "pdv-starter", name: "Starter", basePrice: 89, publicPrice: 149, features: ["1 caixa PDV", "Emissão NFC-e", "Controle de estoque básico", "Relatórios diários", "Suporte por e-mail"] },
      { id: "pdv-pro", name: "Pro", basePrice: 129, publicPrice: 199, highlight: true, badge: "Recomendado", features: ["3 caixas PDV", "Emissão NFC-e + NF-e", "Estoque avançado", "Multi-formas de pagamento", "Dashboard em tempo real", "Suporte prioritário"] },
      { id: "pdv-premium", name: "Premium", basePrice: 189, publicPrice: 299, features: ["Caixas ilimitados", "NFC-e + NF-e + NFS-e", "Estoque + fornecedores", "Integração delivery", "Gestor de fidelidade", "Suporte 24h"] },
    ],
    useCases: ["Mercearias e mercadinhos", "Lojas de roupas e calçados", "Pet shops", "Farmácias", "Lojas de conveniência"],
  },
  {
    id: "erp-business",
    name: "ERP Business",
    tagline: "Gestão completa para sua empresa crescer.",
    description: "ERP modular para médias empresas. Integra compras, vendas, financeiro, estoque e RH em uma única plataforma acessível via navegador.",
    category: "ERP",
    supplier: "Arpa Sistemas",
    color: "#A78BFA",
    colorBg: "rgba(167,139,250,0.08)",
    colorBorder: "rgba(167,139,250,0.3)",
    icon: <Ic.BarChart />,
    plans: [
      { id: "erp-start", name: "Start", basePrice: 179, publicPrice: 299, features: ["Financeiro básico", "Contas a pagar/receber", "Emissão de NF-e", "3 usuários", "Suporte por e-mail"] },
      { id: "erp-business", name: "Business", basePrice: 279, publicPrice: 449, highlight: true, badge: "Recomendado", features: ["Módulos completos", "NF-e + boleto bancário", "10 usuários", "Compras e fornecedores", "BI e dashboards", "Integração contábil", "Suporte prioritário"] },
      { id: "erp-enterprise", name: "Enterprise", basePrice: 449, publicPrice: 699, features: ["Módulos ilimitados", "Usuários ilimitados", "Multi-empresa", "API para integração", "Consultoria de implantação", "Suporte dedicado"] },
    ],
    useCases: ["Distribuidoras", "Indústrias de pequeno porte", "Empresas de serviços", "Atacadistas", "Construtoras"],
  },
  {
    id: "emissor-nfe",
    name: "Emissor NF-e",
    tagline: "Emita notas fiscais sem complicação.",
    description: "Plataforma 100% web para emissão de NF-e, NFS-e e NFC-e. Simples, rápido e com armazenamento automático em nuvem. Ideal para empresas que precisam de agilidade fiscal.",
    category: "Fiscal",
    supplier: "Vimbo",
    color: "#38BDF8",
    colorBg: "rgba(56,189,248,0.08)",
    colorBorder: "rgba(56,189,248,0.3)",
    icon: <Ic.Receipt />,
    plans: [
      { id: "fiscal-basico", name: "Básico", basePrice: 59, publicPrice: 99, features: ["NF-e ilimitada", "Até 3 usuários", "Armazenamento 5 anos", "Consulta SEFAZ", "Suporte por e-mail"] },
      { id: "fiscal-completo", name: "Completo", basePrice: 89, publicPrice: 149, highlight: true, badge: "Recomendado", features: ["NF-e + NFS-e + NFC-e", "Usuários ilimitados", "Armazenamento permanente", "Importação de XML", "Dashboard fiscal", "Suporte chat e e-mail"] },
    ],
    useCases: ["MEI e microempresas", "Prestadores de serviço", "E-commerce", "Escritórios de advocacia", "Clínicas e consultórios"],
  },
  {
    id: "financeiro",
    name: "Financeiro Start",
    tagline: "Controle o dinheiro da sua empresa.",
    description: "Software financeiro para gestão de fluxo de caixa, contas a pagar e receber, DRE automático e conciliação bancária. Tome decisões baseadas em dados reais.",
    category: "Financeiro",
    supplier: "Arpa Sistemas",
    color: "#22C55E",
    colorBg: "rgba(34,197,94,0.08)",
    colorBorder: "rgba(34,197,94,0.3)",
    icon: <Ic.BarChart />,
    plans: [
      { id: "fin-starter", name: "Starter", basePrice: 99, publicPrice: 169, features: ["Fluxo de caixa", "Contas a pagar/receber", "2 usuários", "Relatórios mensais", "Suporte por e-mail"] },
      { id: "fin-pro", name: "Pro", basePrice: 159, publicPrice: 259, highlight: true, badge: "Recomendado", features: ["Fluxo de caixa avançado", "DRE automático", "Conciliação bancária", "5 usuários", "Integração com bancos", "Dashboards executivos", "Suporte prioritário"] },
    ],
    useCases: ["Prestadores de serviço", "Escritórios contábeis", "Clínicas", "Empresas de logística", "Agências digitais"],
  },
];

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  PDV:        { color: "#F07800", bg: "rgba(240,120,0,0.12)" },
  ERP:        { color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  Fiscal:     { color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  Financeiro: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
};

// ─── Demo Modal ───────────────────────────────────────────────────────────────
function DemoModal({ system, onClose }: { system: SystemProduct; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", employees: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone) return;
    setSent(true);
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    border: `1px solid ${B.border}`, background: B.surfaceRaised,
    fontSize: 14, color: B.textPrimary, outline: "none",
    fontFamily: "'Barlow&apos;, sans-serif",
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: B.surface, border: `1px solid ${system.colorBorder}`, borderRadius: 20, padding: "28px 26px", maxWidth: 460, width: "100%", boxShadow: `0 40px 100px rgba(0,0,0,0.6)`, maxHeight: "90vh", overflowY: "auto" }}>
        {!sent ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: system.color, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  Solicitar demonstração
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: B.white, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>{system.name}</h3>
                <p style={{ fontSize: 13, color: B.textSec, margin: "3px 0 0" }}>Nossa equipe entra em contato em até 2 horas úteis</p>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: `1px solid ${B.border}`, color: B.textSec, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Ic.X />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { k: "name",      l: "Seu nome",         ph: "João da Silva" },
                { k: "company",   l: "Nome da empresa",  ph: "Empresa ABC Ltda" },
                { k: "email",     l: "E-mail",           ph: "joao@empresa.com.br" },
                { k: "phone",     l: "WhatsApp",         ph: "(77) 9 9999-9999" },
                { k: "employees", l: "Nº de funcionários", ph: "Ex: 5" },
              ].map((f) => (
                <div key={f.k}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: B.textSec, marginBottom: 5, fontFamily: "'Barlow', sans-serif" }}>{f.l}</label>
                  <input placeholder={f.ph} value={form[f.k as keyof typeof form]} onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 9 }}>
              <button onClick={handleSubmit} style={{ padding: "13px", borderRadius: 11, background: `linear-gradient(135deg, ${system.color}, ${system.color}CC)`, color: system.category === "PDV" ? B.black : "white", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
                Solicitar demonstração gratuita
              </button>
              <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", borderRadius: 11, background: B.greenBg, border: `1px solid ${B.greenBorder}`, color: B.green, fontWeight: 700, fontSize: 15, textDecoration: "none", fontFamily: "'Rajdhani', sans-serif" }}>
                {Ic.WA(17)} Falar agora no WhatsApp
              </a>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: B.greenBg, border: `1px solid ${B.greenBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: B.green, fontSize: 28 }}>✓</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}>Solicitação enviada!</h3>
            <p style={{ color: B.textSec, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>Nossa equipe entrará em contato com você em até 2 horas úteis para agendar a demonstração do <strong style={{ color: B.white }}>{system.name}</strong>.</p>
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 10, background: system.colorBg, border: `1px solid ${system.colorBorder}`, color: system.color, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, system, onSelect }: { plan: Plan; system: SystemProduct; onSelect: () => void }) {
  const commission = plan.publicPrice - plan.basePrice;
  return (
    <div style={{
      background: plan.highlight ? `${system.colorBg}` : "rgba(255,255,255,0.02)",
      border: `1.5px solid ${plan.highlight ? system.colorBorder : B.border}`,
      borderRadius: 14, padding: "20px 18px",
      display: "flex", flexDirection: "column",
      position: "relative", transition: "all 0.2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${system.color}15`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {plan.badge && (
        <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: system.color, color: system.category === "PDV" ? B.black : "white", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 100, whiteSpace: "nowrap", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Rajdhani', sans-serif" }}>
          {plan.badge}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: B.textPrimary, fontFamily: "'Rajdhani', sans-serif", marginBottom: 2 }}>{plan.name}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: B.white, letterSpacing: "-1px", lineHeight: 1.1, fontFamily: "'Rajdhani', sans-serif" }}>
          R$ {plan.publicPrice.toFixed(2).replace(".", ",")}
          <span style={{ fontSize: 13, fontWeight: 400, color: B.textSec, letterSpacing: 0 }}>/mês</span>
        </div>
        {/* commission preview for partners */}
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 7, background: B.orangeGlow, border: `1px solid ${B.orangeBorder}`, width: "fit-content" }}>
          <Ic.Percent />
          <span style={{ fontSize: 11, fontWeight: 700, color: B.orange, fontFamily: "'JetBrains Mono', monospace" }}>
            comissão: R$ {commission.toFixed(2).replace(".", ",")}/mês
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
        {plan.features.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: B.silver }}>
            <span style={{ color: system.color, flexShrink: 0, marginTop: 1 }}>{Ic.Check(13)}</span>
            {f}
          </div>
        ))}
      </div>

      <button onClick={onSelect} style={{ width: "100%", padding: "10px", borderRadius: 10, background: plan.highlight ? `linear-gradient(135deg, ${system.color}, ${system.color}CC)` : "rgba(255,255,255,0.06)", border: plan.highlight ? "none" : `1px solid ${B.border}`, color: plan.highlight ? (system.category === "PDV" ? B.black : "white") : B.textPrimary, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.3px" }}>
        Solicitar demonstração
      </button>
    </div>
  );
}

// ─── System Card (lista) ──────────────────────────────────────────────────────
function SystemCard({ system, onDemo, onDetail }: { system: SystemProduct; onDemo: () => void; onDetail: () => void }) {
  const minPrice = Math.min(...system.plans.map((p) => p.publicPrice));
  const maxCommission = Math.max(...system.plans.map((p) => p.publicPrice - p.basePrice));
  const cat = CATEGORY_COLORS[system.category];

  return (
    <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 18, padding: "24px 22px", display: "flex", flexDirection: "column", position: "relative", transition: "all 0.3s", cursor: "default" }}
      onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${system.colorBorder}`; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 20px 60px ${system.color}12`; }}
      onMouseLeave={(e) => { e.currentTarget.style.border = `1px solid ${B.border}`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {system.badge && (
        <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: system.color, color: system.category === "PDV" ? B.black : "white", fontSize: 10, fontWeight: 800, padding: "3px 14px", borderRadius: 100, whiteSpace: "nowrap", letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "'Rajdhani', sans-serif" }}>
          {system.badge}
        </div>
      )}

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: system.colorBg, border: `1px solid ${system.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: system.color, flexShrink: 0 }}>
            {system.icon}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: B.white, margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>{system.name}</h3>
            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: cat.bg, color: cat.color }}>{system.category}</span>
              <span style={{ fontSize: 11, color: B.textSec }}>{system.supplier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* tagline + desc */}
      <p style={{ fontSize: 15, fontWeight: 600, color: B.textPrimary, margin: "0 0 6px", fontFamily: "'Rajdhani', sans-serif" }}>{system.tagline}</p>
      <p style={{ fontSize: 13.5, color: B.textSec, lineHeight: 1.65, marginBottom: 16 }}>{system.description}</p>

      {/* use cases */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
        {system.useCases.slice(0, 3).map((u) => (
          <span key={u} style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, color: B.textSec }}>
            {u}
          </span>
        ))}
        {system.useCases.length > 3 && (
          <span style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, color: B.textSec }}>
            +{system.useCases.length - 3}
          </span>
        )}
      </div>

      {/* price range */}
      <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 16, marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, color: B.textSec, display: "block", marginBottom: 2 }}>A partir de</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: B.white, letterSpacing: "-0.8px", fontFamily: "'Rajdhani', sans-serif" }}>
              R$ {minPrice.toFixed(2).replace(".", ",")}
              <span style={{ fontSize: 12, fontWeight: 400, color: B.textSec }}>/mês</span>
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 10, color: B.textSec, display: "block", marginBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>comissão parceiro</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: B.orange, fontFamily: "'Rajdhani', sans-serif" }}>até R$ {maxCommission}/mês</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={onDemo} style={{ flex: 1, padding: "11px", borderRadius: 10, background: `linear-gradient(135deg, ${system.color}, ${system.color}BB)`, color: system.category === "PDV" ? B.black : "white", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
            Solicitar demo
          </button>
          <button onClick={onDetail} style={{ padding: "11px 16px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${B.border}`, color: B.silver, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            Ver planos {Ic.Arrow(13)}
          </button>
        </div>
        <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 9, fontSize: 13, fontWeight: 600, color: B.green, textDecoration: "none" }}>
          {Ic.WA(13)} Falar com especialista
        </a>
      </div>
    </div>
  );
}

// ─── System Detail View ───────────────────────────────────────────────────────
function SystemDetail({ system, onBack, onDemo }: { system: SystemProduct; onBack: () => void; onDemo: (s: SystemProduct) => void }) {
  return (
    <div style={{ animation: "fadeIn 0.25s ease both" }}>
      {/* back */}
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 24, background: "rgba(255,255,255,0.05)", border: `1px solid ${B.border}`, color: B.textSec, padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>
        ← Voltar para sistemas
      </button>

      {/* hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: system.colorBg, border: `1px solid ${system.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: system.color }}>
              {system.icon}
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 5, background: CATEGORY_COLORS[system.category].bg, color: CATEGORY_COLORS[system.category].color, marginBottom: 4, display: "inline-block" }}>{system.category}</span>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: B.white, margin: 0, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "-0.5px" }}>{system.name}</h1>
            </div>
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, color: B.textPrimary, margin: "0 0 10px", fontFamily: "'Rajdhani', sans-serif" }}>{system.tagline}</p>
          <p style={{ fontSize: 15, color: B.textSec, lineHeight: 1.7, maxWidth: 600 }}>{system.description}</p>
          <p style={{ fontSize: 12, color: "#444", marginTop: 8 }}>Fornecido por: <strong style={{ color: B.silver }}>{system.supplier}</strong></p>
        </div>
        <div style={{ display: "flex", gap: 9, flexShrink: 0 }}>
          <button onClick={() => onDemo(system)} style={{ padding: "11px 22px", borderRadius: 10, background: `linear-gradient(135deg, ${system.color}, ${system.color}BB)`, color: system.category === "PDV" ? B.black : "white", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "'Rajdhani&apos;, sans-serif" }}>
            Solicitar demo
          </button>
          <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, background: B.greenBg, border: `1px solid ${B.greenBorder}`, color: B.green, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            {Ic.WA(16)} WhatsApp
          </a>
        </div>
      </div>

      {/* plans */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 20px" }}>Escolha seu plano</h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${system.plans.length}, 1fr)`, gap: 16 }}>
          {system.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} system={system} onSelect={() => onDemo(system)} />
          ))}
        </div>
        {/* annual discount callout */}
        <div style={{ marginTop: 14, padding: "13px 18px", borderRadius: 12, background: B.orangeGlow, border: `1px solid ${B.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: B.white, fontFamily: "'Rajdhani', sans-serif" }}>Plano anual com 15% de desconto</span>
            <span style={{ fontSize: 13, color: B.textSec, marginLeft: 10 }}>Economize pagando 12 meses adiantado.</span>
          </div>
          <button onClick={() => onDemo(system)} style={{ padding: "8px 18px", borderRadius: 9, background: B.orange, color: B.black, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            Quero o anual
          </button>
        </div>
      </div>

      {/* use cases */}
      <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 16, padding: "22px 24px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 14px" }}>Ideal para</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {system.useCases.map((u) => (
            <div key={u} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, fontSize: 13.5, color: B.silver }}>
              <span style={{ color: system.color }}>{Ic.Check(13)}</span> {u}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SistemasPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [demoSystem, setDemoSystem] = useState<SystemProduct | null>(null);
  const [detailSystem, setDetailSystem] = useState<SystemProduct | null>(null);

  const categories = ["Todos", "PDV", "ERP", "Fiscal", "Financeiro"];
  const filtered = activeCategory === "Todos" ? SYSTEMS : SYSTEMS.filter((s) => s.category === activeCategory);

  return (
    <div style={{ background: B.dark, minHeight: "100vh", fontFamily: "'Barlow', -apple-system, BlinkMacSystemFont, sans-serif", color: B.textSec }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap&apos;);
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 6px #F07800; } 50% { box-shadow: 0 0 14px #F07800; } }
        ::selection { background: rgba(240,120,0,0.3); color: #fff; }
      `}</style>

      {/* ── NAVBAR (reusa o padrão do sistema) ── */}
      <nav style={{ borderBottom: `1px solid ${B.border}`, padding: "0 clamp(16px,5vw,48px)", background: "rgba(17,17,17,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Logo77 size={36} />
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, color: B.white, letterSpacing: "0.5px", lineHeight: 1 }}>
                <span style={{ color: B.orange }}>77 </span>ASSISTECH
              </div>
              <div style={{ fontSize: 9, color: "#333", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1.5px", textTransform: "uppercase" }}>Tecnologia e Suporte</div>
            </div>
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/sistemas" style={{ fontSize: 14, fontWeight: 600, color: B.orange, textDecoration: "none", padding: "6px 12px" }}>Sistemas</Link>
            <Link href="/" style={{ fontSize: 14, fontWeight: 500, color: B.textSec, textDecoration: "none", padding: "6px 12px" }}>Certificados</Link>
            <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, background: B.greenBg, border: `1px solid ${B.greenBorder}`, color: B.green, fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}>
              {Ic.WA(15)} WhatsApp
            </a>
            <button onClick={() => setDemoSystem(SYSTEMS[0])} style={{ padding: "8px 18px", borderRadius: 9, background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, color: B.black, fontWeight: 800, fontSize: 13.5, border: "none", cursor: "pointer", fontFamily: "'Rajdhani&apos;, sans-serif" }}>
              Solicitar demo
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px clamp(16px,5vw,48px) 80px" }}>

        {detailSystem ? (
          <SystemDetail system={detailSystem} onBack={() => setDetailSystem(null)} onDemo={(s) => setDemoSystem(s)} />
        ) : (
          <>
            {/* ── HERO SECTION ── */}
            <div style={{ padding: "60px 0 56px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -100, right: -60, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${B.orangeGlow} 0%, transparent 70%)`, pointerEvents: "none" }} ></div>
              <div style={{ position: "absolute", bottom: -60, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }} ></div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: B.orangeGlow, border: `1px solid ${B.orangeBorder}`, borderRadius: 100, padding: "5px 16px", marginBottom: 22 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: B.orange, animation: "pulse 2s infinite" }} ></div>
                  <span style={{ fontSize: 12, color: B.orange, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    Sistemas para Empresas · Novo módulo 77 Assistech
                  </span>
                </div>

                <h1 style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700, color: B.white, letterSpacing: "-1.5px", lineHeight: 1.05, maxWidth: 680, marginBottom: 18, fontFamily: "'Rajdhani', sans-serif" }}>
                  Sistemas empresariais que<br />
                  <span style={{ color: B.orange }}>fazem seu negócio crescer.</span>
                </h1>

                <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: B.textSec, maxWidth: 520, lineHeight: 1.75, marginBottom: 36 }}>
                  PDV, ERP, Emissor Fiscal e Financeiro. Soluções completas com suporte especializado da 77 Assistech e comissão recorrente para contadores parceiros.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 52 }}>
                  <button onClick={() => document.getElementById("sistemas-grid")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 11, background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, color: B.black, fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "'Rajdhani&apos;, sans-serif" }}>
                    Ver sistemas {Ic.Arrow(16)}
                  </button>
                  <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 22px", borderRadius: 11, background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, color: B.silver, fontWeight: 600, fontSize: 16, textDecoration: "none" }}>
                    {Ic.WA(17)} Falar com especialista
                  </a>
                </div>

                {/* stats */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 48px" }}>
                  {[
                    { v: "4 categorias", l: "PDV · ERP · Fiscal · Financeiro" },
                    { v: "Trial 14 dias", l: "Sem cartão de crédito" },
                    { v: "Comissão mensal", l: "Para contadores parceiros" },
                    { v: "Suporte incluso", l: "Da 77 Assistech" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "-0.3px" }}>{s.v}</div>
                      <div style={{ fontSize: 12, color: "#444", marginTop: 1 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CATEGORY FILTERS ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const catColor = cat === "Todos" ? B.orange : CATEGORY_COLORS[cat]?.color || B.orange;
                const isActive = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${isActive ? catColor : B.border}`, background: isActive ? `${catColor}15` : "transparent", color: isActive ? catColor : B.textSec, fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Barlow&apos;, sans-serif" }}>
                    {cat}
                  </button>
                );
              })}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#444", alignSelf: "center" }}>
                {filtered.length} sistema{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* ── SYSTEMS GRID ── */}
            <div id="sistemas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 60 }}>
              {filtered.map((system) => (
                <SystemCard key={system.id} system={system} onDemo={() => setDemoSystem(system)} onDetail={() => setDetailSystem(system)} />
              ))}
            </div>

            {/* ── BUNDLE CALLOUT (cert + sistema) ── */}
            <div style={{ marginBottom: 60, padding: "28px 30px", borderRadius: 18, background: `linear-gradient(135deg, rgba(240,120,0,0.08), rgba(167,139,250,0.05))`, border: `1px solid ${B.orangeBorder}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${B.orangeGlow}, transparent 70%)`, pointerEvents: "none" }} ></div>
              <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: B.orange, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                    Oferta especial · Bundle
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}>
                    Certificado Digital + Sistema Empresarial
                  </h3>
                  <p style={{ fontSize: 14, color: B.textSec, lineHeight: 1.65, maxWidth: 500 }}>
                    Contrate um sistema e ganhe o certificado A1 com desconto. Ou assine um sistema e já deixe o certificado digital dos sócios em dia — tudo com suporte 77 Assistech.
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 9, background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, color: B.black, fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "'Rajdhani', sans-serif" }}>
                      Ver certificados {Ic.Arrow(13)}
                    </Link>
                    <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, background: B.greenBg, border: `1px solid ${B.greenBorder}`, color: B.green, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                      {Ic.WA(14)} Pedir bundle
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", gap: -8, flexShrink: 0 }}>
                  {["A1", "ERP", "PDV"].map((tag, i) => (
                    <div key={tag} style={{ width: 52, height: 52, borderRadius: "50%", background: i === 0 ? "#38BDF815" : i === 1 ? "#A78BFA15" : "#F0780015", border: `2px solid ${i === 0 ? "#38BDF8" : i === 1 ? "#A78BFA" : B.orange}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? "#38BDF8" : i === 1 ? "#A78BFA" : B.orange, marginLeft: i > 0 ? -12 : 0, fontFamily: "'Rajdhani&apos;, sans-serif" }}>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PARTNER SECTION ── */}
            <div style={{ padding: "48px 0 0", borderTop: `1px solid ${B.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: B.orange, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Para contadores parceiros</span>
                  <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "-0.5px", margin: "8px 0 14px", lineHeight: 1.1 }}>
                    Indique sistemas.<br /><span style={{ color: B.orange }}>Ganhe todo mês.</span>
                  </h2>
                  <p style={{ fontSize: 15, color: B.textSec, lineHeight: 1.75, marginBottom: 28 }}>
                    Diferente dos certificados, sistemas geram comissão recorrente mensal enquanto o cliente estiver ativo. Quanto mais clientes você mantém, maior sua receita passiva.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                    {[
                      { icon: <Ic.Percent />, c: B.orange, t: "Comissão mensal recorrente", d: "Você ganha todo mês enquanto o cliente mantiver a assinatura ativa." },
                      { icon: <Ic.Refresh />, c: B.purple, t: "MRR crescente", d: "Cada novo cliente aumenta sua receita mensal recorrente automaticamente." },
                      { icon: <Ic.Users />, c: B.green, t: "Painel de clientes ativos", d: "Acompanhe assinaturas, churn e comissões em tempo real no seu portal." },
                    ].map((i) => (
                      <div key={i.t} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: `${i.c}12`, border: `1px solid ${i.c}25`, display: "flex", alignItems: "center", justifyContent: "center", color: i.c, flexShrink: 0 }}>{i.icon}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: B.white, margin: "0 0 3px", fontFamily: "'Rajdhani', sans-serif" }}>{i.t}</p>
                          <p style={{ fontSize: 13, color: B.textSec, margin: 0, lineHeight: 1.6 }}>{i.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Link href="/contador" style={{ padding: "12px 24px", borderRadius: 10, background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, color: B.black, fontWeight: 800, fontSize: 15, textDecoration: "none", fontFamily: "'Rajdhani', sans-serif" }}>
                      Acessar portal
                    </Link>
                    <a href={WA} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${B.border}`, color: B.silver, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                      {Ic.WA(15)} Quero ser parceiro
                    </a>
                  </div>
                </div>

                {/* MRR simulator */}
                <MRRSimulator />
              </div>
            </div>
          </>
        )}
      </div>

      {/* floating WA */}
      <a href={WA} target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, width: 52, height: 52, borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(22,163,74,0.5)", textDecoration: "none", transition: "transform 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {Ic.WA(24)}
      </a>

      {demoSystem && <DemoModal system={demoSystem} onClose={() => setDemoSystem(null)} />}
    </div>
  );
}

// ─── MRR Simulator (componente interno) ──────────────────────────────────────
function MRRSimulator() {
  const [clients, setClients] = useState(5);
  const avgCommission = 70; // média de comissão por cliente/mês

  const mrr = clients * avgCommission;
  const annual = mrr * 12;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${B.border}`, borderRadius: 18, padding: 26 }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: B.orange, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 20px" }}>
        Simulador de MRR · Contador Parceiro
      </p>

      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: B.textSec, fontWeight: 600 }}>Clientes ativos com sistema</label>
          <span style={{ fontSize: 16, fontWeight: 700, color: B.white, fontFamily: "'Rajdhani', sans-serif" }}>{clients}</span>
        </div>
        <input type="range" min={1} max={50} value={clients} onChange={(e) => setClients(Number(e.target.value))}
          style={{ width: "100%", accentColor: B.orange, height: 4, cursor: "pointer", WebkitAppearance: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#333", marginTop: 3 }}>
          <span>1</span><span>50</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ textAlign: "center", padding: "14px", background: B.dark, borderRadius: 11, border: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>MRR mensal</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: B.orange, letterSpacing: "-0.8px", fontFamily: "'Rajdhani', sans-serif" }}>
            R$ {mrr.toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>todo mês</div>
        </div>
        <div style={{ textAlign: "center", padding: "14px", background: B.dark, borderRadius: 11, border: `1px solid ${B.border}` }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Receita anual</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: B.green, letterSpacing: "-0.8px", fontFamily: "'Rajdhani', sans-serif" }}>
            R$ {annual.toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>em 12 meses</div>
        </div>
      </div>

      {/* breakdown por produto */}
      {[
        { n: "PDV Express Pro", c: B.orange, comm: 70 },
        { n: "ERP Business", c: B.purple, comm: 170 },
        { n: "Emissor NF-e", c: B.blue, comm: 60 },
        { n: "Financeiro Pro", c: B.green, comm: 100 },
      ].map((item) => (
        <div key={item.n} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: B.silver }}>{item.n}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: item.c, fontFamily: "'Rajdhani', sans-serif" }}>R$ {item.comm}/cliente/mês</span>
          </div>
          <div style={{ height: 3, borderRadius: 100, background: "rgba(255,255,255,0.06)" }}>
            <div style={{ height: "100%", borderRadius: 100, background: item.c, width: `${(item.comm / 170) * 100}%` }} ></div>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 11, color: "#2A2A2A", margin: "12px 0 0", lineHeight: 1.5 }}>
        * Simulação baseada em média de R$ {avgCommission}/cliente. Valores reais variam por plano escolhido.
      </p>
    </div>
  );
}
