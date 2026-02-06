"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Search, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  FileDown,
  Filter,
  BadgeCheck
} from "lucide-react"
import { obtenerTodosLosEstudiantes } from "@/lib/Actionsestudiantes"

export default function EstudiantesAdminPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerTodosLosEstudiantes()
      setEstudiantes(data)
      setLoading(false)
    }
    cargar()
  }, [])

  // Filtrado por múltiples campos (Nombre, Apellido o Cédula)
  const filtrados = estudiantes.filter(e => 
    `${e.nombre} ${e.apellido} ${e.cedula}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Header Institucional UNIMAR */}
      <div className="bg-[#1a2744] px-8 py-6 shadow-md border-b-4 border-[#d4a843]">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="bg-[#1e3a5f] p-2.5 rounded-full text-[#d4a843] hover:bg-[#162d4a] transition-all shadow-lg border border-[#d4a843]/20">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white font-serif uppercase tracking-widest leading-none">Base de Datos Estudiantil</h1>
              <p className="text-[10px] text-[#8a9bbd] font-bold uppercase mt-1 tracking-tighter">Gestión de Usuarios Registrados en el Sistema de Becas</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-[#d4a843] text-[#1a2744] px-5 py-2.5 rounded-lg font-black text-[10px] hover:bg-[#b88f32] transition-all shadow-md uppercase"
          >
            <FileDown className="h-4 w-4" /> Generar Reporte PDF
          </button>
        </div>
      </div>

      <div className="p-8 mx-auto max-w-7xl w-full space-y-6">
        {/* Panel de Filtros y Búsqueda */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cédula, nombre o apellido..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f8fafc] border border-gray-200 py-3 pl-10 pr-4 rounded-xl text-sm text-[#1e3a5f] outline-none focus:border-[#d4a843] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10">
            <BadgeCheck className="h-5 w-5 text-[#1e3a5f]" />
            <span className="text-xs font-black text-[#1e3a5f] uppercase tracking-wider">
              {filtrados.length} Estudiantes Inscritos
            </span>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fafc] text-[#1e3a5f] text-[10px] font-black uppercase tracking-[0.15em] border-b border-gray-100">
                  <th className="px-10 py-6">Datos Personales</th>
                  <th className="px-10 py-6">Información de Contacto</th>
                  <th className="px-10 py-6">Perfil Académico</th>
                  <th className="px-10 py-6 text-right">Fecha Ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d4a843] border-t-transparent"></div>
                      <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Consultando Base de Datos...</p>
                    </td>
                  </tr>
                ) : filtrados.length > 0 ? (
                  filtrados.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-[#1e3a5f] rounded-2xl flex items-center justify-center text-[#d4a843] font-serif font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                            {e.nombre[0]}{e.apellido[0]}
                          </div>
                          <div>
                            <p className="font-black text-[#1e3a5f] text-sm uppercase tracking-tight leading-none">{e.apellido}, {e.nombre}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">CÉDULA: V-{e.cedula}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                            <Mail className="h-3.5 w-3.5 text-[#d4a843]" /> {e.email}
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                            <Phone className="h-3.5 w-3.5 text-[#d4a843]" /> {e.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <BookOpen className="h-4 w-4 text-[#1e3a5f]" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#1e3a5f] uppercase leading-none">{e.carrera}</p>
                            <p className="text-[10px] text-[#d4a843] font-bold uppercase mt-1 tracking-widest">{e.semestre}° SEMESTRE</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {new Date(e.fecha_registro).toLocaleDateString('es-VE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <p className="text-gray-300 font-serif italic text-lg font-medium">No se encontraron registros de estudiantes...</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] py-4">
          Sistema de Control Interno &bull; Decanato de Estudiantes UNIMAR
        </p>
      </div>
    </div>
  )
}