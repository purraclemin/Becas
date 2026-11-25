import { User, BookOpen, Users, DollarSign, Home, HeartPulse } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export interface SeccionReporteItem {
  titulo: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  campos: Record<string, string>;
}

export const SECCIONES_REPORTE: Record<string, SeccionReporteItem> = {
  identificacion: {
    titulo: "1. Identificación y Ubicación",
    icon: User,
    campos: {
      socio_lugar_nac: "Lugar de Nacimiento",
      socio_nacionalidad: "Nacionalidad",
      socio_estado_civil: "Estado Civil",
      municipio_residencia: "Municipio Residencia",
      direccion_completa: "Dirección Detallada",
      socio_telf_hab: "Teléfono Habitación",
      telefono: "Teléfono Móvil",
      sexo: "Género",
      fecha_nacimiento: "F. Nacimiento"
    }
  },
  academico: {
    titulo: "2. Perfil Académico",
    icon: BookOpen,
    campos: {
      socio_ue_procedencia: "U.E. Procedencia",
      socio_otros_estudios: "Otros Estudios",
      socio_fecha_unimar: "Ingreso Unimar",
      carrera: "Carrera",
      semestre: "Semestre/Trimestre",
      socio_modalidad: "Modalidad",
      indice_global: "Índice Académico"
    }
  },
  familiares: {
    titulo: "3. Entorno Parental y Grupo Familiar",
    icon: Users,
    campos: {
      padre_nombre: "Nombre del Padre",
      padre_edad: "Edad Padre",
      padre_nacionalidad: "Nacionalidad Padre",
      padre_ocupacion: "Ocupación Padre",
      padre_instruccion: "Instrucción Padre",
      padre_trabajo: "Lugar Trabajo y Dirección Padre",
      madre_nombre: "Nombre de la Madre",
      madre_edad: "Edad Madre",
      madre_nacionalidad: "Nacionalidad Madre",
      madre_ocupacion: "Ocupación Madre",
      madre_instruccion: "Instrucción Madre",
      madre_trabajo: "Lugar Trabajo y Dirección Madre",
      familia_estatus_conyugal: "Situación Parental",
      familia_num_hermanos: "N° de Hermanos",
      familia_hermanos_uni_sn: "Hnos. Universitarios (Sí/No)",
      familia_hermanos_uni: "Cantidad Hnos. Uni",
      familia_nucleo_json: "Conformación Núcleo Familiar"
    }
  },
  economia: {
    titulo: "4. Situación Laboral y Análisis Económico ($)",
    icon: DollarSign,
    campos: {
      situacion_laboral_jefe: "¿Trabaja?",
      socio_trabajo_empresa: "Nombre de la Empresa",
      socio_trabajo_cargo: "Cargo",
      socio_trabajo_direccion: "Dirección de Trabajo",
      socio_trabajo_telefono: "Teléfono de Trabajo",
      socio_condicion_laboral_tipo: "Condición / Modalidad Laboral",
      socio_condicion_laboral_desc: "Especificación Laboral",
      rango_ingreso_familiar: "Rango Ingreso Familiar",
      monto_ingreso_familiar: "Sueldos y Salarios (Familiar)",
      monto_ingreso_sueldo: "Sueldo Base",
      monto_ingreso_extra: "Ingresos Particulares",
      monto_ingreso_pension: "Pensión / Jubilación",
      monto_ingreso_ayuda: "Ayudas Familiares",
      monto_ingreso_rentas: "Rentas",
      monto_ingreso_otros: "Otros Ingresos",
      monto_egreso_mercado: "Mercado",
      monto_egreso_vivienda: "Vivienda",
      monto_egreso_salud: "Salud",
      monto_egreso_servicios: "Servicios Públicos",
      monto_egreso_suntuarios: "*Gastos Suntuarios",
      monto_egreso_estudios: "Estudios",
      monto_egreso_recreacion: "Recreación"
    }
  },
  vivienda: {
    titulo: "5. Vivienda, Servicios y Equipamiento",
    icon: Home,
    campos: {
      vivienda_tipo: "Tipo de Vivienda",
      vivienda_estatus: "Tenencia de la Vivienda",
      serv_agua: "Agua",
      serv_luz: "Luz",
      serv_gas: "Gas",
      serv_aseo: "Aseo",
      serv_telefono: "Teléfono",
      serv_cloacas: "Cloacas",
      serv_internet: "Internet",
      equip_nevera: "Nevera",
      equip_aire: "Aire Acondicionado",
      equip_ventilador: "Ventilador",
      equip_tv: "TV",
      equip_cocina: "Cocina",
      equip_microondas: "Microondas",
      equip_lavadora: "Lavadora",
      equip_sonido: "Equipo de Sonido",
      equip_computadora: "Computadora",
      equip_celular: "Celular",
      equip_cable: "TV Cable"
    }
  },
  salud_psicologica: {
    titulo: "6. Área Socio Psicológica, Salud y Observaciones",
    icon: HeartPulse,
    campos: {
      familia_relacion: "Relación del Grupo Familiar",
      familia_problema_sn: "¿Problema Relación Familiar?",
      familia_problema_desc: "Especificación Problema Familiar",
      organizacion_activa: "Organización Activa",
      salud_condicion_especial: "¿Condición Especial / Enfermedad?",
      salud_enfermedad_desc: "Detalle de Enfermedad",
      salud_tratamiento: "Tratamiento Médico",
      observaciones_solicitante: "Observaciones del Solicitante"
    }
  }
};

export const CAMPOS_MONETARIOS: ReadonlyArray<string> = [
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
  "monto_egreso_recreacion"
];