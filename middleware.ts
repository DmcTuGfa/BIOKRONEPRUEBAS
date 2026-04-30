import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

const PUBLIC_PATHS = [
  "/",
  "/tienda",
  "/contacto",
  "/nosotros",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  // Auth API — estas rutas verifican la sesión internamente
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",          // ← FALTABA: el middleware lo bloqueaba antes de que llegara a la ruta
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  // Webhooks y productos públicos
  "/api/webhooks/stripe",
  "/api/products",
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permitir paths públicos y archivos estáticos
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("bk_session")?.value

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const session = await verifyToken(token)
  if (!session) {
    // Token inválido o expirado — limpiar cookie y redirigir
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 })
      res.cookies.delete("bk_session")
      return res
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", pathname)
    const res = NextResponse.redirect(url)
    res.cookies.delete("bk_session")
    return res
  }

  // Rutas solo para ADMIN
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (session.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Inyectar info del usuario en headers para server components
  const res = NextResponse.next()
  res.headers.set("x-user-id", session.userId)
  res.headers.set("x-user-role", session.role)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
