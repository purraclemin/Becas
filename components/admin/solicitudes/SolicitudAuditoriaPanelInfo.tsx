"use client"

import React, { useState } from "react"
import { 
  Info, Mail, GraduationCap, Star, Hash, BookOpen, 
  FileText, ImageIcon, Paperclip, X, ExternalLink,
  ShieldAlert
} from "lucide-react"

export function SolicitudAuditoriaPanelInfo({ solicitud, sinEstudio }: { solicitud: any, sinEstudio?: boolean }) {
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const documentos = [
    { label: 'Foto Carnet', url: solicitud.foto_carnet, icon: ImageIcon },
    { label: 'Cédula', url: solicitud.copia_cedula, icon: FileText },
    { label: 'Planilla', url: solicitud.planilla_inscripcion, icon: Paperclip }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1a2744] p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-[#d4a843]" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Resumen Académico</h3>
          </div>
          
          {/* 🚨 INDICADOR PREVENTIVO: Solo visible si falta el baremo */}
          {sinEstudio && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
              <ShieldAlert className="h-3 w-3 text-amber-500" />
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Estudio Faltante</span>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          {/* Fila: Tipo de Beca */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Star className="h-4 w-4 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase">Beneficio Solicitado</p>
              <p className="text-xs font-bold text-[#1a2744] uppercase">{solicitud.tipo_beca || "No especificado"}</p>
            </div>
          </div>

          {/* Fila Mixta: Trimestre y Promedio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Hash className="h-4 w-4 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase">Trimestre</p>
                <p className="text-xs font-bold text-[#1a2744]">{solicitud.semestre || solicitud.trimestre || "0"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <BookOpen className="h-4 w-4 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase">Promedio</p>
                <p className="text-xs font-bold text-[#1a2744]">{solicitud.promedio_notas || "0.00"}</p>
              </div>
            </div>
          </div>

          {/* Fila: Carrera */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <GraduationCap className="h-4 w-4 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase">Carrera</p>
              <p className="text-xs font-bold text-[#1a2744] truncate uppercase">{solicitud.carrera}</p>
            </div>
          </div>

          {/* Fila: Email */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Mail className="h-4 w-4 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[8px] font-black text-slate-400 uppercase">Correo Institucional</p>
              <p className="text-xs font-bold text-[#1a2744] truncate">{solicitud.email_institucional || "No registrado"}</p>
            </div>
          </div>

          {/* SECCIÓN: DOCUMENTACIÓN DIGITAL */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Documentación Adjunta</p>
            <div className="grid grid-cols-3 gap-2">
              {documentos.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => doc.url && setImgPreview(doc.url)}
                  disabled={!doc.url}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl hover:border-[#d4a843] hover:bg-slate-50 transition-all group disabled:opacity-30 disabled:grayscale"
                >
                  <doc.icon className="h-4 w-4 text-slate-400 group-hover:text-[#d4a843] transition-colors" />
                  <span className="text-[7px] font-black uppercase text-slate-500 text-center leading-tight">{doc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN (ZOOM) */}
      {imgPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a2744]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-4xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <a 
                href={imgPreview} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/90 backdrop-blur-md rounded-full text-[#1a2744] hover:bg-[#d4a843] hover:text-white transition-all shadow-lg"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <button 
                onClick={() => setImgPreview(null)}
                className="p-3 bg-white/90 backdrop-blur-md rounded-full text-[#1a2744] hover:bg-rose-500 hover:text-white transition-all shadow-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-2 bg-slate-100 flex items-center justify-center min-h-[400px] max-h-[80vh]">
              <img 
                src={imgPreview} 
                alt="Vista previa documento" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            
            <div className="p-6 bg-white flex justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visor de Documentos Institucionales</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}