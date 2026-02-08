// middleware.ts (Ubicación: Raíz del proyecto)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Función principal del Middleware que se ejecuta antes de cargar cualquier ruta.
 * Controla el acceso basado en cookies de sesión y roles.
 */
export default function middleware(request: NextRequest) {
  // 1. Extraemos las cookies del navegador
  const session = request.cookies.get('session_token')?.value
  const role = request.cookies.get('user_role')?.value

  const { pathname } = request.nextUrl

  // 2. REGLA PARA ADMINISTRADORES
  // Protege todas las rutas que comiencen con /admin (Reportes, Dashboard, Estudiantes, etc.)
  if (pathname.startsWith('/admin')) {
    // Si no hay sesión iniciada O el rol no es 'admin', rebota al login
    if (!session || role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 3. REGLA PARA ESTUDIANTES
  // Protege la ruta de carga de solicitud
  if (pathname.startsWith('/Solicitud')) {
    // Si no hay sesión (sin importar el rol), rebota al login
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 4. EVITAR QUE USUARIOS LOGUEADOS ENTREN AL LOGIN/REGISTRO
  // Si ya tiene sesión, no debería poder volver a loguearse sin cerrar sesión
  if ((pathname === '/login' || pathname === '/registro') && session) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/Solicitud', request.url))
    }
  }

  // Si todo está bien, permite que la petición continúe
  return NextResponse.next()
}

/**
 * El 'matcher' define qué rutas debe vigilar el Middleware.
 * Usamos :path* para incluir todas las subcarpetas de admin.
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/Solicitud/:path*',
    '/login',
    '/registro/:path'
  ],
}