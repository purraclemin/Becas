'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarConfiguracionPruebas, obtenerConfiguracionActual } from '@/lib/ActionsAdmin'

export default function AdminTestPanel() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [activo, setActivo] = useState(false)
  const [mes, setMes] = useState("")

  useEffect(() => {
    async function init() {
      const data = await obtenerConfiguracionActual()
      setActivo(data.activo)
      setMes(data.mesSimulado || "")
    }
    init()
  }, [])

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setActivo(isChecked)
    if (!isChecked) {
      setMes("") 
    }
  }

  const handleGuardar = async () => {
    if (activo && mes === "") return;

    const formData = new FormData()
    formData.append('modo_prueba', activo ? 'on' : 'off')
    formData.append('mes_simulado', mes)

    startTransition(async () => {
      try {
        const res = await actualizarConfiguracionPruebas(formData)
        if (res.success) {
          router.refresh()
        }
      } catch (error) {
        console.error("Error al guardar:", error)
      }
    })
  }

  return (
    <div className={`p-3 border-2 border-dashed rounded-xl my-3 shadow-sm transition-all duration-500 ${
      activo 
        ? "border-green-500 bg-green-50/50" 
        : "border-red-500 bg-red-50/50"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className={`font-black uppercase text-[8px] tracking-widest transition-colors ${
          activo ? "text-green-700" : "text-red-700"
        }`}>
          🛠️ Modo Desarrollador (Simulación)
        </h3>
        
        {activo && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-gray-500 uppercase mb-1">Bypass de Reglas</span>
          <label className="relative inline-flex items-center cursor-pointer scale-90 origin-left">
            <input 
              type="checkbox" 
              checked={activo} 
              onChange={handleSwitchChange}
              className="sr-only peer"
            />
            <div className={`w-10 h-5 bg-gray-300 rounded-full peer peer-focus:ring-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
              activo ? "peer-checked:bg-green-600 peer-focus:ring-green-300" : "peer-checked:bg-red-600 peer-focus:ring-red-300"
            }`}></div>
          </label>
        </div>

        <div className={`flex flex-col transition-all duration-300 ${!activo ? "opacity-40" : "opacity-100"}`}>
          <span className="text-[8px] font-bold text-gray-500 uppercase mb-1">
            {activo ? "Mes a Simular" : "Desactivado"}
          </span>
          <select 
            value={mes} 
            onChange={(e) => setMes(e.target.value)}
            disabled={!activo} 
            className={`border border-gray-200 px-2 py-1 rounded bg-white text-[9px] font-bold outline-none focus:ring-1 focus:ring-blue-500 h-8 ${
              !activo ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {!activo ? (
              <option value="">Mes Real</option>
            ) : (
              <>
                <option value="">-- Seleccionar --</option>
                <option value="1">Enero (I)</option>
                <option value="5">Mayo (II)</option>
                <option value="9">Septiembre (III)</option>
                <option value="12">Diciembre (Siguiente)</option>
              </>
            )}
          </select>
        </div>

        <button 
          type="button" 
          onClick={handleGuardar}
          disabled={isPending || (activo && mes === "")}
          className={`px-4 py-1.5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-sm active:scale-95 ${
            isPending || (activo && mes === "")
              ? "bg-gray-400 cursor-not-allowed" 
              : activo ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isPending ? "Sincronizando..." : "Aplicar"}
        </button>
      </div>
    </div>
  )
}