import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mysql://root:QyFRfPxRNHyslPyWaHhiMTSAaMErDwHn@hopper.proxy.rlwy.net:38539/railway', 
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};

// Singleton para Next.js
const globalForDb = global as unknown as { pool: mysql.Pool };

export const db = globalForDb.pool || mysql.createPool(dbConfig);

if (process.env.NODE_ENV !== 'production') globalForDb.pool = db;