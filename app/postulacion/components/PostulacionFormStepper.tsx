"use client"

import React from "react"
import { BookOpen, LayoutDashboard, ClipboardList, Upload, Eye } from "lucide-react"

// Definición de pasos constante para mantener la consistencia
export const PASOS = [
  { id: 1, titulo: "Carga Académica", icon: BookOpen },
  { id: 2, titulo: "Detalles Beca", icon: LayoutDashboard },
  { id: 3, titulo: "Estudio Social", icon: ClipboardList },
  { id: 4, titulo: "Documentación2", icon: Upload },
  { id: 5, titulo: "Resumen y Envío", icon: Eye },
]

export const TABS_ENCUESTA = ["personal", "uni", "familia", "laboral", "ingresos", "hogar", "salud"]

interface PostulacionFormStepperProps {
  pasoActual: number
  activeEncuestaTab: string
  // La lógica de estado es manejada por el contenedor padre
}

/**
 * Componente modular encargado de la lógica de navegación entre los pasos 
 * del formulario y las sub-pestañas de la encuesta socioeconómica.
 */
export function PostulacionFormStepper({ 
  pasoActual, 
  activeEncuestaTab 
}: PostulacionFormStepperProps) {
  
  // Este componente actúa como un auxiliar para determinar el estado de navegación
  // y es utilizado por el PostulacionContainer para renderizar la vista correcta.
  
  return null // Lógica funcional, sin renderizado visual directo (se delega al contenedor)
}