import mysql from 'mysql2/promise';

// Configuración adaptativa: Lee las variables de Vercel en producción o usa XAMPP en local
const dbConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unimar_becas',
  port: process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : (process.env.NODE_ENV === 'production' ? 4000 : 3306),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 🔒 SSL Obligatorio: Se activa solo en producción (Vercel) para conectar con TiDB Cloud
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
};

const globalForDb = global as unknown as { pool: mysql.Pool };

export const db = globalForDb.pool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = db;
}

/**
 * Función auxiliar para ejecutar consultas asegurando
 * que no haya desfase de caché en el Pool (Cero any)
 */
export async function queryFresh<T extends mysql.RowDataPacket[]>(
  sql: string,
  params?: ReadonlyArray<string | number | boolean | null>
): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    const [rows] = await connection.execute<T>(sql, params ? [...params] : undefined);
    return rows;
  } finally {
    connection.release();
  }
}