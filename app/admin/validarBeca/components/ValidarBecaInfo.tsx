"use client"

import React, { useState } from "react"
import { 
  Info, Mail, GraduationCap, Star, Hash, BookOpen, 
  FileText, ImageIcon, Paperclip, X, ExternalLink,
  ShieldAlert
} from "lucide-react"

interface SolicitudAuditoria {
  foto_carnet?: string | null;
  copia_cedula?: string | null;
  planilla_inscripcion?: string | null;
  tipo_beca?: string | null;
  semestre?: number | string | null;
  trimestre?: number | string | null;
  promedio_notas?: number | string | null;
  carrera?: string | null;
  email_institucional?: string | null;
}

interface ValidarBecaInfoProps {
  solicitud: SolicitudAuditoria;
  sinEstudio?: boolean;
}

export function ValidarBecaInfo({ solicitud, sinEstudio }: ValidarBecaInfoProps) {
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const documentos = [
    { label: 'Foto Carnet', url: solicitud.foto_carnet, icon: ImageIcon },
    { label: 'Cédula', url: solicitud.copia_cedula, icon: FileText },
    { label: 'Planilla', url: solicitud.planilla_inscripcion, icon: Paperclip }
  ];

  return (
    <div className="space-y-4">
      {/* Contenedor principal ajustado con alta densidad espacial UF-Scale */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cabecera optimizada con altura compacta y colores oficiales Unimar */}
        <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-[#d4a843]" />
            <h3 className="text-[9px] font-black uppercase tracking-widest text-white">Resumen Académico</h3>
          </div>
          
          {sinEstudio && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
              <ShieldAlert className="h-3 w-3 text-amber-500" />
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Estudio Faltante</span>
            </div>
          )}
        </div>
        
        {/* Cuerpo con densidad espacial compacta corporativa */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <Star className="h-3.5 w-3.5 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Beneficio Solicitado</p>
              <p className="text-xs font-bold text-[#1e3a5f] uppercase tracking-tight">{solicitud.tipo_beca || "No especificado"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <Hash className="h-3.5 w-3.5 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Trimestre</p>
                <p className="text-xs font-bold text-[#1e3a5f]">{solicitud.semestre || solicitud.trimestre || "0"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Promedio</p>
                <p className="text-xs font-bold text-[#1e3a5f]">{solicitud.promedio_notas || "0.00"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <GraduationCap className="h-3.5 w-3.5 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Carrera</p>
              <p className="text-xs font-bold text-[#1e3a5f] truncate uppercase">{solicitud.carrera}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <Mail className="h-3.5 w-3.5 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Correo Institucional</p>
              <p className="text-xs font-bold text-[#1e3a5f] truncate">{solicitud.email_institucional || "No registrado"}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-0.5">Documentación Adjunta</p>
            <div className="grid grid-cols-3 gap-2">
              {documentos.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => doc.url && setImgPreview(doc.url)}
                  disabled={!doc.url}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#d4a843] hover:bg-slate-50 transition-all group disabled:opacity-30 disabled:grayscale shadow-sm"
                >
                  <doc.icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#d4a843] transition-colors" />
                  <span className="text-[7px] font-black uppercase text-slate-500 text-center leading-tight">{doc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de previsualización optimizado */}
      {imgPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1e3a5f]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <a 
                href={imgPreview} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#1e3a5f] hover:bg-[#d4a843] hover:text-white transition-all shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button 
                onClick={() => setImgPreview(null)}
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#1e3a5f] hover:bg-rose-500 hover:text-white transition-all shadow-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2 bg-slate-100 flex items-center justify-center min-h-[400px] max-h-[80vh]">
              <img 
                src={imgPreview} 
                alt="Vista previa documento" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            
            <div className="p-4 bg-white flex justify-center border-t border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Visor de Documentos Institucionales</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}