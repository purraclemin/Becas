"use client";

import { useState } from "react";
import { Search, Loader2, Edit3, Trash2, X, Mail, ShieldAlert, ShieldCheck, Shield, Activity, Info, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentData {
  id: number | string;
  nombre?: string;
  apellido?: string;
  cedula: string;
  carrera?: string;
  email?: string;
  nivel_riesgo?: string;
  puntaje_admin?: number | null;
  [key: string]: unknown;
}

interface StudentIdentityProps {
  student: StudentData | null;
  loading: boolean;
  cedulaBusqueda: string;
  setCedulaBusqueda: (val: string) => void;
  handleSearch: () => void;
  mostrarResultado: boolean;
  setMostrarResultado: (val: boolean) => void;
  setPasoActual: (val: number) => void;
  borrarEstudio: (id: number | string) => Promise<{ success: boolean } | void>;
  setStudent: (val: StudentData | null) => void;
  onVerExpediente?: (student: StudentData) => void;
  onView?: (student: StudentData) => void;
}

export function StudentIdentity({ 
  student, 
  loading, 
  cedulaBusqueda, 
  setCedulaBusqueda, 
  handleSearch, 
  mostrarResultado, 
  setMostrarResultado, 
  setPasoActual, 
  borrarEstudio, 
  setStudent,
  onVerExpediente 
}: StudentIdentityProps) {

  const router = useRouter();
  const [mostrarConfirmacionBorrar, setMostrarConfirmacionBorrar] = useState<boolean>(false);
  const [mostrarConfirmacionEditar, setMostrarConfirmacionEditar] = useState<boolean>(false);
  const [mostrarConfirmacionExpediente, setMostrarConfirmacionExpediente] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleClose = () => {
    setStudent(null);
    setMostrarResultado(false);
    setCedulaBusqueda(""); 
    setMostrarConfirmacionBorrar(false);
    setMostrarConfirmacionEditar(false);
    setMostrarConfirmacionExpediente(false);
  };

  const getRiskTheme = (nivel?: string) => {
    switch (nivel) {
      case 'Alto': 
        return { border: 'border-rose-500/50', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', icon: <ShieldAlert className="h-3 w-3" /> };
      case 'Medio': 
        return { border: 'border-amber-500/50', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', icon: <Shield className="h-3 w-3" /> };
      case 'Bajo': 
        return { border: 'border-emerald-500/50', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', icon: <ShieldCheck className="h-3 w-3" /> };
      default: 
        return { border: 'border-slate-200', text: 'text-slate-500', bg: 'bg-slate-100', icon: null };
    }
  };

  const theme = getRiskTheme(student?.nivel_riesgo);

  const ejecutarAccionExpediente = () => {
    if (!student) return;
    if (onVerExpediente) {
      onVerExpediente(student);
    } else {
      router.push(`/admin/validarBeca?search=${encodeURIComponent(String(student.cedula || ''))}&id=${student.id}`);
    }
  };

  const ejecutarAccionEditar = () => {
    setMostrarResultado(false); 
    setPasoActual(1);
    setMostrarConfirmacionEditar(false);
  };

  const confirmarBorradoEstudio = async () => {
    if (!student) return;
    try {
      setIsDeleting(true);
      await borrarEstudio(student.id);
      handleClose();
    } catch (error) {
      console.error("Error al borrar el estudio:", error);
    } finally {
      setIsDeleting(false);
      setMostrarConfirmacionBorrar(false);
    }
  };

  return (
    <div className="w-full">
      
      {/* --- BUSCADOR CON BARRA COMPACTA Y ALTA DENSIDAD ESPACIAL (UF-Scale) --- */}
      {!student && (
        <div className="bg-white p-1.5 pl-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center gap-2 transition-all focus-within:shadow-md focus-within:border-[#1e3a5f]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={cedulaBusqueda} 
            onChange={(e) => setCedulaBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cédula, nombre o correo..." 
            className="flex-1 bg-transparent border-none py-2 md:py-0 md:h-9 text-sm md:text-xs font-medium text-[#1e3a5f] outline-none placeholder:text-slate-400 placeholder:font-normal" 
          />
          <button 
            type="button"
            onClick={handleSearch} 
            disabled={loading}
            className="w-full md:w-auto bg-[#1e3a5f] text-white px-5 h-12 md:h-9 rounded-lg font-bold uppercase text-sm md:text-[9px] tracking-[0.2em] transition-all hover:bg-[#162c4a] disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4 md:h-3.5 md:w-3.5" /> : "Consultar"}
          </button>
        </div>
      )}

      {/* --- FICHA DEL ESTUDIANTE (UNIMAR ACADEMIC MINIMALIST & UF-SCALE) --- */}
      {student && (
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400">
          
          {/* BOTÓN CERRAR */}
          <button 
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 flex flex-col items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 hover:bg-[#d4a843] hover:text-[#1e3a5f] rounded-xl border border-slate-200 transition-all z-20 active:scale-90 group cursor-pointer shadow-xs"
          >
            <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
            <span className="text-[7px] md:text-[6px] font-black uppercase mt-0.5">Cerrar</span>
          </button>

          <div className="flex flex-col p-4 md:p-3">
            
            {/* BLOQUE SUPERIOR: Auditoría e Información Principal */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-4 mb-3 pb-3 border-b border-slate-100">
              
              {/* Avatar */}
              <div className={`h-14 w-14 shrink-0 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center text-[#1e3a5f] dark:text-[#d4a843] font-black text-xl shadow-xs`}>
                {String(student.nombre?.[0] || 'U')}
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left">
                {/* Etiqueta de Auditoría */}
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                  <Activity className="h-3 w-3 text-[#d4a843]" />
                  <span className="text-[9px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Reporte de Auditoría Digital</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[9px] md:text-[8px] font-black text-[#1e3a5f] uppercase tracking-[0.2em]">UNIMAR {new Date().getFullYear()}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-x-3 gap-y-1">
                  <h2 className="text-base md:text-xs font-black text-[#1e3a5f] uppercase tracking-tight truncate">
                    {String(student.nombre || '')} {String(student.apellido || '')}
                  </h2>
                  {student.nivel_riesgo && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${theme.bg} ${theme.text} text-[9px] md:text-[8px] font-black uppercase border ${theme.border} w-fit mx-auto md:mx-0 shadow-xs`}>
                      {theme.icon} Riesgo {String(student.nivel_riesgo)}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 mt-1.5 text-xs md:text-[10px] font-bold text-slate-500">
                  <span className="text-[#d4a843] tabular-nums font-black text-sm md:text-xs">V-{String(student.cedula || '')}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="uppercase tracking-widest opacity-90">{String(student.carrera || '')}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1.5 opacity-75 lowercase font-medium">
                    <Mail className="h-3 w-3 text-[#1e3a5f]" />
                    {String(student.email || '')}
                  </span>
                </div>
              </div>

              {/* ACCIONES (Ordenadas: Expediente primero, luego Editar y Borrar) */}
              {mostrarResultado && (
                <div className="flex items-center gap-2 md:mr-14">
                  
                  {/* 1. Botón Expediente (Activa su panel de confirmación) */}
                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarConfirmacionExpediente(true);
                      setMostrarConfirmacionEditar(false);
                      setMostrarConfirmacionBorrar(false);
                    }}
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-9 md:h-9 bg-slate-50 border border-slate-200 rounded-xl text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all active:scale-95 group cursor-pointer shadow-xs"
                    title="Ver Expediente y Auditoría"
                  >
                    <FileText className="h-4 w-4 md:h-3.5 md:w-3.5 mb-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] md:text-[7px] font-black uppercase tracking-wider">Expediente</span>
                  </button>

                  {/* 2. Botón Editar (Activa su panel de confirmación) */}
                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarConfirmacionEditar(true);
                      setMostrarConfirmacionExpediente(false);
                      setMostrarConfirmacionBorrar(false);
                    }} 
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-9 md:h-9 bg-slate-50 border border-slate-200 rounded-xl text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all active:scale-95 group cursor-pointer shadow-xs"
                    title="Editar estudio"
                  >
                    <Edit3 className="h-4 w-4 md:h-3.5 md:w-3.5 mb-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] md:text-[7px] font-black uppercase tracking-wider">Editar</span>
                  </button>

                  {/* 3. Botón Borrar (Activa su panel de confirmación) */}
                  <button 
                    type="button"
                    onClick={() => {
                      setMostrarConfirmacionBorrar(true);
                      setMostrarConfirmacionExpediente(false);
                      setMostrarConfirmacionEditar(false);
                    }} 
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-9 md:h-9 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95 group cursor-pointer shadow-xs"
                    title="Borrar estudio"
                  >
                    <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5 mb-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] md:text-[7px] font-black uppercase tracking-wider">Borrar</span>
                  </button>
                </div>
              )}
            </div>

            {/* PANEL DE CONFIRMACIÓN: EXPEDIENTE */}
            {mostrarConfirmacionExpediente && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-[#1e3a5f] shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">¿Acceder al expediente del estudiante?</h4>
                    <p className="text-xs md:text-[10px] text-slate-600">Se abrirá el registro completo y la auditoría detallada del perfil.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmacionExpediente(false)}
                    className="px-3.5 py-2.5 md:py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs md:text-[10px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={ejecutarAccionExpediente}
                    className="px-4 py-2.5 md:py-1.5 bg-[#d4a843] hover:bg-[#c2973b] text-[#1e3a5f] rounded-lg text-xs md:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                    Sí, ver expediente
                  </button>
                </div>
              </div>
            )}

            {/* PANEL DE CONFIRMACIÓN: EDITAR */}
            {mostrarConfirmacionEditar && (
              <div className="mb-3 p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">¿Deseas editar los datos de este estudio?</h4>
                    <p className="text-xs md:text-[10px] text-slate-600">Se habilitará el formulario interactivo para modificar la información.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmacionEditar(false)}
                    className="px-3.5 py-2.5 md:py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs md:text-[10px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={ejecutarAccionEditar}
                    className="px-4 py-2.5 md:py-1.5 bg-[#1e3a5f] hover:bg-[#162c4a] text-white rounded-lg text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                    Sí, editar
                  </button>
                </div>
              </div>
            )}

            {/* PANEL DE CONFIRMACIÓN: BORRAR */}
            {mostrarConfirmacionBorrar && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">¿Estás seguro de eliminar este estudio?</h4>
                    <p className="text-xs md:text-[10px] text-slate-600">Esta acción no se puede deshacer y borrará los registros asociados.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmacionBorrar(false)}
                    disabled={isDeleting}
                    className="px-3.5 py-2.5 md:py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs md:text-[10px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarBorradoEstudio}
                    disabled={isDeleting}
                    className="px-4 py-2.5 md:py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs md:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isDeleting && <Loader2 className="h-3.5 w-3.5 md:h-3 md:w-3 animate-spin" />}
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}

            {/* BLOQUE INFERIOR: Leyenda de Riesgos */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 opacity-75 hover:opacity-100 transition-opacity pt-2 border-t border-slate-100">
               <div className="flex items-center gap-1.5">
                  <Info className="h-3 w-3 text-slate-400" />
                  <span className="text-[9px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Leyenda de Baremo:</span>
               </div>
               <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></div>
                    <span className="text-[9px] md:text-[8px] font-bold text-slate-600">CRÍTICO (70+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <span className="text-[9px] md:text-[8px] font-bold text-slate-600">ALTO (50-69)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    <span className="text-[9px] md:text-[8px] font-bold text-slate-600">MEDIO (25-49)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] md:text-[8px] font-bold text-slate-600">BAJO (0-24)</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}