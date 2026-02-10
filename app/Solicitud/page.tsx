import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
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

  if (!userSession?.isLoggedIn) {
    return <RestrictedAccessCard />
  }

  const [studentRows]: any = await db.execute(
    `SELECT nombre, apellido, cedula, sexo, fecha_nacimiento, municipio_residencia, telefono, email, carrera, semestre, ha_tenido_beca, beca_perdida, motivo_exclusion FROM students WHERE id = ?`,
    [userSession.id]
  );

  const [solicitudRows]: any = await db.execute(
    'SELECT estatus, observaciones_admin, tipo_beca, promedio_notas, motivo_solicitud, foto_carnet, copia_cedula, planilla_inscripcion, materias_json, ingreso_familiar_total FROM solicitudes WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [userSession.id]
  );

  const [encuestaRows]: any = await db.execute(
    `SELECT respuestas_json FROM estudios_socioeconomicos WHERE student_id = ? AND tipo = 'estudiante' LIMIT 1`,
    [userSession.id]
  );

  const studentRaw = studentRows[0] ? JSON.parse(JSON.stringify(studentRows[0])) : null;
  const infoSolicitud = solicitudRows[0] ? JSON.parse(JSON.stringify(solicitudRows[0])) : null;
  
  // Mapeo y enriquecimiento de datos
  const enrichedUser = mapSolicitudData(userSession, studentRaw, infoSolicitud, encuestaRows[0]?.respuestas_json);
  
  const estatus = infoSolicitud?.estatus || 'ninguna';
  const tieneSolicitudActiva = estatus === 'En Revisión' || estatus === 'Pendiente';

  // Verificación de estados que bloquean el formulario
  if (estatus === 'Aprobada' || estatus === 'Rechazada' || ((studentRaw && (studentRaw.ha_tenido_beca === 1 || studentRaw.beca_perdida === 1)) && !tieneSolicitudActiva)) {
    return <StatusCard estatus={estatus} user={enrichedUser} studentRaw={studentRaw} />
  }

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
          <p className="text-[#8a9bbd] text-xs uppercase tracking-widest mt-2 font-bold italic">
            Universidad de Margarita
          </p>
        </div>
        <CardContent className="p-8">
          <SolicitudForm user={enrichedUser} />
        </CardContent>
      </Card>
    </div>
  )
}