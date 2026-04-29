import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/app/lib/supabase/admin";

// ─── Auth helper ──────────────────────────────────────────────────────────────
function createSupabaseFromRequest(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {}, // read-only em route handlers
      },
    }
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface NovoContadorPayload {
  name:        string;
  email:       string;
  phone?:      string;
  crc:         string;
  cidade?:     string;
  estado?:     string;
  status?:     "pending" | "active";
  observacoes?:string;
}

// ─── POST /api/admin/contadores ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Verifica autenticação e papel de admin ─────────────────────────────
  const supabase = createSupabaseFromRequest(req);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  // ── 2. Parse e validação do body ──────────────────────────────────────────
  let payload: NovoContadorPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { name, email, crc, phone, cidade, estado, status = "pending", observacoes } = payload;

  // Validações obrigatórias
  const erros: string[] = [];
  if (!name?.trim())  erros.push("Nome é obrigatório");
  if (!email?.trim()) erros.push("E-mail é obrigatório");
  if (!crc?.trim())   erros.push("CRC é obrigatório");

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    erros.push("E-mail inválido");
  }

  if (!["pending", "active"].includes(status)) {
    erros.push("Status inválido");
  }

  if (erros.length > 0) {
    return NextResponse.json({ error: erros.join("; ") }, { status: 422 });
  }

  // ── 3. Verifica unicidade de e-mail e CRC (antes de inserir) ─────────────
  const db = createAdminClient();

  const { data: existente } = await db
    .from("contadores")
    .select("id, email, crc")
    .or(`email.eq.${email.trim().toLowerCase()},crc.eq.${crc.trim().toUpperCase()}`)
    .maybeSingle();

  if (existente) {
    if (existente.email === email.trim().toLowerCase()) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "CRC já cadastrado" }, { status: 409 });
  }

  // ── 4. Cria o registro na tabela contadores ───────────────────────────────
  const { data: novo, error: eInsert } = await db
    .from("contadores")
    .insert({
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      crc:         crc.trim().toUpperCase(),
      phone:       phone?.trim()   || null,
      cidade:      cidade?.trim()  || null,
      estado:      estado?.trim()  || null,
      observacoes: observacoes?.trim() || null,
      status,
    })
    .select("id, name, email, crc, status")
    .single();

  if (eInsert || !novo) {
    console.error("[admin/contadores] Erro ao inserir:", eInsert);
    return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 });
  }

  // ── 5. TODO: Enviar convite de acesso via Supabase Auth ───────────────────
  //
  // Quando implementado, este bloco deve:
  //   1. Chamar supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { role: "contador" } })
  //   2. O link gerado pelo Supabase direciona o usuário para criar sua senha
  //   3. Após o primeiro login, o middleware vincula automaticamente via user_id
  //
  // Exemplo (requer @supabase/supabase-js com service role):
  //   const { data: invited, error: eInvite } = await db.auth.admin.inviteUserByEmail(
  //     novo.email,
  //     {
  //       redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/contador`,
  //       data: { role: "contador" },
  //     }
  //   );
  //   if (eInvite) console.warn("[admin/contadores] Invite falhou:", eInvite);
  //
  // ─────────────────────────────────────────────────────────────────────────

  return NextResponse.json({ contador: novo }, { status: 201 });
}
