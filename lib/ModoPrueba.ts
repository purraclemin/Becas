'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { revalidatePath } from 'next/cache'

interface SistemaConfigRow extends RowDataPacket {
  clave: string;
  valor_int: number | null;
  valor_txt: string | null;
}

/**
 * Consulta el estado actual del modo prueba
 */
export async function getModoPruebaStatus(): Promise<{
  activo: boolean;
  mesSimulado: string | null;
}> {
  try {
    const [rows] = await db.execute<SistemaConfigRow[]>(
      'SELECT clave, valor_int, valor_txt FROM sistema_config'
    );

    const bypass = rows.find((r) => r.clave === 'bypass_reglas')?.valor_int === 1;
    const mes = rows.find((r) => r.clave === 'mes_simulado')?.valor_txt ?? null;

    return { activo: bypass, mesSimulado: mes };
  } catch {
    return { activo: false, mesSimulado: null };
  }
}

/**
 * Activa o desactiva las reglas y el mes simulado, y dispara automáticamente
 * la transición académica de todos los becados al nuevo periodo detectado.
 */
export async function toggleModoPrueba(
  activar: boolean,
  mes?: string
): Promise<{ success: boolean }> {
  try {
    // 1. Actualizar el bypass (0 o 1)
    await db.execute<ResultSetHeader>(
      'UPDATE sistema_config SET valor_int = ? WHERE clave = "bypass_reglas"',
      [activar ? 1 : 0]
    );

    // 2. Actualizar el mes (o limpiar si no se envía)
    await db.execute<ResultSetHeader>(
      'UPDATE sistema_config SET valor_txt = ? WHERE clave = "mes_simulado"',
      [mes || null]
    );

    // 3. Evaluar y sincronizar transición automática del nuevo periodo (sin dependencia circular)
    try {
      const { obtenerOCrearPeriodoObjetivo } = await import('./SolicitudAcademic');
      const { procesarTransicionMasivaDePeriodo } = await import('./ActionsRenovacion');
      const periodoId = Number(await obtenerOCrearPeriodoObjetivo());
      if (periodoId > 0) {
        await procesarTransicionMasivaDePeriodo(periodoId);
      }
    } catch (transicionErr) {
      console.error("⚠️ Advertencia ejecutando transición de periodo en ModoPrueba:", transicionErr);
    }

    // 4. Revalidación total
    revalidatePath('/', 'layout');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/validarBeca');
    revalidatePath('/perfil');

    return { success: true };
  } catch (error) {
    console.error("Error al cambiar modo prueba:", error);
    return { success: false };
  }
}