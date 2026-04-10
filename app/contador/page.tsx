"use client";

import { useState, useRef, useCallback } from "react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange:"#F07800", orangeLight:"#FF9A2E", orangeGlow:"rgba(240,120,0,0.12)", orangeBorder:"rgba(240,120,0,0.28)",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", surfaceRaised:"#252525", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070", silver:"#B8B8B8",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.1)", greenBorder:"rgba(34,197,94,0.25)",
  red:"#EF4444", blue:"#38BDF8", purple:"#A78BFA", amber:"#F59E0B",
};

type ProductId = "a1"|"a3_sem"|"a3_com";
type OrderStatus = "pending_payment"|"paid"|"processing"|"issued"|"cancelled";
type TabId = "dashboard"|"orders"|"prices"|"links";

const PRODUCTS = [
  {id:"a1"     as ProductId, name:"A1 PF/PJ",     label:"Certificado A1",  basePrice:99.00,  publicPrice:109.90, color:"#38BDF8", bg:"rgba(56,189,248,0.08)"},
  {id:"a3_sem" as ProductId, name:"A3 Sem Token", label:"Certificado A3",  basePrice:119.00, publicPrice:149.90, color:B.orange,  bg:"rgba(240,120,0,0.08)"},
  {id:"a3_com" as ProductId, name:"A3 Com Token", label:"Certificado A3+", basePrice:189.00, publicPrice:229.90, color:B.green,   bg:"rgba(34,197,94,0.08)"},
];

const STATUS: Record<OrderStatus,{label:string;color:string;bg:string}> = {
  pending_payment:{label:"Aguard. pagamento",color:B.amber,   bg:"rgba(245,158,11,0.1)"},
  paid:           {label:"Pago",             color:B.blue,    bg:"rgba(56,189,248,0.1)"},
  processing:     {label:"Em processamento", color:B.purple,  bg:"rgba(167,139,250,0.1)"},
  issued:         {label:"Emitido",          color:B.green,   bg:"rgba(34,197,94,0.1)"},
  cancelled:      {label:"Cancelado",        color:B.red,     bg:"rgba(239,68,68,0.1)"},
};

const fmt = (v:number) => `R$ ${v.toFixed(2).replace(".",",")}`;

const MOCK_ORDERS = [
  {id:"1",number:"77-2025-0145",client:"João Silva",      document:"123.456.789-00",   product:"A3 Sem Token",productId:"a3_sem" as ProductId,salePrice:149.90,commission:30.90,status:"issued"          as OrderStatus,date:"07/04/2025",channel:"link"},
  {id:"2",number:"77-2025-0144",client:"Maria Souza",     document:"98.765.432/0001-10",product:"A1 PF/PJ",   productId:"a1"     as ProductId,salePrice:109.90,commission:10.90,status:"processing"       as OrderStatus,date:"06/04/2025",channel:"link"},
  {id:"3",number:"77-2025-0141",client:"Tech Soluções ME",document:"12.345.678/0001-90",product:"A3 Com Token",productId:"a3_com" as ProductId,salePrice:210.00,commission:21.00,status:"issued"          as OrderStatus,date:"05/04/2025",channel:"manual"},
  {id:"4",number:"77-2025-0138",client:"Roberto Alves",   document:"321.654.987-55",   product:"A3 Sem Token",productId:"a3_sem" as ProductId,salePrice:149.90,commission:30.90,status:"paid"             as OrderStatus,date:"04/04/2025",channel:"link"},
  {id:"5",number:"77-2025-0130",client:"Fernanda Costa",  document:"456.789.123-77",   product:"A1 PF/PJ",   productId:"a1"     as ProductId,salePrice:109.90,commission:10.90,status:"issued"          as OrderStatus,date:"02/04/2025",channel:"link"},
  {id:"6",number:"77-2025-0129",client:"Construtora XYZ", document:"55.321.654/0001-20",product:"A3 Com Token",productId:"a3_com" as ProductId,salePrice:229.90,commission:40.90,status:"issued"          as OrderStatus,date:"01/04/2025",channel:"manual"},
  {id:"7",number:"77-2025-0125",client:"Ana Pereira",     document:"654.321.098-11",   product:"A1 PF/PJ",   productId:"a1"     as ProductId,salePrice:105.00,commission:6.00, status:"cancelled"        as OrderStatus,date:"28/03/2025",channel:"link"},
  {id:"8",number:"77-2025-0120",client:"Marcos Lima",     document:"789.012.345-33",   product:"A3 Sem Token",productId:"a3_sem" as ProductId,salePrice:140.00,commission:21.00,status:"issued"          as OrderStatus,date:"25/03/2025",channel:"link"},
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Dashboard: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Orders:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Prices:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Links:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Plus:      ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Copy:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Menu:      ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Bell:      ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Ext:       ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Logout:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Info:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Search:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ mini=false }: { mini?:boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:mini?0:10 }}>
      <svg width={mini?28:34} height={mini?28:34} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="#444" strokeWidth="2" fill="#181818"/>
        <line x1="52" y1="10" x2="28" y2="70" stroke={B.orange} strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#ls)"/>
        <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#lo)"/>
        <defs>
          <linearGradient id="ls" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF"/><stop offset="1" stopColor="#666"/></linearGradient>
          <linearGradient id="lo" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9A2E"/><stop offset="1" stopColor="#C05E00"/></linearGradient>
        </defs>
      </svg>
      {!mini && (
        <div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:15, color:B.white, letterSpacing:"0.5px", lineHeight:1 }}>
            <span style={{ color:B.orange }}>77 </span>ASSISTECH
          </div>
          <div style={{ fontSize:8.5, color:"#333", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase" }}>
            Portal do Contador
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ s }: { s: OrderStatus }) {
  const c = STATUS[s];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:100, background:c.bg, color:c.color, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:c.color,display:"block" }}/>
      {c.label}
    </span>
  );
}

// ─── New Order Modal ──────────────────────────────────────────────────────────
function NewOrderModal({ onClose }: { onClose:()=>void }) {
  const [form, setForm] = useState({ client:"", document:"", email:"", phone:"", product:"a3_sem" as ProductId });
  const product = PRODUCTS.find(p=>p.id===form.product)!;
  const commission = product.publicPrice - product.basePrice;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:"26px", width:"100%", maxWidth:460, boxShadow:"0 32px 80px rgba(0,0,0,0.5)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:B.orange, letterSpacing:"2px", textTransform:"uppercase", margin:"0 0 3px", fontFamily:"'JetBrains Mono',monospace" }}>Novo pedido</div>
            <h3 style={{ fontSize:20, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif" }}>Cadastrar cliente</h3>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.07)",border:`1px solid ${B.border}`,color:B.textSec,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>×</button>
        </div>

        {/* product selector */}
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>Produto</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {PRODUCTS.map(p=>(
              <button key={p.id} onClick={()=>setForm(f=>({...f,product:p.id}))}
                style={{ padding:"10px 6px", borderRadius:10, border:`1.5px solid ${form.product===p.id?p.color:B.border}`, background:form.product===p.id?`${p.color}12`:"transparent", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:12, fontWeight:700, color:form.product===p.id?p.color:B.silver, fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                <div style={{ fontSize:10, color:form.product===p.id?p.color:B.textSec, marginTop:2 }}>{fmt(p.publicPrice)}</div>
              </button>
            ))}
          </div>
        </div>

        {[{k:"client",l:"Nome completo",ph:"João da Silva"},{k:"document",l:"CPF / CNPJ",ph:"000.000.000-00"},{k:"email",l:"E-mail",ph:"joao@email.com"},{k:"phone",l:"Telefone",ph:"(11) 9 9999-9999"}].map(f=>(
          <div key={f.k} style={{ marginBottom:13 }}>
            <label style={lbl}>{f.l}</label>
            <input placeholder={f.ph} value={(form as any)[f.k]} onChange={e=>setForm(frm=>({...frm,[f.k]:e.target.value}))} style={inp}/>
          </div>
        ))}

        {/* preview */}
        <div style={{ background:B.dark, border:`1px solid ${B.orangeBorder}`, borderRadius:11, padding:"13px 15px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
            <span style={{ color:B.textSec }}>Preço de venda:</span>
            <span style={{ fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(product.publicPrice)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
            <span style={{ color:B.textSec }}>Sua comissão:</span>
            <span style={{ fontWeight:800, color:B.orange, fontSize:15, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(commission)}</span>
          </div>
        </div>

        <button onClick={onClose} style={{ width:"100%", padding:"13px", borderRadius:11, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif" }}>
          Gerar link de pagamento
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display:"block", fontSize:12, fontWeight:600, color:B.textSec, marginBottom:5, fontFamily:"'Barlow',sans-serif" };
const inp: React.CSSProperties = { width:"100%", padding:"9px 13px", borderRadius:8, border:`1px solid ${B.border}`, background:B.dark, fontSize:13.5, color:B.textPrimary, outline:"none" };

// ─── Prices Tab ───────────────────────────────────────────────────────────────
function PricesTab() {
  const [prices, setPrices] = useState<Record<ProductId,number>>({a1:109.90, a3_sem:149.90, a3_com:229.90});
  const [saved, setSaved] = useState<Record<ProductId,boolean>>({a1:false, a3_sem:false, a3_com:false});

  const save = (id:ProductId) => {
    setSaved(s=>({...s,[id]:true}));
    setTimeout(()=>setSaved(s=>({...s,[id]:false})),2000);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ marginBottom:4 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:B.white, margin:"0 0 4px", fontFamily:"'Rajdhani',sans-serif" }}>Configurar preços</h2>
        <p style={{ fontSize:14, color:B.textSec }}>Defina o preço de venda. A comissão é calculada automaticamente.</p>
      </div>
      {PRODUCTS.map(p=>{
        const price=prices[p.id];
        const comm=Math.max(0,price-p.basePrice);
        const pct=((price-p.basePrice)/(p.publicPrice-p.basePrice))*100;
        const valid=price>=p.basePrice&&price<=p.publicPrice;
        return (
          <div key={p.id} style={{ background:B.surface, border:`1px solid ${valid?B.border:"rgba(239,68,68,0.25)"}`, borderRadius:15, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:p.color, borderRadius:"15px 0 0 15px" }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20, alignItems:"center" }}>
              {/* product info */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:36,height:36,borderRadius:9,background:p.bg,border:`1px solid ${p.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                    <div style={{ fontSize:10.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>base: {fmt(p.basePrice)}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <span style={{ padding:"2px 8px", borderRadius:5, background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:11.5, fontWeight:600 }}>Mín: {fmt(p.basePrice)}</span>
                  <span style={{ padding:"2px 8px", borderRadius:5, background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:11.5, fontWeight:600 }}>Máx: {fmt(p.publicPrice)}</span>
                </div>
              </div>

              {/* input + slider */}
              <div>
                <label style={{ ...lbl, marginBottom:9 }}>Preço de venda</label>
                <div style={{ position:"relative", marginBottom:9 }}>
                  <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:12.5, fontWeight:700, color:"#555" }}>R$</span>
                  <input type="number" step="0.01" min={p.basePrice} max={p.publicPrice} value={price}
                    onChange={e=>setPrices(pr=>({...pr,[p.id]:parseFloat(e.target.value)||p.basePrice}))}
                    style={{ ...inp, paddingLeft:32, fontWeight:700, color:valid?B.textPrimary:B.red, border:`1px solid ${valid?B.border:"rgba(239,68,68,0.4)"}` }}
                  />
                </div>
                <input type="range" min={p.basePrice} max={p.publicPrice} step="0.10" value={price}
                  onChange={e=>setPrices(pr=>({...pr,[p.id]:parseFloat(e.target.value)}))}
                  style={{ width:"100%", accentColor:p.color, cursor:"pointer" }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10.5, color:"#333", marginTop:2 }}>
                  <span>{fmt(p.basePrice)}</span><span>{fmt(p.publicPrice)}</span>
                </div>
              </div>

              {/* commission */}
              <div>
                <div style={{ background:B.dark, border:`1px solid ${valid?p.color+"20":"rgba(239,68,68,0.2)"}`, borderRadius:11, padding:"13px 15px", marginBottom:11 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>Sua comissão</div>
                  <div style={{ fontSize:26, fontWeight:700, color:valid?p.color:B.red, letterSpacing:"-0.5px", lineHeight:1, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(comm)}</div>
                  {valid && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ height:4, borderRadius:100, background:"rgba(255,255,255,0.07)" }}>
                        <div style={{ height:"100%", borderRadius:100, background:p.color, width:`${Math.max(0,Math.min(100,pct))}%`, transition:"width 0.3s" }}/>
                      </div>
                      <div style={{ fontSize:10, color:"#444", marginTop:3 }}>
                        {pct<=0?"Mínimo — preço base":pct>=99?"Máximo atingido":`${pct.toFixed(0)}% da comissão máxima`}
                      </div>
                    </div>
                  )}
                  {!valid && <div style={{ fontSize:10.5, color:B.red, marginTop:4 }}>Fora do intervalo permitido</div>}
                </div>
                <button onClick={()=>valid&&save(p.id)} disabled={!valid}
                  style={{ width:"100%", padding:"9px", borderRadius:9, background:saved[p.id]?B.green:valid?p.color:"rgba(255,255,255,0.05)", color:saved[p.id]||valid?B.black:"#333", fontWeight:700, fontSize:13.5, border:"none", cursor:valid?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"'Rajdhani',sans-serif" }}>
                  {saved[p.id]?<><Ic.Check/> Salvo!</>:"Salvar preço"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display:"flex", gap:9, alignItems:"flex-start", padding:"13px 15px", borderRadius:11, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}` }}>
        <span style={{ color:B.orange, marginTop:1, flexShrink:0 }}><Ic.Info/></span>
        <p style={{ fontSize:13, color:B.textSec, margin:0, lineHeight:1.65 }}>
          <strong style={{ color:B.white }}>Como funciona:</strong> o cliente paga diretamente para a 77 Assistech. Sua comissão é{" "}
          <code style={{ background:"rgba(255,255,255,0.07)", padding:"1px 6px", borderRadius:4, fontSize:11.5, fontFamily:"'JetBrains Mono',monospace" }}>preço_venda − preço_base</code>,
          calculada ao emitir o pedido e paga no fechamento mensal.
        </p>
      </div>
    </div>
  );
}

// ─── Links Tab ────────────────────────────────────────────────────────────────
function LinksTab() {
  const [copied, setCopied] = useState<string|null>(null);
  const TOKEN = "cnt_a3b8c1d7";
  const BASE = "https://77assistech.com.br/c";

  const copy=(id:string,url:string)=>{
    navigator.clipboard.writeText(url).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null),2000);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
      <div style={{ marginBottom:4 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:B.white, margin:"0 0 4px", fontFamily:"'Rajdhani',sans-serif" }}>Links de venda</h2>
        <p style={{ fontSize:14, color:B.textSec }}>Compartilhe com seus clientes. Cada venda é rastreada e vinculada à sua conta.</p>
      </div>
      {PRODUCTS.map(p=>{
        const url=`${BASE}/${p.id}/${TOKEN}`;
        const ok=copied===p.id;
        return (
          <div key={p.id} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:11, flexWrap:"wrap", gap:9 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:p.bg,border:`1px solid ${p.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="1.9"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{p.name}</div>
                  <div style={{ fontSize:11.5, color:B.textSec }}>Preço: {fmt(p.publicPrice)} · Comissão: {fmt(p.publicPrice-p.basePrice)}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:7 }}>
                <button onClick={()=>copy(p.id,url)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, background:ok?B.greenBg:B.orangeGlow, border:`1px solid ${ok?B.greenBorder:B.orangeBorder}`, color:ok?B.green:B.orange, fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
                  {ok?<><Ic.Check/> Copiado!</>:<><Ic.Copy/> Copiar link</>}
                </button>
                <button style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 11px", borderRadius:7, background:"rgba(255,255,255,0.04)", border:`1px solid ${B.border}`, color:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>
                  <Ic.Ext/> Abrir
                </button>
              </div>
            </div>
            <div style={{ background:B.dark, border:`1px solid ${B.border}`, borderRadius:8, padding:"8px 12px", fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#555", wordBreak:"break-all" }}>{url}</div>
          </div>
        );
      })}
      <div style={{ padding:"13px 15px", borderRadius:11, background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ color:B.amber, flexShrink:0 }}><Ic.Info/></span>
          <p style={{ fontSize:13, color:B.textSec, margin:0, lineHeight:1.65 }}>Os links são únicos e rastreáveis. Ao acessar seu link, o cliente vai direto para a página de pagamento com seu preço configurado. Compartilhe via WhatsApp, e-mail ou redes sociais.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────
function OrdersTab({ onNew }: { onNew:()=>void }) {
  const [filter, setFilter] = useState<OrderStatus|"all">("all");
  const [search, setSearch] = useState("");
  const filtered = MOCK_ORDERS.filter(o=>{
    if(filter!=="all"&&o.status!==filter) return false;
    if(search){const q=search.toLowerCase();return o.client.toLowerCase().includes(q)||o.number.includes(q);}
    return true;
  });
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:B.white, margin:"0 0 2px", fontFamily:"'Rajdhani',sans-serif" }}>Meus pedidos</h2>
          <p style={{ fontSize:13, color:B.textSec, margin:0 }}>{filtered.length} pedido{filtered.length!==1?"s":""}</p>
        </div>
        <button onClick={onNew} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 17px", borderRadius:9, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:14, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif" }}>
          <Ic.Plus/> Novo pedido
        </button>
      </div>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:13 }}>
        {([["all","Todos"]] as [string,string][]).concat(Object.entries(STATUS).map(([k,v])=>[k,v.label])).map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k as any)} style={{ padding:"5px 12px", borderRadius:7, border:`1px solid ${filter===k?B.orange:B.border}`, background:filter===k?B.orangeGlow:"transparent", color:filter===k?B.orange:B.textSec, fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ position:"relative", marginBottom:13 }}>
        <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#444" }}><Ic.Search/></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente ou número..." style={{ ...inp, paddingLeft:32, background:B.surface }}/>
      </div>
      <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:13, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:B.dark, borderBottom:`1px solid ${B.border}` }}>
                {["Pedido","Cliente","Produto","Canal","Preço venda","Comissão","Status","Data"].map(h=>(
                  <th key={h} style={{ padding:"10px 13px", fontSize:9.5, fontWeight:700, color:"#444", textAlign:"left", whiteSpace:"nowrap", textTransform:"uppercase", letterSpacing:"0.8px", fontFamily:"'JetBrains Mono',monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o,i)=>{
                const p=PRODUCTS.find(pr=>pr.id===o.productId)!;
                return (
                  <tr key={o.id} style={{ borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.03)`:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:11.5, fontWeight:700, color:B.orange, fontFamily:"'JetBrains Mono',monospace" }}>{o.number}</div>
                    </td>
                    <td style={{ padding:"11px 13px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:B.textPrimary }}>{o.client}</div>
                      <div style={{ fontSize:10.5, color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{o.document}</div>
                    </td>
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 8px", borderRadius:5, background:p.bg, color:p.color }}>{o.product}</span>
                    </td>
                    <td style={{ padding:"11px 13px" }}>
                      <span style={{ fontSize:12, color:B.textSec, fontWeight:600 }}>{o.channel==="link"?"Link":"Manual"}</span>
                    </td>
                    <td style={{ padding:"11px 13px", fontSize:13, fontWeight:700, color:B.textPrimary, whiteSpace:"nowrap", fontFamily:"'Rajdhani',sans-serif" }}>{fmt(o.salePrice)}</td>
                    <td style={{ padding:"11px 13px", whiteSpace:"nowrap" }}>
                      <span style={{ fontSize:13.5, fontWeight:800, color:o.status==="cancelled"?B.red:o.status==="issued"?B.orange:"#555", fontFamily:"'Rajdhani',sans-serif" }}>
                        {o.status==="cancelled"?"—":fmt(o.commission)}
                      </span>
                    </td>
                    <td style={{ padding:"11px 13px" }}><StatusBadge s={o.status}/></td>
                    <td style={{ padding:"11px 13px", fontSize:12.5, color:"#444", whiteSpace:"nowrap" }}>{o.date}</td>
                  </tr>
                );
              })}
              {filtered.length===0&&<tr><td colSpan={8} style={{ padding:"40px", textAlign:"center", color:"#333", fontSize:13 }}>Nenhum pedido encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardContador77() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const month = "Abril 2025";
  const monthOrders = MOCK_ORDERS.filter(o=>o.date.includes("/04/2025"));
  const issued = monthOrders.filter(o=>o.status==="issued");
  const totalComm = issued.reduce((s,o)=>s+o.commission,0);
  const totalSale = monthOrders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.salePrice,0);
  const pending = MOCK_ORDERS.filter(o=>["pending_payment","paid","processing"].includes(o.status));

  const nav = [
    {id:"dashboard" as TabId, l:"Visão geral",   ic:<Ic.Dashboard/>},
    {id:"orders"    as TabId, l:"Pedidos",        ic:<Ic.Orders/>},
    {id:"prices"    as TabId, l:"Meus preços",    ic:<Ic.Prices/>},
    {id:"links"     as TabId, l:"Links de venda", ic:<Ic.Links/>},
  ];

  const MetricCard = ({label,value,sub,color,delay=0}:{label:string;value:string;sub?:string;color:string;delay?:number}) => (
    <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, padding:"18px 20px", position:"relative", overflow:"hidden", animation:`fadeIn 0.4s ease ${delay}ms both` }}>
      <div style={{ fontSize:11.5, fontWeight:600, color:B.textSec, marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color:B.white, letterSpacing:"-0.8px", lineHeight:1, fontFamily:"'Rajdhani',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize:11.5, color:"#444", marginTop:4 }}>{sub}</div>}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${color}50,transparent)` }}/>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:B.black, fontFamily:"'Barlow',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(240,120,0,0.25);border-radius:100px}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:100px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;cursor:pointer;border:2px solid ${B.dark};box-shadow:0 1px 4px rgba(0,0,0,0.4)}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* sidebar */}
      <aside style={{ width:sidebarOpen?220:58, background:B.dark, borderRight:`1px solid ${B.border}`, display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0, position:"sticky", top:0, height:"100vh", overflow:"hidden" }}>
        <div style={{ padding:"14px 10px", borderBottom:`1px solid ${B.border}`, display:"flex", alignItems:"center" }}>
          <Logo mini={!sidebarOpen}/>
        </div>
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {nav.map(n=>{
            const active=tab===n.id;
            return (
              <button key={n.id} onClick={()=>setTab(n.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:sidebarOpen?"10px 12px":"10px", justifyContent:sidebarOpen?"flex-start":"center", borderRadius:9, border:"none", cursor:"pointer", background:active?B.orangeGlow:"transparent", color:active?B.orange:"#555", fontWeight:active?700:500, fontSize:14, transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden", fontFamily:"'Barlow',sans-serif" }}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent";}}
              >
                <span style={{ flexShrink:0 }}>{n.ic}</span>
                {sidebarOpen && <span>{n.l}</span>}
              </button>
            );
          })}
        </nav>
        {/* new order */}
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${B.border}` }}>
          <button onClick={()=>setShowNewOrder(true)} style={{ width:"100%", display:"flex", alignItems:"center", gap:7, justifyContent:sidebarOpen?"center":"center", padding:"10px 12px", borderRadius:10, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:13.5, border:"none", cursor:"pointer", fontFamily:"'Rajdhani',sans-serif" }}>
            <Ic.Plus/>{sidebarOpen&&<span>Novo pedido</span>}
          </button>
        </div>
        {/* user */}
        <div style={{ padding:"12px 10px", borderTop:`1px solid ${B.border}`, display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:B.black,flexShrink:0,fontFamily:"'Rajdhani',sans-serif" }}>JC</div>
          {sidebarOpen && (
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:700, color:B.silver, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Barlow',sans-serif" }}>João Contador</div>
              <div style={{ fontSize:10, color:"#333" }}>Parceiro · CRC-SP</div>
            </div>
          )}
          {sidebarOpen&&<button style={{ background:"none",border:"none",cursor:"pointer",color:"#333",padding:3,display:"flex",borderRadius:5 }}><Ic.Logout/></button>}
        </div>
      </aside>

      {/* main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <header style={{ background:B.dark, borderBottom:`1px solid ${B.border}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:11 }}>
            <button onClick={()=>setSidebarOpen(s=>!s)} style={{ width:30,height:30,borderRadius:7,background:"rgba(255,255,255,0.04)",border:`1px solid ${B.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555" }}>
              <Ic.Menu/>
            </button>
            <div>
              <span style={{ fontSize:15, fontWeight:700, color:B.white, letterSpacing:"0.3px", fontFamily:"'Rajdhani',sans-serif" }}>{nav.find(n=>n.id===tab)?.l}</span>
              <span style={{ fontSize:10, color:"#333", marginLeft:10, fontFamily:"'JetBrains Mono',monospace" }}>{month}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:7, alignItems:"center" }}>
            <button style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${B.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#555",position:"relative" }}>
              <Ic.Bell/>
              {pending.length>0&&<span style={{ position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:B.red,border:`2px solid ${B.dark}` }}/>}
            </button>
            <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:B.black,cursor:"pointer",fontFamily:"'Rajdhani',sans-serif" }}>JC</div>
          </div>
        </header>

        <main style={{ flex:1, padding:"20px", overflowY:"auto" }}>
          {tab==="dashboard" && (
            <div style={{ animation:"fadeIn 0.25s ease both" }}>
              <div style={{ marginBottom:22 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:B.white, margin:"0 0 4px", fontFamily:"'Rajdhani',sans-serif" }}>Olá, João! 👋</h2>
                <p style={{ fontSize:14, color:B.textSec }}>Resumo do mês de {month}.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:13, marginBottom:22 }}>
                <MetricCard label="Comissão acumulada" value={fmt(totalComm)} sub="Fechamento em 01/05" color={B.orange} delay={0}/>
                <MetricCard label="Pedidos este mês" value={String(monthOrders.length)} sub={`${issued.length} emitidos`} color={B.blue} delay={60}/>
                <MetricCard label="Volume vendido" value={fmt(totalSale)} sub="Soma dos pedidos" color={B.green} delay={120}/>
                <MetricCard label="Pedidos pendentes" value={String(pending.length)} sub="Aguardando ação" color={B.amber} delay={180}/>
              </div>

              {/* two cols */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                {/* recent orders */}
                <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, overflow:"hidden" }}>
                  <div style={{ padding:"15px 18px", borderBottom:`1px solid ${B.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:B.dark }}>
                    <h3 style={{ fontSize:14, fontWeight:700, color:B.white, margin:0, fontFamily:"'Rajdhani',sans-serif" }}>Últimos pedidos</h3>
                    <button onClick={()=>setTab("orders")} style={{ fontSize:12, fontWeight:600, color:B.orange, background:"none", border:"none", cursor:"pointer" }}>Ver todos →</button>
                  </div>
                  {MOCK_ORDERS.slice(0,5).map((o,i)=>{
                    const p=PRODUCTS.find(pr=>pr.id===o.productId)!;
                    return (
                      <div key={o.id} style={{ display:"flex", alignItems:"center", gap:11, padding:"11px 18px", borderBottom:i<4?`1px solid rgba(255,255,255,0.03)`:"none" }}>
                        <div style={{ width:32,height:32,borderRadius:8,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",color:p.color,flexShrink:0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:B.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.client}</div>
                          <div style={{ fontSize:11, color:"#444" }}>{o.product} · {o.date}</div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <StatusBadge s={o.status}/>
                          {o.status==="issued"&&<div style={{ fontSize:11, fontWeight:700, color:B.orange, marginTop:2, fontFamily:"'Rajdhani',sans-serif" }}>+{fmt(o.commission)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* commission breakdown */}
                <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:14, padding:"16px 18px" }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:B.white, margin:"0 0 16px", fontFamily:"'Rajdhani',sans-serif" }}>Comissão por produto</h3>
                  {PRODUCTS.map(p=>{
                    const pIssuedOrders=issued.filter(o=>o.productId===p.id);
                    const comm=pIssuedOrders.reduce((s,o)=>s+o.commission,0);
                    const pct=totalComm>0?(comm/totalComm)*100:0;
                    return (
                      <div key={p.id} style={{ marginBottom:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0 }}/>
                            <span style={{ fontSize:13, fontWeight:600, color:B.silver }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>{fmt(comm)}</span>
                        </div>
                        <div style={{ height:5, borderRadius:100, background:"rgba(255,255,255,0.06)" }}>
                          <div style={{ height:"100%", borderRadius:100, background:p.color, width:`${pct}%`, transition:"width 0.8s ease" }}/>
                        </div>
                        <div style={{ fontSize:10.5, color:"#333", marginTop:3 }}>{pIssuedOrders.length} pedido{pIssuedOrders.length!==1?"s":""} emitido{pIssuedOrders.length!==1?"s":""}</div>
                      </div>
                    );
                  })}
                  <div style={{ borderTop:`1px solid ${B.border}`, paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:B.textSec }}>Total do mês</span>
                    <span style={{ fontSize:20, fontWeight:700, color:B.orange, letterSpacing:"-0.5px", fontFamily:"'Rajdhani',sans-serif" }}>{fmt(totalComm)}</span>
                  </div>
                </div>
              </div>

              {/* closing notice */}
              <div style={{ display:"flex", gap:11, alignItems:"center", padding:"13px 16px", borderRadius:11, background:B.orangeGlow, border:`1px solid ${B.orangeBorder}` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.orange} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontSize:14, fontWeight:600, color:B.white, fontFamily:"'Rajdhani',sans-serif" }}>Fechamento mensal em 01/05/2025</span>
                <span style={{ fontSize:13, color:B.textSec }}>— Comissões aprovadas pagas em até 5 dias úteis.</span>
              </div>
            </div>
          )}
          {tab==="orders" && <OrdersTab onNew={()=>setShowNewOrder(true)}/>}
          {tab==="prices" && <PricesTab/>}
          {tab==="links"  && <LinksTab/>}
        </main>
      </div>

      {showNewOrder && <NewOrderModal onClose={()=>setShowNewOrder(false)}/>}
    </div>
  );
}