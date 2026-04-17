import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Atualiza sessão (obrigatório para SSR com Supabase)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redireciona para /login se não autenticado
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Lê role do app_metadata (imutável pelo usuário — seguro para roteamento)
  const appRole  = user.app_metadata?.role as string | undefined;
  // Fallback: user_metadata para contadores (definido no cadastro, não é vetor de escalada)
  const metaRole = user.user_metadata?.role as string | undefined;
  const isAdmin  = appRole === "admin";
  const isContador = !isAdmin && (metaRole === "contador" || appRole === "contador");

  // Admin tentando acessar /contador → bloqueia
  if (isAdmin && pathname.startsWith("/contador")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Contador tentando acessar /admin → bloqueia
  if (isContador && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/contador";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/contador/:path*"],
};
