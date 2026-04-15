"use client";

import { useState } from "react";
import { AssinaturasTab } from "./assinaturas-tab";
import { ComissoesTab }   from "./comissoes-tab";
import { ParceirosTab }   from "./parceiros-tab";
import { PedidosTab }     from "./pedidos-tab";

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = {
  orange: "#F07800", orangeLight: "#FF9A2E", orangeGlow: "rgba(240,120,0,0.12)", orangeBorder: "rgba(240,120,0,0.28)",
  black: "#0F0F0F", dark: "#141414", surface: "#1E1E1E", surfaceRaised: "#252525", border: "rgba(255,255,255,0.07)",
  white: "#FFFFFF", textSec: "#808080",
  green: "#22C55E", red: "#EF4444",
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: compact ? 0 : 10 }}>
      <svg width={compact ? 28 : 34} height={compact ? 28 : 34} viewBox="0 0 80 80" fill="none">
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
  Orders:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Subs:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Comm:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Partners:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Menu:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Logout:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── Tipos de tab ─────────────────────────────────────────────────────────────
type TabId = "orders" | "commissions" | "partners" | "assinaturas";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id:"orders",      label:"Pedidos",    icon:<Ic.Orders/> },
  { id:"commissions", label:"Comissões",  icon:<Ic.Comm/> },
  { id:"partners",    label:"Parceiros",  icon:<Ic.Partners/> },
  { id:"assinaturas", label:"Assinaturas",icon:<Ic.Subs/> },
];

// ─── Painel Admin ─────────────────────────────────────────────────────────────
export default function AdminPanel77() {
  const [tab, setTab]               = useState<TabId>("orders");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function sair() {
    const { createClient } = await import("@/app/lib/supabase/client");
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

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

      {/* ── Sidebar ── */}
      <aside style={{ width:sidebarOpen?220:58, background:B.dark, borderRight:`1px solid ${B.border}`, display:"flex", flexDirection:"column", transition:"width 0.22s ease", flexShrink:0, position:"sticky", top:0, height:"100vh", overflow:"hidden" }}>

        {/* logo */}
        <div style={{ padding:"15px 10px", borderBottom:`1px solid ${B.border}`, display:"flex", alignItems:"center" }}>
          <Logo compact={!sidebarOpen}/>
        </div>

        {/* nav */}
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_ITEMS.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:sidebarOpen?"10px 12px":"10px", justifyContent:sidebarOpen?"flex-start":"center", borderRadius:9, border:"none", cursor:"pointer", background:active?B.orangeGlow:"transparent", color:active?B.orange:"#555", fontWeight:active?700:500, fontSize:14, transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden", fontFamily:"'Barlow',sans-serif" }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ flexShrink:0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* usuário + sair */}
        <div style={{ padding:"12px 10px", borderTop:`1px solid ${B.border}`, display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:B.black, flexShrink:0, fontFamily:"'Rajdhani',sans-serif" }}>AD</div>
          {sidebarOpen && (
            <>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#555" }}>Admin</div>
                <div style={{ fontSize:10, color:"#333" }}>77 Assistech</div>
              </div>
              <button onClick={sair}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#333", padding:4, display:"flex", borderRadius:5, flexShrink:0 }}
                title="Sair">
                <Ic.Logout/>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Área principal ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* topbar */}
        <header style={{ background:B.dark, borderBottom:`1px solid ${B.border}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => setSidebarOpen(s => !s)}
              style={{ width:30, height:30, borderRadius:7, background:"rgba(255,255,255,0.05)", border:`1px solid ${B.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#555" }}>
              <Ic.Menu/>
            </button>
            <span style={{ fontSize:15, fontWeight:700, color:B.white, letterSpacing:"0.3px", fontFamily:"'Rajdhani',sans-serif" }}>
              {NAV_ITEMS.find(n => n.id === tab)?.label}
            </span>
          </div>
        </header>

        {/* conteúdo da tab */}
        <main style={{ flex:1, padding:"18px 20px", overflowY:"auto", animation:"fadeIn 0.2s ease both" }}>
          {tab === "orders"      && <PedidosTab/>}
          {tab === "commissions" && <ComissoesTab/>}
          {tab === "partners"    && <ParceirosTab/>}
          {tab === "assinaturas" && <AssinaturasTab/>}
        </main>
      </div>
    </div>
  );
}
