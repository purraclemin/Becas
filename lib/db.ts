import mysql from 'mysql2/promise';

// Intentar usar el link de Railway primero; si no existe, usa localhost
const connectionString = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/unimar_becas';

// Singleton para evitar múltiples conexiones en desarrollo (Next.js)
const globalForDb = global as unknown as { pool: mysql.Pool };

export const db = 
  globalForDb.pool || 
  mysql.createPool(connectionString); // 'mysql2' acepta el link directamente

if (process.env.NODE_ENV !== 'production') globalForDb.pool = db;
