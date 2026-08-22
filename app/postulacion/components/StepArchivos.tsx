// linea 81
"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  FileCheck, 
  FileText, 
  CheckCircle2,
  Info,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FileStatus {
  [key: string]: boolean;
}

export function StepArchivos({
  disabled,
  tipoBeca,
  onValidationChange
}: {
  disabled: boolean;
  tipoBeca?: string;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [cargados, setCargados] = useState<FileStatus>({});
  
  // const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const hasFile = !!(e.target.files && e.target.files.length > 0);
    setCargados(prev => ({
      ...prev,
      [fieldName]: hasFile
    }));
  };

  const documentos = useMemo(() => {
    const baseDocs = [
      { id: "foto_carnet", label: "Foto Tipo Carnet", desc: "Formato JPG o PNG" },
      { id: "copia_cedula", label: "Cédula de Identidad", desc: "Copia legible y centrada" },
    ];

    const extraDocs: Record<string, Array<{ id: string; label: string; desc: string }>> = {
      "BECA SOCIAL": [
        { id: "constancia_residencia", label: "Constancia de Residencia", desc: "Expedida por ente oficial" },
        { id: "declaracion_manutencion", label: "Declaración Jurada", desc: "Manutención notariada" }
      ],
      "BECA APRENDIZAJE": [
        { id: "constancia_residencia", label: "Constancia de Residencia", desc: "Expedida por ente oficial" },
        { id: "declaracion_manutencion", label: "Declaración Jurada", desc: "Manutención notariada" }
      ],
      "BECA POR DISCAPACIDAD": [
        { id: "constancia_residencia", label: "Constancia de Residencia", desc: "Expedida por ente oficial" },
        { id: "declaracion_manutencion", label: "Declaración Jurada", desc: "Manutención notariada" },
        { id: "informe_medico", label: "Informe Médico", desc: "Ente de Salud Pública" }
      ],
      "Ayuda Económica Familiar": [
        { id: "partida_nacimiento", label: "Acta de Nacimiento", desc: "Comprobar nexo familiar" }
      ],
      "Ayuda Económica para Hijos de Trabajadores": [
        { id: "partida_nacimiento", label: "Acta de Nacimiento", desc: "Parentesco directo" }
      ],
      "Ayuda Económica por Actividades Extracurriculares": [
        { id: "constancia_club", label: "Constancia de Pertenencia", desc: "Club o selección oficial" }
      ]
    };

    return [...baseDocs, ...(tipoBeca && extraDocs[tipoBeca] ? extraDocs[tipoBeca] : [])];
  }, [tipoBeca]);

  // Validación lista para activar después de pruebas
  const isValid = useMemo(() => {
    if (!tipoBeca) return false;
    return documentos.every(doc => cargados[doc.id]);
  }, [documentos, cargados, tipoBeca]);

  useEffect(() => {
    onValidationChange?.(true); // Cambiar a 'isValid' cuando salgas de pruebas
  }, [isValid, onValidationChange]);

  /* 
  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
    };
    window.addEventListener('intentar-avanzar-archivos', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-archivos', handleValidationAttempt);
  }, []);
  */

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      
      {/* Encabezado compacto */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#d4a843]/10 flex items-center justify-center border border-[#d4a843]/20">
            <Upload className="h-4 w-4 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-tight leading-none">Documentación de Soporte</h4>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-1 leading-none">
              {tipoBeca || "Requisitos pendientes"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
           <Info className="h-3 w-3 text-slate-400" />
           <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest italic">Límite 2MB</span>
        </div>
      </div>

      {/* Grid de Documentos optimizado sin scroll */}
      <div>
        {tipoBeca ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {documentos.map((doc) => {
              const estaCargado = cargados[doc.id];

              return (
                <label 
                  key={doc.id}
                  className={cn(
                    "relative flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group shadow-sm",
                    estaCargado 
                      ? "bg-emerald-50/40 border-emerald-200" 
                      : "bg-white border-slate-200 border-dashed hover:border-[#1e3a5f]/20 hover:bg-slate-50/50"
                  )}
                >
                  <input
                    type="file"
                    name={doc.id}
                    required
                    disabled={disabled}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, doc.id)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                    estaCargado 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {estaCargado ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-tight truncate",
                        estaCargado ? "text-emerald-700" : "text-[#1e3a5f]"
                      )}>
                        {doc.label}
                      </span>
                      {estaCargado && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none">
                      {estaCargado ? "Documento listo para envío" : doc.desc}
                    </p>
                  </div>

                  <div className={cn(
                    "px-3 py-1.5 rounded-lg text-[7.5px] font-black uppercase tracking-widest transition-colors",
                    estaCargado 
                      ? "bg-white text-emerald-600 border border-emerald-100" 
                      : "bg-[#1e3a5f] text-white"
                  )}>
                    {estaCargado ? "Cambiar" : "Subir"}
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-xl">
            <AlertCircle className="h-6 w-6 text-slate-200 mb-2" />
            <p className="text-slate-400 text-[8.5px] font-bold uppercase tracking-widest text-center px-4">
              Seleccione el tipo de beca en el paso anterior<br/>para habilitar la carga de archivos
            </p>
          </div>
        )}
      </div>

      {/* Footer de Advertencia compacto */}
      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center gap-3 shrink-0">
        <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Info className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <p className="text-[8.5px] text-amber-800 font-bold uppercase tracking-tight leading-relaxed">
          Verifique que las capturas sean nítidas y los textos legibles. Los formatos permitidos son PDF, JPG y PNG.
        </p>
      </div>

    </div>
  )
}