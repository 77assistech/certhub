"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

const B = {
  orange:"#F07800", orangeLight:"#FF9A2E",
  black:"#0F0F0F", dark:"#141414", surface:"#1E1E1E", border:"rgba(255,255,255,0.07)",
  white:"#FFFFFF", textPrimary:"#F0F0F0", textSec:"#707070",
  red:"#EF4444", redBg:"rgba(239,68,68,0.08)",
};

function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
      <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="37" stroke="#444" strokeWidth="2" fill="#181818"/>
        <line x1="52" y1="10" x2="28" y2="70" stroke={B.orange} strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 22h18l-12 36h-6l10-30H18V22z" fill="url(#ls)"/>
        <path d="M36 22h18l-12 36h-6l10-30H36V22z" fill="url(#lo)"/>
        <defs>
          <linearGradient id="ls" x1="18" y1="22" x2="28" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF"/><stop offset="1" stopColor="#666"/></linearGradient>
          <linearGradient id="lo" x1="36" y1="22" x2="46" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#FF9A2E"/><stop offset="1" stopColor="#C05E00"/></linearGradient>
        </defs>
      </svg>
      <div>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:20, color:B.white, letterSpacing:"0.5px", lineHeight:1 }}>
          <span style={{ color:B.orange }}>77 </span>ASSISTECH
        </div>
        <div style={{ fontSize:9, color:"#444", letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
          Portal de acesso
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [senha, setSenha]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setLoading(true);

    const sb = createClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // app_metadata → admin (imutável pelo usuário)
    // user_metadata → contador (definido no cadastro)
    const appRole  = data.user?.app_metadata?.role as string | undefined;
    const metaRole = data.user?.user_metadata?.role as string | undefined;

    if (appRole === "admin") {
      router.push("/admin");
    } else if (metaRole === "contador" || appRole === "contador") {
      router.push("/contador");
    } else {
      // Tenta inferir pela existência de registro em contadores
      const { data: cnt } = await sb
        .from("contadores")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      if (cnt) {
        router.push("/contador");
      } else {
        setErro("Usuário sem perfil definido. Contate o administrador.");
        await sb.auth.signOut();
        setLoading(false);
      }
    }
  }

  const inp: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:9,
    border:`1px solid ${B.border}`, background:B.dark,
    fontSize:14, color:B.textPrimary, outline:"none",
    transition:"border-color 0.2s",
  };
  const lbl: React.CSSProperties = {
    display:"block", fontSize:12, fontWeight:600,
    color:B.textSec, marginBottom:6,
  };

  return (
    <div style={{ minHeight:"100vh", background:B.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Barlow',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus{border-color:${B.orange} !important;outline:none}
      `}</style>

      <div style={{ width:"100%", maxWidth:400 }}>
        <Logo/>

        <div style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:18, padding:"28px 26px", boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
          <div style={{ marginBottom:22 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:B.white, margin:"0 0 4px", fontFamily:"'Rajdhani',sans-serif" }}>Entrar</h1>
            <p style={{ fontSize:13.5, color:B.textSec, margin:0 }}>Acesse o portal com seu e-mail e senha.</p>
          </div>

          <form onSubmit={entrar} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={lbl}>E-mail</label>
              <input
                type="email" required
                value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={inp}
              />
            </div>

            <div>
              <label style={lbl}>Senha</label>
              <input
                type="password" required
                value={senha} onChange={e=>setSenha(e.target.value)}
                placeholder="••••••••"
                style={inp}
              />
            </div>

            {erro && (
              <div style={{ padding:"10px 13px", borderRadius:8, background:B.redBg, border:"1px solid rgba(239,68,68,0.2)", color:B.red, fontSize:13 }}>
                {erro}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width:"100%", padding:"12px", borderRadius:10, background:`linear-gradient(135deg,${B.orange},${B.orangeLight})`, color:B.black, fontWeight:800, fontSize:15, border:"none", cursor:loading?"not-allowed":"pointer", fontFamily:"'Rajdhani',sans-serif", opacity:loading?0.7:1, marginTop:4 }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:"#333", marginTop:20 }}>
          77 Assistech · Plataforma de Certificados Digitais
        </p>
      </div>
    </div>
  );
}
