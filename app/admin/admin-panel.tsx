/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { AssinaturasTab } from "./assinaturas-tab";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange: "#F07800", orangeLight: "#FF9A2E", orangeGlow: "rgba(240,120,0,0.12)", orangeBorder: "rgba(240,120,0,0.28)",
  black: "#0F0F0F", dark: "#141414", surface: "#1E1E1E", surfaceRaised: "#252525", border: "rgba(255,255,255,0.07)",
  white: "#FFFFFF", textPrimary: "#F0F0F0", textSec: "#808080", silver: "#C0C0C0",
  green: "#22C55E", greenBg: "rgba(34,197,94,0.1)", greenBorder: "rgba(34,197,94,0.25)",
  red: "#EF4444", redBg: "rgba(239,68,68,0.1)",
  blue: "#38BDF8", blueBg: "rgba(56,189,248,0.1)",
  purple: "#A78BFA", purpleBg: "rgba(167,139,250,0.1)",
  amber: "#F59E0B", amberBg: "rgba(245,158,11,0.1)",
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR");

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: compact?0:10 }}>
      <svg width={compact?28:34} height={compact?28:34} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="#444" strokeWidth="2" fill="#1A1A1A"/>
        <line x1="52" y1="10" x2="28" y2="70" stroke={B.orange} strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#s1)"/>
        <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#o1)"/>
        <defs>
          <linearGradient id="s1" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF"/><stop offset="1" stopColor="#777"/></linearGradient>
          <linearGradient id="o1" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9A2E"/><stop offset="1" stopColor="#C05E00"/></linearGradient>
        </defs>
      </svg>
      {!compact && (
        <div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:16, color:B.white, letterSpacing:"0.5px", lineHeight:1 }}>
            <span style={{ color:B.orange }}>77 </span>ASSISTECH
          </div>
          <div style={{ fontSize:9, color:"#444", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase" }}>Admin</div>
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Orders:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Subs:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Comm:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Partners:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Arrow:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Eye:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Check:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Menu:    ()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Bell:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Download:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
};

// ─── Status ───────────────────────────────────────────────────────────────────
type OrderStatus = "pending_payment"|"paid"|"processing"|"issued"|"cancelled";
const STATUS: Record<OrderStatus,{label:string;color:string;bg:string;next:OrderStatus[]}> = {
  pending_payment: { label:"Aguard. pagamento", color:B.amber,  bg:B.amberBg,  next:["paid","cancelled"] },
  paid:            { label:"Pago",              color:B.blue,   bg:B.blueBg,   next:["processing","cancelled"] },
  processing:      { label:"Em processamento",  color:B.purple, bg:B.purpleBg, next:["issued","cancelled"] },
  issued:          { label:"Emitido",           color:B.green,  bg:B.greenBg,  next:[] },
  cancelled:       { label:"Cancelado",         color:B.red,    bg:B.redBg,    next:[] },
};

function StatusBadge({ s }: { s: OrderStatus }) {
  const c = STATUS[s];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:100, background:c.bg, color:c.color, fontSize:11.5, fontWeight:700, whiteSpace:"nowrap", fontFamily:"'Barlow',sans-serif" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:c.color,display:"block",flexShrink:0 }}/>
      {c.label}
    </span>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
interface Order { id:string; number:string; client:string; document:string; email:string; product:string; productId:string; salePrice:number; basePrice:number; commission:number; status:OrderStatus; date:string; partnerId:string|null; partnerName:string|null; channel:"direct"|"partner"; paymentMethod:"pix"|"credit_card"|"boleto"; }
interface Partner { id:string; name:string; email:string; crc:string; status:"active"|"pending"|"blocked"; joinedAt:string; }

const INIT_ORDERS: Order[] = [
  {id:"1",  number:"77-2025-0158", client:"João Silva",        document:"123.456.789-00",     email:"joao@email.com",       product:"A3 Sem Token", productId:"a3_sem", salePrice:149.90, basePrice:119.00, commission:30.90, status:"paid",            date:"2025-04-09", partnerId:"p1", partnerName:"Carlos Mendes",  channel:"partner", paymentMethod:"pix"},
  {id:"2",  number:"77-2025-0157", client:"Tech Soluções ME",  document:"12.345.678/0001-90", email:"ti@techsolucoes.com",   product:"A3 Com Token", productId:"a3_com", salePrice:229.90, basePrice:189.00, commission:40.90, status:"processing",      date:"2025-04-09", partnerId:"p1", partnerName:"Carlos Mendes",  channel:"partner", paymentMethod:"credit_card"},
  {id:"3",  number:"77-2025-0156", client:"Maria Souza",       document:"987.654.321-11",     email:"maria@gmail.com",      product:"A1 PF/PJ",     productId:"a1",     salePrice:109.90, basePrice:99.00,  commission:10.90, status:"pending_payment", date:"2025-04-09", partnerId:null, partnerName:null,             channel:"direct",  paymentMethod:"boleto"},
  {id:"4",  number:"77-2025-0155", client:"Roberto Lima",      document:"456.789.123-44",     email:"roberto@email.com",    product:"A1 PF/PJ",     productId:"a1",     salePrice:109.90, basePrice:99.00,  commission:10.90, status:"issued",          date:"2025-04-08", partnerId:"p2", partnerName:"Ana Fiscal",     channel:"partner", paymentMethod:"pix"},
  {id:"5",  number:"77-2025-0154", client:"Construtora XYZ",   document:"55.321.654/0001-20", email:"cxyz@constr.com",      product:"A3 Com Token", productId:"a3_com", salePrice:229.90, basePrice:189.00, commission:40.90, status:"issued",          date:"2025-04-08", partnerId:"p3", partnerName:"Marcos Ribeiro", channel:"partner", paymentMethod:"pix"},
  {id:"6",  number:"77-2025-0153", client:"Fernanda Costa",    document:"654.321.098-77",     email:"fcosta@email.com",     product:"A3 Sem Token", productId:"a3_sem", salePrice:149.90, basePrice:119.00, commission:30.90, status:"issued",          date:"2025-04-07", partnerId:"p2", partnerName:"Ana Fiscal",     channel:"partner", paymentMethod:"pix"},
  {id:"7",  number:"77-2025-0150", client:"Paulo Rodrigues",   document:"321.654.987-22",     email:"paulo@email.com",      product:"A1 PF/PJ",     productId:"a1",     salePrice:109.90, basePrice:99.00,  commission:0,     status:"issued",          date:"2025-04-07", partnerId:null, partnerName:null,             channel:"direct",  paymentMethod:"credit_card"},
  {id:"8",  number:"77-2025-0148", client:"Advocacia Santos",  document:"78.901.234/0001-56", email:"santos@adv.com",       product:"A3 Sem Token", productId:"a3_sem", salePrice:140.00, basePrice:119.00, commission:21.00, status:"issued",          date:"2025-04-06", partnerId:"p1", partnerName:"Carlos Mendes",  channel:"partner", paymentMethod:"pix"},
  {id:"9",  number:"77-2025-0145", client:"Ana Pereira",       document:"111.222.333-99",     email:"ana@email.com",        product:"A3 Com Token", productId:"a3_com", salePrice:229.90, basePrice:189.00, commission:40.90, status:"cancelled",       date:"2025-04-05", partnerId:"p3", partnerName:"Marcos Ribeiro", channel:"partner", paymentMethod:"boleto"},
  {id:"10", number:"77-2025-0140", client:"Mercado Bom SA",    document:"99.888.777/0001-11", email:"adm@mercadobom.com",   product:"A3 Com Token", productId:"a3_com", salePrice:210.00, basePrice:189.00, commission:21.00, status:"issued",          date:"2025-04-04", partnerId:"p2", partnerName:"Ana Fiscal",     channel:"partner", paymentMethod:"pix"},
  {id:"11", number:"77-2025-0135", client:"Lucas Ferreira",    document:"222.333.444-88",     email:"lucas@email.com",      product:"A1 PF/PJ",     productId:"a1",     salePrice:109.90, basePrice:99.00,  commission:10.90, status:"issued",          date:"2025-04-03", partnerId:"p1", partnerName:"Carlos Mendes",  channel:"partner", paymentMethod:"pix"},
  {id:"12", number:"77-2025-0130", client:"Oficina Boa ME",    document:"44.555.666/0001-77", email:"oficina@email.com",    product:"A3 Sem Token", productId:"a3_sem", salePrice:149.90, basePrice:119.00, commission:30.90, status:"issued",          date:"2025-04-02", partnerId:"p3", partnerName:"Marcos Ribeiro", channel:"partner", paymentMethod:"credit_card"},
];
const PARTNERS: Partner[] = [
  {id:"p1", name:"Carlos Mendes",  email:"carlos@contabilidade.com", crc:"CRC-SP 12345", status:"active",  joinedAt:"2025-01-10"},
  {id:"p2", name:"Ana Fiscal",     email:"ana@fiscal.com",           crc:"CRC-RJ 67890", status:"active",  joinedAt:"2025-02-03"},
  {id:"p3", name:"Marcos Ribeiro", email:"marcos@contabilidades.com",crc:"CRC-MG 11223", status:"active",  joinedAt:"2025-03-15"},
  {id:"p4", name:"Bruna Torres",   email:"bruna@bt.com",             crc:"CRC-SP 44556", status:"pending", joinedAt:"2025-04-07"},
];

// ─── Print Report ─────────────────────────────────────────────────────────────
function printReport(type: "orders"|"commissions", data: Order[], partners: Partner[]) {
  const now = new Date().toLocaleDateString("pt-BR");
  const nowTime = new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });

  let body = "";
  if (type === "orders") {
    const rows = data.map(o => `
      <tr>
        <td>${o.number}</td>
        <td>${o.client}</td>
        <td>${o.document}</td>
        <td>${o.product}</td>
        <td>${o.channel === "partner" ? o.partnerName : "Direto"}</td>
        <td>${fmt(o.salePrice)}</td>
        <td>${fmt(o.basePrice)}</td>
        <td style="color:${o.channel==="partner"?"#F07800":"#666"};font-weight:700">${o.channel==="partner"?fmt(o.commission):"—"}</td>
        <td><span class="badge badge-${o.status}">${STATUS[o.status].label}</span></td>
        <td>${fmtDate(o.date)}</td>
      </tr>`).join("");
    const totalSale = data.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.salePrice,0);
    const totalComm = data.filter(o=>o.status==="issued"&&o.channel==="partner").reduce((s,o)=>s+o.commission,0);
    body = `
      <h2>Relatório de Pedidos — Abril 2025</h2>
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Documento</th><th>Produto</th><th>Canal/Parceiro</th><th>Preço Venda</th><th>Preço Base</th><th>Comissão</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div class="total-row"><span>Total pedidos:</span><strong>${data.length}</strong></div>
        <div class="total-row"><span>Volume de vendas:</span><strong>${fmt(totalSale)}</strong></div>
        <div class="total-row orange"><span>Total comissões:</span><strong>${fmt(totalComm)}</strong></div>
      </div>`;
  } else {
    const pStats = partners.map(p => {
      const pOrders = data.filter(o=>o.partnerId===p.id&&o.status==="issued");
      const totalComm = pOrders.reduce((s,o)=>s+o.commission,0);
      const totalSale = pOrders.reduce((s,o)=>s+o.salePrice,0);
      const orderRows = pOrders.map(o => `
        <tr>
          <td>${o.number}</td><td>${o.client}</td><td>${o.product}</td>
          <td>${fmt(o.salePrice)}</td><td>${fmt(o.basePrice)}</td>
          <td style="color:#F07800;font-weight:700">${fmt(o.commission)}</td>
          <td>${fmtDate(o.date)}</td>
        </tr>`).join("");
      return `
        <div class="partner-block">
          <div class="partner-header">
            <div><strong>${p.name}</strong> — ${p.crc} — ${p.email}</div>
            <div class="partner-totals">
              <span>Vendas: <strong>${fmt(totalSale)}</strong></span>
              <span class="orange">Comissão: <strong>${fmt(totalComm)}</strong></span>
            </div>
          </div>
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Produto</th><th>Preço Venda</th><th>Preço Base</th><th>Comissão</th><th>Data</th></tr></thead>
            <tbody>${orderRows || "<tr><td colspan='7' style='text-align:center;color:#999'>Nenhum pedido emitido.</td></tr>"}</tbody>
          </table>
          <div class="subtotal">Total: ${fmt(totalComm)}</div>
        </div>`;
    });
    const grandTotal = data.filter(o=>o.status==="issued"&&o.channel==="partner").reduce((s,o)=>s+o.commission,0);
    body = `<h2>Relatório de Comissões — Abril 2025</h2>${pStats.join("")}
      <div class="totals"><div class="total-row orange"><span>TOTAL GERAL A REPASSAR:</span><strong>${fmt(grandTotal)}</strong></div></div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>77 Assistech — ${type === "orders" ? "Relatório de Pedidos" : "Relatório de Comissões"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Rajdhani:wght@600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 20px; }
  
  /* Header */
  .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #F07800; padding-bottom: 16px; margin-bottom: 20px; }
  .logo-area { display: flex; align-items: center; gap: 12px; }
  .logo-circle { width: 52px; height: 52px; border-radius: 50%; background: #1a1a1a; border: 2px solid #444; display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 18px; color: #fff; }
  .logo-circle span { color: #F07800; }
  .brand-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 22px; color: #1a1a1a; letter-spacing: 1px; }
  .brand-name span { color: #F07800; }
  .brand-tag { font-size: 9px; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .report-meta { text-align: right; }
  .report-meta .report-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a1a; }
  .report-meta .report-sub { font-size: 10px; color: #888; margin-top: 4px; }
  .report-meta .report-date { font-size: 10px; color: #555; margin-top: 2px; }
  
  /* Title */
  h2 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
  
  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #1a1a1a; color: #fff; }
  thead th { padding: 8px 10px; text-align: left; font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f9f9f9; }
  tbody tr:hover { background: #fff3e0; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 10.5px; color: #333; }
  
  /* Badges */
  .badge { padding: 2px 7px; border-radius: 100px; font-size: 9.5px; font-weight: 700; white-space: nowrap; }
  .badge-pending_payment { background: #FEF3C7; color: #D97706; }
  .badge-paid            { background: #E0F2FE; color: #0284C7; }
  .badge-processing      { background: #EDE9FE; color: #7C3AED; }
  .badge-issued          { background: #D1FAE5; color: #059669; }
  .badge-cancelled       { background: #FEE2E2; color: #DC2626; }
  
  /* Totals */
  .totals { margin-top: 16px; border-top: 2px solid #F07800; padding-top: 12px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .total-row { display: flex; gap: 24px; align-items: center; font-size: 12px; }
  .total-row span { color: #666; }
  .total-row strong { color: #1a1a1a; font-weight: 800; font-size: 13px; }
  .total-row.orange strong { color: #F07800; font-size: 15px; }
  .orange { color: #F07800 !important; }
  
  /* Partner blocks */
  .partner-block { margin-bottom: 24px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
  .partner-header { background: #f5f5f5; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e0e0e0; }
  .partner-header strong { font-size: 12px; }
  .partner-totals { display: flex; gap: 18px; font-size: 11px; }
  .partner-totals .orange strong { color: #F07800; }
  .subtotal { background: #fff8f0; padding: 8px 14px; text-align: right; font-weight: 800; font-size: 12px; color: #F07800; border-top: 2px solid #F07800; }
  
  /* Footer */
  .report-footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 9px; color: #bbb; }
  
  /* Print */
  @media print {
    body { padding: 0; }
    @page { margin: 15mm; size: A4 landscape; }
    .partner-block { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <!-- Header -->
  <div class="report-header">
    <div class="logo-area">
      <div class="logo-circle"><span>77</span></div>
      <div>
        <div class="brand-name"><span>77 </span>ASSISTECH</div>
        <div class="brand-tag">Tecnologia e Suporte Inteligente</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">${type === "orders" ? "Relatório de Pedidos" : "Relatório de Comissões"}</div>
      <div class="report-sub">Plataforma de Certificados Digitais ICP-Brasil</div>
      <div class="report-date">Gerado em ${now} às ${nowTime}</div>
    </div>
  </div>
  
  <!-- Body -->
  ${body}
  
  <!-- Footer -->
  <div class="report-footer">
    <span>77 Assistech — Tecnologia e Suporte Inteligente · CNPJ: 00.000.000/0001-00</span>
    <span>Documento gerado automaticamente pelo sistema 77 Assistech em ${now}</span>
  </div>
  
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function OrderDrawer({ order, onClose, onStatusChange }: { order: Order; onClose:()=>void; onStatusChange:(id:string,s:OrderStatus)=>void }) {
  const cfg = STATUS[order.status];
  const steps: OrderStatus[] = ["pending_payment","paid","processing","issued"];
  const currentIdx = steps.indexOf(order.status);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)" }}/>
      <div style={{ width:460, background:B.surface, height:"100%", overflowY:"auto", boxShadow:"-8px 0 48px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column" }}>
        {/* drawer header */}
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${B.border}`, background:B.dark, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>Pedido</div>
            <div style={{ fontSize:18, fontWeight:700, color:B.white, letterSpacing:"0.5px", fontFamily:"'Rajdhani',sans-serif" }}>{order.number}</div>
            <div style={{ marginTop:6 }}><StatusBadge s={order.status}/></div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => printReport("orders", [order], [])} style={{ width:30, height:30, borderRadius:7, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, color:B.orange, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Ic.Print />
            </button>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:7, background:"rgba(255,255,255,0.07)", border:`1px solid ${B.border}`, color:B.textSec, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Ic.X />
            </button>
          </div>
        </div>

        <div style={{ flex:1, padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
          {/* stepper */}
          {order.status !== "cancelled" && (
            <div style={{ padding:"14px 16px", background:B.dark, borderRadius:11, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>Progresso do pedido</div>
              <div style={{ display:"flex", alignItems:"center" }}>
                {steps.map((s,i)=>{
                  const done=i<currentIdx; const active=i===currentIdx; const c=STATUS[s];
                  return (
                    <div key={s} style={{ display:"flex", alignItems:"center" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:done?"#22C55E":active?c.color:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                          {done?<span style={{ color:"#fff", fontSize:11 }}>✓</span>:<span style={{ width:7,height:7,borderRadius:"50%",background:active?"white":"rgba(255,255,255,0.15)",display:"block" }}/>}
                        </div>
                        <span style={{ fontSize:8, fontWeight:700, color:active?c.color:done?"#22C55E":"#333", whiteSpace:"nowrap", letterSpacing:"0.3px" }}>
                          {s==="pending_payment"?"Pend.":s==="paid"?"Pago":s==="processing"?"Process.":"Emitido"}
                        </span>
                      </div>
                      {i<steps.length-1 && <div style={{ width:24, height:2, background:done?"#22C55E":"rgba(255,255,255,0.07)", marginBottom:14, transition:"background 0.3s" }}/>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* client section */}
          <DrawerSection title="Cliente">
            <DrawerRow l="Nome" v={order.client} bold/>
            <DrawerRow l="Documento" v={order.document} mono/>
            <DrawerRow l="E-mail" v={order.email}/>
          </DrawerSection>

          {/* product section */}
          <DrawerSection title="Produto & Canal">
            <DrawerRow l="Certificado" v={order.product} bold/>
            <DrawerRow l="Canal" v={order.channel==="direct"?"Venda direta":`Parceiro — ${order.partnerName}`}/>
            <DrawerRow l="Pagamento" v={order.paymentMethod==="pix"?"Pix":order.paymentMethod==="credit_card"?"Cartão de crédito":"Boleto bancário"}/>
            <DrawerRow l="Data" v={fmtDate(order.date)}/>
          </DrawerSection>

          {/* financials */}
          <div style={{ background:B.dark, borderRadius:11, border:`1px solid ${B.border}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>Financeiro</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[{l:"Preço venda",v:fmt(order.salePrice),c:B.white},{l:"Preço base",v:fmt(order.basePrice),c:B.textSec},{l:"Comissão",v:fmt(order.commission),c:order.channel==="partner"?B.orange:B.textSec}].map(f=>(
                <div key={f.l} style={{ textAlign:"center", padding:"10px 6px", background:B.surfaceRaised, borderRadius:8, border:`1px solid ${B.border}` }}>
                  <div style={{ fontSize:10, color:"#555", marginBottom:4, fontWeight:600 }}>{f.l}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:f.c, letterSpacing:"-0.3px", fontFamily:"'Rajdhani',sans-serif" }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* actions */}
          {cfg.next.length > 0 && (
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>Avançar status</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {cfg.next.map(next=>{
                  const nc=STATUS[next]; const isCancel=next==="cancelled";
                  return (
                    <button key={next} onClick={()=>{onStatusChange(order.id,next);onClose();}} style={{ width:"100%", padding:"10px 16px", borderRadius:9, background:isCancel?B.redBg:nc.bg, border:`1px solid ${isCancel?"rgba(239,68,68,0.25)":nc.color+"30"}`, color:nc.color, fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"'Barlow',sans-serif" }}>
                      <span>Marcar como {`"{nc.label}"`}</span>
                      {isCancel?<Ic.X/>:<Ic.Arrow/>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(order.status==="issued"||order.status==="cancelled") && (
            <div style={{ padding:"11px 14px", borderRadius:9, background:order.status==="issued"?B.greenBg:B.redBg, border:`1px solid ${order.status==="issued"?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:order.status==="issued"?B.green:B.red }}>
                {order.status==="issued"?"✓ Pedido finalizado — nenhuma ação necessária.":"✕ Cancelado — comissão não gerada."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerSection({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>{title}</div>
      <div style={{ background:B.dark, borderRadius:11, border:`1px solid ${B.border}`, overflow:"hidden" }}>{children}</div>
    </div>
  );
}
function DrawerRow({ l, v, bold, mono }: { l:string; v:string; bold?:boolean; mono?:boolean }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", borderBottom:`1px solid ${B.border}` }}>
      <span style={{ fontSize:13, color:B.textSec }}>{l}</span>
      <span style={{ fontSize:13, color:B.textPrimary, fontWeight:bold?700:500, fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}>{v}</span>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function OrdersTab({ orders, onStatusChange }: { orders:Order[]; onStatusChange:(id:string,s:OrderStatus)=>void }) {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState<OrderStatus|"all">("all");
  const [cf, setCf] = useState<"all"|"direct"|"partner">("all");
  const [selected, setSelected] = useState<Order|null>(null);
  const [flashing, setFlashing] = useState<string|null>(null);

  const filtered = useMemo(()=>orders.filter(o=>{
    if(sf!=="all"&&o.status!==sf) return false;
    if(cf!=="all"&&o.channel!==cf) return false;
    if(search){const q=search.toLowerCase();return o.client.toLowerCase().includes(q)||o.number.includes(q)||o.document.includes(q)||(o.partnerName||"").toLowerCase().includes(q);}
    return true;
  }),[orders,sf,cf,search]);

  const quickStatus=(id:string,next:OrderStatus,e:React.MouseEvent)=>{
    e.stopPropagation(); onStatusChange(id,next);
    setFlashing(id); setTimeout(()=>setFlashing(null),1500);
  };

  const inp: React.CSSProperties = { width:"100%", padding:"8px 12px 8px 32px", borderRadius:8, border:`1px solid ${B.border}`, background:B.surfaceRaised, fontSize:13.5, color:B.textPrimary, outline:"none" };

  return (
    <div>
      {/* toolbar */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
        <div style={{ position:"relative", flex:"1 1 260px", minWidth:200 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#555" }}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar número, cliente, CPF/CNPJ, parceiro..." style={inp}/>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {([["all","Todos"]] as [string,string][]).concat(Object.entries(STATUS).map(([k,v])=>[k,v.label])).map(([k,l])=>(
            <button key={k} onClick={()=>setSf(k as any)} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${sf===k?B.orange:B.border}`, background:sf===k?B.orangeGlow:"transparent", color:sf===k?B.orange:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <select value={cf} onChange={e=>setCf(e.target.value as any)} style={{ padding:"7px 10px", borderRadius:8, border:`1px solid ${B.border}`, background:B.surfaceRaised, fontSize:13, color:B.textPrimary, cursor:"pointer", outline:"none" }}>
          <option value="all">Todos os canais</option>
          <option value="direct">Direto</option>
          <option value="partner">Parceiro</option>
        </select>
        <button onClick={()=>printReport("orders",filtered,PARTNERS)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:8, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, color:B.orange, fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
          <Ic.Print/> Imprimir / PDF
        </button>
        <span style={{ fontSize:12, color:"#444", whiteSpace:"nowrap" }}>{filtered.length} pedido{filtered.length!==1?"s":""}</span>
      </div>

      {/* table */}
      <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:B.dark, borderBottom:`1px solid ${B.border}` }}>
                {["Pedido","Cliente","Produto","Canal","Venda","Base","Comissão","Status","Ação"].map(h=>(
                  <th key={h} style={{ padding:"11px 13px", fontSize:10, fontWeight:700, color:"#444", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o,i)=>{
                const nextFwd = STATUS[o.status].next.filter(s=>s!=="cancelled")[0];
                const isFlash = flashing===o.id;
                return (
                  <tr key={o.id} onClick={()=>setSelected(o)}
                    style={{ borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.03)`:"none", cursor:"pointer", background:isFlash?B.greenBg:"transparent", transition:"background 0.4s" }}
                    onMouseEnter={e=>{if(!isFlash)e.currentTarget.style.background="rgba(255,255,255,0.02)";}}
                    onMouseLeave={e=>{if(!isFlash)e.currentTarget.style.background="transparent";}}
                  >
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:B.orange, fontFamily:"'JetBrains Mono',monospace" }}>{o.number}</div>
                      <div style={{ fontSize:10, color:"#333", marginTop:1 }}>{fmtDate(o.date)}</div>
                    </td>
                    <td style={{ padding:"11px 13px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.textPrimary, maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.client}</div>
                      <div style={{ fontSize:10.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{o.document}</div>
                    </td>
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 8px", borderRadius:5, background:"rgba(255,255,255,0.05)", color:B.silver }}>{o.product}</span>
                    </td>
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      {o.channel==="partner"
                        ?<div><div style={{ fontSize:11.5, fontWeight:600, color:B.orange }}>Parceiro</div><div style={{ fontSize:10.5, color:"#444" }}>{o.partnerName}</div></div>
                        :<span style={{ fontSize:11.5, fontWeight:600, color:B.blue }}>Direto</span>
                      }
                    </td>
                    <td style={{ padding:"11px 13px", fontSize:13, fontWeight:700, color:B.textPrimary, whiteSpace:"nowrap", fontFamily:"'Rajdhani',sans-serif" }}>{fmt(o.salePrice)}</td>
                    <td style={{ padding:"11px 13px", fontSize:12.5, color:"#555", whiteSpace:"nowrap" }}>{fmt(o.basePrice)}</td>
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      {o.channel==="partner"
                        ?<span style={{ fontSize:13, fontWeight:800, color:o.status==="cancelled"?B.red:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>{o.status==="cancelled"?"—":fmt(o.commission)}</span>
                        :<span style={{ fontSize:12, color:"#333" }}>—</span>
                      }
                    </td>
                    <td style={{ padding:"11px 13px" }}><StatusBadge s={o.status}/></td>
                    <td style={{ padding:"11px 13px" }} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:"flex", gap:4 }}>
                        {nextFwd && (
                          <button onClick={e=>quickStatus(o.id,nextFwd,e)} style={{ display:"flex", alignItems:"center", gap:3, padding:"4px 9px", borderRadius:6, background:STATUS[nextFwd].bg, border:`1px solid ${STATUS[nextFwd].color}30`, color:STATUS[nextFwd].color, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                            <Ic.Arrow/> {STATUS[nextFwd].label.split(" ")[0]}
                          </button>
                        )}
                        <button onClick={e=>{e.stopPropagation();setSelected(o);}} style={{ padding:"4px 8px", borderRadius:6, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, color:"#555", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                          <Ic.Eye/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={9} style={{ padding:"48px", textAlign:"center", color:"#333", fontSize:14 }}>Nenhum pedido encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <OrderDrawer order={selected} onClose={()=>setSelected(null)} onStatusChange={onStatusChange}/>}
    </div>
  );
}

function CommissionsTab({ orders, partners }: { orders:Order[]; partners:Partner[] }) {
  const [payStatus, setPayStatus] = useState<Record<string,"pending"|"paid">>({});

  const stats = useMemo(()=>partners.map(p=>{
    const po=orders.filter(o=>o.partnerId===p.id);
    const issued=po.filter(o=>o.status==="issued");
    const totalComm=issued.reduce((s,o)=>s+o.commission,0);
    const totalSale=issued.reduce((s,o)=>s+o.salePrice,0);
    return {partner:p,issued,totalComm,totalSale};
  }),[orders,partners]);

  const grandTotal=stats.reduce((s,p)=>s+p.totalComm,0);

  return (
    <div>
      {/* summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginBottom:20 }}>
        {[
          {l:"Total a repassar", v:fmt(grandTotal),  c:B.orange},
          {l:"Volume emitido",   v:fmt(orders.filter(o=>o.status==="issued").reduce((s,o)=>s+o.salePrice,0)), c:B.blue},
          {l:"Parceiros ativos", v:String(partners.filter(p=>p.status==="active").length), c:B.green},
          {l:"Fechamento",       v:"01/05/2025", c:B.amber},
        ].map(c=>(
          <div key={c.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#555", marginBottom:8, fontFamily:"'Barlow',sans-serif" }}>{c.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:c.c, letterSpacing:"-0.5px", fontFamily:"'Rajdhani',sans-serif" }}>{c.v}</div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`${c.c}30` }}/>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
        <button onClick={()=>printReport("commissions",orders,partners)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, color:B.orange, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>
          <Ic.Print/> Imprimir relatório de comissões
        </button>
      </div>

      {stats.map(({partner, issued, totalComm, totalSale})=>{
        const isPaid=payStatus[partner.id]==="paid";
        return (
          <div key={partner.id} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, marginBottom:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${B.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, background:B.dark }}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:B.black, fontFamily:"'Rajdhani',sans-serif", flexShrink:0 }}>
                  {partner.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{partner.name}</div>
                  <div style={{ fontSize:11.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{partner.crc} · {partner.email}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"#444", marginBottom:2 }}>Vendas emitidas</div>
                  <div style={{ fontSize:14, fontWeight:700, color:B.textPrimary, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(totalSale)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:"#444", marginBottom:2 }}>Comissão total</div>
                  <div style={{ fontSize:20, fontWeight:700, color:B.orange, letterSpacing:"-0.5px", fontFamily:"'Rajdhani',sans-serif" }}>{fmt(totalComm)}</div>
                </div>
                <button onClick={()=>setPayStatus(s=>({...s,[partner.id]:isPaid?"pending":"paid"}))} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, background:isPaid?B.greenBg:B.orangeGlow, border:`1px solid ${isPaid?B.greenBorder:B.orangeBorder}`, color:isPaid?B.green:B.orange, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  {isPaid?<><Ic.Check/> Pago</>:<>Marcar como pago</>}
                </button>
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${B.border}` }}>
                    {["Pedido","Cliente","Produto","Preço venda","Preço base","Comissão","Status"].map(h=>(
                      <th key={h} style={{ padding:"9px 13px", fontSize:10, fontWeight:700, color:"#333", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {issued.map((o,i)=>(
                    <tr key={o.id} style={{ borderBottom:i<issued.length-1?`1px solid rgba(255,255,255,0.03)`:"none" }}>
                      <td style={{ padding:"9px 13px", fontSize:11.5, fontWeight:700, color:B.orange, fontFamily:"'JetBrains Mono',monospace" }}>{o.number}</td>
                      <td style={{ padding:"9px 13px" }}><div style={{ fontSize:12.5, color:B.textPrimary }}>{o.client}</div><div style={{ fontSize:10, color:"#333" }}>{fmtDate(o.date)}</div></td>
                      <td style={{ padding:"9px 13px", fontSize:12, color:B.textSec, whiteSpace:"nowrap" }}>{o.product}</td>
                      <td style={{ padding:"9px 13px", fontSize:13, fontWeight:700, color:B.textPrimary, whiteSpace:"nowrap", fontFamily:"'Rajdhani',sans-serif" }}>{fmt(o.salePrice)}</td>
                      <td style={{ padding:"9px 13px", fontSize:12, color:"#555", whiteSpace:"nowrap" }}>{fmt(o.basePrice)}</td>
                      <td style={{ padding:"9px 13px", whiteSpace:"nowrap" }}><span style={{ fontSize:14, fontWeight:800, color:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(o.commission)}</span></td>
                      <td style={{ padding:"9px 13px" }}><StatusBadge s={o.status}/></td>
                    </tr>
                  ))}
                  {issued.length===0 && <tr><td colSpan={7} style={{ padding:"18px 13px", textAlign:"center", color:"#333", fontSize:13 }}>Nenhum pedido emitido.</td></tr>}
                  {issued.length>0 && (
                    <tr style={{ borderTop:`2px solid ${B.orangeBorder}`, background:B.dark }}>
                      <td colSpan={5} style={{ padding:"10px 13px", fontSize:12, fontWeight:700, color:"#555", textAlign:"right" }}>Total — {issued.length} pedido{issued.length!==1?"s":""}</td>
                      <td style={{ padding:"10px 13px" }}><span style={{ fontSize:16, fontWeight:800, color:B.orange, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(totalComm)}</span></td>
                      <td style={{ padding:"10px 13px" }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:100, background:isPaid?B.greenBg:B.orangeGlow, color:isPaid?B.green:B.orange }}>
                          {isPaid?"Pago":"Pendente"}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PartnersTab({ partners, orders, onApprove }: { partners:Partner[]; orders:Order[]; onApprove:(id:string)=>void }) {
  const pending = partners.filter(p=>p.status==="pending");
  return (
    <div>
      {pending.length>0 && (
        <div style={{ marginBottom:14, padding:"12px 16px", borderRadius:11, background:B.amberBg, border:`1px solid rgba(245,158,11,0.25)`, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:B.amber }}>⚠ {pending.length} cadastro{pending.length!==1?"s":""} aguardando aprovação</span>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {partners.map(p=>{
          const po=orders.filter(o=>o.partnerId===p.id);
          const issued=po.filter(o=>o.status==="issued");
          const totalComm=issued.reduce((s,o)=>s+o.commission,0);
          const isPending=p.status==="pending";
          return (
            <div key={p.id} style={{ background:B.surface, border:`1px solid ${isPending?"rgba(245,158,11,0.25)":B.border}`, borderRadius:13, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:isPending?B.amberBg:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:isPending?B.amber:B.black, flexShrink:0, fontFamily:"'Rajdhani',sans-serif" }}>
                {p.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
              </div>
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                <div style={{ fontSize:11.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{p.crc}</div>
                <div style={{ fontSize:12, color:"#444" }}>{p.email}</div>
              </div>
              <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
                {[{l:"Pedidos",v:String(po.length),c:B.textPrimary},{l:"Emitidos",v:String(issued.length),c:B.green},{l:"Comissão",v:fmt(totalComm),c:B.orange},{l:"Membro desde",v:fmtDate(p.joinedAt),c:B.textSec}].map(s=>(
                  <div key={s.l} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:10, color:"#444", marginBottom:2, fontFamily:"'JetBrains Mono',monospace" }}>{s.l}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:s.c, fontFamily:"'Rajdhani',sans-serif" }}>{s.v}</div>
                  </div>
                ))}
                {isPending
                  ?<button onClick={()=>onApprove(p.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, background:B.greenBg, border:`1px solid ${B.greenBorder}`, color:B.green, fontWeight:700, fontSize:13, cursor:"pointer" }}><Ic.Check/> Aprovar</button>
                  :<span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, background:B.greenBg, color:B.green, border:`1px solid ${B.greenBorder}` }}>Ativo</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPanel77() {
  const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  const [tab, setTab] = useState<"orders"|"commissions"|"partners"|"assinaturas">("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleStatus=(id:string,s:OrderStatus)=>setOrders(prev=>prev.map(o=>o.id===id?{...o,status:s}:o));
  const handleApprove=(id:string)=>setPartners(prev=>prev.map(p=>p.id===id?{...p,status:"active"}:p));

  const pendingCount=orders.filter(o=>["pending_payment","paid","processing"].includes(o.status)).length;
  const pendingPartners=partners.filter(p=>p.status==="pending").length;
  const issuedToday=orders.filter(o=>o.status==="issued"&&o.date==="2025-04-09").length;
  const totalComm=orders.filter(o=>o.status==="issued"&&o.channel==="partner").reduce((s,o)=>s+o.commission,0);

  const navItems = [
    {id:"orders"       as const, label:"Pedidos",      icon:<Ic.Orders/>,   badge:pendingCount||undefined},
    {id:"commissions"  as const, label:"Comissões",    icon:<Ic.Comm/>,     badge:undefined},
    {id:"partners"     as const, label:"Parceiros",    icon:<Ic.Partners/>, badge:pendingPartners||undefined},
    {id:"assinaturas"  as const, label:"Assinaturas",  icon:<Ic.Subs/>,     badge:undefined},
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif", fontSize:14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(240,120,0,0.3);border-radius:100px}
        select:focus,input:focus{outline:1px solid ${B.orange};outline-offset:1px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ width:sidebarOpen?220:58, background:B.dark, borderRight:`1px solid ${B.border}`, display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0, position:"sticky", top:0, height:"100vh", overflow:"hidden" }}>
        <div style={{ padding:"15px 10px", borderBottom:`1px solid ${B.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <Logo compact={!sidebarOpen}/>
        </div>
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {navItems.map(item=>{
            const active=tab===item.id;
            return (
              <button key={item.id} onClick={()=>setTab(item.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:sidebarOpen?"10px 12px":"10px", justifyContent:sidebarOpen?"flex-start":"center", borderRadius:9, border:"none", cursor:"pointer", background:active?B.orangeGlow:"transparent", color:active?B.orange:"#555", fontWeight:active?700:500, fontSize:14, transition:"all 0.15s", position:"relative", whiteSpace:"nowrap", overflow:"hidden", fontFamily:"'Barlow',sans-serif" }}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}
              >
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {item.badge && item.badge > 0 && (
                  <span style={{ position:sidebarOpen?"static":"absolute", top:sidebarOpen?undefined:3, right:sidebarOpen?undefined:3, marginLeft:sidebarOpen?"auto":undefined, background:B.orange, color:B.black, fontSize:10, fontWeight:800, padding:"1px 6px", borderRadius:100, minWidth:18, textAlign:"center" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:"12px 10px", borderTop:`1px solid ${B.border}`, display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:B.black, flexShrink:0, fontFamily:"'Rajdhani',sans-serif" }}>AD</div>
          {sidebarOpen && <div><div style={{ fontSize:12, fontWeight:600, color:"#555" }}>Admin</div><div style={{ fontSize:10, color:"#333" }}>admin@77assistech.com.br</div></div>}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* topbar */}
        <header style={{ background:B.dark, borderBottom:`1px solid ${B.border}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setSidebarOpen(s=>!s)} style={{ width:30,height:30,borderRadius:7,background:"rgba(255,255,255,0.05)",border:`1px solid ${B.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555" }}>
              <Ic.Menu/>
            </button>
            <div>
              <span style={{ fontSize:15, fontWeight:700, color:B.white, letterSpacing:"0.3px", fontFamily:"'Rajdhani',sans-serif" }}>
                {navItems.find(n=>n.id===tab)?.label}
              </span>
              <span style={{ fontSize:10, color:"#333", marginLeft:10, fontFamily:"'JetBrains Mono',monospace" }}>Abril 2025</span>
            </div>
          </div>

          {/* live stats pill */}
          <div style={{ display:"flex", background:B.surfaceRaised, border:`1px solid ${B.border}`, borderRadius:10, overflow:"hidden" }}>
            {[{l:"Pedidos",v:orders.length,c:B.blue},{l:"Pendentes",v:pendingCount,c:B.amber},{l:"Emitidos hoje",v:issuedToday,c:B.green},{l:"Comissões",v:fmt(totalComm),c:B.orange}].map((s,i)=>(
              <div key={s.l} style={{ padding:"7px 14px", borderRight:i<3?`1px solid ${B.border}`:"none", textAlign:"center" }}>
                <div style={{ fontSize:9.5, color:"#444", fontWeight:600, marginBottom:1, fontFamily:"'JetBrains Mono',monospace" }}>{s.l}</div>
                <div style={{ fontSize:13.5, fontWeight:800, color:s.c, letterSpacing:"-0.3px", fontFamily:"'Rajdhani',sans-serif" }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:7, alignItems:"center" }}>
            <button style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${B.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555",position:"relative" }}>
              <Ic.Bell/>
              {(pendingCount>0||pendingPartners>0)&&<span style={{ position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:B.red,border:`2px solid ${B.dark}` }}/>}
            </button>
            <button onClick={()=>printReport("orders",orders,partners)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:8, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}`, color:B.orange, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"'Barlow',sans-serif" }}>
              <Ic.Download/> Exportar
            </button>
          </div>
        </header>

        {/* content */}
        <main style={{ flex:1, padding:"18px 20px", overflowY:"auto", animation:"fadeIn 0.2s ease both" }}>
          {tab==="orders"       && <OrdersTab      orders={orders} onStatusChange={handleStatus}/>}
          {tab==="commissions"  && <CommissionsTab orders={orders} partners={partners}/>}
          {tab==="partners"     && <PartnersTab    partners={partners} orders={orders} onApprove={handleApprove}/>}
          {tab==="assinaturas"  && <AssinaturasTab/>}
        </main>
      </div>
    </div>
  );
}