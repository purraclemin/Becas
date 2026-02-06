-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS unimar_becas;
USE unimar_becas;

-- 2. Tabla de Usuarios (Credenciales)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('estudiante', 'admin') DEFAULT 'estudiante',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Estudiantes (Datos de tu formulario de registro)
-- Incluye los campos: nombre, apellido, cedula, telefono, carrera y semestre
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla de Becas (Tipos de beneficios mostrados en tu sección de becas)
-- Incluye: Académica, Socioeconómica, Deportiva y Excelencia
CREATE TABLE scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cobertura_maxima INT NOT NULL
);

-- 5. Tabla de Solicitudes (Vincula al estudiante con la beca)
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    status ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
);

-- Insertar las becas iniciales
INSERT INTO scholarships (nombre, descripcion, cobertura_maxima) VALUES
('Beca Academica', 'Para promedios superiores a 16 puntos', 50),
('Beca Socioeconomica', 'Basado en estudio socioeconomico', 70),
('Beca Deportiva', 'Para atletas universitarios', 40),
('Beca a la Excelencia', 'Mejores promedios por carrera', 100);