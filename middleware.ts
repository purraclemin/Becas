import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * MIDDLEWARE DE CONTROL DE ACCESO - UNIMAR 2026
 * Gestiona la seguridad perimetral de la plataforma.
 */
export default function middleware(request: NextRequest) {
  const session = request.cookies.get('session_token')?.value
  const role = request.cookies.get('user_role')?.value
  const { pathname } = request.nextUrl

  // --- 1. ZONA ADMINISTRATIVA (/admin/...) ---
  // Protege los 8 archivos y cualquier subcarpeta dentro de admin
  if (pathname.startsWith('/admin')) {
    if (!session || role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // --- 2. ZONA DE USUARIO AUTENTICADO (/Solicitud) ---
  // Solo accesible si existe una sesión activa (independiente del rol)
  if (pathname.startsWith('/Solicitud')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // --- 3. GESTIÓN DE PÁGINAS PÚBLICAS (Login/Registro) ---
  // Si el usuario ya está logueado, lo redirigimos a su área correspondiente
  const isPublicAuthPage = pathname === '/login' || pathname.startsWith('/registro')
  
  if (isPublicAuthPage && session) {
    const homeRedirect = role === 'admin' ? '/admin/dashboard' : '/Solicitud'
    return NextResponse.redirect(new URL(homeRedirect, request.url))
  }

  return NextResponse.next()
}

/**
 * CONFIGURACIÓN DEL MATCHER
 * Define qué rutas activan la vigilancia del Middleware.
 */
export const config = {
  matcher: [
    '/admin/:path*',    // Cubre tus 8 archivos y más
    '/Solicitud/:path*', // Protege la página de solicitudes y sus subrutas
    '/login',
    '/registro/:path*',
  ],
}