"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, PieChart, Users, FileSpreadsheet, ArrowLeft, Download, Filter } from "lucide-react"
import { obtenerEstadisticasBecas } from "@/lib/ActionsReportes"

export default function ReportesPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await obtenerEstadisticasBecas();
      setStats(data);
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Header Administrativo */}
      <div className="bg-[#1a2744] px-6 py-4 shadow-lg border-b border-[#d4a843]">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-[#8a9bbd] hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-white font-serif uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#d4a843]" /> Panel de Reportes UNIMAR
            </h1>
          </div>
          <button onClick={() => window.print()} className="bg-[#d4a843] text-[#1a2744] px-4 py-2 rounded font-bold text-xs flex items-center gap-2 hover:bg-[#b88f32] transition-all">
            <Download className="h-4 w-4" /> EXPORTAR PDF
          </button>
        </div>
      </div>

      <div className="p-8 mx-auto max-w-7xl w-full space-y-8">
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#1e3a5f]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Promedio Académico Global</p>
                <h2 className="text-3xl font-black text-[#1e3a5f] mt-1">
                  {stats?.promedio ? Number(stats.promedio).toFixed(2) : "0.00"}
                </h2>
              </div>
              <PieChart className="h-8 w-8 text-[#d4a843] opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Solicitudes Recibidas</p>
                <h2 className="text-3xl font-black text-[#1e3a5f] mt-1">
                  {stats?.porEstatus?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0}
                </h2>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#d4a843]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Documentos por Validar</p>
                <h2 className="text-3xl font-black text-[#1e3a5f] mt-1">
                  {stats?.porEstatus?.find((e: any) => e.estatus === 'Pendiente')?.total || 0}
                </h2>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-[#d4a843] opacity-20" />
            </div>
          </div>
        </div>

        {/* Sección de Distribución */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla por Tipo de Beca */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Distribución por Tipo de Beca</h3>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <div className="p-6">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="pb-3 font-medium text-xs">TIPO</th>
                    <th className="pb-3 font-medium text-xs text-right">CANTIDAD</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats?.porTipo?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-semibold text-[#1e3a5f]">{item.tipo_beca}</td>
                      <td className="py-3 text-right font-bold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Estado de las Solicitudes */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#f8fafc] px-6 py-4 border-b">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Estatus de Solicitudes</h3>
            </div>
            <div className="p-6 space-y-4">
              {stats?.porEstatus?.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{item.estatus}</span>
                    <span>{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div 
                      className="bg-[#1e3a5f] h-2 rounded-full" 
                      style={{ width: `${(item.total / (stats?.porEstatus?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}