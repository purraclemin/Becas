'use server'

import { db } from './db'

/**
 * 🟢 MOTOR DE VALIDACIÓN DE REGLAMENTOS Y CUPOS
 * Centraliza las reglas institucionales y la lógica de "Cupo Comprometido".
 */

// Se añadió 'export' para que el componente AuditoriaPanel pueda reconocer el tipo
export interface DiagnosticoBeca {
  apto: boolean;
  codigo: 'OK' | 'CUPO_EXCEDIDO' | 'INDICE_INSUFICIENTE' | 'TRIMESTRE_INSUFICIENTE' | 'ERROR';
  mensaje: string;
  detalles?: {
    actual: number;
    maximo: number;
    indiceRequerido: number;
    indiceActual: number;
  };
}

/**
 * Valida requisitos y cupos buscando los datos reales en la DB por solicitudId.
 * Se añadió 'export' para que pueda ser invocada desde el cliente.
 */
export async function validarCuposYRequisitos(
  solicitudId: number,
  periodoId: number
): Promise<DiagnosticoBeca> {
  try {
    // 1. OBTENER DATOS CON LIMPIEZA TOTAL
    const [dataRows]: any = await db.execute(`
      SELECT 
        TRIM(s.tipo_beca) as tipo_beca, 
        s.promedio_notas, 
        st.semestre as trimestre_real, 
        TRIM(st.carrera) as carrera
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.id = ?
    `, [Number(solicitudId)]); 

    if (!dataRows || dataRows.length === 0) {
      return { apto: false, codigo: 'ERROR', mensaje: "No se encontró el expediente del estudiante." };
    }

    // NORMALIZACIÓN: Eliminamos espacios dobles o extraños
    const tipoBecaRaw = dataRows[0].tipo_beca.toUpperCase().replace(/\s+/g, ' ').trim();
    const carreraDB = dataRows[0].carrera.toUpperCase().replace(/\s+/g, ' ').trim();
    const trimestreReal = parseInt(dataRows[0].trimestre_real);
    const indiceNum = parseFloat(dataRows[0].promedio_notas);
    
    // 2. REGLAMENTO INSTITUCIONAL
    const REGLAMENTO: Record<string, any> = {
      'BECA APRENDIZAJE': { cupoMaximo: 25, indiceMinimo: 16, trimestreMinimo: 1 },
      'BECA SOCIAL': { cupoMaximo: 7, indiceMinimo: 18, trimestreMinimo: 1 }, 
      'BECA POR DISCAPACIDAD': { cupoMaximo: 20, indiceMinimo: 16, trimestreMinimo: 1 },
      'BECA A LA EXCELENCIA': { cupoMaximo: 1, indiceMinimo: 18, trimestreMinimo: 4 }
    };

    const regla = REGLAMENTO[tipoBecaRaw];

    if (!regla) {
      return { 
        apto: true, 
        codigo: 'OK', 
        mensaje: `Tipo de beca (${tipoBecaRaw}) sin restricciones específicas.` 
      };
    }

    // 3. VALIDACIÓN DE REQUISITOS ACADÉMICOS
    if (trimestreReal < regla.trimestreMinimo) {
      return {
        apto: false,
        codigo: 'TRIMESTRE_INSUFICIENTE',
        mensaje: `Esta beca exige cursar a partir del trimestre ${regla.trimestreMinimo}. El estudiante está cursando el trimestre ${trimestreReal}.`,
      };
    }

    if (indiceNum < regla.indiceMinimo) {
      return {
        apto: false,
        codigo: 'INDICE_INSUFICIENTE',
        mensaje: `El índice (${indiceNum}) es insuficiente para ${tipoBecaRaw}. Mínimo: ${regla.indiceMinimo}.`,
        detalles: { actual: 0, maximo: regla.cupoMaximo, indiceRequerido: regla.indiceMinimo, indiceActual: indiceNum }
      };
    }

    // 4. CONTEO DE CUPOS COMPROMETIDOS
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.periodo_id = ? 
        AND UPPER(TRIM(s.tipo_beca)) = ? 
        AND s.estatus NOT IN ('Aprobada', 'Renovación')
        AND s.id != ?
    `;
    
    let params: any[] = [Number(periodoId), tipoBecaRaw, Number(solicitudId)];

    if (tipoBecaRaw === 'BECA A LA EXCELENCIA') {
      countQuery += ` AND UPPER(TRIM(st.carrera)) = ?`;
      params.push(carreraDB);
    }

    const [rows]: any = await db.execute(countQuery, params);
    const cupoOcupado = rows[0]?.total || 0;

    console.log(`🔍 VALIDACIÓN [${tipoBecaRaw}]: Detectadas ${cupoOcupado} ocupadas. Límite: ${regla.cupoMaximo}`);

    if (cupoOcupado >= regla.cupoMaximo) {
      return {
        apto: false,
        codigo: 'CUPO_EXCEDIDO',
        mensaje: `Cupo comprometido: Ya existen ${cupoOcupado} solicitudes activas para ${tipoBecaRaw}${tipoBecaRaw === 'BECA A LA EXCELENCIA' ? ' en esta carrera' : ''}.`,
        detalles: { 
          actual: cupoOcupado, 
          maximo: regla.cupoMaximo, 
          indiceRequerido: regla.indiceMinimo, 
          indiceActual: indiceNum 
        }
      };
    }

    return { apto: true, codigo: 'OK', mensaje: "Cumple con los requisitos y hay cupo disponible." };

  } catch (error) {
    console.error("❌ Error en validador de becas:", error);
    return { apto: false, codigo: 'ERROR', mensaje: "Error interno al verificar el reglamento." };
  }
}

/**
 * 🟢 ACTUALIZACIÓN DE ESTATUS Y DEPARTAMENTO ASIGNADO
 * Guarda el departamento asignado únicamente si la beca es aprobada. 
 * Lo limpia si se rechaza o pasa a revisión.
 */
export async function actualizarEstadoSolicitud(
  solicitudId: number,
  nuevoEstatus: string,
  observaciones: string,
  departamentoAsignado?: string
) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Si está aprobada se guarda el departamento, de lo contrario se asigna NULL
    const deptAGuardar = nuevoEstatus === 'Aprobada' ? (departamentoAsignado || null) : null;

    await connection.execute(
      `UPDATE solicitudes 
       SET estatus = ?, 
           observaciones_admin = ?, 
           departamento_asignado = ?, 
           fecha_decision = CASE WHEN ? IN ('Aprobada', 'Rechazada') THEN NOW() ELSE fecha_decision END,
           fecha_revision = CASE WHEN ? = 'En Revisión' THEN NOW() ELSE fecha_revision END
       WHERE id = ?`,
      [nuevoEstatus, observaciones, deptAGuardar, nuevoEstatus, nuevoEstatus, Number(solicitudId)]
    );

    await connection.commit();
    return { success: true, message: "Estatus y departamento actualizados exitosamente." };

  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error al actualizar el estatus de la solicitud:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}