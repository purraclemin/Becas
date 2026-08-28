"use client"

import React, { useState } from "react"
import { Database, Loader2, Trash2 } from "lucide-react"
import { seedDatabase, cleanSeedData } from "@/lib/ActionsSeedData"

interface Boton100registrosProps {
  disabled?: boolean;
}

export function Boton100registros({ disabled = false }: Boton100registrosProps) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  const handleSeed = async () => {
    if (!confirm("¿Deseas generar 100 estudiantes y solicitudes de prueba?")) return;
    setIsSeeding(true)
    try {
      const res = await seedDatabase()
      if (res.success) { alert("✅ " + res.message); window.location.reload(); }
      else { alert("❌ Error: " + res.error); }
    } catch { alert("❌ Ocurrió un error inesperado al generar los datos."); }
    finally { setIsSeeding(false); }
  }

  const handleClean = async () => {
    if (!confirm("¿Estás seguro de eliminar los 100 registros de prueba?")) return;
    setIsCleaning(true)
    try {
      const res = await cleanSeedData()
      if (res.success) { alert("🗑️ " + res.message); window.location.reload(); }
      else { alert("❌ Error: " + res.error); }
    } catch { alert("❌ Ocurrió un error inesperado al limpiar los datos."); }
    finally { setIsCleaning(false); }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón para generar registros */}
      <button 
        onClick={handleSeed} 
        disabled={disabled || isSeeding || isCleaning} 
        className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
          isSeeding ? "bg-slate-50 text-slate-300" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
        }`} 
        title="Generar 100 registros de prueba"
      >
        {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      </button>

      {/* Botón para limpiar registros */}
      <button 
        onClick={handleClean} 
        disabled={disabled || isSeeding || isCleaning} 
        className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
          isCleaning ? "bg-slate-50 text-slate-300" : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
        }`} 
        title="Limpiar registros de prueba"
      >
        {isCleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}