// lib/scholarships-data.ts
import {
  GraduationCap,
  Award,
  Trophy,
  Heart,
  Accessibility,
  Users,
  Briefcase,
  UserCheck,
  BookOpen,
  Activity,
  Clock,
  Percent,
  LucideIcon
} from "lucide-react"

export interface Scholarship {
  id: string
  icon: LucideIcon
  title: string
  coverage: string
  badge: string
  description: string
  requisitos: string[]
  color: string
  featured: boolean
  postulable: boolean
  ctaLabel: string
  ctaNote?: string
}

export const BECAS_DATA: Scholarship[] = [
  // --- BECAS PRINCIPALES ---
  {
    id: "social",
    icon: Heart,
    title: "Beca Social Aprendizaje",
    coverage: "100%",
    badge: "100% Cobertura • Concurso Anual",
    description:
      "Programa asignado anualmente mediante concurso (10 nuevos cupos al año, máx. 60 activos) para bachilleres de Unidades Educativas Públicas de Nueva Esparta con alto rendimiento y escasos recursos.",
    requisitos: [
      "Promedio de notas de bachillerato igual o superior a 18 puntos (Art. 6 y 11).",
      "Provenir de una Unidad Educativa Pública del estado Nueva Esparta.",
      "Selección previa mediante concurso ante Bienestar Estudiantil, Secretaría General y Consejo Superior.",
      "Mantener índice trimestral >= 16 puntos y cumplir 15 horas semanales de apoyo administrativo.",
    ],
    color: "bg-[#2a6041]",
    featured: true,
    postulable: false,
    ctaLabel: "Por Concurso Anual",
    ctaNote: "Registro institucional directo por Bienestar Estudiantil",
  },
  {
    id: "aprendizaje",
    icon: GraduationCap,
    title: "Beca Aprendizaje",
    coverage: "70%",
    badge: "70% Cobertura",
    description:
      "Subvención del 70% de la matrícula para estudiantes regulares que colaboran en actividades administrativas para complementar su formación académica.",
    requisitos: [
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior (18 pts en curso introductorio).",
      "Inscribir la máxima carga académica del pensum de estudios.",
      "Aprobar la evaluación socioeconómica del Departamento de Bienestar Estudiantil.",
      "Cumplir 15 horas semanales de apoyo en el departamento asignado (máx. 25 cupos).",
    ],
    color: "bg-[#1e3a5f]",
    featured: true,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "discapacidad",
    icon: Accessibility,
    title: "Beca por Discapacidad",
    coverage: "100%",
    badge: "100% Cobertura",
    description:
      "Exoneración total de la matrícula para estudiantes regulares con alguna discapacidad y de escasos recursos económicos debidamente comprobados.",
    requisitos: [
      "Informe médico emitido por especialista y carnet oficial de discapacidad (Art. 15).",
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior.",
      "Comprobación socioeconómica por Bienestar Estudiantil (máx. 20 estudiantes activos).",
    ],
    color: "bg-[#1e3a5f]",
    featured: true,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "excelencia",
    icon: Award,
    title: "Beca a la Excelencia Académica",
    coverage: "100%",
    badge: "100% Cobertura • Automática",
    description:
      "Reconocimiento otorgado automáticamente en cada lapso al mayor Índice Académico Acumulado (Global >= 18 pts) de cada una de las 8 carreras, sin necesidad de postulación.",
    requisitos: [
      "Poseer el mayor Índice Académico Acumulado (Global) de la carrera (>= 18 puntos, Art. 8).",
      "Estar cursando a partir del cuarto (4to) trimestre académico cursado y aprobado.",
      "Asignación automática por carrera (1 por carrera) conforme al listado de Control de Estudios (Art. 32).",
    ],
    color: "bg-[#7c2d3e]",
    featured: true,
    postulable: false,
    ctaLabel: "Asignación Automática",
    ctaNote: "No requiere solicitud web — otorgada por mérito acumulado",
  },

  // --- AYUDAS ECONÓMICAS ---
  {
    id: "general",
    icon: Trophy,
    title: "Ayuda Económica",
    coverage: "30%",
    badge: "Hasta 30%",
    description:
      "Descuento parcial de hasta el 30% sobre la matrícula estudiantil, otorgado previa evaluación de vulnerabilidad y autorización del Consejo Superior.",
    requisitos: [
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior (Art. 18).",
      "Sujeto a disponibilidad presupuestaria (máximo 30 estudiantes por trimestre).",
    ],
    color: "bg-[#8b5e1b]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "familiar",
    icon: Users,
    title: "Ayuda Económica para Estudiantes con Familiares",
    coverage: "10%",
    badge: "10% Descuento",
    description:
      "Descuento del 10% en la matrícula para estudiantes que tengan familiares directos inscritos en la Universidad de Margarita.",
    requisitos: [
      "Consignar documentos probatorios de filiación (hermanos, padres, hijos, cónyuge o concubino — Art. 20).",
      "Promedio igual o mayor a 16 puntos en el trimestre inmediatamente anterior.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "trabajadores",
    icon: Briefcase,
    title: "Ayuda Económica a Trabajadores",
    coverage: "Especial",
    badge: "Especial",
    description:
      "Beneficio económico para el personal administrativo y docente activo de la Universidad de Margarita para cursar una carrera universitaria.",
    requisitos: [
      "Ser trabajador activo de la institución (aplicable solo para una carrera — Art. 19).",
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "hijos-trabajadores",
    icon: UserCheck,
    title: "Ayuda Económica para Hijos de Trabajadores",
    coverage: "10%",
    badge: "10% Descuento",
    description:
      "Descuento del 10% en la matrícula para hijos del personal administrativo y docente de la Universidad de Margarita.",
    requisitos: [
      "Documentos probatorios de filiación con el trabajador (aplicable para una carrera — Art. 19 Par. 1°).",
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "preparadores",
    icon: BookOpen,
    title: "Ayuda Económica para Estudiantes Preparadores",
    coverage: "Asignación",
    badge: "Máx. 6 por Periodo",
    description:
      "Incentivo para estudiantes preparadores en una asignatura conforme a la Normativa para Estudiantes Preparadores.",
    requisitos: [
      "Cumplir con la Normativa de Estudiantes Preparadores y aval de Decanatos (Art. 19 Par. 2°).",
      "Índice académico igual o superior a 16 puntos en el trimestre inmediatamente anterior.",
      "Máximo 6 preparadores autorizados por período académico.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
  {
    id: "extracurriculares",
    icon: Activity,
    title: "Ayuda Económica por Actividades Deportivas, Culturales y Orfeón",
    coverage: "20%",
    badge: "20% Descuento",
    description:
      "Descuento del 20% en la matrícula para estudiantes que formen parte activa de los clubes deportivos, actividades culturales u orfeón de UNIMAR.",
    requisitos: [
      "Constancia de pertenencia activa al club deportivo, agrupación cultural u orfeón (Art. 21).",
      "Promedio igual o mayor a 16 puntos en el trimestre inmediatamente anterior.",
    ],
    color: "bg-[#8b5e1b]",
    featured: false,
    postulable: true,
    ctaLabel: "Solicitar",
  },
]

export const BECAS_STATS = [
  { icon: Users, value: "60", label: "Máximo Beca Social Activos" },
  { icon: Percent, value: "100%", label: "Exoneración Beca Excelencia" },
  { icon: GraduationCap, value: "25", label: "Cupos Beca Aprendizaje" },
  { icon: Clock, value: "1 Trimestre", label: "Vigencia por Período" },
]