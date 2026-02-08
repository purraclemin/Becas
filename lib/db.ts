import mysql from 'mysql2/promise';

// 1. Definimos la conexión usando la variable de entorno de Vercel o el localhost
const connectionString = process.env.DATABASE_URL || 'mysql://root:UWlGmfQzAfFjBnqoFXjfKFpmgTlOHnwA@mainline.proxy.rlwy.net:18980/unimar_becas';

const poolConfig = {
  uri: connectionString, // Usamos 'uri' para que acepte la URL completa de Railway
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  // Railway requiere SSL para conexiones seguras
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined 
};

const globalForDb = global as unknown as { pool: mysql.Pool };

// 2. Creamos el pool usando la configuración dinámica
export const db = globalForDb.pool || mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') globalForDb.pool = db;
