"use client"

import React, { useMemo, useState, useEffect } from "react"
import {
  Upload,
  FileCheck,
  FileText,
  CheckCircle2,
  Info,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const DOC_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

interface FileValidationState {
  cargado: boolean;
  nombre?: string;
  error?: string;
}

interface FileStatus {
  [key: string]: FileValidationState;
}

interface DocumentoRequisito {
  id: string;
  label: string;
  desc: string;
  soloImagen?: boolean;
}

export function StepArchivos({
  disabled,
  tipoBeca,
  semestre,
  onValidationChange
}: {
  disabled: boolean;
  tipoBeca?: string;
  semestre?: number | string;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [cargados, setCargados] = useState<FileStatus>({});
  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    doc: DocumentoRequisito
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setCargados(prev => ({
        ...prev,
        [doc.id]: { cargado: false }
      }));
      return;
    }

    const allowedTypes = doc.soloImagen ? IMAGE_MIME_TYPES : DOC_MIME_TYPES;

    if (!allowedTypes.includes(file.type)) {
      e.target.value = "";
      setCargados(prev => ({
        ...prev,
        [doc.id]: {
          cargado: false,
          error: doc.soloImagen
            ? "Formato inválido. Use solo JPG o PNG."
            : "Formato inválido. Use PDF, JPG o PNG."
        }
      }));
      return;
    }

    if (file.size === 0) {
      e.target.value = "";
      setCargados(prev => ({
        ...prev,
        [doc.id]: { cargado: false, error: "El archivo está vacío o dañado." }
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      e.target.value = "";
      setCargados(prev => ({
        ...prev,
        [doc.id]: { cargado: false, error: "Supera el límite máximo de 2 MB." }
      }));
      return;
    }

    setCargados(prev => ({
      ...prev,
      [doc.id]: { cargado: true, nombre: file.name }
    }));
  };

  const tipoOficial = useMemo(() => normalizarTipoBecaOficial(tipoBeca), [tipoBeca]);

  const documentos = useMemo<DocumentoRequisito[]>(() => {
    const esPrimerTrimestre = Number(semestre) === 1;

    const baseDocs: DocumentoRequisito[] = [
      { id: "foto_carnet", label: "Foto Tipo Carnet", desc: "Formato JPG o PNG", soloImagen: true },
      { id: "copia_cedula", label: "Cédula de Identidad Ampliada", desc: "Copia legible y centrada" },
    ];

    const extraDocs: Record<string, DocumentoRequisito[]> = {
      "BECA APRENDIZAJE": [
        { id: "constancia_notas", label: "Constancia de Notas", desc: "Emitida por Control de Estudios " }
      ],
      "BECA SOCIAL APRENDIZAJE": [
        ...(esPrimerTrimestre
          ? [{ id: "notas_certificadas", label: "Notas Certificadas", desc: "7to, 8to, 9no y 1er año de Media General " }]
          : [])
      ],
      "BECA POR DISCAPACIDAD": [
        ...(esPrimerTrimestre
          ? [{ id: "notas_certificadas", label: "Notas Certificadas", desc: "7to a 1er año — Promedio mínimo 16 pts " }]
          : []),
        { id: "informe_medico", label: "Informe Médico", desc: "Emitido por especialista de salud " },
        { id: "carnet_discapacidad", label: "Carnet de Discapacidad", desc: "Documento oficial vigente " }
      ],
      "BECA A LA EXCELENCIA ACADÉMICA": [
        { id: "constancia_notas", label: "Constancia de Notas Acumuladas", desc: "Emitida por Control de Estudios " }
      ],
      "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES": [
        { id: "documentos_filiacion", label: "Documentos de Filiación", desc: "Partida de nacimiento o nexo familiar " }
      ],
      "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES": [
        { id: "documentos_filiacion", label: "Documentos de Filiación", desc: "Comprobante de parentesco directo " }
      ],
      "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN": [
        { id: "constancia_club", label: "Constancia de Pertenencia", desc: "Avalada por club deportivo, cultura u orfeón " }
      ]
    };

    return [...baseDocs, ...(tipoOficial && extraDocs[tipoOficial] ? extraDocs[tipoOficial] : [])];
  }, [tipoOficial, semestre]);

  const totalCargados = useMemo(() => {
    return documentos.filter(doc => cargados[doc.id]?.cargado === true).length;
  }, [documentos, cargados]);

  const isValid = useMemo(() => {
    if (!tipoOficial || documentos.length === 0) return false;
    return documentos.every(doc => cargados[doc.id]?.cargado === true);
  }, [documentos, cargados, tipoOficial]);

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
    };
    window.addEventListener("intentar-avanzar-archivos", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-archivos", handleValidationAttempt);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center border border-[#d4a843]/20 shrink-0">
            <Upload className="h-4 w-4 text-[#d4a843]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[#1e3a5f] font-black text-xs lg:text-[10px] uppercase tracking-tight leading-none truncate">
              Documentación de Soporte
            </h4>
            <p className="text-slate-400 text-[9px] lg:text-[8px] font-bold uppercase tracking-widest mt-1 leading-none truncate">
              {tipoOficial || "Requisitos pendientes"} {Number(semestre) > 1 ? `• Estudiante Regular (Trimestre ${semestre})` : "• Nuevo Ingreso"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tipoOficial && (
            <div className={cn(
              "px-2.5 py-1 rounded-lg border text-[9px] lg:text-[8px] font-black uppercase tracking-wider",
              isValid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-[#1e3a5f] border-slate-200"
            )}>
              {totalCargados} / {documentos.length} Adjuntos
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <Info className="h-3 w-3 text-slate-400" />
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest italic">Límite 2MB</span>
          </div>
        </div>
      </div>

      <div>
        {tipoOficial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-2">
            {documentos.map((doc) => {
              const estado = cargados[doc.id];
              const estaCargado = estado?.cargado === true;
              const mensajeError =
                estado?.error ||
                (hasAttemptedNext && !estaCargado ? "Documento obligatorio pendiente" : undefined);

              return (
                <label
                  key={doc.id}
                  className={cn(
                    "relative flex items-center gap-3 p-3 lg:p-2.5 min-h-12 lg:min-h-9 rounded-xl border transition-all cursor-pointer group shadow-sm",
                    disabled && "opacity-60 cursor-not-allowed",
                    estaCargado
                      ? "bg-emerald-50/40 border-emerald-200"
                      : mensajeError
                        ? "bg-red-50/40 border-red-400 border-dashed"
                        : "bg-white border-slate-200 border-dashed hover:border-[#1e3a5f]/30 hover:bg-slate-50/50"
                  )}
                >
                  <input
                    type="file"
                    name={doc.id}
                    required
                    disabled={disabled}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, doc)}
                    accept={doc.soloImagen ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
                  />

                  <div className={cn(
                    "h-10 w-10 lg:h-9 lg:w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                    estaCargado
                      ? "bg-emerald-500 text-white"
                      : mensajeError
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-400"
                  )}>
                    {estaCargado ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        "text-sm lg:text-xs font-black uppercase tracking-tight truncate",
                        estaCargado ? "text-emerald-700" : mensajeError ? "text-red-700" : "text-[#1e3a5f]"
                      )}>
                        {doc.label} {!estaCargado && "*"}
                      </span>
                      {estaCargado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className={cn(
                      "text-[10px] lg:text-[8px] font-bold uppercase tracking-wider truncate leading-tight",
                      mensajeError ? "text-red-600" : "text-slate-400"
                    )}>
                      {estaCargado
                        ? (estado?.nombre || "Documento listo para envío")
                        : (mensajeError || doc.desc)}
                    </p>
                  </div>

                  <div className={cn(
                    "px-3 py-2 lg:py-1.5 rounded-lg text-[10px] lg:text-[8px] font-black uppercase tracking-widest transition-colors shrink-0",
                    estaCargado
                      ? "bg-white text-emerald-600 border border-emerald-200"
                      : "bg-[#1e3a5f] text-white group-hover:bg-[#162d4a]"
                  )}>
                    {obtenerEtiquetaBoton(estaCargado)}
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-xl">
            <AlertCircle className="h-6 w-6 text-slate-200 mb-2" />
            <p className="text-slate-400 text-xs lg:text-[9px] font-bold uppercase tracking-widest text-center px-4">
              Seleccione el tipo de beca en el paso anterior<br />para habilitar la carga de archivos
            </p>
          </div>
        )}
      </div>

      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-3 shrink-0">
        <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Info className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <p className="text-[10px] lg:text-[8.5px] text-amber-800 font-bold uppercase tracking-tight leading-relaxed">
          Todos los documentos listados son obligatorios. Verifique que las capturas sean nítidas y legibles. Formatos permitidos: PDF, JPG y PNG (máx. 2 MB).
        </p>
      </div>
    </div>
  )
}

function obtenerEtiquetaBoton(estaCargado: boolean): string {
  return estaCargado ? "Cambiar" : "Subir";
}