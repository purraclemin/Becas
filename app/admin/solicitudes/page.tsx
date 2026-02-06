"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, Clock, Search, GraduationCap, ClipboardList } from "lucide-react"
import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatus"

export default function GestionSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar todas las solicitudes (podemos reusar o ampliar la lógica de Recientes)
  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerSolicitudesRecientes(); // Aquí podrías crear una función 'obtenerTodas' si prefieres
      setSolicitudes(data)
      setLoading(false)
    }
    cargar()
  }, [])

  const handleCambioEstatus = async (id: number, nuevoEstatus: string) => {
    const confirmar = confirm(`¿Está seguro de cambiar el estatus a ${nuevoEstatus}?`)
    if (!confirmar) return

    const res = await actualizarEstatusBeca(id, nuevoEstatus)
    if (res.success) {
      // Actualizamos el estado local para reflejar el cambio visualmente
      setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, estatus: nuevoEstatus } : s))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Header Estilo UNIMAR */}
      <div className="bg-[#1a2744] px-8 py-6 shadow-md border-b-4 border-[#d4a843]">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="bg-[#1e3a5f] p-2 rounded-full text-[#d4a843] hover:bg-[#162d4a] transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white font-serif uppercase tracking-widest">Gestión de Becas</h1>
              <p className="text-[10px] text-[#8a9bbd] font-bold">Validación y Revisión de Postulaciones Estudiantiles</p>
            </div>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o cédula..." className="bg-[#1e3a5f] text-white text-xs py-2 pl-10 pr-4 rounded-md border border-[#1e3a5f] focus:border-[#d4a843] outline-none w-64" />
          </div>
        </div>
      </div>

      <div className="p-8 mx-auto max-w-7xl w-full">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#1e3a5f] text-[10px] font-black uppercase tracking-tighter border-b">
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Tipo de Beca</th>
                <th className="px-6 py-4">Promedio</th>
                <th className="px-6 py-4 text-center">Estatus</th>
                <th className="px-6 py-4 text-right">Acciones de Validación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 animate-pulse">Cargando registros...</td></tr>
              ) : solicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-[#1e3a5f] text-sm">{s.nombre} {s.apellido}</p>
                    <p className="text-[10px] text-gray-400 italic">ID Usuario: #{s.id}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#d4a843]" />
                      <span className="text-xs font-semibold text-gray-600">{s.tipo_beca}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-[#1e3a5f]/5 text-[#1e3a5f] px-2 py-1 rounded font-bold text-xs">{s.promedio_notas}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      s.estatus === 'Aprobada' ? 'bg-green-100 text-green-700' : 
                      s.estatus === 'Rechazada' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {s.estatus}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleCambioEstatus(s.id, 'Aprobada')}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Aprobar Beca"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCambioEstatus(s.id, 'Rechazada')}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Rechazar Beca"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCambioEstatus(s.id, 'En Revisión')}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Poner en Revisión"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {solicitudes.length === 0 && !loading && (
            <div className="py-20 text-center">
              <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm italic">No hay solicitudes pendientes por procesar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}