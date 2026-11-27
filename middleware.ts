import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLES_ADMINISTRATIVOS: ReadonlyArray<string> = ['admin', 'secretaria']

/**
 * Rutas permitidas exclusivamente para el rol de Secretaría General.
 */
const RUTAS_PERMITIDAS_SECRETARIA: ReadonlyArray<string> = [
  '/admin/validarBeca',
  '/admin/estudiantes',
  '/admin/reportes',
]

function esRutaPermitidaSecretaria(pathname: string): boolean {
  return RUTAS_PERMITIDAS_SECRETARIA.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  )
}

/**
 * MIDDLEWARE DE CONTROL DE ACCESO - UNIMAR 2026
 * Gestiona la seguridad perimetral y segregación de roles de la plataforma.
 */
export default function middleware(request: NextRequest) {
  const session = request.cookies.get('session_token')?.value
  const role = request.cookies.get('user_role')?.value
  const { pathname } = request.nextUrl

  // --- 1. ZONA ADMINISTRATIVA (/admin/...) ---
  // Permite acceso a Coordinación ('admin') y Secretaría General ('secretaria')
  if (pathname.startsWith('/admin')) {
    if (!session || !role || !ROLES_ADMINISTRATIVOS.includes(role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Restricción perimetral exclusiva para Secretaría General
    if (role === 'secretaria' && !esRutaPermitidaSecretaria(pathname)) {
      return NextResponse.redirect(new URL('/admin/validarBeca', request.url))
    }
  }

  // --- 2. ZONA DE USUARIO AUTENTICADO (/postulacion) ---
  // Solo accesible si existe una sesión activa (independiente del rol)
  if (pathname.startsWith('/postulacion')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // --- 2.5 MÓDULO DE REGISTRO OCULTO ---
  // Redirige cualquier acceso directo por URL a /registro hacia /login sin eliminar archivos
  if (pathname === '/registro' || pathname.startsWith('/registro/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // --- 3. GESTIÓN DE PÁGINAS PÚBLICAS (Login) ---
  // Si el usuario ya está logueado, lo redirigimos a su área correspondiente
  const isPublicAuthPage = pathname === '/login'

  if (isPublicAuthPage && session) {
    const homeRedirect =
      role === 'admin'
        ? '/admin/dashboard'
        : role === 'secretaria'
          ? '/admin/validarBeca'
          : '/postulacion'

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
    '/admin/:path*',       // Cubre la zona administrativa y segrega Coordinación vs Secretaría
    '/postulacion/:path*', // Protege la página de solicitudes y sus subrutas
    '/login',
    '/registro',
    '/registro/:path*',
  ],
}