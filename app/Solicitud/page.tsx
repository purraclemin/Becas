import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent" 
import { SolicitudForm } from "@/app/Solicitud/components/SolicitudFormFields" 
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { mapSolicitudData } from "@/lib/solicitudMappers"
import { RestrictedAccessCard, StatusCard } from "@/app/Solicitud/components/SolicitudStatusUI"

export const dynamic = 'force-dynamic';

export default async function SolicitudPage() {
  const userSession = await getSession()

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

  // CONSULTA DE ENCUESTA PREVIA (Para precargar si ya ha intentado llenar el formulario)
  const [encuestaRows]: any = await db.execute(
    `SELECT respuestas_json FROM estudios_socioeconomicos WHERE student_id = ? AND tipo = 'estudiante' LIMIT 1`,
    [userId]
  );

  const studentRaw = studentRows[0] ? JSON.parse(JSON.stringify(studentRows[0])) : null;
  const encuestaPrevia = encuestaRows[0]?.respuestas_json || null;

  // 🟢 FORMATEO CRÍTICO DE FECHA: El input date y el cálculo de edad fallan si no es YYYY-MM-DD
  if (studentRaw && studentRaw.fecha_nacimiento) {
    const d = new Date(studentRaw.fecha_nacimiento);
    studentRaw.fecha_nacimiento = d.toISOString().split('T')[0];
  }

  // 3. CONSULTA DE ESTATUS ACADÉMICO
  const academicStatus = await getStudentAcademicStatus(userId);
  const estatusUI = academicStatus.estatus;

  /**
   * 🟢 LÓGICA DE FILTRADO
   * Solo permitimos el paso a nuevos aspirantes (estatus 'ninguna').
   * Si ya tiene beca, veto o está en revisión, va a la StatusCard.
   */
  const yaPoseeBeneficio = studentRaw?.ha_tenido_beca === 1;
  const tieneVeto = studentRaw?.beca_perdida === 1;

  if (yaPoseeBeneficio || tieneVeto || (estatusUI !== 'ninguna' && estatusUI !== 'Renovacion')) {
    return <StatusCard estatus={estatusUI} studentRaw={studentRaw} />;
  }

  // 4. MAPEO DE DATOS
  // Pasamos 'encuestaPrevia' en lugar de null para recuperar sexo, municipio, etc., si ya se guardaron.
  const enrichedUser = mapSolicitudData(
    userSession, 
    { ...studentRaw, indice_global: academicStatus.indiceGlobal }, 
    null, 
    encuestaPrevia
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" /> Volver al Inicio
          </Button>
        </Link>
        <div className="text-[#1e3a5f] font-black text-xs uppercase tracking-widest hidden sm:block">
          Unimar • Sistema de Becas
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="bg-[#1e3a5f] p-8 text-center border-b-4 border-[#d4a843]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <FileText className="h-8 w-8 text-[#1e3a5f]" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight font-serif">
            Nueva Solicitud de Beca
          </CardTitle>
          <p className="text-white/70 text-xs uppercase tracking-widest mt-2 font-bold italic">
            {academicStatus.periodoActual !== 'N/A' ? `Periodo de Ingreso: ${academicStatus.periodoActual}` : 'Universidad de Margarita'}
          </p>
        </div>

        <CardContent className="p-8">
          <SolicitudForm user={enrichedUser} />
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Al enviar esta solicitud, usted certifica que toda la información suministrada es verídica.
        </p>
      </div>
    </div>
  )
}