'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import {
  normalizarTipoBecaOficial,
  obtenerPromedioMinimoPorTipoBeca,
  obtenerReglaPorTipoBeca,
  obtenerVariantesTipoBeca,
} from './RecordAcademicoUtils'

/**
 * MOTOR DE VALIDACIÓN DE REGLAMENTOS, PROMEDIOS Y CUPOS (NORMATIVA UNIMAR 2023)
 * - Bloqueo definitivo por rechazo o suspensión previa (Art. 28).
 * - Beca a la Excelencia Académica: valida Índice Global Acumulado >= 18 y 1 cupo por carrera (Art. 8).
 * - Beca Social Aprendizaje: valida tope anual de 10 nuevos ingresos y máximo 60 activos por periodo (Art. 6 Par. 2°).
 * - Resto de modalidades: valida Promedio del Trimestre Anterior >= 16 y cupos vigentes.
 */
export interface DiagnosticoBeca {
  apto: boolean;
  codigo:
    | 'OK'
    | 'CUPO_EXCEDIDO'
    | 'INDICE_INSUFICIENTE'
    | 'TRIMESTRE_INSUFICIENTE'
    | 'BECA_PERDIDA'
    | 'ERROR';
  mensaje: string;
  detalles?: {
    actual: number;
    maximo: number;
    indiceRequerido: number;
    indiceActual: number;
  };
}

interface SolicitudValidacionRow extends RowDataPacket {
  user_id: number;
  tipo_beca: string | null;
  promedio_notas: number | string | null;
  indice_global: number | string | null;
  trimestre_real: number | string | null;
  carrera: string | null;
  beca_perdida: number | null;
}

interface CupoTotalRow extends RowDataPacket {
  total: number;
}

interface PeriodoAnioRow extends RowDataPacket {
  anio: number;
}

interface SolicitudUserIdRow extends RowDataPacket {
  user_id: number;
}

export async function validarCuposYRequisitos(
  solicitudId: number,
  periodoId: number
): Promise<DiagnosticoBeca> {
  try {
    const [dataRows] = await db.execute<SolicitudValidacionRow[]>(
      `
      SELECT 
        s.user_id,
        TRIM(s.tipo_beca) AS tipo_beca, 
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        st.semestre AS trimestre_real, 
        TRIM(st.carrera) AS carrera,
        IFNULL(st.beca_perdida, 0) AS beca_perdida
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [Number(solicitudId)]
    );

    if (!dataRows || dataRows.length === 0) {
      return { apto: false, codigo: 'ERROR', mensaje: "No se encontró el expediente del estudiante." };
    }

    const row = dataRows[0];

    // 1. VERIFICAR BLOQUEO PERMANENTE POR RECHAZO / SUSPENSIÓN PREVIA (Art. 28)
    if (Number(row.beca_perdida) === 1) {
      return {
        apto: false,
        codigo: 'BECA_PERDIDA',
        mensaje:
          "El estudiante registra una suspensión o rechazo definitivo previo  y no puede optar nuevamente por ninguna beca o ayuda económica.",
      };
    }

    const tipoBecaOficial =
      normalizarTipoBecaOficial(row.tipo_beca) || String(row.tipo_beca || "").trim();
    const regla = obtenerReglaPorTipoBeca(tipoBecaOficial);
    const carreraDB = String(row.carrera ?? "").toUpperCase().replace(/\s+/g, " ").trim();
    const trimestreReal = parseInt(String(row.trimestre_real ?? 0), 10) || 0;
    const promedioTrimestral = parseFloat(String(row.promedio_notas ?? 0)) || 0;
    const indiceGlobal = parseFloat(String(row.indice_global ?? 0)) || 0;

    // Solo Beca a la Excelencia Académica (Art. 8) evalúa Índice Global Acumulado
    const indiceEvaluado =
      regla?.usaIndiceAcumulado ? indiceGlobal : promedioTrimestral;

    const indiceMinimo = obtenerPromedioMinimoPorTipoBeca(
      tipoBecaOficial,
      "ingreso",
      trimestreReal
    );
    const trimestreMinimo = regla?.trimestreMinimo ?? 1;
    const cupoMaximo = regla?.cupoMaximo ?? null;

    // 2. VALIDACIÓN ESTRICTA DE CUPOS ANTES DE REGLAS EXCEPCIONABLES (bloqueo absoluto sin bypass)
    if (cupoMaximo !== null) {
      const variantes = obtenerVariantesTipoBeca(tipoBecaOficial);
      const placeholders = variantes.map(() => '?').join(', ');

      // 2A. TOPE ANUAL DE 10 NUEVOS INGRESOS EN BECA SOCIAL APRENDIZAJE (Art. 6, Par. 2°)
      if (tipoBecaOficial === 'BECA SOCIAL APRENDIZAJE' && regla?.cupoAnualNuevos) {
        const [anioRows] = await db.execute<PeriodoAnioRow[]>(
          `SELECT YEAR(fecha_inicio) AS anio FROM periodos_academicos WHERE id = ? LIMIT 1`,
          [Number(periodoId)]
        );
        const anioPeriodo = Number(anioRows[0]?.anio || new Date().getFullYear());

        const [yaTuvoSocialAntes] = await db.execute<CupoTotalRow[]>(
          `
          SELECT COUNT(*) AS total
          FROM solicitudes s
          JOIN periodos_academicos p ON s.periodo_id = p.id
          WHERE s.user_id = ?
            AND LOWER(TRIM(s.tipo_beca)) IN (${placeholders})
            AND s.estatus = 'Aprobada'
            AND YEAR(p.fecha_inicio) < ?
          `,
          [Number(row.user_id), ...variantes, anioPeriodo]
        );

        const esNuevoIngresoAnual = Number(yaTuvoSocialAntes[0]?.total || 0) === 0;

        if (esNuevoIngresoAnual) {
          const [nuevosAnioRows] = await db.execute<CupoTotalRow[]>(
            `
            SELECT COUNT(DISTINCT s.user_id) AS total
            FROM solicitudes s
            JOIN periodos_academicos p ON s.periodo_id = p.id
            WHERE LOWER(TRIM(s.tipo_beca)) IN (${placeholders})
              AND s.estatus IN ('Aprobada', 'Renovacion', 'Renovación')
              AND YEAR(p.fecha_inicio) = ?
              AND s.user_id != ?
              AND NOT EXISTS (
                SELECT 1
                FROM solicitudes s_prev
                JOIN periodos_academicos p_prev ON s_prev.periodo_id = p_prev.id
                WHERE s_prev.user_id = s.user_id
                  AND LOWER(TRIM(s_prev.tipo_beca)) IN (${placeholders})
                  AND s_prev.estatus = 'Aprobada'
                  AND YEAR(p_prev.fecha_inicio) < ?
              )
            `,
            [...variantes, anioPeriodo, Number(row.user_id), ...variantes, anioPeriodo]
          );

          const nuevosEsteAnio = Number(nuevosAnioRows[0]?.total || 0);
          if (nuevosEsteAnio >= regla.cupoAnualNuevos) {
            return {
              apto: false,
              codigo: 'CUPO_EXCEDIDO',
              mensaje: `Cupos llenos : Ya existen ${nuevosEsteAnio} de ${regla.cupoAnualNuevos} nuevas Becas Sociales Aprendizaje otorgadas en ${anioPeriodo}. No es posible aprobar más ingresos en esta modalidad.`,
              detalles: {
                actual: nuevosEsteAnio,
                maximo: regla.cupoAnualNuevos,
                indiceRequerido: indiceMinimo,
                indiceActual: indiceEvaluado,
              },
            };
          }
        }
      }

      // 2B. CONTEO DE CUPOS ACTIVOS EN EL PERIODO VIGENTE
      let countQuery = `
        SELECT COUNT(*) AS total 
        FROM solicitudes s
        JOIN students st ON s.user_id = st.id
        WHERE s.periodo_id = ? 
          AND LOWER(TRIM(s.tipo_beca)) IN (${placeholders})
          AND s.estatus IN ('Aprobada', 'Renovacion', 'Renovación')
          AND s.id != ?
      `;

      const params: Array<string | number> = [
        Number(periodoId),
        ...variantes,
        Number(solicitudId),
      ];

      if (tipoBecaOficial === 'BECA A LA EXCELENCIA ACADÉMICA') {
        countQuery += ` AND UPPER(TRIM(st.carrera)) = ?`;
        params.push(carreraDB);
      }

      const [rows] = await db.execute<CupoTotalRow[]>(countQuery, params);
      const cupoOcupado = Number(rows[0]?.total || 0);

      if (cupoOcupado >= cupoMaximo) {
        return {
          apto: false,
          codigo: 'CUPO_EXCEDIDO',
          mensaje: `Cupos llenos en el periodo actual: Ya existen ${cupoOcupado} de ${cupoMaximo} beneficio(s) aprobado(s) para ${tipoBecaOficial}${
            tipoBecaOficial === 'BECA A LA EXCELENCIA ACADÉMICA' ? ' en esta carrera' : ''
          }. No se permiten nuevas aprobaciones.`,
          detalles: {
            actual: cupoOcupado,
            maximo: cupoMaximo,
            indiceRequerido: indiceMinimo,
            indiceActual: indiceEvaluado,
          },
        };
      }
    }

    // 3. VALIDACIÓN DE TRIMESTRE MÍNIMO (ej. Art. 8: desde 4° trimestre)
    if (trimestreReal < trimestreMinimo) {
      return {
        apto: false,
        codigo: 'TRIMESTRE_INSUFICIENTE',
        mensaje: `La modalidad ${tipoBecaOficial} exige cursar a partir del ${trimestreMinimo}° trimestre. El estudiante cursa el trimestre ${trimestreReal}.`,
      };
    }

    // 4. VALIDACIÓN DE ÍNDICE MÍNIMO (1er trimestre sin notas previas no se bloquea por 0.00)
    const esNuevoIngresoSinNotas = trimestreReal <= 1 && indiceEvaluado === 0;
    if (!esNuevoIngresoSinNotas && indiceEvaluado < indiceMinimo) {
      return {
        apto: false,
        codigo: 'INDICE_INSUFICIENTE',
        mensaje: `El ${
          regla?.usaIndiceAcumulado ? "Índice Global Acumulado" : "Promedio del Trimestre Anterior"
        } (${indiceEvaluado.toFixed(
          2
        )}) es insuficiente para ${tipoBecaOficial}. Mínimo exigido por normativa: ${indiceMinimo.toFixed(2)}.`,
        detalles: {
          actual: 0,
          maximo: cupoMaximo ?? 0,
          indiceRequerido: indiceMinimo,
          indiceActual: indiceEvaluado,
        },
      };
    }

    return {
      apto: true,
      codigo: 'OK',
      mensaje:
        cupoMaximo === null
          ? `Cumple el promedio trimestral mínimo reglamentario (${indiceMinimo.toFixed(2)}) para ${tipoBecaOficial}.`
          : "Cumple con los requisitos de la normativa y hay cupo disponible.",
    };
  } catch (error) {
    console.error("❌ Error en validador de becas:", error);
    return { apto: false, codigo: 'ERROR', mensaje: "Error interno al verificar el reglamento." };
  }
}

export async function actualizarEstadoSolicitud(
  solicitudId: number,
  nuevoEstatus: string,
  observaciones: string,
  departamentoAsignado?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const debeGuardarDept = ['Aprobada', 'En Revisión'].includes(nuevoEstatus);
    const deptAGuardar = debeGuardarDept ? (departamentoAsignado || null) : null;

    await connection.execute<ResultSetHeader>(
      `UPDATE solicitudes 
       SET estatus = ?, 
           observaciones_admin = ?, 
           departamento_asignado = ?, 
           fecha_decision = CASE WHEN ? IN ('Aprobada', 'Rechazada') THEN NOW() ELSE fecha_decision END,
           fecha_revision = CASE WHEN ? = 'En Revisión' THEN NOW() ELSE fecha_revision END
       WHERE id = ?`,
      [nuevoEstatus, observaciones, deptAGuardar, nuevoEstatus, nuevoEstatus, Number(solicitudId)]
    );

    if (nuevoEstatus === 'Rechazada') {
      const [solRows] = await connection.execute<SolicitudUserIdRow[]>(
        'SELECT user_id FROM solicitudes WHERE id = ? LIMIT 1',
        [Number(solicitudId)]
      );
      if (solRows.length > 0) {
        await connection.execute<ResultSetHeader>(
          'UPDATE students SET beca_perdida = 1 WHERE id = ?',
          [solRows[0].user_id]
        );
      }
    }

    await connection.commit();
    return { success: true, message: "Estatus y departamento actualizados exitosamente." };
  } catch (error: unknown) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : "Error al actualizar estatus.";
    console.error("❌ Error al actualizar el estatus de la solicitud:", error);
    return { success: false, error: message };
  } finally {
    connection.release();
  }
}