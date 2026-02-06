// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',      // En XAMPP siempre es root
  password: '',      // En XAMPP siempre es vacío
  database: 'unimar_becas', // Asegúrate de que se llame exactamente así en phpMyAdmin
  port: 3306,
});