"use client"

import React, { useState, useMemo, ComponentType, SVGProps } from "react"
import {
  Info, Mail, GraduationCap, Star, Hash, BookOpen,
  FileText, ImageIcon, X, ExternalLink,
  ShieldAlert, CreditCard, Phone, Trophy
} from "lucide-react"
import { normalizarTipoBecaOficial, esBecaExcelenciaAcademica } from "@/lib/RecordAcademicoUtils"
import { esEgresadoPorSemestre } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"

export interface SolicitudAuditoria {
  cedula?: string | null;
  telefono?: string | null;
  telefono_movil?: string | null;
  foto_carnet?: string | null;
  copia_cedula?: string | null;
  tipo_beca?: string | null;
  semestre?: number | string | null;
  trimestre?: number | string | null;
  promedio_notas?: number | string | null;
  indice_global?: number | string | null;
  carrera?: string | null;
  email_institucional?: string | null;
  constancia_notas?: string | null;
  notas_certificadas?: string | null;
  informe_medico?: string | null;
  carnet_discapacidad?: string | null;
  documentos_filiacion?: string | null;
  constancia_club?: string | null;
  constancia_residencia?: string | null;
  declaracion_manutencion?: string | null;
  [key: string]: unknown;
}

export interface DocumentoItem {
  label: string;
  url?: string | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface ValidarBecaInfoProps {
  solicitud: SolicitudAuditoria;
  sinEstudio?: boolean;
}

export function ValidarBecaInfo({ solicitud, sinEstudio }: ValidarBecaInfoProps) {
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const tipoOficial = useMemo(
    () => normalizarTipoBecaOficial(solicitud.tipo_beca),
    [solicitud.tipo_beca]
  );

  const esExcelencia = useMemo(
    () => esBecaExcelenciaAcademica(solicitud.tipo_beca),
    [solicitud.tipo_beca]
  );

  const esEgresado = esEgresadoPorSemestre(solicitud.semestre ?? solicitud.trimestre);

  const documentos = useMemo(() => {
    const esPrimerTrimestre = Number(solicitud.semestre || solicitud.trimestre) === 1;

    const baseDocs: DocumentoItem[] = [
      { label: 'Foto Carnet', url: solicitud.foto_carnet as string | null, icon: ImageIcon },
      { label: 'Cédula', url: solicitud.copia_cedula as string | null, icon: FileText }
    ];

    const extraDocs: Record<string, DocumentoItem[]> = {
      "BECA SOCIAL APRENDIZAJE": [
        ...(solicitud.constancia_residencia
          ? [{ label: 'Constancia Residencia', url: solicitud.constancia_residencia as string | null, icon: FileText }]
          : []),
        ...(solicitud.declaracion_manutencion
          ? [{ label: 'Declaración Jurada', url: solicitud.declaracion_manutencion as string | null, icon: FileText }]
          : []),
        ...(esPrimerTrimestre || solicitud.notas_certificadas
          ? [{ label: 'Notas Certificadas', url: solicitud.notas_certificadas as string | null, icon: FileText }]
          : [])
      ],
      "BECA APRENDIZAJE": [
        ...(solicitud.constancia_residencia
          ? [{ label: 'Constancia Residencia', url: solicitud.constancia_residencia as string | null, icon: FileText }]
          : []),
        ...(solicitud.declaracion_manutencion
          ? [{ label: 'Declaración Jurada', url: solicitud.declaracion_manutencion as string | null, icon: FileText }]
          : []),
        { label: 'Constancia Notas', url: solicitud.constancia_notas as string | null, icon: FileText }
      ],
      "BECA POR DISCAPACIDAD": [
        ...(esPrimerTrimestre || solicitud.notas_certificadas
          ? [{ label: 'Notas Certificadas', url: solicitud.notas_certificadas as string | null, icon: FileText }]
          : []),
        { label: 'Informe Médico', url: solicitud.informe_medico as string | null, icon: FileText },
        { label: 'Carnet Discapacidad', url: solicitud.carnet_discapacidad as string | null, icon: FileText }
      ],
      "BECA A LA EXCELENCIA ACADÉMICA": [
        { label: 'Constancia Notas', url: solicitud.constancia_notas as string | null, icon: FileText }
      ],
      "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES": [
        { label: 'Doc. Filiación', url: solicitud.documentos_filiacion as string | null, icon: FileText }
      ],
      "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES": [
        { label: 'Doc. Filiación', url: solicitud.documentos_filiacion as string | null, icon: FileText }
      ],
      "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN": [
        { label: 'Constancia Club', url: solicitud.constancia_club as string | null, icon: FileText }
      ]
    };

    return [...baseDocs, ...(tipoOficial && extraDocs[tipoOficial] ? extraDocs[tipoOficial] : [])];
  }, [solicitud, tipoOficial]);

  const promTrimNum = Number(solicitud.promedio_notas ?? 0);
  const promTrimTexto = Number.isFinite(promTrimNum) ? promTrimNum.toFixed(2) : "0.00";
  const globalNum = Number(solicitud.indice_global ?? 0);
  const globalTexto = Number.isFinite(globalNum) ? globalNum.toFixed(2) : "0.00";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <Star className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Beneficio Solicitado</p>
              <p className="text-xs font-bold text-[#1e3a5f] uppercase tracking-tight">
                {tipoOficial || String(solicitud.tipo_beca || "No especificado")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <CreditCard className="h-3.5 w-3.5 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Cédula</p>
                <p className="text-xs font-bold text-[#1e3a5f]">V-{String(solicitud.cedula || "---")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
              <Phone className="h-3.5 w-3.5 text-[#d4a843]" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Teléfono</p>
                <p className="text-xs font-bold text-[#1e3a5f] truncate">{String(solicitud.telefono_movil || solicitud.telefono || "---")}</p>
              </div>
            </div>
          </div>

          {/* Separación explícita: Trimestre (o Egresado), Promedio Trimestral e Índice Global */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${esEgresado ? 'bg-teal-50/70 border-teal-200' : 'bg-slate-50/70 border-slate-100'}`}>
              <Hash className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">
                  {esEgresado ? "Nivel" : "Trim."}
                </p>
                {esEgresado ? (
                  <p className="text-[10px] font-black text-teal-800 uppercase truncate">
                    Egresado
                  </p>
                ) : (
                  <p className="text-xs font-bold text-[#1e3a5f]">
                    {String(solicitud.semestre || solicitud.trimestre || "0")}°
                  </p>
                )}
              </div>
            </div>
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${!esExcelencia ? 'bg-blue-50/60 border-blue-200/70' : 'bg-slate-50/70 border-slate-100'}`}>
              <BookOpen className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Trim. Ant.</p>
                <p className="text-xs font-black text-[#1e3a5f] tabular-nums">{promTrimTexto}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${esExcelencia ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-50/70 border-slate-100'}`}>
              <Trophy className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
              <div className="min-w-0">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Global</p>
                <p className="text-xs font-black text-[#1e3a5f] tabular-nums">{globalTexto}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <GraduationCap className="h-3.5 w-3.5 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Carrera</p>
              <p className="text-xs font-bold text-[#1e3a5f] truncate uppercase">{String(solicitud.carrera || "No especificada")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <Mail className="h-3.5 w-3.5 text-[#d4a843]" />
            <div className="min-w-0">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Correo Institucional</p>
              <p className="text-xs font-bold text-[#1e3a5f] truncate">{String(solicitud.email_institucional || "No registrado")}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-0.5">Documentación Adjunta</p>
            <div className="grid grid-cols-3 gap-2">
              {documentos.map((doc: DocumentoItem, idx: number) => {
                const IconComponent = doc.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => doc.url && setImgPreview(doc.url)}
                    disabled={!doc.url}
                    className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#d4a843] hover:bg-slate-50 transition-all group disabled:opacity-30 disabled:grayscale shadow-sm cursor-pointer"
                  >
                    <IconComponent className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#d4a843] transition-colors" />
                    <span className="text-[7px] font-black uppercase text-slate-500 text-center leading-tight">{doc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
                type="button"
                onClick={() => setImgPreview(null)}
                className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#1e3a5f] hover:bg-rose-500 hover:text-white transition-all shadow-md cursor-pointer"
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