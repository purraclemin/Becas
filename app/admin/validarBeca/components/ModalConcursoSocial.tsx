"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  UserPlus,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building2
} from "lucide-react"
import {
  buscarEstudianteParaConcursoSocial,
  registrarBecarioConcursoSocial,
  type InputRegistroConcursoSocial,
} from "@/lib/ActionsGestionEspecial"
import { DEPARTAMENTOS_UNIMAR_OFICIALES } from "@/lib/RecordAcademicoUtils"
import {
  CARRERAS_UNIMAR_LIST,
  MUNICIPIOS_MARGARITA_LIST,
} from "@/components/registro/validations"

interface ModalConcursoSocialProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshList: () => void;
}

interface CuposSocialState {
  nuevosEsteAnio: number;
  maxNuevosAnual: number;
  activosPeriodo: number;
  maxActivosPeriodo: number;
}

interface FeedbackSocial {
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
}

const ESTADO_INICIAL_FORM: InputRegistroConcursoSocial = {
  cedula: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  sexo: "M",
  fecha_nacimiento: "2007-01-15",
  municipio_residencia: "García",
  carrera: CARRERAS_UNIMAR_LIST[0],
  promedio_bachillerato: 18.5,
  ue_procedencia: "",
  departamento_asignado: DEPARTAMENTOS_UNIMAR_OFICIALES[0],
  observaciones_concurso: "",
};

export function ModalConcursoSocial({
  isOpen,
  onClose,
  onRefreshList,
}: ModalConcursoSocialProps) {
  const [form, setForm] = useState<InputRegistroConcursoSocial>(ESTADO_INICIAL_FORM);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [estudianteExistente, setEstudianteExistente] = useState<boolean>(false);
  const [bloqueadoParaRegistro, setBloqueadoParaRegistro] = useState<boolean>(false);
  const [cupos, setCupos] = useState<CuposSocialState>({
    nuevosEsteAnio: 0,
    maxNuevosAnual: 10,
    activosPeriodo: 0,
    maxActivosPeriodo: 60,
  });
  const [feedback, setFeedback] = useState<FeedbackSocial | null>(null);

  const cargarCuposIniciales = useCallback(async () => {
    try {
      const res = await buscarEstudianteParaConcursoSocial("");
      if (res.success && res.cupos) {
        setCupos(res.cupos);
      }
    } catch {
      // Silencioso en carga inicial de cupos
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setForm(ESTADO_INICIAL_FORM);
      setEstudianteExistente(false);
      setBloqueadoParaRegistro(false);
      setFeedback(null);
      void cargarCuposIniciales();
    }
  }, [isOpen, cargarCuposIniciales]);

  if (!isOpen) return null;

  const handleBuscarCedula = async () => {
    const cedulaLimpia = form.cedula.replace(/\D/g, "").trim();
    if (cedulaLimpia.length < 7) {
      setFeedback({ tipo: 'warning', mensaje: 'Ingrese al menos 7 dígitos de cédula para buscar.' });
      return;
    }

    setBuscando(true);
    setFeedback(null);
    setBloqueadoParaRegistro(false);

    try {
      const res = await buscarEstudianteParaConcursoSocial(cedulaLimpia);
      if (res.cupos) setCupos(res.cupos);

      if (!res.success) {
        setFeedback({ tipo: 'error', mensaje: res.error || 'Error al consultar la cédula.' });
        return;
      }

      if (res.encontrado && res.estudiante) {
        const est = res.estudiante;
        setEstudianteExistente(true);
        setForm((prev) => ({
          ...prev,
          cedula: est.cedula,
          nombre: est.nombre,
          apellido: est.apellido,
          email: est.email,
          telefono: est.telefono,
          sexo: est.sexo === 'F' ? 'F' : 'M',
          fecha_nacimiento: est.fecha_nacimiento || prev.fecha_nacimiento,
          municipio_residencia: est.municipio_residencia || prev.municipio_residencia,
          carrera: est.carrera || prev.carrera,
        }));

        if (est.beca_perdida) {
          setBloqueadoParaRegistro(true);
          setFeedback({
            tipo: 'error',
            mensaje: 'Este estudiante registra una suspensión definitiva previa (Art. 28) y no puede recibir beca.',
          });
        } else if (est.yaTieneSolicitudActual) {
          setBloqueadoParaRegistro(true);
          setFeedback({
            tipo: 'warning',
            mensaje: `El estudiante ya posee un registro activo en el periodo actual (${est.tipoBecaActual} — ${est.estatusActual}).`,
          });
        } else {
          setFeedback({
            tipo: 'success',
            mensaje: `Estudiante encontrado (${est.nombre} ${est.apellido}). Complete los datos del concurso y el departamento para aprobar directamente.`,
          });
        }
      } else {
        setEstudianteExistente(false);
        setFeedback({
          tipo: 'warning',
          mensaje: 'No existe usuario con esa cédula. Complete el formulario para crear su cuenta (1° trimestre) y aprobar su Beca Social Aprendizaje.',
        });
      }
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al buscar por cédula.' });
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueadoParaRegistro) return;

    setGuardando(true);
    setFeedback(null);

    try {
      const res = await registrarBecarioConcursoSocial(form);
      if (res.success) {
        setFeedback({
          tipo: 'success',
          mensaje: res.message || 'Beneficiario registrado y aprobado correctamente.',
        });
        await cargarCuposIniciales();
        onRefreshList();
        setForm(ESTADO_INICIAL_FORM);
        setEstudianteExistente(false);
      } else {
        setFeedback({
          tipo: 'error',
          mensaje: res.error || 'No se pudo completar el registro.',
        });
      }
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de comunicación con el servidor.' });
    } finally {
      setGuardando(false);
    }
  };

  const inputClass =
    "w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed";
  const labelClass =
    "text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1e3a5f]/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Cabecera */}
        <div className="bg-[#1e3a5f] px-5 py-4 border-b-2 border-[#d4a843] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d4a843]/20 border border-[#d4a843]/40 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-[#d4a843]" />
            </div>
            <div>
              <h2 className="text-sm md:text-xs font-black text-white uppercase tracking-widest leading-none">
                Registro Directo — Concurso Beca Social Aprendizaje
              </h2>
              <p className="text-[10px] text-slate-300 font-semibold mt-1">
                Art. 6, 11–13: Seleccionados aprobados por Secretaría General y Consejo Superior (Crea usuario si no existe)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Indicador de Cupos Normativos */}
        <div className="bg-[#f8fafc] px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-black text-[#1e3a5f] uppercase">
            <ShieldCheck className="h-3.5 w-3.5 text-[#d4a843]" />
            <span>Cupo Anual Concurso: {cupos.nuevosEsteAnio} / {cupos.maxNuevosAnual}</span>
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase">
            Beneficiarios Activos Periodo: {cupos.activosPeriodo} / {cupos.maxActivosPeriodo}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2 ${
                feedback.tipo === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : feedback.tipo === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.tipo === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{feedback.mensaje}</span>
            </div>
          )}

          {/* Paso 1: Búsqueda por Cédula */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200">
            <label className={labelClass}>1. Cédula del Seleccionado (Verificar si ya posee cuenta)</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                maxLength={8}
                value={form.cedula}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setForm((prev) => ({ ...prev, cedula: val }));
                  setEstudianteExistente(false);
                  setBloqueadoParaRegistro(false);
                }}
                placeholder="Ej: 31222333"
                className={`${inputClass} bg-white flex-1`}
              />
              <button
                type="button"
                disabled={buscando}
                onClick={handleBuscarCedula}
                className="h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-xs md:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {buscando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5 text-[#d4a843]" />}
                Verificar Cédula
              </button>
            </div>
          </div>

          {/* Paso 2: Datos del Estudiante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                type="text"
                required
                disabled={estudianteExistente}
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Apellido *</label>
              <input
                type="text"
                required
                disabled={estudianteExistente}
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                placeholder="Apellido"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Correo @unimar.edu.ve *</label>
              <input
                type="email"
                required
                disabled={estudianteExistente}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="estudiante@unimar.edu.ve"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="text"
                maxLength={11}
                disabled={estudianteExistente}
                value={form.telefono}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, telefono: e.target.value.replace(/\D/g, "").slice(0, 11) }))
                }
                placeholder="04120000000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Sexo</label>
              <select
                disabled={estudianteExistente}
                value={form.sexo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sexo: e.target.value === 'F' ? 'F' : 'M' }))
                }
                className={inputClass}
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Fecha de Nacimiento</label>
              <input
                type="date"
                disabled={estudianteExistente}
                value={form.fecha_nacimiento}
                onChange={(e) => setForm((prev) => ({ ...prev, fecha_nacimiento: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Municipio</label>
              <select
                disabled={estudianteExistente}
                value={form.municipio_residencia}
                onChange={(e) => setForm((prev) => ({ ...prev, municipio_residencia: e.target.value }))}
                className={inputClass}
              >
                {MUNICIPIOS_MARGARITA_LIST.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Carrera *</label>
              <select
                disabled={estudianteExistente}
                value={form.carrera}
                onChange={(e) => setForm((prev) => ({ ...prev, carrera: e.target.value }))}
                className={inputClass}
              >
                {CARRERAS_UNIMAR_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Paso 3: Datos del Concurso y Departamento */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Promedio Bachillerato (18-20) *</label>
              <input
                type="number"
                step="0.01"
                min={18}
                max={20}
                required
                value={form.promedio_bachillerato}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, promedio_bachillerato: parseFloat(e.target.value) || 0 }))
                }
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>U.E. Pública de Procedencia *</label>
              <input
                type="text"
                required
                value={form.ue_procedencia}
                onChange={(e) => setForm((prev) => ({ ...prev, ue_procedencia: e.target.value }))}
                placeholder="Ej: U.E.N. Dr. Francisco Antonio Rísquez"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-3">
              <label className={`${labelClass} flex items-center gap-1`}>
                <Building2 className="h-3 w-3 text-[#d4a843]" /> Departamento Asignado (15h/sem) *
              </label>
              <select
                required
                value={form.departamento_asignado}
                onChange={(e) => setForm((prev) => ({ ...prev, departamento_asignado: e.target.value }))}
                className={inputClass}
              >
                {DEPARTAMENTOS_UNIMAR_OFICIALES.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className={labelClass}>Acta / Observaciones del Concurso (Opcional)</label>
              <input
                type="text"
                value={form.observaciones_concurso || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, observaciones_concurso: e.target.value }))}
                placeholder="Ej: Acta Consejo Superior N° 012-2026"
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-12 md:h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || bloqueadoParaRegistro}
              className="w-full sm:w-auto h-12 md:h-9 px-5 rounded-lg bg-[#d4a843] hover:bg-[#c2973b] text-[#1e3a5f] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Registrar y Aprobar Beneficio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}