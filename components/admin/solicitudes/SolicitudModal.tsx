"use client"

import React, { useState, useMemo } from "react"
import { 
  X, Check, Clock, FileText, User, 
  ClipboardList, Calendar, GraduationCap,
  Image as ImageIcon, Paperclip, ExternalLink,
  Mail, Phone, Hash, AlertTriangle,
  // Nuevos iconos para el estudio
  Home, DollarSign, Users, Wifi, Activity
} from "lucide-react"

interface ModalProps {
  solicitud: any
  onClose: () => void
  onStatusChange: (id: number, status: string) => void
}

export function SolicitudModal({ solicitud, onClose, onStatusChange }: ModalProps) {
  const [confirmando, setConfirmando] = useState<string | null>(null)

  // Lógica para extraer datos del estudio socioeconómico de forma segura
  const estudioData = useMemo(() => {
    if (!solicitud) return null;
    
    // Caso 1: Los datos vienen planos en la solicitud
    if (solicitud.ingreso_mensual_familiar) return solicitud;

    // Caso 2: Los datos vienen en un JSON string
    if (solicitud.respuestas_json) {
        try {
            return JSON.parse(solicitud.respuestas_json);
        } catch (e) {
            return null;
        }
    }
    return null;
  }, [solicitud]);

  if (!solicitud) return null

  // Colores dinámicos según el estatus
  const statusStyles: any = {
    'Aprobada': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Rechazada': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    'En Revisión': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Pendiente': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
  }

  const currentStyle = statusStyles[solicitud.estatus] || statusStyles['Pendiente']

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-md transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* HEADER */}
        <div className="relative bg-[#1a2744] px-8 py-6 shrink-0">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 bg-gradient-to-br from-[#d4a843] to-[#b88d2d] rounded-2xl flex items-center justify-center text-3xl font-black text-[#1a2744] shadow-xl border-4 border-white/10">
              {solicitud.nombre?.[0]}{solicitud.apellido?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white font-extrabold text-2xl tracking-tight leading-none">
                  {solicitud.nombre} {solicitud.apellido}
                </h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
                  {solicitud.estatus}
                </span>
              </div>
              <p className="text-[#8a9bbd] text-xs font-medium mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-[#d4a843]" /> V-{solicitud.cedula}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-[#d4a843]" /> {solicitud.carrera}</span>
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
          
          {/* Stats Rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Promedio</span>
              <span className="text-xl font-black text-[#1a2744]">{solicitud.promedio_notas} <small className="text-[10px] text-slate-400">PTS</small></span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo Beca</span>
              <span className="text-sm font-bold text-[#1a2744] truncate block">{solicitud.tipo_beca}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Teléfono</span>
              <span className="text-sm font-bold text-[#1a2744] flex items-center gap-1"><Phone className="h-3 w-3 text-[#d4a843]" /> {solicitud.telefono || "S/I"}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registrado</span>
              <span className="text-[11px] font-bold text-[#1a2744] leading-tight block">{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" /> Justificación del Estudiante
            </h4>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-[#d4a843]/20" />
              <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                "{solicitud.motivo_solicitud || "El estudiante no proporcionó una descripción detallada para esta solicitud."}"
              </p>
            </div>
          </div>

          {/* Perfil Socioeconómico */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" /> Perfil Socioeconómico
            </h4>
            
            {estudioData ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <SocioCard 
                        label="Ingreso Familiar" 
                        value={estudioData.ingreso_mensual_familiar ? `$${estudioData.ingreso_mensual_familiar}` : "N/A"} 
                        icon={DollarSign} 
                    />
                    <SocioCard 
                        label="Personas en Hogar" 
                        value={estudioData.num_personas_hogar || "N/A"} 
                        icon={Users} 
                    />
                      <SocioCard 
                        label="Vivienda" 
                        value={estudioData.tipo_vivienda || "N/A"} 
                        icon={Home} 
                    />
                      <SocioCard 
                        label="Internet" 
                        value={estudioData.acceso_internet || "No especificado"} 
                        icon={Wifi} 
                    />
                      <SocioCard 
                        label="Dependencia Econ." 
                        value={estudioData.dependencia_economica || "N/A"} 
                        icon={Activity} 
                    />
                      <SocioCard 
                        label="Trabajan en casa" 
                        value={estudioData.num_personas_trabajan || "0"} 
                        icon={BriefcaseIcon} 
                    />
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">No se encontraron datos socioeconómicos vinculados.</p>
                </div>
            )}
          </div>

          {/* Recaudos */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" /> Documentación Adjunta
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Foto Carnet', url: solicitud.foto_carnet, icon: ImageIcon },
                { label: 'Cédula Identidad', url: solicitud.copia_cedula, icon: FileText },
                { label: 'Constancia Insc.', url: solicitud.planilla_inscripcion, icon: Paperclip }
              ].map((file, idx) => (
                <a 
                  key={idx}
                  href={file.url || "#"}
                  target="_blank"
                  className={`flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all ${
                    file.url 
                    ? "bg-white border-slate-100 hover:border-[#d4a843] hover:shadow-md cursor-pointer group" 
                    : "bg-slate-100/50 border-transparent opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${file.url ? "bg-[#1a2744] text-[#d4a843]" : "bg-slate-200 text-slate-400"}`}>
                    <file.icon className="h-5 w-5" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500">{file.label}</span>
                    {file.url && <ExternalLink className="h-3 w-3 text-[#d4a843] group-hover:scale-110 transition-transform" />}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white p-6 border-t border-slate-100 shrink-0">
          {confirmando ? (
            <div className={`flex items-center justify-between p-4 rounded-2xl animate-in slide-in-from-bottom-2 border ${
                confirmando === 'En Revisión' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${confirmando === 'En Revisión' ? 'text-blue-600' : 'text-amber-600'}`} />
                <p className={`text-sm font-bold ${confirmando === 'En Revisión' ? 'text-blue-900' : 'text-amber-900'}`}>
                    ¿Cambiar estatus a <span className="uppercase">{confirmando}</span>?
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmando(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white rounded-lg transition-all">Cancelar</button>
                <button 
                  onClick={() => { onStatusChange(solicitud.id, confirmando!); onClose(); }} 
                  className="px-6 py-2 bg-[#1a2744] text-[#d4a843] text-xs font-black uppercase rounded-lg shadow-lg"
                >
                  Confirmar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button onClick={onClose} className="text-slate-400 font-bold text-xs uppercase hover:text-slate-600 transition-colors">Volver al listado</button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {/* 🔵 BOTÓN NUEVO: A REVISIÓN */}
                <button 
                    onClick={() => setConfirmando('En Revisión')} 
                    className="flex-1 sm:flex-none px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-blue-100 transition-all border border-blue-100"
                >
                    A Revisión
                </button>

                <button onClick={() => setConfirmando('Rechazada')} className="flex-1 sm:flex-none px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase hover:bg-rose-100 transition-all border border-rose-100">Rechazar</button>
                <button onClick={() => setConfirmando('Aprobada')} className="flex-1 sm:flex-none px-8 py-3 bg-[#1a2744] text-[#d4a843] rounded-xl font-black text-[10px] uppercase hover:bg-[#233559] transition-all shadow-xl">Aprobar Beca</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componentes Auxiliares
function SocioCard({ label, value, icon: Icon }: any) {
    return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#d4a843] shrink-0">
                {Icon ? <Icon className="h-4 w-4" /> : <div className="h-2 w-2 bg-slate-300 rounded-full" />}
            </div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">{label}</p>
                <p className="text-xs font-bold text-[#1a2744] truncate mt-0.5" title={value}>{value}</p>
            </div>
        </div>
    )
}

function BriefcaseIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="6" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    )
}