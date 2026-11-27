"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, X, LogIn } from "lucide-react"
import { getSession } from "@/lib/ActionsSession"
import {
  verificarEstadoLigeroEstudiante,
  type EstadoLigeroEstudianteResponse,
} from "@/lib/ActionsStudent"
import { UserActions, type UserActionData } from "./UserActions"
import { NavMenu } from "./NavMenu"

type NavbarSession = Awaited<ReturnType<typeof getSession>>

interface NavbarProps {
  initialUser?: NavbarSession
}

const INTERVALO_POLLING_NAVBAR_MS = 4000
const EVENTO_ESTATUS_ESTUDIANTE = "unimar:estudiante-estatus-actualizado"

let cachedSession: NavbarSession | null = null
let hasResolvedSession = false

function isLoggedSession(session: NavbarSession | null): boolean {
  return Boolean(
    session &&
      typeof session === "object" &&
      "isLoggedIn" in session &&
      session.isLoggedIn
  )
}

function isStudentSession(session: NavbarSession | null): boolean {
  return Boolean(
    isLoggedSession(session) &&
      session &&
      "role" in session &&
      session.role === "estudiante"
  )
}

function fusionarEstadoEstudianteEnSesion(
  prev: NavbarSession | null,
  estado: EstadoLigeroEstudianteResponse
): { cambiado: boolean; siguiente: NavbarSession | null } {
  if (!prev || !isStudentSession(prev)) {
    return { cambiado: false, siguiente: prev }
  }

  const prevRecord = prev as Record<string, unknown>
  const prevEstatus = String(prevRecord.estatus ?? "ninguna").trim()
  const prevSemestre = Number(prevRecord.semestre ?? prevRecord.trimestre ?? 0)
  const prevDepto = String(prevRecord.departamentoAsignado ?? "").trim()
  const prevObs = String(prevRecord.observacionesAdmin ?? "").trim()
  const prevPerdida = Boolean(prevRecord.becaPerdida)

  const nextEstatus = String(estado.estatus ?? "ninguna").trim()
  const nextSemestre = Number(estado.semestre ?? prevSemestre)
  const nextDepto = String(estado.departamentoAsignado ?? "").trim()
  const nextObs = String(estado.observacionesAdmin ?? "").trim()
  const nextPerdida = Boolean(estado.becaPerdida)

  const cambiado =
    prevEstatus !== nextEstatus ||
    prevSemestre !== nextSemestre ||
    prevDepto !== nextDepto ||
    prevObs !== nextObs ||
    prevPerdida !== nextPerdida

  if (!cambiado) {
    return { cambiado: false, siguiente: prev }
  }

  const puedePostular =
    !nextPerdida &&
    !estado.esEgresado &&
    (nextEstatus === "ninguna" || nextEstatus === "Finalizada")

  const siguiente = {
    ...prev,
    estatus: nextEstatus,
    estatusBeca: nextEstatus,
    semestre: nextSemestre,
    trimestre: nextSemestre,
    esEgresado: estado.esEgresado,
    becaPerdida: nextPerdida,
    puedePostular,
    departamentoAsignado: estado.departamentoAsignado,
    observacionesAdmin: estado.observacionesAdmin,
    tipoBeca: estado.tipoBeca,
  } as NavbarSession

  return { cambiado: true, siguiente }
}

export function Navbar({ initialUser }: NavbarProps = {}) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<NavbarSession | null>(() => {
    if (initialUser !== undefined) {
      cachedSession = initialUser
      hasResolvedSession = true
      return initialUser
    }
    return hasResolvedSession ? cachedSession : null
  })
  const [loading, setLoading] = useState<boolean>(() => {
    if (initialUser !== undefined) return false
    return !hasResolvedSession
  })

  const userRef = useRef<NavbarSession | null>(user)
  const pollingInFlightRef = useRef<boolean>(false)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (initialUser !== undefined) {
      cachedSession = initialUser
      hasResolvedSession = true
      setUser(initialUser)
      setLoading(false)
    }
  }, [initialUser])

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        const sessionData = await getSession()
        if (!isMounted) return

        const prevSerialized = JSON.stringify(cachedSession)
        const nextSerialized = JSON.stringify(sessionData)

        cachedSession = sessionData
        hasResolvedSession = true

        if (prevSerialized !== nextSerialized) {
          setUser(sessionData)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [])

  const esEstudianteAutenticado = isStudentSession(user)

  // Sincronización en tiempo real del estatus del estudiante en el Navbar / NavMenu (escritorio y móvil)
  useEffect(() => {
    if (!esEstudianteAutenticado) return

    let desmontado = false

    const aplicarActualizacion = (
      estado: EstadoLigeroEstudianteResponse,
      dispararRefresh: boolean
    ) => {
      if (desmontado || !estado.ok) return
      const { cambiado, siguiente } = fusionarEstadoEstudianteEnSesion(
        userRef.current,
        estado
      )
      if (cambiado && siguiente) {
        cachedSession = siguiente
        userRef.current = siguiente
        setUser(siguiente)
        if (dispararRefresh) {
          router.refresh()
        }
      }
    }

    const verificarEstatusNavbar = async () => {
      if (desmontado || pollingInFlightRef.current) return
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }

      pollingInFlightRef.current = true
      try {
        const res = await verificarEstadoLigeroEstudiante()
        aplicarActualizacion(res, true)
      } catch {
        // Reintentará silenciosamente en el siguiente intervalo
      } finally {
        pollingInFlightRef.current = false
      }
    }

    const timer = setInterval(() => {
      void verificarEstatusNavbar()
    }, INTERVALO_POLLING_NAVBAR_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verificarEstatusNavbar()
      }
    }

    const handleFocus = () => {
      void verificarEstatusNavbar()
    }

    const handleCustomEvent = (event: Event) => {
      const customEvt = event as CustomEvent<EstadoLigeroEstudianteResponse>
      if (customEvt.detail && customEvt.detail.ok) {
        aplicarActualizacion(customEvt.detail, false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener(EVENTO_ESTATUS_ESTUDIANTE, handleCustomEvent)

    return () => {
      desmontado = true
      clearInterval(timer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener(EVENTO_ESTATUS_ESTUDIANTE, handleCustomEvent)
    }
  }, [esEstudianteAutenticado, router])

  const isAuthenticated = isLoggedSession(user)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-sm w-full bg-white">
      {/* Barra Principal (Logo + Menú Integrado + Acciones) */}
      <div className="relative z-20 w-full border-b border-[#e2e8f0]">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-3">
          {/* 1. Izquierda: Botón Hamburguesa (Móvil) + Logotipo Institucional */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-[#1e3a5f] hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-36 h-12 sm:w-56 sm:h-16 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logounimar2.png"
                  alt="Logo UNIMAR"
                  width={292}
                  height={100}
                  priority
                  unoptimized
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <span className="block text-sm sm:text-lg font-extrabold tracking-wide text-[#1e3a5f] font-serif leading-none">
                  Gestión de Becas
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Centro: Menú de Navegación Integrado (Escritorio) */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <NavMenu
              mobileOpen={false}
              setMobileOpen={setMobileOpen}
              user={user as Record<string, unknown> | null}
            />
          </div>

          {/* 3. Derecha: Bloque de Acciones y Sesión */}
          <div className="flex items-center gap-3 shrink-0">
            {!loading && !isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1 rounded-md border border-[#1e3a5f] px-3 py-1.5 text-xs font-bold text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors"
                >
                  <LogIn className="h-4 w-4" /> <span>Entrar</span>
                </Link>
              </div>
            )}

            <div className="relative z-30">
              <UserActions
                user={user as UserActionData | null}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Compacto para Móviles */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-md border-b border-[#e2e8f0] transition-all duration-300 origin-top ${
          mobileOpen
            ? "scale-y-100 opacity-100"
            : "scale-y-0 opacity-0 h-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col w-full">
          <NavMenu
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user as Record<string, unknown> | null}
          />
        </div>
      </div>
    </header>
  )
}
