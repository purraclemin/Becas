"use client"

import React, { useRef } from "react"
import { Copy, ChevronRight, Plus, Trash2, Users, Calendar, type LucideIcon } from "lucide-react"
import type { CampoFormularioAdmin } from "./StepFormData"

interface IntegranteNucleoAudit {
  nombre: string;
  edad: string;
  sexo: string;
  parentesco: string;
  instruccion: string;
  ocupacion: string;
}

interface AuditSectionProps {
  icon: LucideIcon;
  title: string;
  fields: ReadonlyArray<CampoFormularioAdmin>;
  formData: Record<string, unknown>;
  dataEstudiante: Record<string, string> | null;
  copyValue: (field: string, value: string | number | boolean | null | undefined) => void;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  campoFaltante?: string | null;
}

const crearIntegranteVacio = (): IntegranteNucleoAudit => ({
  nombre: "",
  edad: "",
  sexo: "",
  parentesco: "",
  instruccion: "",
  ocupacion: "",
});

const parsearIntegrantes = (raw: unknown): IntegranteNucleoAudit[] => {
  if (!raw) return [];
  const texto = typeof raw === "string" ? raw.trim() : JSON.stringify(raw);
  if (!texto || texto === "[]" || texto.toLowerCase() === "no" || texto.toLowerCase() === "no declarado") {
    return [];
  }
  try {
    const parsed: unknown = typeof raw === "string" ? JSON.parse(texto) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        nombre: String(item.nombre ?? item.NOMBRE ?? "").trim(),
        edad: String(item.edad ?? item.EDAD ?? "").trim(),
        sexo: String(item.sexo ?? item.SEXO ?? "").trim(),
        parentesco: String(item.parentesco ?? item.PARENTESCO ?? "").trim(),
        instruccion: String(item.instruccion ?? item.INSTRUCCION ?? "").trim(),
        ocupacion: String(item.ocupacion ?? item.OCUPACION ?? "").trim(),
      }));
  } catch {
    return [];
  }
};

const normalizarListaParaComparar = (lista: IntegranteNucleoAudit[]): string => {
  const limpios = lista
    .map((m) => ({
      nombre: m.nombre.trim().toLowerCase(),
      edad: m.edad.trim(),
      sexo: m.sexo.trim().toLowerCase(),
      parentesco: m.parentesco.trim().toLowerCase(),
      instruccion: m.instruccion.trim().toLowerCase(),
      ocupacion: m.ocupacion.trim().toLowerCase(),
    }))
    .filter((m) => m.nombre || m.parentesco || m.ocupacion || m.edad || m.sexo || m.instruccion);
  return JSON.stringify(limpios);
};

const formatearFechaDDMMAAAA = (val: unknown): string => {
  if (val === undefined || val === null) return "";

  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return "";
    const dia = String(val.getDate()).padStart(2, "0");
    const mes = String(val.getMonth() + 1).padStart(2, "0");
    const anio = String(val.getFullYear());
    return `${dia}/${mes}/${anio}`;
  }

  const texto = String(val).trim();
  if (!texto) return "";

  const fechaBase = texto.includes("T") ? texto.split("T")[0] : texto;

  const isoMatch = fechaBase.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const dmyMatch = fechaBase.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[1]}/${dmyMatch[2]}/${dmyMatch[3]}`;
  }

  const parsed = new Date(texto);
  if (!Number.isNaN(parsed.getTime())) {
    const dia = String(parsed.getDate()).padStart(2, "0");
    const mes = String(parsed.getMonth() + 1).padStart(2, "0");
    const anio = String(parsed.getFullYear());
    return `${dia}/${mes}/${anio}`;
  }

  return texto;
};

const aplicarMascaraDDMMAAAA = (valor: string): string => {
  const soloDigitos = valor.replace(/\D/g, "").slice(0, 8);
  if (soloDigitos.length <= 2) return soloDigitos;
  if (soloDigitos.length <= 4) {
    return `${soloDigitos.slice(0, 2)}/${soloDigitos.slice(2)}`;
  }
  return `${soloDigitos.slice(0, 2)}/${soloDigitos.slice(2, 4)}/${soloDigitos.slice(4)}`;
};

const convertirAISOFecha = (val: unknown): string => {
  if (val === undefined || val === null) return "";

  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return "";
    const dia = String(val.getDate()).padStart(2, "0");
    const mes = String(val.getMonth() + 1).padStart(2, "0");
    const anio = String(val.getFullYear());
    return `${anio}-${mes}-${dia}`;
  }

  const texto = String(val).trim();
  if (!texto) return "";
  const fechaBase = texto.includes("T") ? texto.split("T")[0] : texto;

  const isoMatch = fechaBase.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const dmyMatch = fechaBase.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  }

  return "";
};

const normalizarFechaParaComparar = (val: unknown): string | null => {
  const iso = convertirAISOFecha(val);
  return iso ? iso : null;
};

const formatDisplayEstudiante = (val: unknown, tipo?: string, campo?: string): string => {
  if (campo === "socio_fecha_unimar") {
    const fechaFormateada = formatearFechaDDMMAAAA(val);
    return fechaFormateada || "No";
  }
  const strVal = val !== undefined && val !== null ? String(val) : "No";
  if (tipo === "checkbox") {
    return (
      strVal === "on" ||
      strVal === "Posee" ||
      strVal === "Si" ||
      strVal === "Sí"
    )
      ? "SI"
      : "NO";
  }
  return strVal;
};

const normalizeComparable = (val: unknown, campo?: string): string => {
  if (val === undefined || val === null) return "";
  if (campo === "socio_fecha_unimar") {
    const fechaIso = normalizarFechaParaComparar(val);
    if (fechaIso) return fechaIso;
  }
  const str = String(val);
  if (str === "on" || str === "Posee" || str === "Si" || str === "Sí" || str === "on_true") {
    return "on_true";
  }
  if (str === "off" || str === "No posee" || str === "No" || str === "off_false") {
    return "off_false";
  }
  const trimmed = str.trim();
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
    return String(Number(trimmed));
  }
  return trimmed.toLowerCase();
};

function CampoFechaVenezolano({
  name,
  valueRaw,
  onChange,
  className,
}: {
  name: string;
  valueRaw: unknown;
  onChange: (nuevoValor: string) => void;
  className: string;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const textoActual =
    valueRaw instanceof Date
      ? formatearFechaDDMMAAAA(valueRaw)
      : valueRaw !== undefined && valueRaw !== null
        ? String(valueRaw)
        : "";

  const fechaIsoPicker = convertirAISOFecha(valueRaw);

  const abrirCalendario = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      if (typeof picker.showPicker === "function") {
        picker.showPicker();
      } else {
        picker.focus();
      }
    } catch {
      picker.focus();
    }
  };

  return (
    <div
      onClick={abrirCalendario}
      className={`${className} relative flex items-center justify-between gap-2 cursor-pointer`}
    >
      <input
        name={name}
        type="text"
        inputMode="numeric"
        value={textoActual}
        onChange={(e) => onChange(aplicarMascaraDDMMAAAA(e.target.value))}
        placeholder="dd/mm/aaaa"
        className="w-full bg-transparent text-sm font-bold text-[#1e3a5f] outline-none placeholder:text-slate-400 cursor-pointer"
      />
      <Calendar className="h-4 w-4 text-[#1e3a5f]/70 shrink-0 pointer-events-none" />
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={fechaIsoPicker}
        onChange={(e) => {
          const iso = e.target.value;
          onChange(iso ? formatearFechaDDMMAAAA(iso) : "");
        }}
        className="sr-only"
      />
    </div>
  );
}

export function AuditSection({
  icon: Icon,
  title,
  fields,
  formData,
  dataEstudiante,
  copyValue,
  setFormData,
  campoFaltante = null
}: AuditSectionProps) {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-5 w-5 text-[#d4a843]" />
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-wider">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {fields.map((f) => {
          const valEstudiante = dataEstudiante?.[f.name] ?? "No";
          const valAdminRaw = formData[f.name];
          const valAdminStr =
            f.name === "socio_fecha_unimar"
              ? valAdminRaw instanceof Date
                ? formatearFechaDDMMAAAA(valAdminRaw)
                : valAdminRaw !== undefined && valAdminRaw !== null
                  ? String(valAdminRaw)
                  : ""
              : valAdminRaw !== undefined && valAdminRaw !== null
                ? String(valAdminRaw)
                : "";
          const esFaltanteEnEnvio = campoFaltante === f.name;

          if (f.type === "nucleo") {
            const integrantesDeclarados = parsearIntegrantes(valEstudiante);
            const integrantesAdmin = parsearIntegrantes(valAdminRaw);
            const isEmptyNucleo = valAdminStr.trim() === "" || valAdminStr === "seleccione";
            const isDifferentNucleo =
              !isEmptyNucleo &&
              normalizarListaParaComparar(integrantesAdmin) !==
                normalizarListaParaComparar(integrantesDeclarados);

            const guardarIntegrantes = (nuevaLista: IntegranteNucleoAudit[]) => {
              const limpios = nuevaLista.filter(
                (m) =>
                  m.nombre.trim() !== "" ||
                  m.edad.trim() !== "" ||
                  m.sexo.trim() !== "" ||
                  m.parentesco.trim() !== "" ||
                  m.instruccion.trim() !== "" ||
                  m.ocupacion.trim() !== ""
              );
              setFormData((prev) => ({
                ...prev,
                [f.name]: JSON.stringify(limpios),
              }));
            };

            const handleAgregarIntegrante = () => {
              const base = integrantesAdmin.length > 0 ? [...integrantesAdmin] : [];
              base.push(crearIntegranteVacio());
              setFormData((prev) => ({
                ...prev,
                [f.name]: JSON.stringify(base),
              }));
            };

            const handleActualizarIntegrante = (
              idx: number,
              campo: keyof IntegranteNucleoAudit,
              valor: string
            ) => {
              const base = integrantesAdmin.length > 0 ? [...integrantesAdmin] : [crearIntegranteVacio()];
              const actual = base[idx] ?? crearIntegranteVacio();
              const valorSanitizado =
                campo === "edad"
                  ? valor.replace(/\D/g, "").slice(0, 3)
                  : valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,/]/g, "");
              base[idx] = { ...actual, [campo]: valorSanitizado };
              setFormData((prev) => ({
                ...prev,
                [f.name]: JSON.stringify(base),
              }));
            };

            const handleEliminarIntegrante = (idx: number) => {
              const base = integrantesAdmin.filter((_, i) => i !== idx);
              guardarIntegrantes(base);
            };

            const handleCopiarNucleo = () => {
              copyValue(f.name, JSON.stringify(integrantesDeclarados));
            };

            return (
              <div
                key={f.name}
                data-audit-field={f.name}
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-start rounded-2xl transition-all ${
                  esFaltanteEnEnvio ? "ring-2 ring-rose-500 p-2 bg-rose-50/20" : ""
                }`}
              >
                {/* LADO IZQUIERDO: NÚCLEO DECLARADO LIMPIO */}
                <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {f.label} (Declarado)
                      </p>
                      <p className="text-[11px] font-bold text-[#1e3a5f] mt-0.5">
                        {integrantesDeclarados.length > 0
                          ? `${integrantesDeclarados.length} integrante(s) registrado(s)`
                          : "Sin integrantes declarados"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopiarNucleo}
                      title={`Copiar ${f.label}`}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-[#d4a843] hover:border-[#d4a843] transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {integrantesDeclarados.length > 0 ? (
                    <div className="space-y-1.5">
                      {integrantesDeclarados.map((m, i) => (
                        <div
                          key={i}
                          className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs text-[#1e3a5f]"
                        >
                          <p className="font-black uppercase truncate">
                            {m.nombre || "Sin nombre"}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600 font-semibold mt-1">
                            <span>Parentesco: <strong>{m.parentesco || "No"}</strong></span>
                            <span>Edad: <strong>{m.edad ? `${m.edad} años` : "No"}</strong></span>
                            <span>Sexo: <strong>{m.sexo || "No"}</strong></span>
                            <span>Instrucción: <strong>{m.instruccion || "No"}</strong></span>
                            <span>Ocupación: <strong>{m.ocupacion || "No"}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/80 border border-dashed border-slate-200 rounded-lg p-3 text-xs font-bold text-slate-400 uppercase">
                      No
                    </div>
                  )}
                </div>

                {/* LADO DERECHO: EDITOR INTERACTIVO DE NÚCLEO FAMILIAR */}
                <div className="relative">
                  <div className="absolute -top-2 left-4 px-2 bg-white z-10">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${
                        isEmptyNucleo || esFaltanteEnEnvio
                          ? esFaltanteEnEnvio ? "text-rose-600" : "text-slate-400"
                          : isDifferentNucleo
                            ? "text-rose-500"
                            : "text-[#d4a843]"
                      }`}
                    >
                      {isEmptyNucleo
                        ? esFaltanteEnEnvio ? "⚠️ Campo Faltante" : "Pendiente"
                        : isDifferentNucleo
                          ? "⚠️ Inconsistencia"
                          : "Verificación Admin"}
                    </span>
                  </div>

                  <input
                    type="hidden"
                    name={f.name}
                    value={isEmptyNucleo ? "" : JSON.stringify(integrantesAdmin)}
                  />

                  <div
                    className={`w-full bg-white border-2 p-4 rounded-xl space-y-2.5 transition-all ${
                      esFaltanteEnEnvio
                        ? "border-rose-500 bg-rose-50/20"
                        : isEmptyNucleo
                          ? "border-slate-100 focus-within:border-[#d4a843]"
                          : isDifferentNucleo
                            ? "border-rose-200 bg-rose-50/30"
                            : "border-slate-100 focus-within:border-[#d4a843]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1e3a5f] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#d4a843]" />
                        Integrantes Verificados ({integrantesAdmin.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAgregarIntegrante}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1e3a5f] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#162d4a] transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3 text-[#d4a843]" /> Agregar
                      </button>
                    </div>

                    {integrantesAdmin.length > 0 ? (
                      <div className="space-y-2">
                        {integrantesAdmin.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={m.nombre}
                                onChange={(e) => handleActualizarIntegrante(idx, "nombre", e.target.value)}
                                placeholder="Apellidos y Nombres"
                                className="sm:col-span-6 h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f]"
                              />
                              <input
                                type="text"
                                inputMode="numeric"
                                value={m.edad}
                                onChange={(e) => handleActualizarIntegrante(idx, "edad", e.target.value)}
                                placeholder="Edad"
                                className="sm:col-span-3 h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-[#1e3a5f] text-center outline-none focus:border-[#1e3a5f]"
                              />
                              <select
                                value={m.sexo}
                                onChange={(e) => handleActualizarIntegrante(idx, "sexo", e.target.value)}
                                className="sm:col-span-3 h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f]"
                              >
                                <option value="">Sexo</option>
                                <option value="M">M</option>
                                <option value="F">F</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                              <input
                                type="text"
                                value={m.parentesco}
                                onChange={(e) => handleActualizarIntegrante(idx, "parentesco", e.target.value)}
                                placeholder="Parentesco"
                                className="sm:col-span-4 h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f]"
                              />
                              <input
                                type="text"
                                value={m.instruccion}
                                onChange={(e) => handleActualizarIntegrante(idx, "instruccion", e.target.value)}
                                placeholder="Instrucción"
                                className="sm:col-span-4 h-9 bg-white border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f]"
                              />
                              <div className="sm:col-span-4 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={m.ocupacion}
                                  onChange={(e) => handleActualizarIntegrante(idx, "ocupacion", e.target.value)}
                                  placeholder="Ocupación"
                                  className="h-9 flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-2.5 text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleEliminarIntegrante(idx)}
                                  title="Eliminar integrante"
                                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 py-1">
                        <span className="text-xs font-bold text-slate-400">
                          {isEmptyNucleo
                            ? "Pendiente: pulse Copiar o Agregar para verificar"
                            : "Sin integrantes verificados"}
                        </span>
                        {isEmptyNucleo && (
                          <button
                            type="button"
                            onClick={() => guardarIntegrantes([])}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1e3a5f] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Confirmar Vacío
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          const textoDeclarado = formatDisplayEstudiante(valEstudiante, f.type, f.name);
          const displayEstudiante = normalizeComparable(valEstudiante, f.name);
          const displayAdmin = normalizeComparable(valAdminRaw, f.name);

          const isDifferent =
            valAdminStr !== "" &&
            displayAdmin !== displayEstudiante &&
            valEstudiante !== "No declarado";
          const isEmpty = valAdminStr === "" || valAdminStr === "seleccione";

          const handleFieldChange = (nuevoValor: string) => {
            setFormData((prev) => ({ ...prev, [f.name]: nuevoValor }));
          };

          const handleCopy = () => {
            if (f.name === "socio_fecha_unimar") {
              copyValue(f.name, formatearFechaDDMMAAAA(valEstudiante));
              return;
            }
            let copyTarget = String(valEstudiante);
            if (f.type === "checkbox") {
              copyTarget =
                valEstudiante === "Posee" ||
                valEstudiante === "on" ||
                valEstudiante === "Si" ||
                valEstudiante === "Sí"
                  ? "on"
                  : "off";
            } else if (
              f.name === "salud_condicion_especial" ||
              f.name === "posee_empleo_aspirante" ||
              f.name === "familia_hermanos_uni_sn" ||
              f.name === "familia_problema_sn"
            ) {
              copyTarget =
                valEstudiante === "Si" ||
                valEstudiante === "Sí" ||
                valEstudiante === "on" ||
                valEstudiante === "Posee"
                  ? "Si"
                  : "No";
            } else if (f.type === "number") {
              copyTarget = String(valEstudiante).replace(/[^0-9.]/g, "");
            }
            copyValue(f.name, copyTarget);
          };

          const inputEstiloBase = `w-full bg-white border-2 p-4 rounded-xl text-sm font-bold text-[#1e3a5f] outline-none transition-all ${
            esFaltanteEnEnvio
              ? "border-rose-500 bg-rose-50/30"
              : isEmpty
                ? "border-slate-100 focus:border-[#d4a843]"
                : isDifferent
                  ? "border-rose-200 bg-rose-50/30"
                  : "border-slate-100 focus:border-[#d4a843]"
          }`;

          return (
            <div
              key={f.name}
              data-audit-field={f.name}
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-2xl transition-all ${
                esFaltanteEnEnvio ? "ring-2 ring-rose-500 p-2 bg-rose-50/20" : ""
              }`}
            >
              {/* LADO IZQUIERDO: DATO DECLARADO */}
              <div
                title={`${f.label} (Declarado): ${textoDeclarado}`}
                className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                    {f.label} (Declarado)
                  </p>
                  <p className="text-sm font-black text-[#1e3a5f] truncate uppercase italic">
                    {textoDeclarado}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  title={`Copiar ${f.label}`}
                  className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-[#d4a843] hover:border-[#d4a843] transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* LADO DERECHO: VERIFICACIÓN ADMIN */}
              <div className="relative">
                <div className="absolute -top-2 left-4 px-2 bg-white z-10">
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest ${
                      isEmpty || esFaltanteEnEnvio
                        ? esFaltanteEnEnvio ? "text-rose-600" : "text-slate-400"
                        : isDifferent
                          ? "text-rose-500"
                          : "text-[#d4a843]"
                    }`}
                  >
                    {isEmpty
                      ? esFaltanteEnEnvio ? "⚠️ Campo Faltante" : "Pendiente"
                      : isDifferent
                        ? "⚠️ Inconsistencia"
                        : "Verificación Admin"}
                  </span>
                </div>

                {f.type === "checkbox" ? (
                  <div className="relative">
                    <select
                      name={f.name}
                      title={valAdminStr || "Seleccione..."}
                      value={valAdminStr}
                      onChange={(e) => handleFieldChange(e.target.value)}
                      className={`${inputEstiloBase} appearance-none`}
                    >
                      <option value="">Seleccione...</option>
                      <option value="on">SI</option>
                      <option value="off">NO</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 rotate-90 pointer-events-none" />
                  </div>
                ) : f.options ? (
                  <div className="relative">
                    <select
                      name={f.name}
                      title={valAdminStr || "Seleccione..."}
                      value={valAdminStr}
                      onChange={(e) => handleFieldChange(e.target.value)}
                      className={`${inputEstiloBase} appearance-none`}
                    >
                      <option value="">Seleccione...</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 rotate-90 pointer-events-none" />
                  </div>
                ) : f.name === "socio_fecha_unimar" ? (
                  <CampoFechaVenezolano
                    name={f.name}
                    valueRaw={valAdminRaw}
                    onChange={handleFieldChange}
                    className={inputEstiloBase}
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type || "text"}
                    title={valAdminStr || "Ingrese valor verificado..."}
                    value={valAdminStr}
                    onChange={(e) => handleFieldChange(e.target.value)}
                    className={inputEstiloBase}
                    placeholder="Ingrese valor verificado..."
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}