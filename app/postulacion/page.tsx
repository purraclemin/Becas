import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent" 
import { db } from "@/lib/db"
import { getStudentById } from "@/lib/TablaStudient"
import { RestrictedAccessCard, StatusCard } from "./components/PostulacionStatusUI"
import { PostulacionContainer } from "./components/PostulacionContainer"

// Configuración de SSR para garantizar datos frescos de la DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostulacionPage(props: { searchParams: Promise<{ trimestre?: string }> }) {
  const userSession = await getSession();
  const searchParams = await props.searchParams; 

  // 1. VALIDACIÓN DE SESIÓN (Protección de Ruta)
  if (!userSession?.isLoggedIn || !userSession.id) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
            <RestrictedAccessCard />
        </div>
    )
  }

  // Convertimos el ID de la sesión a número para cumplir con la interfaz de getStudentById
  const userId = Number(userSession.id);

  // 2. CONSULTA DE DATOS MAESTROS DEL ESTUDIANTE
  const studentRaw = await getStudentById(userId);

  if (!studentRaw) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-serif font-black text-[#1e3a5f] uppercase tracking-tight">Error de Registro</h1>
          <p className="text-[#6b7280] leading-relaxed">No se encontró información del estudiante en la base de datos.</p>
        </div>
      </div>
    );
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

  const encuestaPrevia = encuestaRows[0] || {};

  // 4. FORMATEO DE FECHA
  if (studentRaw.fecha_nacimiento) {
    const d = new Date(studentRaw.fecha_nacimiento);
    studentRaw.fecha_nacimiento = d.toISOString().split('T')[0];
  }
  
  if (encuestaPrevia.socio_fecha_unimar) {
    const d = new Date(encuestaPrevia.socio_fecha_unimar);
    encuestaPrevia.socio_fecha_unimar = d.toISOString().split('T')[0];
  }

  // 5. OBTENCIÓN DE ESTATUS
  const academicStatus = await getStudentAcademicStatus(userId, trimestreFinal);
  const estatusUI = academicStatus.estatus;
  const yaPoseeBeneficio = studentRaw.ha_tenido_beca === 1;
  const tieneVeto = studentRaw.beca_perdida === 1;

  if (yaPoseeBeneficio || tieneVeto || (estatusUI !== 'ninguna' && estatusUI !== 'Renovacion')) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
        <StatusCard estatus={estatusUI} studentRaw={studentRaw} />
      </div>
    );
  }

  const enrichedUser = {
    ...userSession,
    ...encuestaPrevia,
    ...studentRaw,
    semestre: nivelRealEstudiante,
    indice_global: academicStatus.indiceGlobal
  };

  return (
    <main className="w-full min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Renderizado Directo (Full Page):
          Se eliminó el div restrictivo con paddings y anchos máximos.
          El PostulacionContainer ahora tiene libertad absoluta para acoplarse 
          a los bordes de la pantalla y extender su Sidebar hacia la izquierda.
      */}
      <PostulacionContainer 
        user={enrichedUser}
        materiasDelPensum={academicStatus.materiasSugeridas}
        trimestreActual={trimestreFinal}
        periodoIngreso={academicStatus.periodoActual}
      />
    </main>
  )
}