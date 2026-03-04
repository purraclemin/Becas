// app/postulacion/page.tsx

import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent" 
import { db } from "@/lib/db"
import { getStudentById } from "@/lib/TablaStudient"
import { RestrictedAccessCard, StatusCard } from "@/app/Solicitud3/components/SolicitudStatusUI"
import { PostulacionContainer } from "./components/PostulacionContainer"

// Configuración de SSR para garantizar datos frescos de la DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostulacionPage(props: { searchParams: Promise<{ trimestre?: string }> }) {
  const userSession = await getSession();
  const searchParams = await props.searchParams; 

  // 1. VALIDACIÓN DE SESIÓN (Protección de Ruta)
  if (!userSession?.isLoggedIn || !userSession.id) {
    return <RestrictedAccessCard />
  }

  // Convertimos el ID de la sesión a número para cumplir con la interfaz de getStudentById
  const userId = Number(userSession.id);

  // 2. CONSULTA DE DATOS MAESTROS DEL ESTUDIANTE (Usando TablaStudient)
  const studentRaw = await getStudentById(userId);

  if (!studentRaw) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-[#1e3a5f]">Error de Registro</h1>
          <p className="text-slate-500 font-medium">No se encontró información del estudiante en la base de datos.</p>
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

  // 4. FORMATEO DE FECHA PARA INPUTS DATE
  if (studentRaw.fecha_nacimiento) {
    const d = new Date(studentRaw.fecha_nacimiento);
    studentRaw.fecha_nacimiento = d.toISOString().split('T')[0];
  }
  
  // Formateo de la fecha de ingreso universitario de la encuesta previa
  if (encuestaPrevia.socio_fecha_unimar) {
    const d = new Date(encuestaPrevia.socio_fecha_unimar);
    encuestaPrevia.socio_fecha_unimar = d.toISOString().split('T')[0];
  }

  // 5. OBTENCIÓN DE ESTATUS ACADÉMICO Y RESTRICCIONES
  const academicStatus = await getStudentAcademicStatus(userId, trimestreFinal);
  const estatusUI = academicStatus.estatus;

  const yaPoseeBeneficio = studentRaw.ha_tenido_beca === 1;
  const tieneVeto = studentRaw.beca_perdida === 1;

  // Si ya tiene una beca o está vetado, mostramos la tarjeta de estatus fuera del flujo de postulación
  if (yaPoseeBeneficio || tieneVeto || (estatusUI !== 'ninguna' && estatusUI !== 'Renovacion')) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <StatusCard estatus={estatusUI} studentRaw={studentRaw} />
      </div>
    );
  }

  // 6. CONSOLIDACIÓN DE DATOS (Sin mapeadores externos que alteren las propiedades)
  const enrichedUser = {
    ...userSession,
    ...encuestaPrevia, // Agregamos primero la encuesta (socio_lugar_nac, socio_fecha_unimar, socio_ue_procedencia, etc.)
    ...studentRaw,     // Agregamos studentRaw de último para que sus campos (nombre, apellido) tengan prioridad absoluta
    semestre: nivelRealEstudiante,
    indice_global: academicStatus.indiceGlobal
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#f8fafc] flex flex-col">
      {/* PostulacionContainer será el componente "use client" encargado de 
          gestionar el estado de los pasos y la visualización fija.
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