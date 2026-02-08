"use client"

import React from "react"
import { User, GraduationCap, Lock, CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  onStepClick: (targetStep: number) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const steps = [
    { s: 1, label: "Personal", icon: User },
    { s: 2, label: "Académico", icon: GraduationCap },
    { s: 3, label: "Seguridad", icon: Lock }
  ]

  return (
    <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc] px-10 py-4">
      {steps.map((item, idx) => (
        <div key={item.s} className="flex items-center flex-1 last:flex-none">
          {/* BOTÓN DEL PASO */}
          <button
            type="button"
            onClick={() => onStepClick(item.s)}
            className="flex flex-col items-center gap-1 group focus:outline-none"
          >
            {/* CÍRCULO CON ICONO */}
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
              currentStep === item.s 
              ? "bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/10 shadow-md" 
              : currentStep > item.s 
              ? "bg-[#d4a843] text-[#1e3a5f]" 
              : "bg-[#e2e8f0] text-[#9ca3af]"
            }`}>
              {currentStep > item.s ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
            </div>
            
            {/* ETIQUETA DEL PASO */}
            <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${
              currentStep >= item.s ? "text-[#1e3a5f]" : "text-[#9ca3af]"
            }`}>
              {item.label}
            </span>
          </button>

          {/* LÍNEA DE PROGRESO ENTRE PASOS */}
          {idx < 2 && (
            <div className="flex-1 mx-2 h-0.5 bg-[#e2e8f0] relative">
              <div 
                className={`absolute top-0 left-0 h-full bg-[#d4a843] transition-all duration-500 ease-in-out ${
                  currentStep > item.s ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}