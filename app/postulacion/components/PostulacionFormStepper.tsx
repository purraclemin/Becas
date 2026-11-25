"use client"

import { LayoutDashboard, ClipboardList, Upload, Eye } from "lucide-react"

// Definición de pasos constante sincronizada con el flujo actual de 4 pasos
export const PASOS = [
  { id: 1, titulo: "Detalles Beca", icon: LayoutDashboard },
  { id: 2, titulo: "Estudio Social", icon: ClipboardList },
  { id: 3, titulo: "Documentación", icon: Upload },
  { id: 4, titulo: "Resumen y Envío", icon: Eye },
]

export const TABS_ENCUESTA = ["familia", "laboral", "ingresos", "hogar", "salud"]

interface PostulacionFormStepperProps {
  pasoActual: number
  activeEncuestaTab: string
}

/**
 * Componente modular auxiliar sincronizado con los pasos activos
 * y las sub-pestañas de la encuesta socioeconómica.
 */
export function PostulacionFormStepper({
  pasoActual,
  activeEncuestaTab
}: PostulacionFormStepperProps) {
  void pasoActual;
  void activeEncuestaTab;
  return null
}