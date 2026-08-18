"use client"

import React, { useMemo, useState } from "react"
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
  tipoBeca
}: {
  disabled: boolean;
  tipoBeca?: string;
}) {
  const [cargados, setCargados] = useState<FileStatus>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const hasFile = e.target.files && e.target.files.length > 0;
    setCargados(prev => ({
      ...prev,
      [fieldName]: !!hasFile
    }));
  };

  const documentos = useMemo(() => {
    let docs = [
      { id: "foto_carnet", label: "Foto Tipo Carnet", desc: "Formato JPG o PNG" },
      { id: "copia_cedula", label: "Cédula de Identidad", desc: "Copia legible y centrada" },
    ];

    if (tipoBeca === "BECA SOCIAL" || tipoBeca === "BECA APRENDIZAJE") {
      docs.push(
        { id: "constancia_residencia", label: "Constancia de Residencia", desc: "Expedida por ente oficial" },
        { id: "declaracion_manutencion", label: "Declaración Jurada", desc: "Manutención notariada" }
      );
    }

    if (tipoBeca === "BECA POR DISCAPACIDAD") {
      docs.push(
        { id: "constancia_residencia", label: "Constancia de Residencia", desc: "Expedida por ente oficial" },
        { id: "declaracion_manutencion", label: "Declaración Jurada", desc: "Manutención notariada" },
        { id: "informe_medico", label: "Informe Médico", desc: "Ente de Salud Pública" }
      );
    }

    if (tipoBeca === "Ayuda Económica Familiar") {
      docs.push({ id: "partida_nacimiento", label: "Acta de Nacimiento", desc: "Comprobar nexo familiar" });
    }
    if (tipoBeca === "Ayuda Económica para Hijos de Trabajadores") {
      docs.push({ id: "partida_nacimiento", label: "Acta de Nacimiento", desc: "Parentesco directo" });
    }
    if (tipoBeca === "Ayuda Económica por Actividades Extracurriculares") {
      docs.push({ id: "constancia_club", label: "Constancia de Pertenencia", desc: "Club o selección oficial" });
    }

    return docs;
  }, [tipoBeca]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 h-full pb-4">
      
      {/* Encabezado */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#d4a843]/10 flex items-center justify-center border border-[#d4a843]/20">
            <Upload className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-xs uppercase tracking-tight leading-none">Documentación de Soporte</h4>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1.5 leading-none">
              {tipoBeca || "Requisitos pendientes"}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
           <Info className="h-3 w-3 text-slate-400" />
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Límite 2MB</span>
        </div>
      </div>

      {/* Grid de Documentos */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {tipoBeca ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documentos.map((doc) => {
              const estaCargado = cargados[doc.id];

              return (
                <label 
                  key={doc.id}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group shadow-sm",
                    estaCargado 
                      ? "bg-emerald-50/40 border-emerald-200" 
                      : "bg-white border-slate-100 border-dashed hover:border-[#1e3a5f]/20 hover:bg-slate-50/50"
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
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                    estaCargado 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    {estaCargado ? <FileCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tight truncate",
                        estaCargado ? "text-emerald-700" : "text-[#1e3a5f]"
                      )}>
                        {doc.label}
                      </span>
                      {estaCargado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none">
                      {estaCargado ? "Documento listo para envío" : doc.desc}
                    </p>
                  </div>

                  <div className={cn(
                    "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors",
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
          <div className="h-40 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="h-8 w-8 text-slate-200 mb-3" />
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest text-center px-6">
              Seleccione el tipo de beca en el paso anterior<br/>para habilitar la carga de archivos
            </p>
          </div>
        )}
      </div>

      {/* Footer de Advertencia */}
      <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center gap-4 shrink-0 mt-auto">
        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Info className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-[9px] text-amber-800 font-bold uppercase tracking-tight leading-relaxed">
          Verifique que las capturas sean nítidas y los textos legibles. Los formatos permitidos son PDF, JPG y PNG.
        </p>
      </div>

    </div>
  )
}