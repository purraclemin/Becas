import { User, BookOpen, Users, DollarSign, Home, Zap, HeartPulse } from "lucide-react";

export const SECCIONES_MAESTRAS = [
  {
    titulo: "1. Identificación y Ubicación",
    icon: User,
    fields: [
      { label: "Lugar de Nacimiento", name: "socio_lugar_nac" },
      { label: "Nacionalidad", name: "socio_nacionalidad" },
      { label: "Estado Civil", name: "socio_estado_civil", options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Concubinato"] },
      { label: "Teléfono Habitación", name: "socio_telf_hab" },
      { label: "Dirección Completa", name: "direccion_completa" },
      { label: "Empresa", name: "socio_trabajo_empresa" },
      { label: "Cargo", name: "socio_trabajo_cargo" },
      { label: "¿Trabaja?", name: "posee_empleo_aspirante", options: ["Si", "No"] }
    ]
  },
  {
    titulo: "2. Información Académica",
    icon: BookOpen,
    fields: [
      { label: "U.E. Procedencia", name: "socio_ue_procedencia" },
      { label: "Otros Estudios", name: "socio_otros_estudios" },
      { label: "Fecha Ingreso Unimar", name: "socio_fecha_unimar", type: "date" },
      { label: "Carrera", name: "socio_carrera" },
      { label: "Semestre/Trimestre", name: "socio_trimestre" },
      { label: "Modalidad", name: "socio_modalidad", options: ["Presencial", "Semipresencial", "Virtual"] }
    ]
  },
  {
    titulo: "3. Entorno de los Padres",
    icon: Users,
    fields: [
      { label: "Nombre del Padre", name: "padre_nombre" },
      { label: "Edad Padre", name: "padre_edad", type: "number" },
      { label: "Ocupación Padre", name: "padre_ocupacion" },
      { label: "Lugar Trabajo Padre", name: "padre_trabajo" },
      { label: "Nombre de la Madre", name: "madre_nombre" },
      { label: "Edad Madre", name: "madre_edad", type: "number" },
      { label: "Ocupación Madre", name: "madre_ocupacion" },
      { label: "Lugar Trabajo Madre", name: "madre_trabajo" }
    ]
  },
  {
    titulo: "4. Composición Familiar",
    icon: Users,
    fields: [
      { label: "N° de Hermanos", name: "familia_num_hermanos", type: "number" },
      { label: "Hermanos en Universidad", name: "familia_hermanos_uni", type: "number" },
      { label: "Relación Familiar", name: "familia_relacion", options: ["Buena", "Regular", "Mala"] }
    ]
  },
  {
    titulo: "5. Situación Económica (Mensual $)",
    icon: DollarSign,
    fields: [
      { label: "Sueldo", name: "monto_ingreso_sueldo", type: "number" },
      { label: "Extra", name: "monto_ingreso_extra", type: "number" },
      { label: "Pensión", name: "monto_ingreso_pension", type: "number" },
      { label: "Ayuda/Otros", name: "monto_ingreso_ayuda", type: "number" },
      { label: "Ingreso Familiar", name: "monto_ingreso_familiar", type: "number" },
      { label: "Rango Familiar", name: "rango_ingreso_familiar", options: ["1", "2", "3", "4"] }
    ]
  },
  {
    titulo: "6. Vivienda y Egresos ($)",
    icon: Home,
    fields: [
      { label: "Tipo de Estructura", name: "vivienda_tipo", options: ["Quinta", "Casa", "Apartamento", "Vivienda rural", "Otro"] },
      { label: "Tenencia", name: "vivienda_estatus", options: ["Propia", "Alquilada", "Residencia", "Otro"] },
      { label: "Gasto Mercado", name: "monto_egreso_mercado", type: "number" },
      { label: "Gasto Vivienda", name: "monto_egreso_vivienda", type: "number" },
      { label: "Gasto Salud", name: "monto_egreso_salud", type: "number" },
      { label: "Gasto Servicios", name: "monto_egreso_servicios", type: "number" }
    ]
  },
  {
    titulo: "7. Servicios y Equipamiento",
    icon: Zap,
    fields: [
      { label: "Internet", name: "serv_internet", type: "checkbox" },
      { label: "Agua", name: "serv_agua", type: "checkbox" },
      { label: "Electricidad", name: "serv_luz", type: "checkbox" },
      { label: "Gas", name: "serv_gas", type: "checkbox" },
      { label: "Aseo", name: "serv_aseo", type: "checkbox" },
      { label: "Nevera", name: "equip_nevera", type: "checkbox" },
      { label: "Lavadora", name: "equip_lavadora", type: "checkbox" },
      { label: "TV Cable", name: "equip_cable", type: "checkbox" }
    ]
  },
  {
    titulo: "8. Salud",
    icon: HeartPulse,
    fields: [
      { label: "¿Condición Especial?", name: "salud_condicion_especial", options: ["Si", "No"] },
      { label: "Descripción Salud", name: "salud_enfermedad_desc" },
      { label: "Tratamiento", name: "salud_tratamiento" }
    ]
  }
];