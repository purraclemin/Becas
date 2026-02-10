"use client"

import React from "react"
import { Step1Personal } from "./Step1Personal"
import { Step2Academic } from "./Step2Academic"
import { Step3Security } from "./Step3Security"

/**
 * Propiedades que recibe el componente desde el formulario principal
 */
interface StepContentProps {
  step: number
  form: any
  updateField: (field: string, value: string | boolean) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirm: boolean
  setShowConfirm: (show: boolean) => void
}

/**
 * El componente StepContent se encarga de realizar el renderizado condicional.
 * Recibe todas las props y las reparte (spread) a los sub-componentes.
 */
export function StepContent(props: StepContentProps) {
  const { step } = props;

  switch (step) {
    case 1:
      // Paso de Datos Personales (Nombre, Apellido, Cédula, Sexo, Fecha Nac, Municipio, Teléfono, Email)
      // {...props} envía automáticamente el objeto 'form' actualizado
      return <Step1Personal {...props} />;
    
    case 2:
      // Paso de Datos Académicos (Carrera y Trimestre)
      return <Step2Academic {...props} />;
    
    case 3:
      // Paso de Seguridad (Contraseña y Términos)
      return <Step3Security {...props} />;
    
    default:
      // En caso de un paso inexistente, no renderiza nada
      return null;
  }
}