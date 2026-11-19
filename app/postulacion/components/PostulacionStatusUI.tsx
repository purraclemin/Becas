"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquareQuote,
  ArrowRight
} from "lucide-react"
import type { Student } from "@/lib/TablaStudient"

export interface StatusStudentData extends Partial<Student> {
  observaciones_beca?: string | null;
}

/**
 * TARJETA: ACCESO RESTRINGIDO
 * Se muestra cuando no hay una sesión activa.
 */
export function RestrictedAccessCard() {
  return (
    <div className="flex w-full items-center justify-center bg-[#f8fafc] p-4 sm:p-6 animate-in fade-in duration-500">
      <Card className="max-w-md w-full text-center p-6 sm:p-8 border border-slate-200/80 shadow-sm rounded-3xl bg-white">
        <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl lg:text-lg font-black text-[#1e3a5f] uppercase tracking-tight mb-2">
          Acceso Restringido
        </h2>
        <p className="text-sm lg:text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Debe iniciar sesión en el portal académico para acceder al sistema de postulación de beneficios.
        </p>
        <Link href="/login" className="block">
          <Button className="w-full h-12 lg:h-9 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-black uppercase text-sm lg:text-xs tracking-wider rounded-xl transition-all">
            Ir al Inicio de Sesión
          </Button>
        </Link>
      </Card>
    </div>
  )
}

/**
 * TARJETA: ESTADO DE SOLICITUD
 * Se muestra cuando ya existe un proceso, veto o beneficio activo.
 */
export function StatusCard({
  estatus,
  studentRaw
}: {
  estatus: string;
  studentRaw: StatusStudentData | null;
}) {
  const esRechazada = estatus === "Rechazada" || studentRaw?.beca_perdida === 1;
  const esAprobada = !esRechazada && (estatus === "Aprobada" || studentRaw?.ha_tenido_beca === 1);
  const observaciones = studentRaw?.observaciones_beca || studentRaw?.motivo_exclusion || null;

  const tituloEstado = esRechazada
    ? "Solicitud Denegada"
    : esAprobada
      ? "Beneficio Aprobado"
      : "Solicitud en Proceso";

  const descripcionEstado = esRechazada
    ? "Su postulación no ha sido aprobada por el comité evaluador en esta oportunidad."
    : esAprobada
      ? "Actualmente cuenta con un beneficio estudiantil aprobado y activo en el sistema."
      : "Actualmente su solicitud se encuentra en fase de validación por el departamento de Bienestar Estudiantil.";

  return (
    <div className="flex w-full items-center justify-center bg-[#f8fafc] p-4 sm:p-6 animate-in fade-in duration-500">
      <Card className="max-w-lg w-full p-6 sm:p-8 border border-slate-200/80 shadow-sm rounded-3xl bg-white relative overflow-hidden">
        <div className="text-center">
          <div
            className={`h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border ${
              esRechazada
                ? "bg-rose-50 border-rose-100"
                : esAprobada
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-[#d4a843]/10 border-[#d4a843]/30"
            }`}
          >
            {esRechazada ? (
              <XCircle className="h-10 w-10 text-rose-500" />
            ) : esAprobada ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : (
              <AlertCircle className="h-10 w-10 text-[#d4a843]" />
            )}
          </div>

          <h1 className="text-2xl lg:text-xl font-black text-[#1e3a5f] uppercase tracking-tight mb-3">
            {tituloEstado}
          </h1>

          <div className="space-y-4 mb-6">
            <p className="text-sm lg:text-xs text-slate-500 font-medium leading-relaxed">
              {descripcionEstado}
            </p>

            {observaciones && (
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-slate-200/80 text-left">
                <div className="flex items-center gap-2 mb-1.5 text-[#1e3a5f]">
                  <MessageSquareQuote className="h-4 w-4 text-[#d4a843]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Observaciones</span>
                </div>
                <p className="text-xs lg:text-[11px] font-semibold italic text-slate-600">
                  &ldquo;{observaciones}&rdquo;
                </p>
              </div>
            )}
          </div>

          <Link href="/perfil" className="block">
            <Button className="w-full h-12 lg:h-9 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-black uppercase text-sm lg:text-xs tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all">
              Volver a mi Perfil <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}