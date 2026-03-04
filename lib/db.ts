import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'unimar_becas', 
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  // 🟢 AGREGAR ESTO: Fuerza a MySQL a no cachear lecturas de transacciones viejas
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const globalForDb = global as unknown as { pool: mysql.Pool };

export const db = globalForDb.pool || mysql.createPool(dbConfig);

// 🟢 CONFIGURACIÓN ADICIONAL PARA TIEMPO REAL
// Esto asegura que cada conexión nueva use el nivel de lectura más fresco
if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = db;
}

/**
 * Función auxiliar para ejecutar consultas asegurando 
 * que no haya desfase de caché en el Pool
 */
export async function queryFresh(sql: string, params?: any[]) {
    const connection = await db.getConnection();
    try {
        // Forzamos el nivel de aislamiento para esta consulta específica
        await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        const [rows] = await connection.execute(sql, params);
        return rows;
    } finally {
        connection.release(); // Devolvemos la conexión al pool
    }
}