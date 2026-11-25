"use client"

import React from "react"
import { User, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

// 1. Hook de Lógica Central y Tipos
import { usePostulacionForm, TOTAL_PASOS } from "../hooks/usePostulacionForm"
import type { MateriaPensum, PostulacionUser } from "../types"

// 2. Componentes UI Modulares
import { PostulacionSidebar, PASOS } from "./PostulacionSidebar"
import { PostulacionHeader } from "./PostulacionHeader"
import { PostulacionFooter } from "./PostulacionFooter"

// 3. Componentes de Pasos (Steps)
import { StepDetalles } from "./StepDetalles"
import { StepEncuesta } from "./StepEncuesta"
import { StepArchivos } from "./StepArchivos"
import { StepResumen } from "./StepResumen"

interface PostulacionContainerProps {
  user: PostulacionUser;
  materiasDelPensum?: MateriaPensum[];
  trimestreActual?: string;
  periodoIngreso?: string;
}

const resolverIndiceGlobal = (
  user: PostulacionUser,
  promedioFallback: string
): string => {
  const candidato =
    user.indice_global ??
    user.promedio_notas ??
    promedioFallback ??
    "0.00";
  const numero = Number(candidato);
  if (Number.isFinite(numero) && numero > 0) {
    return numero.toFixed(2);
  }
  const fallbackNum = Number(promedioFallback);
  return Number.isFinite(fallbackNum) ? fallbackNum.toFixed(2) : "0.00";
};

export function PostulacionContainer({
  user,
  materiasDelPensum = [],
  trimestreActual = "1",
  periodoIngreso
}: PostulacionContainerProps) {

  // Orquestación: Conectamos la interfaz con la lógica de negocio
  const formHook = usePostulacionForm({ user, trimestreActual });
  const {
    formRef,
    pasoActual, isPending, promedio, detallesValidos, encuestaValida, archivosValidos,
    tipoBecaSeleccionada, formData, activeEncuestaTab, progreso,
    setDetallesValidos, setEncuestaValida, setArchivosValidos, setTipoBecaSeleccionada, setActiveEncuestaTab,
    setPersonalValido, setUniValido, setFamiliaValido, setLaboralValido, setIngresosValido, setHogarValido, setSaludValido,
    handleSiguiente, handleAnterior, handleSubmit
  } = formHook;

  const tituloPaso = PASOS.find(p => p.id === pasoActual)?.titulo || "Postulación";
  const indiceGlobalDisplay = resolverIndiceGlobal(user, promedio);
  const trimestreOculto = String(user?.semestre ?? trimestreActual ?? "1");

  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 lg:h-screen lg:overflow-hidden bg-white selection:bg-[#d4a843]/30">

      {/* 1. SIDEBAR (Navegación Lateral/Superior) */}
      <PostulacionSidebar pasoActual={pasoActual} progreso={progreso} />

      {/* 2. ÁREA DE TRABAJO PRINCIPAL (Viewport fijo en PC para mantener el footer siempre visible) */}
      <section className="flex-1 flex flex-col min-w-0 lg:min-h-0 lg:h-full bg-[#f8fafc] relative">

        {/* Cabecera del Formulario (Índice Global del Estudiante) */}
        <PostulacionHeader
          tituloPaso={tituloPaso}
          periodoIngreso={periodoIngreso}
          promedio={indiceGlobalDisplay}
          etiquetaPromedio="Índice Global"
        />

        {/* Barra de Información del Estudiante */}
        {user && (
          <div className="bg-[#1e3a5f]/5 px-4 sm:px-6 py-2 border-b border-[#1e3a5f]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <p className="text-xs font-bold text-[#1e3a5f] truncate max-w-[200px] sm:max-w-xs">
                {user.nombre} {user.apellido}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#d4a843]" />
              <p className="text-xs font-bold text-[#1e3a5f] truncate max-w-[200px] sm:max-w-xs">
                {user.email || user.correo || "Sin correo"}
              </p>
            </div>
          </div>
        )}

        {/* 3. CONTENEDOR CENTRAL DE PASOS */}
        <form
          ref={formRef}
          id="form-postulacion"
          noValidate
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 flex flex-col min-h-0 bg-white lg:overflow-hidden"
        >
          {/* Datos académicos internos preservados en inputs ocultos (gestionados en /perfil) */}
          <input type="hidden" name="trimestre_seleccionado" value={trimestreOculto} />
          {materiasDelPensum.map((materia, idx) => {
            const materiaConNota = materia as MateriaPensum & { nota?: number | string };
            const codigo = materia.codigo_materia || materia.codigo || "";
            const nombre = materia.nombre_materia || materia.nombre || "";
            const notaVal = materiaConNota.nota !== undefined && materiaConNota.nota !== null
              ? String(materiaConNota.nota)
              : "0.00";
            return (
              <React.Fragment key={`hidden-mat-${materia.id ?? (codigo || idx)}`}>
                <input type="hidden" name="materias_codigos[]" value={codigo} />
                <input type="hidden" name="materias_nombres[]" value={nombre} />
                <input type="hidden" name="materias_notas[]" value={notaVal} />
              </React.Fragment>
            );
          })}

          <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 lg:px-6 lg:py-4 lg:overflow-y-auto">

            <div className={cn("flex-1 flex-col min-h-0", pasoActual === 1 ? "flex" : "hidden")}>
              <StepDetalles
                disabled={isPending}
                user={formData}
                onTipoBecaChange={setTipoBecaSeleccionada}
                tipoBecaSeleccionada={tipoBecaSeleccionada}
                promedio={promedio}
                onValidationChange={setDetallesValidos}
              />
            </div>

            <div className={cn("flex-1 flex-col min-h-0", pasoActual === 2 ? "flex" : "hidden")}>
              <StepEncuesta
                disabled={isPending}
                user={formData}
                activeTab={activeEncuestaTab}
                onTabChange={setActiveEncuestaTab}
                onValidationChange={setEncuestaValida}
                onPersonalValidationChange={setPersonalValido}
                onUniValidationChange={setUniValido}
                onFamiliaValidationChange={setFamiliaValido}
                onLaboralValidationChange={setLaboralValido}
                onIngresosValidationChange={setIngresosValido}
                onHogareValidationChange={setHogarValido}
                onSaludValidationChange={setSaludValido}
              />
            </div>

            <div className={cn("flex-1 flex-col min-h-0", pasoActual === 3 ? "flex" : "hidden")}>
              <StepArchivos
                disabled={isPending}
                tipoBeca={tipoBecaSeleccionada}
                semestre={user?.semestre || trimestreActual}
                onValidationChange={setArchivosValidos}
              />
            </div>

            <div className={cn("flex-1 flex-col min-h-0", pasoActual === 4 ? "flex" : "hidden")}>
              <StepResumen
                user={formData}
                promedio={promedio}
                trimestre={trimestreActual}
                tipoBeca={tipoBecaSeleccionada}
              />
            </div>
          </div>
        </form>

        {/* 4. FOOTER SIEMPRE VISIBLE EN PANTALLA */}
        <PostulacionFooter
          pasoActual={pasoActual}
          totalPasos={TOTAL_PASOS}
          activeEncuestaTab={activeEncuestaTab}
          isPending={isPending}
          materiasValidas={true}
          detallesValidos={detallesValidos}
          encuestaValida={encuestaValida}
          archivosValidos={archivosValidos}
          handleAnterior={handleAnterior}
          handleSiguiente={handleSiguiente}
          handleSubmit={handleSubmit}
        />
      </section>
    </div>
  )
}