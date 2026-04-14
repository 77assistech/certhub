import { NextResponse, type NextRequest } from "next/server";

// Auth desabilitado temporariamente — será ativado na etapa de autenticação
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/contador/:path*"],
};
