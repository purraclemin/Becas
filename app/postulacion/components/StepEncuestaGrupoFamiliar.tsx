"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Users2,
  UserCircle,
  Baby,
  Building2,
  GraduationCap,
  Info,
  Plus,
  Trash2,
  HeartHandshake
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MiembroNucleoFamiliar, PostulacionUser } from "../types"

interface FichaFamiliarState {
  nombre: string;
  edad: string;
  ocupacion: string;
  trabajo: string;
  nacionalidad: string;
  instruccion: string;
}

interface CampoFamiliarConfig {
  key: keyof FichaFamiliarState;
  label: string;
  span: string;
  type: "letras" | "numeros" | "texto";
  placeholder: string;
  max?: number;
  center?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  icon?: React.ElementType;
}

const OPCIONES_ESTATUS_CONYUGAL = [
  "Ninguna",
  "Matrimonio Civil",
  "Concubinato",
  "Separados",
  "Divorciados"
] as const;

const crearIntegranteVacio = (): MiembroNucleoFamiliar => ({
  nombre: "",
  edad: "",
  sexo: "",
  parentesco: "",
  instruccion: "",
  ocupacion: "",
});

const sanitizarEdadInicial = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Math.trunc(Number(val));
  return !isNaN(num) && num >= 1 && num <= 120 ? String(num) : "";
};

const sanitizarEnteroNoNegativoInicial = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Math.trunc(Number(val));
  return !isNaN(num) && num >= 0 ? String(num) : "";
};

const parsearNucleoInicial = (jsonStr: string | undefined): MiembroNucleoFamiliar[] => {
  if (!jsonStr || jsonStr.trim() === "") return [crearIntegranteVacio()];
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [crearIntegranteVacio()];
    return parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        nombre: String(item.nombre ?? ""),
        edad: String(item.edad ?? ""),
        sexo: String(item.sexo ?? ""),
        parentesco: String(item.parentesco ?? ""),
        instruccion: String(item.instruccion ?? ""),
        ocupacion: String(item.ocupacion ?? ""),
      }));
  } catch {
    return [crearIntegranteVacio()];
  }
};

export function StepEncuestaGrupoFamiliar({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [padre, setPadre] = useState<FichaFamiliarState>({
    nombre: user?.padre_nombre || "",
    edad: sanitizarEdadInicial(user?.padre_edad),
    ocupacion: user?.padre_ocupacion || "",
    trabajo: user?.padre_trabajo || "",
    nacionalidad: user?.padre_nacionalidad || "Venezolano/a",
    instruccion: user?.padre_instruccion || "",
  });

  const [madre, setMadre] = useState<FichaFamiliarState>({
    nombre: user?.madre_nombre || "",
    edad: sanitizarEdadInicial(user?.madre_edad),
    ocupacion: user?.madre_ocupacion || "",
    trabajo: user?.madre_trabajo || "",
    nacionalidad: user?.madre_nacionalidad || "Venezolano/a",
    instruccion: user?.madre_instruccion || "",
  });

  const [estatusConyugal, setEstatusConyugal] = useState<string>(
    user?.familia_estatus_conyugal || "Ninguna"
  );

  const [numHermanos, setNumHermanos] = useState<string>(
    sanitizarEnteroNoNegativoInicial(user?.familia_num_hermanos)
  );

  const hermanosUniSnInicial =
    user?.familia_hermanos_uni_sn === "Si" ||
    Number(user?.familia_hermanos_uni || 0) > 0
      ? "Si"
      : "No";

  const [hermanosUniSn, setHermanosUniSn] = useState<string>(hermanosUniSnInicial);
  const [hermanosUni, setHermanosUni] = useState<string>(() => {
    if (hermanosUniSnInicial === "No") return "0";
    return sanitizarEnteroNoNegativoInicial(user?.familia_hermanos_uni) || "1";
  });

  const [nucleoFamiliar, setNucleoFamiliar] = useState<MiembroNucleoFamiliar[]>(() =>
    parsearNucleoInicial(user?.familia_nucleo_json)
  );

  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);
  const [ultimoAgregadoIdx, setUltimoAgregadoIdx] = useState<number | null>(null);

  const padreNombreRef = useRef<HTMLInputElement>(null);
  const madreNombreRef = useRef<HTMLInputElement>(null);
  const numHermanosRef = useRef<HTMLInputElement>(null);
  const hermanosUniRef = useRef<HTMLInputElement>(null);
  const ultimoIntegranteRef = useRef<HTMLDivElement>(null);

  const isEdadValida = (edadStr: string): boolean => {
    if (edadStr.trim() === "") return false;
    const n = parseInt(edadStr, 10);
    return !isNaN(n) && n >= 1 && n <= 120;
  };

  const isPadreValid =
    padre.nombre.trim() !== "" &&
    isEdadValida(padre.edad) &&
    padre.ocupacion.trim() !== "" &&
    padre.trabajo.trim() !== "";

  const isMadreValid =
    madre.nombre.trim() !== "" &&
    isEdadValida(madre.edad) &&
    madre.ocupacion.trim() !== "" &&
    madre.trabajo.trim() !== "";

  const valorHermanosUniFinal = hermanosUniSn === "No" ? "0" : hermanosUni;
  const isHermanosUniValido =
    hermanosUniSn === "No" ||
    (hermanosUni.trim() !== "" && parseInt(hermanosUni, 10) >= 1);

  const isHermanosValid = numHermanos !== "" && isHermanosUniValido;
  const isValid = isPadreValid && isMadreValid && isHermanosValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isPadreValid && padreNombreRef.current) padreNombreRef.current.focus();
      else if (!isMadreValid && madreNombreRef.current) madreNombreRef.current.focus();
      else if (numHermanos === "" && numHermanosRef.current) numHermanosRef.current.focus();
      else if (!isHermanosUniValido && hermanosUniRef.current) hermanosUniRef.current.focus();
    };

    window.addEventListener("intentar-avanzar-familia", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-familia", handleValidationAttempt);
  }, [isPadreValid, isMadreValid, numHermanos, isHermanosUniValido]);

  useEffect(() => {
    if (ultimoAgregadoIdx !== null && ultimoIntegranteRef.current) {
      ultimoIntegranteRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setUltimoAgregadoIdx(null);
    }
  }, [ultimoAgregadoIdx, nucleoFamiliar.length]);

  const handleInput = (
    setter: React.Dispatch<React.SetStateAction<FichaFamiliarState>>,
    field: keyof FichaFamiliarState,
    type: "letras" | "numeros" | "texto"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "letras") {
      const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s/]/g, "");
      setter(prev => ({ ...prev, [field]: soloLetras }));
    } else if (type === "texto") {
      const textoSeguro = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-/#()]/g, "");
      setter(prev => ({ ...prev, [field]: textoSeguro }));
    } else {
      const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 3);
      if (soloDigitos !== "" && parseInt(soloDigitos, 10) > 120) return;
      setter(prev => ({ ...prev, [field]: soloDigitos }));
    }
  };

  const handleHermanos = (isUni = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (isUni) {
      const max = numHermanos === "" ? 0 : parseInt(numHermanos, 10);
      const limpio = val === "" || parseInt(val, 10) <= max ? val : max.toString();
      setHermanosUni(limpio);
    } else {
      setNumHermanos(val);
      const maxNuevo = val === "" ? 0 : parseInt(val, 10);
      if (maxNuevo === 0) {
        setHermanosUniSn("No");
        setHermanosUni("0");
      } else if (hermanosUni !== "" && parseInt(hermanosUni, 10) > maxNuevo) {
        setHermanosUni(String(maxNuevo));
      }
    }
  };

  const agregarMiembroNucleo = () => {
    setNucleoFamiliar((prev) => {
      const siguienteIdx = prev.length;
      setUltimoAgregadoIdx(siguienteIdx);
      return [...prev, crearIntegranteVacio()];
    });
  };

  const actualizarMiembroNucleo = (
    index: number,
    campo: keyof MiembroNucleoFamiliar,
    valor: string
  ) => {
    setNucleoFamiliar((prev) =>
      prev.map((miembro, idx) =>
        idx === index
          ? {
              ...miembro,
              [campo]:
                campo === "edad"
                  ? valor.replace(/\D/g, "").slice(0, 3)
                  : valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,/]/g, "")
            }
          : miembro
      )
    );
  };

  const eliminarMiembroNucleo = (index: number) => {
    setNucleoFamiliar((prev) => prev.filter((_, idx) => idx !== index));
  };

  const nucleoFiltrado = nucleoFamiliar.filter(
    (m) => m.nombre.trim() !== "" || m.parentesco.trim() !== "" || m.ocupacion.trim() !== ""
  );

  const editableClass =
    "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  const compactControlClass =
    "h-12 lg:h-7 bg-white border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2 rounded-lg";

  const renderFichaFamiliar = (
    titulo: string,
    tipo: "padre" | "madre",
    data: FichaFamiliarState,
    setter: React.Dispatch<React.SetStateAction<FichaFamiliarState>>,
    ref: React.RefObject<HTMLInputElement | null>,
    colorClass: string,
    hoverClass: string
  ) => {
    const campos: CampoFamiliarConfig[] = [
      { key: "nombre", label: "Nombres y Apellidos", span: "col-span-4 sm:col-span-3", type: "letras", placeholder: "Nombre completo", ref },
      { key: "edad", label: "Edad", span: "col-span-2 sm:col-span-1", type: "numeros", placeholder: "Ej. 45", max: 3, center: true },
      { key: "nacionalidad", label: "Nacionalidad", span: "col-span-2 sm:col-span-2", type: "letras", placeholder: "Venezolano/a" },
      { key: "ocupacion", label: "Ocupación", span: "col-span-4 sm:col-span-2", type: "letras", placeholder: "Ej. Comerciante" },
      { key: "instruccion", label: "Grado de Instrucción", span: "col-span-4 sm:col-span-2", type: "texto", placeholder: "Bachiller / T.S.U. / Lic." },
      { key: "trabajo", label: "Lugar de Trabajo y Dirección", span: "col-span-4 sm:col-span-4", type: "texto", placeholder: "Empresa, negocio o dirección", icon: Building2 }
    ];

    return (
      <div className={cn("p-3 lg:p-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm relative transition-colors", hoverClass)}>
        <div className="flex items-center gap-2 mb-1.5">
          <UserCircle className={cn("h-3.5 w-3.5", colorClass)} />
          <Label className={cn("text-[9px] font-black uppercase tracking-widest", colorClass)}>{titulo}</Label>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
          {campos.map((field) => {
            const valorActual = data[field.key];
            const esRequeridoBase =
              field.key === "nombre" ||
              field.key === "edad" ||
              field.key === "ocupacion" ||
              field.key === "trabajo";
            const isInvalid = hasAttemptedNext && esRequeridoBase && (
              field.key === "edad" ? !isEdadValida(valorActual) : valorActual.trim() === ""
            );
            const IconComp = field.icon;

            return (
              <div key={field.key} className={field.span + " space-y-0.5"}>
                <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors leading-none", isInvalid ? "text-red-500 font-extrabold" : "text-slate-500")}>
                  {IconComp && <IconComp className="h-2.5 w-2.5 text-[#d4a843]" />}
                  {field.label} {isInvalid && "*"}
                </Label>
                <Input
                  ref={field.ref}
                  name={`${tipo}_${field.key}`}
                  type="text"
                  inputMode={field.type === "numeros" ? "numeric" : "text"}
                  disabled={disabled}
                  value={valorActual}
                  onChange={handleInput(setter, field.key, field.type)}
                  required={esRequeridoBase}
                  maxLength={field.max}
                  placeholder={field.placeholder}
                  className={cn(editableClass, field.center && "text-center", isInvalid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 pb-6 lg:pb-0">
      <div className="bg-slate-50 px-2.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shrink-0">
        <Info className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />
        <p className="text-[8.5px] text-slate-600 font-bold uppercase tracking-tight leading-snug">
          3- Área Familiar: Datos de los padres, situación conyugal, hermanos y conformación del núcleo familiar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {renderFichaFamiliar("Ficha del Padre", "padre", padre, setPadre, padreNombreRef, "text-blue-600", "hover:border-blue-200")}
        {renderFichaFamiliar("Ficha de la Madre", "madre", madre, setMadre, madreNombreRef, "text-pink-600", "hover:border-pink-200")}
      </div>

      <div className="p-2.5 bg-[#1e3a5f]/5 rounded-2xl border border-[#1e3a5f]/10 space-y-2 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-[8px] font-black uppercase flex items-center gap-1.5 text-[#1e3a5f] leading-none">
              <HeartHandshake className="h-2.5 w-2.5 text-[#d4a843]" /> Situación Parental
            </Label>
            <select
              name="familia_estatus_conyugal"
              disabled={disabled}
              value={estatusConyugal}
              onChange={(e) => setEstatusConyugal(e.target.value)}
              className={cn(compactControlClass, "w-full outline-none cursor-pointer")}
            >
              {OPCIONES_ESTATUS_CONYUGAL.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors leading-none", hasAttemptedNext && numHermanos === "" ? "text-red-500 font-extrabold" : "text-slate-500")}>
              <Users2 className="h-2.5 w-2.5 text-[#d4a843]" /> Número de Hermanos {hasAttemptedNext && numHermanos === "" && "*"}
            </Label>
            <Input
              ref={numHermanosRef}
              name="familia_num_hermanos"
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={disabled}
              value={numHermanos}
              onChange={handleHermanos(false)}
              required
              placeholder="0"
              className={cn(compactControlClass, "text-center", hasAttemptedNext && numHermanos === "" && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[8px] font-black uppercase text-slate-500 leading-none block">
              Hnos. Uni (Sí/No)
            </Label>
            <select
              name="familia_hermanos_uni_sn"
              disabled={disabled || numHermanos === "0"}
              value={hermanosUniSn}
              onChange={(e) => {
                const val = e.target.value;
                setHermanosUniSn(val);
                if (val === "No") {
                  setHermanosUni("0");
                } else if (hermanosUni === "0" || hermanosUni === "") {
                  setHermanosUni("1");
                }
              }}
              className={cn(compactControlClass, "w-full outline-none cursor-pointer")}
            >
              <option value="No">No</option>
              <option value="Si">Sí</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1 transition-colors leading-none", hasAttemptedNext && !isHermanosUniValido ? "text-red-500 font-extrabold" : "text-slate-500")}>
              <GraduationCap className="h-2.5 w-2.5 text-[#d4a843]" /> Cantidad {hasAttemptedNext && !isHermanosUniValido && "*"}
            </Label>
            <Input
              ref={hermanosUniRef}
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={disabled || hermanosUniSn === "No"}
              value={valorHermanosUniFinal}
              onChange={handleHermanos(true)}
              required={hermanosUniSn === "Si"}
              placeholder="0"
              className={cn(compactControlClass, "text-center", hasAttemptedNext && !isHermanosUniValido && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
            />
            <input type="hidden" name="familia_hermanos_uni" value={valorHermanosUniFinal} />
          </div>
        </div>

        {/* Conformación del Núcleo Familiar (permite eliminar el primer/único integrante si está solo) */}
        <div className="pt-1.5 border-t border-[#1e3a5f]/10 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Baby className="h-3.5 w-3.5 text-[#d4a843]" />
              <Label className="text-[8.5px] font-black uppercase tracking-wider text-[#1e3a5f]">
                Como se conforma su Núcleo Familiar (Apellidos y Nombres, Edad, Sexo, Parentesco, Instrucción, Ocupación
              </Label>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={agregarMiembroNucleo}
              className="inline-flex items-center gap-1 px-2.5 h-7 rounded-lg bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-wider hover:bg-[#162d4a] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Plus className="h-3 w-3 text-[#d4a843]" /> Agregar Integrante
            </button>
          </div>

          {nucleoFamiliar.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {nucleoFamiliar.map((miembro, idx) => {
                const esUltimo = idx === nucleoFamiliar.length - 1;
                return (
                  <div
                    key={idx}
                    ref={esUltimo ? ultimoIntegranteRef : undefined}
                    className="grid grid-cols-2 sm:grid-cols-12 gap-1.5 items-center bg-white p-1.5 rounded-xl border border-slate-200"
                  >
                    <Input
                      type="text"
                      disabled={disabled}
                      value={miembro.nombre}
                      onChange={(e) => actualizarMiembroNucleo(idx, "nombre", e.target.value)}
                      placeholder="Apellidos y Nombres"
                      className="sm:col-span-3 h-10 lg:h-7 bg-slate-50 border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] rounded-lg px-2"
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      disabled={disabled}
                      value={miembro.edad}
                      onChange={(e) => actualizarMiembroNucleo(idx, "edad", e.target.value)}
                      placeholder="Edad"
                      className="sm:col-span-1 h-10 lg:h-7 bg-slate-50 border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] text-center rounded-lg px-1"
                    />
                    <select
                      disabled={disabled}
                      value={miembro.sexo}
                      onChange={(e) => actualizarMiembroNucleo(idx, "sexo", e.target.value)}
                      className="sm:col-span-2 h-10 lg:h-7 bg-slate-50 border border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] rounded-lg px-1.5 outline-none"
                    >
                      <option value="">Sexo</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                    <Input
                      type="text"
                      disabled={disabled}
                      value={miembro.parentesco}
                      onChange={(e) => actualizarMiembroNucleo(idx, "parentesco", e.target.value)}
                      placeholder="Parentesco"
                      className="sm:col-span-2 h-10 lg:h-7 bg-slate-50 border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] rounded-lg px-2"
                    />
                    <Input
                      type="text"
                      disabled={disabled}
                      value={miembro.instruccion}
                      onChange={(e) => actualizarMiembroNucleo(idx, "instruccion", e.target.value)}
                      placeholder="Instrucción"
                      className="sm:col-span-2 h-10 lg:h-7 bg-slate-50 border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] rounded-lg px-2"
                    />
                    <div className="col-span-2 sm:col-span-2 flex items-center gap-1">
                      <Input
                        type="text"
                        disabled={disabled}
                        value={miembro.ocupacion}
                        onChange={(e) => actualizarMiembroNucleo(idx, "ocupacion", e.target.value)}
                        placeholder="Ocupación"
                        className="h-10 lg:h-7 bg-slate-50 border-slate-200 text-xs lg:text-[11px] font-bold text-[#1e3a5f] rounded-lg px-2 flex-1"
                      />
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => eliminarMiembroNucleo(idx)}
                        className="h-10 lg:h-7 w-8 lg:w-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                        title="Eliminar integrante"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/80 border border-dashed border-slate-200 rounded-xl px-3 py-2 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sin integrantes adicionales registrados. Pulse &ldquo;Agregar Integrante&rdquo; si desea incluir alguno.
              </p>
            </div>
          )}

          <input
            type="hidden"
            name="familia_nucleo_json"
            value={JSON.stringify(nucleoFiltrado)}
          />
        </div>
      </div>
    </div>
  )
}