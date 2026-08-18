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
  featured: boolean // Indica si se muestra en el resumen del Home
}

export const BECAS_DATA: Scholarship[] = [
  // --- BECAS PRINCIPALES ---
  {
    id: "social",
    icon: Heart,
    title: "Beca Social Aprendizaje",
    coverage: "100%",
    badge: "100% Cobertura",
    description: "Programa destinado a bachilleres de planteles públicos del estado Nueva Esparta con alto rendimiento y escasos recursos económicos..",
    requisitos: [
      "Promedio de notas igual o superior a 18 puntos.",
      "Provenir de una Unidad Educativa Pública del estado Nueva Esparta.",
      "Demostrar escasos recursos económicos en la entrevista socioeconómica.",
      "Cumplir 15 horas semanales de apoyo administrativo asignado.",
    ],
    color: "bg-[#2a6041]",
    featured: true,
  },
  {
    id: "aprendizaje",
    icon: GraduationCap,
    title: "Beca Aprendizaje",
    coverage: "70%",
    badge: "70% Cobertura",
    description: "Subvención del 70% de la matrícula para estudiantes regulares que colaboran en actividades administrativas para desarrollar destrezas..",
    requisitos: [
      "Índice académico igual o superior a 16 puntos en el período anterior.",
      "Inscribir la máxima carga académica del pensum de estudios.",
      "Aprobar la evaluación socioeconómica del Departamento de Bienestar Estudiantil.",
      "Cumplir 15 horas semanales de apoyo en la dependencia asignada.",
    ],
    color: "bg-[#1e3a5f]",
    featured: true,
  },
  {
    id: "discapacidad",
    icon: Accessibility,
    title: "Beca por Discapacidad",
    coverage: "100%",
    badge: "100% Cobertura",
    description: "Exoneración total de la matrícula para estudiantes regulares con alguna discapacidad y de escasos recursos económicos..",
    requisitos: [
      "Informe médico por especialista y carnet oficial de discapacidad.",
      "Índice académico igual o superior a 16 puntos en el período anterior.",
      "Comprobación socioeconómica por Bienestar Estudiantil.",
    ],
    color: "bg-[#1e3a5f]",
    featured: true,
  },
  {
    id: "excelencia",
    icon: Award,
    title: "Beca a la Excelencia Académica",
    coverage: "100%",
    badge: "100% Cobertura",
    description: "Reconocimiento al mayor índice acumulado de cada carrera (mínimo 18 pts), exonerando el costo total de la matrícula..",
    requisitos: [
      "Poseer el mayor índice acumulado de la carrera (≥ 18 puntos).",
      "Estar cursando a partir del cuarto (4to) trimestre académico.",
      "Haber cumplido con todos los deberes y no tener sanciones disciplinarias.",
    ],
    color: "bg-[#7c2d3e]",
    featured: true,
  },

  // --- AYUDAS ECONÓMICAS ---
  {
    id: "general",
    icon: Trophy,
    title: "Ayuda Económica General",
    coverage: "30%",
    badge: "Hasta 30%",
    description: "Descuento parcial de la matrícula otorgado previa evaluación de vulnerabilidad por el Consejo Superior..",
    requisitos: [
      "Índice académico igual o superior a 16 puntos en el período anterior.",
      "Consignar solicitud directa ante las oficinas del Consejo Superior.",
      "Sujeto a la disponibilidad presupuestaria (máximo 30 estudiantes).",
    ],
    color: "bg-[#8b5e1b]",
    featured: false,
  },
  {
    id: "familiar",
    icon: Users,
    title: "Ayuda Económica Familiar",
    coverage: "10%",
    badge: "10% Descuento",
    description: "Descuento del 10% en la matrícula para estudiantes que tengan familiares directos inscritos en la universidad..",
    requisitos: [
      "Comprobar filiación directa (hermanos, padres, hijos, cónyuge o concubino).",
      "Promedio o índice académico igual o superior a 16 puntos.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
  },
  {
    id: "trabajadores",
    icon: Briefcase,
    title: "Ayuda para Trabajadores",
    coverage: "Especial",
    badge: "Especial",
    description: "Beneficio para el personal administrativo y docente de la Universidad de Margarita para cursar una carrera..",
    requisitos: [
      "Ser trabajador activo de la institución.",
      "Aplica exclusivamente para una (1) carrera universitaria.",
      "Mantener un índice académico igual o superior a 16 puntos.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
  },
  {
    id: "hijos-trabajadores",
    icon: UserCheck,
    title: "Hijos de Trabajadores",
    coverage: "10%",
    badge: "10% Descuento",
    description: "Descuento del 10% en la matrícula para hijos del personal docente y administrativo de la institución..",
    requisitos: [
      "Documentos probatorios de filiación con el trabajador.",
      "Índice académico igual o superior a 16 puntos en el período anterior.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
  },
  {
    id: "preparadores",
    icon: BookOpen,
    title: "Estudiantes Preparadores",
    coverage: "Asignación",
    badge: "Asignación Reg.",
    description: "Incentivo asignado a estudiantes seleccionados para ejercer funciones de apoyo académico en asignaturas..",
    requisitos: [
      "Cumplir con la Normativa de Estudiantes Preparadores.",
      "Postulación y aval de los Decanatos ante el Vicerrectorado Académico.",
      "Máximo 6 preparadores autorizados por período académico.",
    ],
    color: "bg-[#1e3a5f]",
    featured: false,
  },
  {
    id: "extracurriculares",
    icon: Activity,
    title: "Actividades Extracurriculares",
    coverage: "20%",
    badge: "20% Descuento",
    description: "Descuento del 20% para estudiantes activos en clubes deportivos, agrupaciones culturales o el orfeón de UNIMAR..",
    requisitos: [
      "Formar parte activa del grupo cultural, deportivo u orfeón de la universidad.",
      "Índice académico igual o superior a 16 puntos en el trimestre anterior.",
    ],
    color: "bg-[#8b5e1b]",
    featured: false,
  },
]

export const BECAS_STATS = [
  { icon: Users, value: "60", label: "Máximo Beca Social Activos" },
  { icon: Percent, value: "100%", label: "Exoneración Beca Excelencia" },
  { icon: GraduationCap, value: "25", label: "Cupos Beca Aprendizaje" },
  { icon: Clock, value: "1 Trimestre", label: "Vigencia por Período" },
]