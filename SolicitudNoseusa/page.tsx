// app/Solicitud/page.tsx

// 🔴 ELIMINADO: "use client" (Esta página debe ser Server Component para usar la DB)

import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent" 
import { SolicitudForm } from "@/SolicitudNoseusa/components/SolicitudFormFields" 
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { mapSolicitudData } from "@/lib/solicitudMappers"
import { RestrictedAccessCard, StatusCard } from "@/SolicitudNoseusa/components/SolicitudStatusUI"

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

  // 3. CONSULTA DE ENCUESTA PREVIA (Columnas Planas)
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

  // 6. MAPEO DE DATOS (Enviamos el objeto plano de la DB)
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
    <div className="container mx-auto py-6 lg:py-12 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-center px-2">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all rounded-xl shadow-sm">
            <ArrowLeft className="h-4 w-4" /> Volver al Inicio
          </Button>
        </Link>
        <div className="text-[#1e3a5f] font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] hidden sm:block opacity-60">
          Unimar • Sistema de Gestión de Becas
        </div>
      </div>

      <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden bg-white">
        <div className="bg-[#1e3a5f] p-10 lg:p-14 text-center relative overflow-hidden">
          {/* Elemento decorativo sutil */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl transform rotate-3 transition-transform hover:rotate-0">
              <FileText className="h-10 w-10 text-[#1e3a5f]" />
            </div>
            <CardTitle className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight font-serif">
              Nueva Solicitud de Beca
            </CardTitle>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843] animate-pulse" />
              <p className="text-white text-[10px] lg:text-xs uppercase tracking-[0.2em] font-bold">
                {academicStatus.periodoActual !== 'N/A' ? `Periodo de Ingreso: ${academicStatus.periodoActual}` : 'Periodo Académico Vigente'}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-10 lg:p-14">
          <SolicitudForm 
            user={enrichedUser} 
            materiasDelPensum={academicStatus.materiasSugeridas}
            trimestreActual={trimestreFinal}
          />
        </CardContent>
      </Card>
      
      <div className="mt-10 text-center pb-10">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed">
          Al enviar esta solicitud, usted certifica bajo fe de juramento que toda la información suministrada es verídica y comprobable por la institución.
        </p>
      </div>
    </div>
  )
}