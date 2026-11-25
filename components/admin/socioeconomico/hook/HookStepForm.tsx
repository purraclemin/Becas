"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { SECCIONES_MAESTRAS } from "@/components/admin/socioeconomico/StepFormData"
import type { EstudioSocioeconomicoInput } from "@/lib/ActionsSocioeconomicoActions"

type FormStateMap = Record<string, string | number | boolean | null | undefined>;

const CAMPOS_MONETARIOS_Y_CANTIDADES = new Set([
  "monto_ingreso_sueldo",
  "monto_ingreso_extra",
  "monto_ingreso_pension",
  "monto_ingreso_ayuda",
  "monto_ingreso_familiar",
  "monto_ingreso_rentas",
  "monto_ingreso_otros",
  "monto_egreso_mercado",
  "monto_egreso_vivienda",
  "monto_egreso_salud",
  "monto_egreso_servicios",
  "monto_egreso_suntuarios",
  "monto_egreso_estudios",
  "monto_egreso_recreacion",
  "familia_num_hermanos",
  "familia_hermanos_uni",
  "padre_edad",
  "madre_edad",
]);

const ESTATUS_PARENTALES_VALIDOS = new Set([
  "Ninguna",
  "Matrimonio Civil",
  "Concubinato",
  "Separados",
  "Divorciados",
]);

const ORGANIZACIONES_VALIDAS = new Set([
  "Ninguna",
  "Deportiva",
  "Cultural",
  "Vecinal",
  "Religiosa",
]);

const CONDICIONES_LABORALES_VALIDAS = new Set([
  "Empleado",
  "Comerciante",
  "Economía Informal",
  "No aplica",
]);

function esValorVacioONoDeclarado(val: unknown): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === "number") return !Number.isFinite(val);
  if (typeof val === "boolean") return false;
  if (val instanceof Date) return Number.isNaN(val.getTime());
  if (typeof val === "object") {
    try {
      const str = JSON.stringify(val);
      return !str || str === "{}" || str === "[]";
    } catch {
      return true;
    }
  }
  const limpio = String(val).trim().toLowerCase();
  return (
    limpio === "" ||
    limpio === "null" ||
    limpio === "undefined" ||
    limpio === "no declarado" ||
    limpio === "seleccione"
  );
}

function normalizarMontoDeclarado(val: unknown): string {
  if (esValorVacioONoDeclarado(val)) return "0";
  const texto = val instanceof Date ? val.toISOString().split("T")[0] : String(val).trim();
  const limpio = texto.replace(/[^0-9.-]/g, "");
  const num = Number(limpio);
  if (!Number.isFinite(num) || num < 0) return "0";
  return String(num);
}

function normalizarTextoDeclarado(val: unknown): string {
  if (esValorVacioONoDeclarado(val)) return "No";
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "object") {
    try {
      const serializado = JSON.stringify(val);
      return serializado && serializado !== "[]" && serializado !== "{}" ? serializado : "No";
    } catch {
      return "No";
    }
  }
  const texto = String(val).trim();
  if (!texto || texto.toLowerCase() === "no declarado") return "No";
  return texto;
}

function formatearFechaDDMMAAAA(val: unknown): string {
  if (esValorVacioONoDeclarado(val)) return "No";

  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return "No";
    const dia = String(val.getUTCDate()).padStart(2, "0");
    const mes = String(val.getUTCMonth() + 1).padStart(2, "0");
    const anio = String(val.getUTCFullYear());
    return `${dia}/${mes}/${anio}`;
  }

  const texto = String(val).trim();
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
    const dia = String(parsed.getUTCDate()).padStart(2, "0");
    const mes = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const anio = String(parsed.getUTCFullYear());
    return `${dia}/${mes}/${anio}`;
  }

  return "No";
}

function normalizarLetraModalidad(val: unknown): string {
  if (esValorVacioONoDeclarado(val)) return "No";
  const texto = String(val).trim().toUpperCase();
  if (texto === "P" || texto === "PRESENCIAL") return "P";
  if (texto === "S" || texto === "SEMIPRESENCIAL") return "S";
  if (texto === "V" || texto === "VIRTUAL") return "V";
  return texto || "No";
}

function normalizarEstatusParental(val: string): string {
  const limpio = val.trim();
  if (!limpio || limpio.toLowerCase() === "no declarado" || limpio.toLowerCase() === "no") {
    return "Ninguna";
  }
  for (const op of ESTATUS_PARENTALES_VALIDOS) {
    if (op.toLowerCase() === limpio.toLowerCase()) return op;
  }
  return "Ninguna";
}

function normalizarOrganizacion(val: string): string {
  const limpio = val.trim();
  if (!limpio || limpio.toLowerCase() === "no declarado" || limpio.toLowerCase() === "no") {
    return "Ninguna";
  }
  for (const op of ORGANIZACIONES_VALIDAS) {
    if (op.toLowerCase() === limpio.toLowerCase()) return op;
  }
  return "Ninguna";
}

function normalizarCondicionLaboral(val: string): string {
  const limpio = val.trim();
  if (!limpio || limpio.toLowerCase() === "no declarado") return "No aplica";
  for (const op of CONDICIONES_LABORALES_VALIDAS) {
    if (op.toLowerCase() === limpio.toLowerCase()) return op;
  }
  return "No aplica";
}

function normalizarSiNo(val: string): "Si" | "No" {
  const limpio = val.trim().toLowerCase();
  if (limpio === "si" || limpio === "sí" || limpio === "on" || limpio === "posee") {
    return "Si";
  }
  return "No";
}

export function useStepForm(
  student: EstudioSocioeconomicoInput | null | undefined,
  formData: FormStateMap,
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
) {
  const [dataEstudiante, setDataEstudiante] = useState<Record<string, string> | null>(null);
  const [campoFaltante, setCampoFaltante] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const normalizarCampoEstudiante = useCallback((campo: string, val: unknown): string => {
    if (campo === "socio_fecha_unimar") {
      return formatearFechaDDMMAAAA(val);
    }
    if (campo === "socio_modalidad") {
      return normalizarLetraModalidad(val);
    }
    if (CAMPOS_MONETARIOS_Y_CANTIDADES.has(campo)) {
      return normalizarMontoDeclarado(val);
    }
    return normalizarTextoDeclarado(val);
  }, []);

  useEffect(() => {
    if (student) {
      const flatData: Record<string, string> = {
        socio_lugar_nac: normalizarCampoEstudiante("socio_lugar_nac", student.socio_lugar_nac),
        socio_nacionalidad: normalizarCampoEstudiante("socio_nacionalidad", student.socio_nacionalidad),
        socio_estado_civil: normalizarCampoEstudiante("socio_estado_civil", student.socio_estado_civil),
        socio_municipio: normalizarCampoEstudiante("socio_municipio", student.municipio_residencia),
        socio_telf_hab: normalizarCampoEstudiante("socio_telf_hab", student.socio_telf_hab),
        direccion_completa: normalizarCampoEstudiante("direccion_completa", student.direccion_completa),
        socio_trabajo_empresa: normalizarCampoEstudiante("socio_trabajo_empresa", student.socio_trabajo_empresa),
        socio_trabajo_cargo: normalizarCampoEstudiante("socio_trabajo_cargo", student.socio_trabajo_cargo),
        socio_trabajo_direccion: normalizarCampoEstudiante("socio_trabajo_direccion", student.socio_trabajo_direccion),
        socio_trabajo_telefono: normalizarCampoEstudiante("socio_trabajo_telefono", student.socio_trabajo_telefono),
        socio_condicion_laboral_tipo: normalizarCondicionLaboral(
          normalizarCampoEstudiante("socio_condicion_laboral_tipo", student.socio_condicion_laboral_tipo)
        ),
        socio_condicion_laboral_desc: normalizarCampoEstudiante("socio_condicion_laboral_desc", student.socio_condicion_laboral_desc),
        posee_empleo_aspirante: normalizarSiNo(
          normalizarCampoEstudiante(
            "posee_empleo_aspirante",
            student.situacion_laboral_jefe || student.posee_empleo_aspirante
          )
        ),
        monto_ingreso_sueldo: normalizarCampoEstudiante("monto_ingreso_sueldo", student.monto_ingreso_sueldo),
        monto_ingreso_extra: normalizarCampoEstudiante("monto_ingreso_extra", student.monto_ingreso_extra),
        monto_ingreso_pension: normalizarCampoEstudiante("monto_ingreso_pension", student.monto_ingreso_pension),
        monto_ingreso_ayuda: normalizarCampoEstudiante("monto_ingreso_ayuda", student.monto_ingreso_ayuda),
        monto_ingreso_familiar: normalizarCampoEstudiante("monto_ingreso_familiar", student.monto_ingreso_familiar),
        monto_ingreso_rentas: normalizarCampoEstudiante("monto_ingreso_rentas", student.monto_ingreso_rentas),
        monto_ingreso_otros: normalizarCampoEstudiante("monto_ingreso_otros", student.monto_ingreso_otros),
        rango_ingreso_familiar: normalizarCampoEstudiante("rango_ingreso_familiar", student.rango_ingreso_familiar),
        socio_ue_procedencia: normalizarCampoEstudiante("socio_ue_procedencia", student.socio_ue_procedencia),
        socio_otros_estudios: normalizarCampoEstudiante("socio_otros_estudios", student.socio_otros_estudios),
        socio_fecha_unimar: normalizarCampoEstudiante("socio_fecha_unimar", student.socio_fecha_unimar),
        socio_carrera: normalizarCampoEstudiante("socio_carrera", student.carrera || student.socio_carrera),
        socio_trimestre: normalizarCampoEstudiante("socio_trimestre", student.semestre),
        socio_modalidad: normalizarCampoEstudiante("socio_modalidad", student.socio_modalidad),
        padre_nombre: normalizarCampoEstudiante("padre_nombre", student.padre_nombre),
        padre_edad: normalizarCampoEstudiante("padre_edad", student.padre_edad),
        padre_nacionalidad: normalizarCampoEstudiante("padre_nacionalidad", student.padre_nacionalidad),
        padre_ocupacion: normalizarCampoEstudiante("padre_ocupacion", student.padre_ocupacion),
        padre_instruccion: normalizarCampoEstudiante("padre_instruccion", student.padre_instruccion),
        padre_trabajo: normalizarCampoEstudiante("padre_trabajo", student.padre_trabajo),
        madre_nombre: normalizarCampoEstudiante("madre_nombre", student.madre_nombre),
        madre_edad: normalizarCampoEstudiante("madre_edad", student.madre_edad),
        madre_nacionalidad: normalizarCampoEstudiante("madre_nacionalidad", student.madre_nacionalidad),
        madre_ocupacion: normalizarCampoEstudiante("madre_ocupacion", student.madre_ocupacion),
        madre_instruccion: normalizarCampoEstudiante("madre_instruccion", student.madre_instruccion),
        madre_trabajo: normalizarCampoEstudiante("madre_trabajo", student.madre_trabajo),
        familia_estatus_conyugal: normalizarEstatusParental(
          normalizarCampoEstudiante("familia_estatus_conyugal", student.familia_estatus_conyugal)
        ),
        familia_num_hermanos: normalizarCampoEstudiante("familia_num_hermanos", student.familia_num_hermanos),
        familia_hermanos_uni_sn: normalizarSiNo(
          esValorVacioONoDeclarado(student.familia_hermanos_uni_sn)
            ? Number(student.familia_hermanos_uni || 0) > 0
              ? "Si"
              : "No"
            : String(student.familia_hermanos_uni_sn)
        ),
        familia_hermanos_uni: normalizarCampoEstudiante("familia_hermanos_uni", student.familia_hermanos_uni),
        familia_nucleo_json: normalizarCampoEstudiante("familia_nucleo_json", student.familia_nucleo_json),
        familia_relacion: normalizarCampoEstudiante("familia_relacion", student.familia_relacion),
        familia_problema_sn: normalizarSiNo(
          normalizarCampoEstudiante("familia_problema_sn", student.familia_problema_sn)
        ),
        familia_problema_desc: normalizarCampoEstudiante("familia_problema_desc", student.familia_problema_desc),
        organizacion_activa: normalizarOrganizacion(
          normalizarCampoEstudiante("organizacion_activa", student.organizacion_activa)
        ),
        monto_egreso_mercado: normalizarCampoEstudiante("monto_egreso_mercado", student.monto_egreso_mercado),
        monto_egreso_vivienda: normalizarCampoEstudiante("monto_egreso_vivienda", student.monto_egreso_vivienda),
        monto_egreso_salud: normalizarCampoEstudiante("monto_egreso_salud", student.monto_egreso_salud),
        monto_egreso_servicios: normalizarCampoEstudiante("monto_egreso_servicios", student.monto_egreso_servicios),
        monto_egreso_suntuarios: normalizarCampoEstudiante("monto_egreso_suntuarios", student.monto_egreso_suntuarios),
        monto_egreso_estudios: normalizarCampoEstudiante("monto_egreso_estudios", student.monto_egreso_estudios),
        monto_egreso_recreacion: normalizarCampoEstudiante("monto_egreso_recreacion", student.monto_egreso_recreacion),
        vivienda_tipo: normalizarCampoEstudiante("vivienda_tipo", student.vivienda_tipo),
        vivienda_estatus: normalizarCampoEstudiante("vivienda_estatus", student.vivienda_estatus),
        serv_internet: student.serv_internet === "on" ? "Posee" : "No posee",
        serv_agua: student.serv_agua === "on" ? "Posee" : "No posee",
        serv_luz: student.serv_luz === "on" ? "Posee" : "No posee",
        serv_gas: student.serv_gas === "on" ? "Posee" : "No posee",
        serv_aseo: student.serv_aseo === "on" ? "Posee" : "No posee",
        serv_telefono: student.serv_telefono === "on" ? "Posee" : "No posee",
        serv_cloacas: student.serv_cloacas === "on" ? "Posee" : "No posee",
        equip_lavadora: student.equip_lavadora === "on" ? "Posee" : "No posee",
        equip_nevera: student.equip_nevera === "on" ? "Posee" : "No posee",
        equip_cable: student.equip_cable === "on" ? "Posee" : "No posee",
        equip_aire: student.equip_aire === "on" ? "Posee" : "No posee",
        equip_ventilador: student.equip_ventilador === "on" ? "Posee" : "No posee",
        equip_tv: student.equip_tv === "on" ? "Posee" : "No posee",
        equip_cocina: student.equip_cocina === "on" ? "Posee" : "No posee",
        equip_microondas: student.equip_microondas === "on" ? "Posee" : "No posee",
        equip_sonido: student.equip_sonido === "on" ? "Posee" : "No posee",
        equip_computadora: student.equip_computadora === "on" ? "Posee" : "No posee",
        equip_celular: student.equip_celular === "on" ? "Posee" : "No posee",
        salud_condicion_especial: normalizarSiNo(
          normalizarCampoEstudiante("salud_condicion_especial", student.salud_condicion_especial)
        ),
        salud_enfermedad_desc: normalizarCampoEstudiante("salud_enfermedad_desc", student.salud_enfermedad_desc),
        salud_tratamiento: normalizarCampoEstudiante("salud_tratamiento", student.salud_tratamiento),
        observaciones_solicitante: normalizarCampoEstudiante(
          "observaciones_solicitante",
          student.observaciones_solicitante
        ),
      };
      setDataEstudiante(flatData);
      setCampoFaltante(null);
    }
  }, [student, normalizarCampoEstudiante]);

  const copyValue = (field: string, value: string | number | boolean | null | undefined) => {
    const esMonto = CAMPOS_MONETARIOS_Y_CANTIDADES.has(field);
    const baseStr =
      field === "socio_fecha_unimar"
        ? formatearFechaDDMMAAAA(value)
        : field === "socio_modalidad"
          ? normalizarLetraModalidad(value)
          : esMonto
            ? normalizarMontoDeclarado(value)
            : normalizarTextoDeclarado(value);

    let normalizedValue: string | number | boolean = baseStr;
    let fieldType = "";
    SECCIONES_MAESTRAS.forEach((s) =>
      s.fields.forEach((f) => {
        if (f.name === field) fieldType = f.type || "";
      })
    );

    if (fieldType === "checkbox") {
      normalizedValue =
        baseStr === "Posee" || baseStr === "on" || baseStr === "Si" || baseStr === "Sí"
          ? "on"
          : "off";
    } else if (
      field === "salud_condicion_especial" ||
      field === "posee_empleo_aspirante" ||
      field === "familia_hermanos_uni_sn" ||
      field === "familia_problema_sn"
    ) {
      normalizedValue = normalizarSiNo(baseStr);
    } else if (field === "familia_estatus_conyugal") {
      normalizedValue = normalizarEstatusParental(baseStr);
    } else if (field === "organizacion_activa") {
      normalizedValue = normalizarOrganizacion(baseStr);
    } else if (field === "socio_condicion_laboral_tipo") {
      normalizedValue = normalizarCondicionLaboral(baseStr);
    } else if (fieldType === "number") {
      normalizedValue = normalizarMontoDeclarado(baseStr);
    }

    setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
    setCampoFaltante(null);
  };

  const copiarTodoParaPrueba = () => {
    if (!dataEstudiante) return;
    const newData: FormStateMap = { ...formData };

    Object.keys(dataEstudiante).forEach((key) => {
      const val = dataEstudiante[key];
      if (key === "socio_fecha_unimar") {
        newData[key] = formatearFechaDDMMAAAA(val);
      } else if (key === "socio_modalidad") {
        newData[key] = normalizarLetraModalidad(val);
      } else if (CAMPOS_MONETARIOS_Y_CANTIDADES.has(key)) {
        newData[key] = normalizarMontoDeclarado(val);
      } else if (val === "Posee" || val === "on" || val === "Si" || val === "Sí") {
        let isCheck = false;
        SECCIONES_MAESTRAS.forEach((s) =>
          s.fields.forEach((f) => {
            if (f.name === key && f.type === "checkbox") isCheck = true;
          })
        );
        newData[key] = isCheck ? "on" : "Si";
      } else if (val === "No posee" || val === "off" || val === "No") {
        let isCheck = false;
        SECCIONES_MAESTRAS.forEach((s) =>
          s.fields.forEach((f) => {
            if (f.name === key && f.type === "checkbox") isCheck = true;
          })
        );
        newData[key] = isCheck ? "off" : "No";
      } else {
        newData[key] = normalizarTextoDeclarado(val);
      }
    });
    setFormData(newData);
    setCampoFaltante(null);
  };

  const handleValidateAndSubmit = async (
    e: React.FormEvent,
    onValidSubmit: (ev: React.FormEvent) => Promise<void> | void
  ) => {
    e.preventDefault();

    for (const seccion of SECCIONES_MAESTRAS) {
      for (const field of seccion.fields) {
        const val = formData[field.name];
        if (
          field.type !== "checkbox" &&
          (val === undefined || val === null || String(val).trim() === "" || val === "seleccione")
        ) {
          setCampoFaltante(field.name);
          const targetEl = formContainerRef.current?.querySelector<HTMLElement>(
            `[data-audit-field="${field.name}"]`
          );
          targetEl?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    }

    setCampoFaltante(null);
    await onValidSubmit(e);
    formContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isFormComplete = SECCIONES_MAESTRAS.every((s) =>
    s.fields.every(
      (f) =>
        f.type === "checkbox" ||
        (formData[f.name] !== undefined &&
          formData[f.name] !== null &&
          String(formData[f.name]).trim() !== "" &&
          formData[f.name] !== "seleccione")
    )
  );

  return {
    dataEstudiante,
    copyValue,
    copiarTodoParaPrueba,
    handleValidateAndSubmit,
    isFormComplete,
    campoFaltante,
    formContainerRef,
  };
}