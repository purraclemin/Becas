import { User, BookOpen, Users, DollarSign, Home } from "lucide-react";

export const SECCIONES_REPORTE: any = {
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
    titulo: "3. Entorno Parental y Familiar",
    icon: Users,
    campos: {
      padre_nombre: "Nombre del Padre",
      padre_edad: "Edad Padre",
      padre_ocupacion: "Ocupación Padre",
      padre_trabajo: "Lugar Trabajo Padre",
      madre_nombre: "Nombre de la Madre",
      madre_edad: "Edad Madre",
      madre_ocupacion: "Ocupación Madre",
      madre_trabajo: "Lugar Trabajo Madre",
      familia_num_hermanos: "N° de Hermanos",
      familia_hermanos_uni: "Hermanos en Uni",
      familia_relacion: "Relación Familiar"
    }
  },
  economia: {
    titulo: "4. Análisis Económico ($)",
    icon: DollarSign,
    campos: {
      monto_ingreso_sueldo: "Sueldo Base",
      monto_ingreso_extra: "Ingresos Extras",
      monto_ingreso_pension: "Pensión/Bonos",
      monto_ingreso_ayuda: "Ayudas Externas",
      monto_ingreso_familiar: "Ingreso Familiar Extra",
      rango_ingreso_familiar: "Escala Salarial",
      situacion_laboral_jefe: "¿Trabaja?",
      monto_egreso_mercado: "Gasto Mercado",
      monto_egreso_vivienda: "Gasto Vivienda",
      monto_egreso_salud: "Gasto Salud",
      monto_egreso_servicios: "Gasto Servicios"
    }
  },
  vivienda_salud: {
    titulo: "5. Vivienda, Servicios y Salud",
    icon: Home,
    campos: {
      vivienda_tipo: "Estructura",
      vivienda_estatus: "Tenencia",
      serv_internet: "Internet",
      serv_agua: "Agua Potable",
      serv_luz: "Electricidad",
      serv_gas: "Gas Doméstico",
      serv_aseo: "Aseo Urbano",
      equip_lavadora: "Lavadora",
      equip_nevera: "Nevera",
      equip_cable: "TV Cable",
      salud_condicion_especial: "¿Condición Especial?",
      salud_enfermedad_desc: "Detalle Salud",
      salud_tratamiento: "Tratamiento"
    }
  }
};

export const CAMPOS_MONETARIOS = [
  "monto_ingreso_sueldo", "monto_ingreso_extra", "monto_ingreso_pension", 
  "monto_ingreso_ayuda", "monto_ingreso_familiar", "monto_egreso_mercado", "monto_egreso_vivienda", 
  "monto_egreso_salud", "monto_egreso_servicios"
];