import { User, BookOpen, Users, DollarSign, Home, HeartPulse, type LucideIcon } from "lucide-react";

export interface CampoFormularioAdmin {
  label: string;
  name: string;
  type?: "text" | "number" | "date" | "checkbox" | "nucleo";
  options?: ReadonlyArray<string>;
}

export interface SeccionFormularioAdmin {
  titulo: string;
  icon: LucideIcon;
  fields: ReadonlyArray<CampoFormularioAdmin>;
}

export const SECCIONES_MAESTRAS: ReadonlyArray<SeccionFormularioAdmin> = [
  {
    titulo: "1. Identificación, Ubicación y Situación Laboral",
    icon: User,
    fields: [
      { label: "Lugar de Nacimiento", name: "socio_lugar_nac" },
      { label: "Nacionalidad", name: "socio_nacionalidad" },
      {
        label: "Estado Civil",
        name: "socio_estado_civil",
        options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Concubinato"]
      },
      { label: "Teléfono Habitación", name: "socio_telf_hab" },
      { label: "Dirección Completa", name: "direccion_completa" },
      { label: "¿Trabaja?", name: "posee_empleo_aspirante", options: ["Si", "No"] },
      { label: "Nombre de la Empresa", name: "socio_trabajo_empresa" },
      { label: "Cargo", name: "socio_trabajo_cargo" },
      { label: "Dirección de Trabajo", name: "socio_trabajo_direccion" },
      { label: "Teléfono de Trabajo", name: "socio_trabajo_telefono" },
      {
        label: "Condición / Modalidad Laboral",
        name: "socio_condicion_laboral_tipo",
        options: ["Empleado", "Comerciante", "Economía Informal", "No aplica"]
      },
      { label: "Especificación Laboral", name: "socio_condicion_laboral_desc" }
    ]
  },
  {
    titulo: "2. Información Académica",
    icon: BookOpen,
    fields: [
      { label: "U.E. Procedencia", name: "socio_ue_procedencia" },
      { label: "Otros Estudios", name: "socio_otros_estudios" },
      { label: "Fecha Ingreso Unimar", name: "socio_fecha_unimar", type: "text" },
      { label: "Carrera", name: "socio_carrera" },
      { label: "Semestre/Trimestre", name: "socio_trimestre" },
      {
        label: "Modalidad",
        name: "socio_modalidad",
        options: ["P", "S", "V"]
      }
    ]
  },
  {
    titulo: "3. Entorno de los Padres y Grupo Familiar",
    icon: Users,
    fields: [
      { label: "Nombre del Padre", name: "padre_nombre" },
      { label: "Edad Padre", name: "padre_edad", type: "number" },
      { label: "Nacionalidad Padre", name: "padre_nacionalidad" },
      { label: "Ocupación Padre", name: "padre_ocupacion" },
      { label: "Instrucción Padre", name: "padre_instruccion" },
      { label: "Lugar Trabajo y Dirección Padre", name: "padre_trabajo" },
      { label: "Nombre de la Madre", name: "madre_nombre" },
      { label: "Edad Madre", name: "madre_edad", type: "number" },
      { label: "Nacionalidad Madre", name: "madre_nacionalidad" },
      { label: "Ocupación Madre", name: "madre_ocupacion" },
      { label: "Instrucción Madre", name: "madre_instruccion" },
      { label: "Lugar Trabajo y Dirección Madre", name: "madre_trabajo" },
      {
        label: "Situación Parental",
        name: "familia_estatus_conyugal",
        options: ["Ninguna", "Matrimonio Civil", "Concubinato", "Separados", "Divorciados"]
      },
      { label: "N° de Hermanos", name: "familia_num_hermanos", type: "number" },
      { label: "Hnos. Uni (Sí/No)", name: "familia_hermanos_uni_sn", options: ["No", "Si"] },
      { label: "Hermanos en Universidad", name: "familia_hermanos_uni", type: "number" },
      { label: "Conformación Núcleo Familiar (JSON)", name: "familia_nucleo_json", type: "nucleo" }
    ]
  },
  {
    titulo: "4. Situación Económica y Egresos (Mensual $)",
    icon: DollarSign,
    fields: [
      { label: "Sueldo Mensual", name: "monto_ingreso_sueldo", type: "number" },
      { label: "Ingresos Particulares", name: "monto_ingreso_extra", type: "number" },
      { label: "Pensión / Jubilación", name: "monto_ingreso_pension", type: "number" },
      { label: "Ayudas Familiares", name: "monto_ingreso_ayuda", type: "number" },
      { label: "Sueldos y Salarios (Familiar)", name: "monto_ingreso_familiar", type: "number" },
      { label: "Rentas", name: "monto_ingreso_rentas", type: "number" },
      { label: "Otros Ingresos", name: "monto_ingreso_otros", type: "number" },
      { label: "Rango Familiar", name: "rango_ingreso_familiar", options: ["1", "2", "3", "4"] },
      { label: "Gasto Mercado", name: "monto_egreso_mercado", type: "number" },
      { label: "Gasto Vivienda", name: "monto_egreso_vivienda", type: "number" },
      { label: "Gasto Salud", name: "monto_egreso_salud", type: "number" },
      { label: "Gasto Servicios Públicos", name: "monto_egreso_servicios", type: "number" },
      { label: "*Gastos Suntuarios", name: "monto_egreso_suntuarios", type: "number" },
      { label: "Gasto Estudios", name: "monto_egreso_estudios", type: "number" },
      { label: "Gasto Recreación", name: "monto_egreso_recreacion", type: "number" }
    ]
  },
  {
    titulo: "5. Vivienda, Servicios y Equipamiento",
    icon: Home,
    fields: [
      { label: "Tipo de Estructura", name: "vivienda_tipo" },
      { label: "Tenencia", name: "vivienda_estatus" },
      { label: "Internet", name: "serv_internet", type: "checkbox" },
      { label: "Agua", name: "serv_agua", type: "checkbox" },
      { label: "Electricidad", name: "serv_luz", type: "checkbox" },
      { label: "Gas", name: "serv_gas", type: "checkbox" },
      { label: "Aseo", name: "serv_aseo", type: "checkbox" },
      { label: "Teléfono", name: "serv_telefono", type: "checkbox" },
      { label: "Cloacas", name: "serv_cloacas", type: "checkbox" },
      { label: "Nevera", name: "equip_nevera", type: "checkbox" },
      { label: "Lavadora", name: "equip_lavadora", type: "checkbox" },
      { label: "TV Cable", name: "equip_cable", type: "checkbox" },
      { label: "Aire Acondicionado", name: "equip_aire", type: "checkbox" },
      { label: "Ventilador", name: "equip_ventilador", type: "checkbox" },
      { label: "TV", name: "equip_tv", type: "checkbox" },
      { label: "Cocina", name: "equip_cocina", type: "checkbox" },
      { label: "Microondas", name: "equip_microondas", type: "checkbox" },
      { label: "Equipo de Sonido", name: "equip_sonido", type: "checkbox" },
      { label: "Computadora", name: "equip_computadora", type: "checkbox" },
      { label: "Celular", name: "equip_celular", type: "checkbox" }
    ]
  },
  {
    titulo: "6. Área Socio Psicológica, Salud y Observaciones",
    icon: HeartPulse,
    fields: [
      { label: "Relación Familiar", name: "familia_relacion", options: ["Buena", "Regular", "Mala"] },
      { label: "¿Problema Relación Familiar?", name: "familia_problema_sn", options: ["No", "Si"] },
      { label: "Detalle Problema Familiar", name: "familia_problema_desc" },
      {
        label: "Miembro Activo de Organización",
        name: "organizacion_activa",
        options: ["Ninguna", "Deportiva", "Cultural", "Vecinal", "Religiosa"]
      },
      { label: "¿Condición Especial?", name: "salud_condicion_especial", options: ["Si", "No"] },
      { label: "Descripción Salud", name: "salud_enfermedad_desc" },
      { label: "Tratamiento", name: "salud_tratamiento" },
      { label: "Observaciones del Solicitante", name: "observaciones_solicitante" }
    ]
  }
];