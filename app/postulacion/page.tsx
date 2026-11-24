import type { RowDataPacket } from "mysql2/promise"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent"
import { db } from "@/lib/db"
import { getStudentById } from "@/lib/TablaStudient"
import {
  RestrictedAccessCard,
  StatusCard,
  type StatusStudentData
} from "./components/PostulacionStatusUI"
import { PostulacionContainer } from "./components/PostulacionContainer"
import type { MateriaPensum, PostulacionUser } from "./types"

// Configuración de SSR para garantizar datos frescos de la DB
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EstudioSocioeconomicoRow extends RowDataPacket {
  socio_estado_civil?: string | null;
  socio_nacionalidad?: string | null;
  socio_lugar_nac?: string | null;
  direccion_completa?: string | null;
  socio_telf_hab?: string | null;
  socio_celular?: string | null;
  socio_carrera?: string | null;
  socio_trimestre?: string | number | null;
  socio_ue_procedencia?: string | null;
  socio_fecha_unimar?: string | Date | null;
  socio_otros_estudios?: string | null;
  socio_modalidad?: string | null;
  padre_nombre?: string | null;
  padre_edad?: string | number | null;
  padre_ocupacion?: string | null;
  padre_trabajo?: string | null;
  madre_nombre?: string | null;
  madre_edad?: string | number | null;
  madre_ocupacion?: string | null;
  madre_trabajo?: string | null;
  familia_num_hermanos?: string | number | null;
  familia_hermanos_uni?: string | number | null;
  familia_relacion?: string | null;
  situacion_laboral_jefe?: string | null;
  posee_empleo_aspirante?: string | null;
  socio_trabajo_empresa?: string | null;
  socio_trabajo_cargo?: string | null;
  monto_ingreso_sueldo?: string | number | null;
  rango_ingreso_familiar?: string | null;
  monto_ingreso_familiar?: string | number | null;
  monto_ingreso_extra?: string | number | null;
  monto_ingreso_pension?: string | number | null;
  monto_ingreso_ayuda?: string | number | null;
  monto_egreso_mercado?: string | number | null;
  monto_egreso_vivienda?: string | number | null;
  monto_egreso_salud?: string | number | null;
  monto_egreso_servicios?: string | number | null;
  vivienda_tipo?: string | null;
  vivienda_estatus?: string | null;
  serv_agua?: string | null;
  serv_luz?: string | null;
  serv_gas?: string | null;
  serv_aseo?: string | null;
  serv_internet?: string | null;
  equip_nevera?: string | null;
  equip_lavadora?: string | null;
  equip_cable?: string | null;
  salud_condicion_especial?: string | null;
  salud_enfermedad_desc?: string | null;
  salud_tratamiento?: string | null;
  observaciones_estudio?: string | null;
}

const formatearFechaISO = (valor: string | Date | null | undefined): string | null => {
  if (!valor) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
};

const extraerObservacionSolicitud = (lastSolicitud: unknown): string | null => {
  if (!lastSolicitud || typeof lastSolicitud !== "object") return null;
  const record = lastSolicitud as Record<string, unknown>;
  const obs = record.observaciones_admin;
  return typeof obs === "string" && obs.trim() !== "" ? obs.trim() : null;
};

const serializarEncuestaPrevia = (
  row: EstudioSocioeconomicoRow | undefined
): Partial<PostulacionUser> => {
  if (!row) return {};

  const fechaUnimar = formatearFechaISO(row.socio_fecha_unimar);

  return {
    socio_estado_civil: row.socio_estado_civil ?? undefined,
    socio_nacionalidad: row.socio_nacionalidad ?? undefined,
    socio_lugar_nac: row.socio_lugar_nac ?? undefined,
    direccion_completa: row.direccion_completa ?? undefined,
    socio_telf_hab: row.socio_telf_hab ?? undefined,
    socio_celular: row.socio_celular ?? undefined,
    socio_carrera: row.socio_carrera ?? undefined,
    socio_trimestre: row.socio_trimestre ?? undefined,
    socio_ue_procedencia: row.socio_ue_procedencia ?? undefined,
    socio_fecha_unimar: fechaUnimar ?? undefined,
    socio_otros_estudios: row.socio_otros_estudios ?? undefined,
    socio_modalidad: row.socio_modalidad ?? undefined,
    padre_nombre: row.padre_nombre ?? undefined,
    padre_edad: row.padre_edad ?? undefined,
    padre_ocupacion: row.padre_ocupacion ?? undefined,
    padre_trabajo: row.padre_trabajo ?? undefined,
    madre_nombre: row.madre_nombre ?? undefined,
    madre_edad: row.madre_edad ?? undefined,
    madre_ocupacion: row.madre_ocupacion ?? undefined,
    madre_trabajo: row.madre_trabajo ?? undefined,
    familia_num_hermanos: row.familia_num_hermanos ?? undefined,
    familia_hermanos_uni: row.familia_hermanos_uni ?? undefined,
    familia_relacion: row.familia_relacion ?? undefined,
    posee_empleo_aspirante: row.posee_empleo_aspirante ?? row.situacion_laboral_jefe ?? undefined,
    socio_trabajo_empresa: row.socio_trabajo_empresa ?? undefined,
    socio_trabajo_cargo: row.socio_trabajo_cargo ?? undefined,
    monto_ingreso_sueldo: row.monto_ingreso_sueldo ?? undefined,
    rango_ingreso_familiar: row.rango_ingreso_familiar ?? undefined,
    monto_ingreso_familiar: row.monto_ingreso_familiar ?? undefined,
    monto_ingreso_extra: row.monto_ingreso_extra ?? undefined,
    monto_ingreso_pension: row.monto_ingreso_pension ?? undefined,
    monto_ingreso_ayuda: row.monto_ingreso_ayuda ?? undefined,
    monto_egreso_mercado: row.monto_egreso_mercado ?? undefined,
    monto_egreso_vivienda: row.monto_egreso_vivienda ?? undefined,
    monto_egreso_salud: row.monto_egreso_salud ?? undefined,
    monto_egreso_servicios: row.monto_egreso_servicios ?? undefined,
    vivienda_tipo: row.vivienda_tipo ?? undefined,
    vivienda_estatus: row.vivienda_estatus ?? undefined,
    serv_agua: row.serv_agua ?? undefined,
    serv_luz: row.serv_luz ?? undefined,
    serv_gas: row.serv_gas ?? undefined,
    serv_aseo: row.serv_aseo ?? undefined,
    serv_internet: row.serv_internet ?? undefined,
    equip_nevera: row.equip_nevera ?? undefined,
    equip_lavadora: row.equip_lavadora ?? undefined,
    equip_cable: row.equip_cable ?? undefined,
    salud_condicion_especial: row.salud_condicion_especial ?? undefined,
    salud_enfermedad_desc: row.salud_enfermedad_desc ?? undefined,
    salud_tratamiento: row.salud_tratamiento ?? undefined,
    observaciones_estudio: row.observaciones_estudio ?? undefined,
  };
};

export default async function PostulacionPage(props: {
  searchParams: Promise<{ trimestre?: string }>;
}) {
  const userSession = await getSession();
  const searchParams = await props.searchParams;

  // 1. VALIDACIÓN DE SESIÓN (Protección de Ruta)
  if (!userSession?.isLoggedIn || !userSession.id) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <RestrictedAccessCard />
      </div>
    );
  }

  // Convertimos y validamos el ID de la sesión para cumplir con getStudentById
  const userId = Number(userSession.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <RestrictedAccessCard />
      </div>
    );
  }

  // 2. CONSULTA DE DATOS MAESTROS DEL ESTUDIANTE
  const studentRaw = await getStudentById(userId);

  if (!studentRaw) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="text-center space-y-3 max-w-md bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <h1 className="text-xl lg:text-lg font-black text-[#1e3a5f] uppercase tracking-tight">
            Error de Registro
          </h1>
          <p className="text-sm lg:text-xs text-slate-500 font-medium leading-relaxed">
            No se encontró información del estudiante en la base de datos.
          </p>
        </div>
      </div>
    );
  }

  const nivelRealEstudiante = studentRaw.semestre || 1;
  const trimestreSugerido = Math.max(1, nivelRealEstudiante - 1).toString();
  const trimestreQuery = searchParams.trimestre?.trim();
  const trimestreFinal =
    trimestreQuery && /^\d+$/.test(trimestreQuery) && Number(trimestreQuery) > 0
      ? trimestreQuery
      : trimestreSugerido;

  // 3. CONSULTA DE ENCUESTA PREVIA (Tipado estricto mysql2/promise)
  const [encuestaRows] = await db.execute<EstudioSocioeconomicoRow[]>(
    `SELECT * FROM estudios_socioeconomicos 
     WHERE student_id = ? AND tipo = 'estudiante' 
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  const encuestaPrevia = serializarEncuestaPrevia(encuestaRows[0]);

  // 4. FORMATEO SEGURO DE FECHA DE NACIMIENTO
  const fechaNacimientoFormateada = formatearFechaISO(studentRaw.fecha_nacimiento);

  // 5. OBTENCIÓN DE ESTATUS
  const academicStatus = await getStudentAcademicStatus(userId, trimestreFinal);
  const estatusUI = academicStatus.estatus;
  const yaPoseeBeneficio = studentRaw.ha_tenido_beca === 1;
  const tieneVeto = studentRaw.beca_perdida === 1;

  if (yaPoseeBeneficio || tieneVeto || (estatusUI !== "ninguna" && estatusUI !== "Renovacion")) {
    const observacionSolicitud = extraerObservacionSolicitud(academicStatus.lastSolicitud);
    const studentStatusData: StatusStudentData = {
      ...studentRaw,
      fecha_nacimiento: fechaNacimientoFormateada,
      observaciones_beca: observacionSolicitud
    };

    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
        <StatusCard estatus={estatusUI} studentRaw={studentStatusData} />
      </div>
    );
  }

  const enrichedUser: PostulacionUser = {
    ...encuestaPrevia,
    ...studentRaw,
    fecha_nacimiento: fechaNacimientoFormateada,
    semestre: nivelRealEstudiante,
    indice_global: academicStatus.indiceGlobal
  };

  const materiasDelPensum: MateriaPensum[] = Array.isArray(academicStatus.materiasSugeridas)
    ? (academicStatus.materiasSugeridas as MateriaPensum[])
    : [];

  return (
    <main className="w-full min-h-screen bg-[#f8fafc] flex flex-col">
      <PostulacionContainer
        user={enrichedUser}
        materiasDelPensum={materiasDelPensum}
        trimestreActual={trimestreFinal}
        periodoIngreso={academicStatus.periodoActual}
      />
    </main>
  );
}