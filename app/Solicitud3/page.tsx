// app/Solicitud/page.tsx

// 🔴 ELIMINADO: "use client" (Esta página debe ser Server Component para usar la DB)

import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent" 
import { SolicitudForm } from "@/app/Solicitud3/components/SolicitudFormFields" 
import { CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Sparkles, LayoutGrid } from "lucide-react"
import { db } from "@/lib/db"
import { mapSolicitudData } from "@/lib/solicitudMappers"
import { RestrictedAccessCard, StatusCard } from "@/app/Solicitud3/components/SolicitudStatusUI"

// Configuración de SSR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SolicitudPage(props: { searchParams: Promise<{ trimestre?: string }> }) {
  const userSession = await getSession();
  const searchParams = await props.searchParams; 

  // 1. VALIDACIÓN DE SESIÓN
  if (!userSession?.isLoggedIn || !userSession.id) {
    return <RestrictedAccessCard />
  }

  const userId = userSession.id;

  // 2. CONSULTA DE DATOS MAESTROS DEL ESTUDIANTE
  const [studentRows]: any = await db.execute(
    `SELECT nombre, apellido, cedula, sexo, fecha_nacimiento, municipio_residencia, telefono, email, carrera, semestre, ha_tenido_beca, beca_perdida, motivo_exclusion FROM students WHERE id = ?`,
    [userId]
  );

  const studentRaw = studentRows[0] || null;

  if (!studentRaw) {
    return <div>Error: Estudiante no encontrado.</div>;
  }

  const nivelRealEstudiante = studentRaw.semestre || 1;
  const trimestreSugerido = Math.max(1, nivelRealEstudiante - 1).toString();
  const trimestreFinal = searchParams.trimestre || trimestreSugerido;

  // 3. CONSULTA DE ENCUESTA PREVIA
  const [encuestaRows]: any = await db.execute(
    `SELECT * FROM estudios_socioeconomicos 
     WHERE student_id = ? AND tipo = 'estudiante' 
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  const encuestaPrevia = encuestaRows[0] || null;

  // 4. FORMATEO DE FECHA
  if (studentRaw.fecha_nacimiento) {
    const d = new Date(studentRaw.fecha_nacimiento);
    studentRaw.fecha_nacimiento = d.toISOString().split('T')[0];
  }

  // 5. ESTATUS ACADÉMICO
  const academicStatus = await getStudentAcademicStatus(userId, trimestreFinal);
  const estatusUI = academicStatus.estatus;

  const yaPoseeBeneficio = studentRaw.ha_tenido_beca === 1;
  const tieneVeto = studentRaw.beca_perdida === 1;

  if (yaPoseeBeneficio || tieneVeto || (estatusUI !== 'ninguna' && estatusUI !== 'Renovacion')) {
    return <StatusCard estatus={estatusUI} studentRaw={studentRaw} />;
  }

  // 6. MAPEO DE DATOS
  const enrichedUser = mapSolicitudData(
    userSession, 
    { 
      ...studentRaw, 
      semestre: nivelRealEstudiante, 
      indice_global: academicStatus.indiceGlobal 
    }, 
    null, 
    encuestaPrevia
  );

  return (
    <div className="w-full min-h-screen animate-in fade-in duration-700">
      
      {/* HEADER ULTRA-COMPACTO (Reducido) */}
      <div className="flex items-center justify-between py-2 px-1">
        <Link href="/">
          <Button variant="ghost" className="group flex items-center gap-1.5 text-[#1e3a5f]/40 hover:text-[#1e3a5f] transition-all p-0 h-auto font-black uppercase tracking-[0.15em] text-[7px]">
            <ArrowLeft className="h-2.5 w-2.5 transition-transform group-hover:-translate-x-0.5" /> Inicio
          </Button>
        </Link>
        <div className="flex items-center gap-1.5 opacity-20">
          <LayoutGrid className="h-2.5 w-2.5 text-[#1e3a5f]" />
          <span className="text-[7px] font-black uppercase tracking-widest text-[#1e3a5f]">Portal de Gestión</span>
        </div>
      </div>

      {/* CONTENEDOR INTEGRADO (Más compacto) */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_15px_40px_rgba(30,58,95,0.04)] overflow-hidden border border-slate-100">
        
        {/* BANNER COMPACTO (Slim High-Density) */}
        <div className="bg-[#1e3a5f] px-5 py-5 lg:px-8 text-center relative overflow-hidden">
          {/* Acento Unimar */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-[#d4a843]/60" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Título e Icono en miniatura */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-md">
                <FileText className="h-4 w-4 text-[#1e3a5f]" />
              </div>
              <div className="text-left">
                <CardTitle className="text-lg lg:text-xl font-black text-white uppercase tracking-tight font-serif italic leading-none">
                  Nueva Solicitud
                </CardTitle>
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/30 mt-0.5">Gestión de Beneficios Estudiantiles</p>
              </div>
            </div>
            
            {/* Info de Periodo Badge (Compacto) */}
            <div className="flex flex-col items-center sm:items-end gap-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="h-2.5 w-2.5 text-[#d4a843]" />
                <p className="text-white text-[8px] uppercase tracking-[0.15em] font-black italic">
                  {academicStatus.periodoActual !== 'N/A' ? `Periodo: ${academicStatus.periodoActual}` : 'Periodo Vigente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL (Padding reducido para no verse "inflado") */}
        <CardContent className="p-0">
          <div className="py-6 px-3 md:px-6 lg:px-8">
            <SolicitudForm 
              user={enrichedUser} 
              materiasDelPensum={academicStatus.materiasSugeridas}
              trimestreActual={trimestreFinal}
            />
          </div>
        </CardContent>
      </div>
      
      {/* FOOTER MINIMALISTA */}
      <div className="mt-6 text-center pb-6">
        <p className="text-[6px] text-slate-300 font-bold uppercase tracking-[0.4em] max-w-xl mx-auto italic opacity-50">
          Universidad de Margarita • Bienestar Estudiantil
        </p>
      </div>
    </div>
  )
}