-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-10-2026 a las 07:48:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `unimar_becas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carreras`
--

CREATE TABLE `carreras` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carreras`
--

INSERT INTO `carreras` (`id`, `nombre`) VALUES
(5, 'Administración'),
(3, 'Artes mención Diseño Gráfico'),
(6, 'Contaduría Pública'),
(7, 'Derecho'),
(4, 'Idiomas Modernos'),
(1, 'Ingeniería de Sistemas'),
(2, 'Ingeniería Industrial'),
(8, 'Psicología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `codigo` varchar(6) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `email`, `codigo`, `verified`, `expires_at`, `created_at`) VALUES
(2, 'rgomez.2841@unimar.edu.ve', '703186', 0, '2026-10-16 02:41:38', '2026-10-16 01:13:11'),
(5, '1485@unimar.edu.ve', '609265', 0, '2026-10-16 02:07:27', '2026-10-16 01:52:27'),
(6, 'rr3r@unimar.edu.ve', '995338', 0, '2026-10-16 02:39:57', '2026-10-16 02:24:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudios_socioeconomicos`
--

CREATE TABLE `estudios_socioeconomicos` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `tipo` enum('estudiante','administrador') DEFAULT 'estudiante',
  `evaluador_id` int(11) DEFAULT NULL,
  `socio_lugar_nac` varchar(100) DEFAULT NULL,
  `socio_nacionalidad` varchar(50) DEFAULT NULL,
  `socio_estado_civil` varchar(50) DEFAULT NULL,
  `socio_telf_hab` varchar(20) DEFAULT NULL,
  `direccion_completa` text DEFAULT NULL,
  `socio_trabajo_empresa` varchar(100) DEFAULT NULL,
  `socio_trabajo_cargo` varchar(100) DEFAULT NULL,
  `monto_ingreso_sueldo` decimal(10,2) DEFAULT NULL,
  `monto_ingreso_extra` decimal(10,2) DEFAULT 0.00,
  `monto_ingreso_pension` decimal(10,2) DEFAULT 0.00,
  `monto_ingreso_ayuda` decimal(10,2) DEFAULT 0.00,
  `monto_ingreso_familiar` decimal(10,2) DEFAULT 0.00,
  `socio_ue_procedencia` varchar(150) DEFAULT NULL,
  `socio_otros_estudios` varchar(255) DEFAULT NULL,
  `socio_fecha_unimar` date DEFAULT NULL,
  `socio_modalidad` char(1) DEFAULT NULL,
  `padre_nombre` varchar(150) DEFAULT NULL,
  `padre_edad` int(11) DEFAULT NULL,
  `padre_ocupacion` varchar(100) DEFAULT NULL,
  `padre_trabajo` varchar(150) DEFAULT NULL,
  `madre_nombre` varchar(150) DEFAULT NULL,
  `madre_edad` int(11) DEFAULT NULL,
  `madre_ocupacion` varchar(100) DEFAULT NULL,
  `madre_trabajo` varchar(150) DEFAULT NULL,
  `rango_ingreso_familiar` varchar(50) DEFAULT NULL,
  `vivienda_tipo` varchar(50) DEFAULT NULL,
  `vivienda_estatus` varchar(50) DEFAULT NULL,
  `serv_internet` varchar(10) DEFAULT 'off',
  `familia_num_hermanos` int(11) DEFAULT NULL,
  `familia_hermanos_uni` int(11) DEFAULT NULL,
  `monto_egreso_mercado` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_vivienda` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_salud` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_servicios` decimal(10,2) DEFAULT 0.00,
  `situacion_laboral_jefe` varchar(50) DEFAULT NULL,
  `salud_condicion_especial` varchar(10) DEFAULT NULL,
  `serv_agua` varchar(5) DEFAULT 'off',
  `serv_gas` varchar(5) DEFAULT 'off',
  `serv_aseo` varchar(5) DEFAULT 'off',
  `equip_lavadora` varchar(5) DEFAULT 'off',
  `equip_nevera` varchar(5) DEFAULT 'off',
  `serv_luz` varchar(10) DEFAULT 'off',
  `equip_cable` varchar(5) DEFAULT 'off',
  `salud_enfermedad_desc` text DEFAULT NULL,
  `salud_tratamiento` text DEFAULT NULL,
  `familia_relacion` varchar(50) DEFAULT NULL,
  `puntaje` int(11) NOT NULL,
  `nivel_riesgo` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudios_socioeconomicos`
--

INSERT INTO `estudios_socioeconomicos` (`id`, `student_id`, `periodo_id`, `tipo`, `evaluador_id`, `socio_lugar_nac`, `socio_nacionalidad`, `socio_estado_civil`, `socio_telf_hab`, `direccion_completa`, `socio_trabajo_empresa`, `socio_trabajo_cargo`, `monto_ingreso_sueldo`, `monto_ingreso_extra`, `monto_ingreso_pension`, `monto_ingreso_ayuda`, `monto_ingreso_familiar`, `socio_ue_procedencia`, `socio_otros_estudios`, `socio_fecha_unimar`, `socio_modalidad`, `padre_nombre`, `padre_edad`, `padre_ocupacion`, `padre_trabajo`, `madre_nombre`, `madre_edad`, `madre_ocupacion`, `madre_trabajo`, `rango_ingreso_familiar`, `vivienda_tipo`, `vivienda_estatus`, `serv_internet`, `familia_num_hermanos`, `familia_hermanos_uni`, `monto_egreso_mercado`, `monto_egreso_vivienda`, `monto_egreso_salud`, `monto_egreso_servicios`, `situacion_laboral_jefe`, `salud_condicion_especial`, `serv_agua`, `serv_gas`, `serv_aseo`, `equip_lavadora`, `equip_nevera`, `serv_luz`, `equip_cable`, `salud_enfermedad_desc`, `salud_tratamiento`, `familia_relacion`, `puntaje`, `nivel_riesgo`, `created_at`) VALUES
(237, 10, 3, 'estudiante', NULL, 'qq', 'Venezolano/a', 'Soltero/a', '11', '1q1q1q1', '1qq', 'q', 1110.00, 11.00, 1.00, 11.00, 11.00, '1q1q1', '1q1q1', '0011-11-11', 'S', 'qq', 11, 'q', 'q', 'qq', 1, 'q', 'qq', '2', 'Apartamento', 'Residencia', 'on', 11, 11, 1.00, 11.00, 1.00, 111.00, 'Si', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'NO', 'NO', 'Regular', 17, 'Bajo', '2026-09-03 01:27:16'),
(540, 10, 3, 'administrador', 1, 'qq', 'Venezolano/a', 'Soltero/a', '11', '1q1q1q1', '1qq', 'q', 1110.00, 11.00, 1.00, 11.00, 11.00, '1q1q1', '1q1q1', '1911-11-11', 'S', 'qq', 11, 'q', 'q', 'qq', 1, 'q', 'qq', '2', 'Apartamento', 'Residencia', 'on', 11, 11, 1.00, 11.00, 1.00, 111.00, 'Si', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'NO', 'NO', 'Regular', 22, 'Bajo', '2026-09-05 07:20:11'),
(652, 951, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(653, 952, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(654, 953, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(655, 954, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(656, 955, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(657, 956, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(658, 957, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(659, 958, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(660, 959, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(661, 960, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(662, 961, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(663, 962, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(664, 963, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(665, 964, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(666, 965, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(667, 966, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(668, 967, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(669, 968, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(670, 969, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(671, 970, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(672, 971, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(673, 972, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(674, 973, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(675, 974, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(676, 975, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(677, 976, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(678, 977, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(679, 978, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(680, 979, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(681, 980, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(682, 981, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(683, 982, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(684, 983, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(685, 984, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(686, 985, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(687, 986, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(688, 987, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(689, 988, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(690, 989, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(691, 990, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(692, 991, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(693, 992, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(694, 993, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(695, 994, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(696, 995, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(697, 996, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(698, 997, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(699, 998, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(700, 999, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(701, 1000, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(702, 1001, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(703, 1002, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(704, 1003, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(705, 1004, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(706, 1005, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(707, 1006, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(708, 1007, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(709, 1008, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(710, 1009, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(711, 1010, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(712, 1011, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(713, 1012, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(714, 1013, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(715, 1014, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(716, 1015, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(717, 1016, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(718, 1017, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(719, 1018, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(720, 1019, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(721, 1020, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(722, 1021, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(723, 1022, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(724, 1023, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(725, 1024, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(726, 1025, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(727, 1026, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(728, 1027, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(729, 1028, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(730, 1029, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(731, 1030, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(732, 1031, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(733, 1032, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(734, 1033, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(735, 1034, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(736, 1035, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(737, 1036, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(738, 1037, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(739, 1038, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(740, 1039, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32');
INSERT INTO `estudios_socioeconomicos` (`id`, `student_id`, `periodo_id`, `tipo`, `evaluador_id`, `socio_lugar_nac`, `socio_nacionalidad`, `socio_estado_civil`, `socio_telf_hab`, `direccion_completa`, `socio_trabajo_empresa`, `socio_trabajo_cargo`, `monto_ingreso_sueldo`, `monto_ingreso_extra`, `monto_ingreso_pension`, `monto_ingreso_ayuda`, `monto_ingreso_familiar`, `socio_ue_procedencia`, `socio_otros_estudios`, `socio_fecha_unimar`, `socio_modalidad`, `padre_nombre`, `padre_edad`, `padre_ocupacion`, `padre_trabajo`, `madre_nombre`, `madre_edad`, `madre_ocupacion`, `madre_trabajo`, `rango_ingreso_familiar`, `vivienda_tipo`, `vivienda_estatus`, `serv_internet`, `familia_num_hermanos`, `familia_hermanos_uni`, `monto_egreso_mercado`, `monto_egreso_vivienda`, `monto_egreso_salud`, `monto_egreso_servicios`, `situacion_laboral_jefe`, `salud_condicion_especial`, `serv_agua`, `serv_gas`, `serv_aseo`, `equip_lavadora`, `equip_nevera`, `serv_luz`, `equip_cable`, `salud_enfermedad_desc`, `salud_tratamiento`, `familia_relacion`, `puntaje`, `nivel_riesgo`, `created_at`) VALUES
(741, 1040, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(742, 1041, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(743, 1042, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(744, 1043, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(745, 1044, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(746, 1045, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(747, 1046, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(748, 1047, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(749, 1048, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(750, 1049, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(751, 1050, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-10-16 02:35:32'),
(753, 1017, 3, 'administrador', 1, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'No', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 10, 'Bajo', '2026-10-16 02:36:33'),
(757, 1005, 3, 'administrador', 1, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Si', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 0, 'Bajo', '2026-10-16 02:47:31'),
(758, 1042, 3, 'administrador', 1, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 0, 'Bajo', '2026-10-16 05:05:30'),
(759, 1051, 3, 'estudiante', NULL, 'fgfgf', 'Venezolano/a', 'Casado/a', '33', 'fdfdfd', 'NO', 'NO', 0.00, 111.00, 111.00, 1111.00, 1111.00, 'dddddddddd', 'ddddddddddddddd', '2026-02-16', 'S', 'ddddddddddd', 2, 'ddddddddd', 'ddddddddddddd', 'ddddddddddddddddddd', 2, 'dddddddddd', 'ddddddddddddddd', '2', 'Casa', 'Residencia', 'off', 1, 1, 111.00, 111.00, 111.00, 1111.00, 'No', 'No', 'off', 'off', 'off', 'on', 'off', 'on', 'off', 'NO', 'NO', 'Buena', 29, 'Medio', '2026-10-16 05:16:06'),
(760, 1051, 3, 'administrador', 1, 'fgfgf', 'Venezolano/a', 'Casado/a', '33', 'fdfdfd', 'NO', 'NO', 0.00, 111.00, 111.00, 1111.00, 1111.00, 'dddddddddd', 'ddddddddddddddd', '2026-02-16', 'S', 'ddddddddddd', 2, 'ddddddddd', 'ddddddddddddd', 'ddddddddddddddddddd', 2, 'dddddddddd', 'ddddddddddddddd', '2', 'Casa', 'Residencia', 'off', 1, 1, 111.00, 111.00, 111.00, 1111.00, 'No', 'No', 'off', 'off', 'off', 'on', 'off', 'on', 'off', 'NO', 'NO', 'Buena', 29, 'Medio', '2026-10-16 05:16:59'),
(761, 990, 3, 'administrador', 1, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 0, 'Bajo', '2026-10-16 05:31:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_aprobaciones`
--

CREATE TABLE `historial_aprobaciones` (
  `id` int(11) NOT NULL,
  `solicitud_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periodo_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `promedio_ciclo` decimal(5,2) NOT NULL,
  `trimestre` int(11) NOT NULL,
  `puntaje_baremo_` int(11) NOT NULL,
  `nivel_riesgo` varchar(50) NOT NULL,
  `tipo_beca_snapshot` varchar(100) DEFAULT NULL,
  `estatus_previo` varchar(50) NOT NULL,
  `estatus_nuevo` varchar(50) NOT NULL,
  `observacion_admin` text DEFAULT NULL,
  `materias_snapshot_json` longtext DEFAULT NULL,
  `indice_global_snapshot` decimal(5,2) DEFAULT NULL,
  `fecha_aprobacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `token_verificacion` varchar(255) DEFAULT NULL,
  `ip_accion` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pensum_materias`
--

CREATE TABLE `pensum_materias` (
  `id` int(11) NOT NULL,
  `carrera_id` int(11) NOT NULL,
  `trimestre_ubicacion` int(11) NOT NULL,
  `codigo_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(150) NOT NULL,
  `unidades_credito` int(11) DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pensum_materias`
--

INSERT INTO `pensum_materias` (`id`, `carrera_id`, `trimestre_ubicacion`, `codigo_materia`, `nombre_materia`, `unidades_credito`) VALUES
(1, 1, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(2, 1, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(3, 1, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(4, 1, 1, 'IG0104341', 'INTRODUCCIÓN A LA INGENIERÍA DE SISTEMAS', 3),
(5, 1, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(6, 1, 1, 'ITI0104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(7, 1, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(8, 1, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(9, 1, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(10, 1, 2, 'MAT0205341', 'MATEMÁTICA I', 3),
(11, 1, 2, 'ALD0204341', 'ÁLGEBRA DISCRETA', 3),
(12, 1, 2, 'DIB0203141', 'DIBUJO I', 1),
(13, 1, 2, 'GEA0205341', 'GEOMETRÍA ANALÍTICA', 3),
(14, 1, 2, 'QUG0205341', 'QUÍMICA GENERAL', 3),
(15, 1, 3, 'MAT0305341', 'MATEMÁTICA II', 3),
(16, 1, 3, 'FIS0304341', 'FÍSICA I', 3),
(17, 1, 3, 'INI0304341', 'INGLÉS INSTRUMENTAL I', 3),
(18, 1, 3, 'TEP0304341', 'TÉCNICAS DE PROGRAMACIÓN', 3),
(19, 1, 3, 'LQU0303141', 'LABORATORIO DE QUÍMICA GENERAL', 1),
(20, 1, 4, 'FIS0405341', 'FÍSICA II', 3),
(21, 1, 4, 'MAT0405341', 'MATEMÁTICA III', 3),
(22, 1, 4, 'INI0404341', 'INGLÉS INSTRUMENTAL II', 3),
(23, 1, 4, 'PRO0405341', 'PROGRAMACIÓN I', 3),
(24, 1, 4, 'LAF0403141', 'LABORATORIO DE FÍSICA I', 1),
(25, 1, 5, 'MAT0505341', 'MATEMÁTICA IV', 3),
(26, 1, 5, 'ESD0504341', 'ESTRUCTURA DE DATOS', 3),
(27, 1, 5, 'PRO0505341', 'PROGRAMACIÓN II', 3),
(28, 1, 5, 'CIE0505341', 'CIRCUITOS ELÉCTRICOS', 3),
(29, 1, 5, 'MER0505341', 'MECÁNICA RACIONAL', 3),
(30, 1, 5, 'INI0504341', 'INGLÉS INSTRUMENTAL III', 3),
(31, 1, 6, 'MAT0605341', 'MATEMÁTICA V', 3),
(32, 1, 6, 'ESP0605341', 'ESTADÍSTICA Y PROBABILIDADES', 3),
(33, 1, 6, 'PRO0605341', 'PROGRAMACIÓN III', 3),
(34, 1, 6, 'ELE0606341', 'ELECTRÓNICA', 3),
(35, 1, 6, 'ARC0604341', 'ARQUITECTURA DEL COMPUTADOR', 3),
(36, 1, 7, 'PRO0705341', 'PROGRAMACIÓN IV', 3),
(37, 1, 7, 'SID0705341', 'SISTEMAS DIGITALES', 3),
(38, 1, 7, 'ESA0704341', 'ESTADÍSTICA APLICADA', 3),
(39, 1, 8, 'INV0804341', 'INVESTIGACIÓN DE OPERACIONES', 3),
(40, 1, 8, 'SIS0805341', 'SISTEMAS DE INFORMACIÓN', 3),
(41, 1, 8, 'RED0805341', 'REDES DE DATOS I', 3),
(42, 1, 9, 'SIO0904341', 'SISTEMAS OPERATIVOS', 3),
(43, 1, 9, 'SIG0905341', 'SISTEMAS DE INFORMACIÓN GERENCIAL', 3),
(44, 1, 9, 'SIC0905341', 'SISTEMAS DE CONTROLES', 3),
(45, 1, 9, 'MEI0904341', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(46, 1, 9, 'INE0904341', 'INGENIERÍA ECONÓMICA', 3),
(47, 1, 10, 'HEG1004341', 'HERRAMIENTAS GERENCIALES', 3),
(48, 1, 10, 'SIS1004341', 'SISTEMAS DE SEÑALES', 3),
(49, 1, 10, 'RED1005341', 'REDES DE DATOS II', 3),
(50, 1, 10, 'SMI1004341', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(51, 1, 10, 'MDS1004241', 'METODOLOGÍA DE DESARROLLO DE SOFTWARE', 2),
(52, 1, 11, 'TRI1106341', 'TRABAJO DE INVESTIGACIÓN I', 3),
(53, 1, 11, 'ECP1104341', 'EVALUACIÓN Y CONTROL DE PROYECTOS', 3),
(54, 1, 11, 'INT1105341', 'INTRODUCCIÓN A LAS TELECOMUNICACIONES', 3),
(55, 1, 11, 'PRP1107441', 'PRÁCTICA PROFESIONAL', 4),
(56, 1, 12, 'TRI1208441', 'TRABAJO DE INVESTIGACIÓN II', 4),
(57, 1, 12, 'AUS1205341', 'AUDITORIA DE SISTEMAS', 3),
(58, 1, 12, 'SIO1204341', 'SIMULACIÓN Y OPTIMIZACIÓN', 3),
(59, 1, 12, 'EDP1203341', 'ÉTICA Y DEONTOLOGÍA PROFESIONAL', 3),
(60, 2, 1, 'CEL0104300', 'COMPRENSIÓN Y EXPRESIÓN LINGÜÍSTICA', 3),
(61, 2, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(62, 2, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(63, 2, 1, 'INI0104300', 'INTRODUCCIÓN A LA INGENIERÍA INDUSTRIAL', 3),
(64, 2, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(65, 2, 1, 'ITI0104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(66, 2, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(67, 2, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(68, 2, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(69, 2, 2, 'MAT0205342', 'MATEMÁTICA I', 3),
(70, 2, 2, 'QUG0205342', 'QUÍMICA GENERAL I', 3),
(71, 2, 2, 'DIB0203142', 'DIBUJO I', 1),
(72, 2, 2, 'GEA0205342', 'GEOMETRÍA ANALÍTICA', 3),
(73, 2, 3, 'MAT0305342', 'MATEMÁTICA II', 3),
(74, 2, 3, 'FIS0304342', 'FÍSICA I', 3),
(75, 2, 3, 'QUG0305342', 'QUÍMICA GENERAL II', 3),
(76, 2, 3, 'DIB0303142', 'DIBUJO II', 1),
(77, 2, 3, 'LQU0303142', 'LABORATORIO DE QUÍMICA GENERAL I', 1),
(78, 2, 3, 'ING0304342', 'INGLÉS I', 3),
(79, 2, 4, 'FIS0405342', 'FÍSICA II', 3),
(80, 2, 4, 'MAT0405342', 'MATEMÁTICA III', 3),
(81, 2, 4, 'ALN0404342', 'ALGEBRA LINEAL', 3),
(82, 2, 4, 'ING0404342', 'INGLÉS II', 3),
(83, 2, 4, 'LAF0403142', 'LABORATORIO DE FÍSICA I', 1),
(84, 2, 5, 'MAT0505342', 'MATEMÁTICA IV', 3),
(85, 2, 5, 'FIS0505342', 'FÍSICA III', 3),
(86, 2, 5, 'MER0505342', 'MECÁNICA RACIONAL I', 3),
(87, 2, 5, 'ING0504342', 'INGLÉS III', 3),
(88, 2, 5, 'LAF0503142', 'LABORATORIO DE FÍSICA II', 1),
(89, 2, 6, 'MER0605342', 'MECÁNICA RACIONAL II', 3),
(90, 2, 6, 'ESP0605342', 'ESTADÍSTICA I', 3),
(91, 2, 6, 'TEI0604342', 'TERMODINÁMICA I', 3),
(92, 2, 6, 'COI0604342', 'COMPUTACIÓN PARA INGENIEROS', 3),
(93, 2, 6, 'REI0605342', 'RESISTENCIA DE MATERIALES I', 3),
(94, 2, 7, 'REI0705342', 'RESISTENCIA DE MATERIALES II', 3),
(95, 2, 7, 'ESP0705342', 'ESTADÍSTICA II', 3),
(96, 2, 7, 'TEI0705342', 'TERMODINÁMICA II', 3),
(97, 2, 7, 'MFL0705342', 'MECÁNICA DE LOS FLUIDOS', 3),
(98, 2, 7, 'PRM0704342', 'PROCESOS DE MANUFACTURA I', 3),
(99, 2, 8, 'INV0804342', 'INVESTIGACIÓN DE OPERACIONES I', 3),
(100, 2, 8, 'PRM0805342', 'PROCESOS DE MANUFACTURA II', 3),
(101, 2, 8, 'IEM0804342', 'INGENIERÍA DE MÉTODOS I', 3),
(102, 2, 8, 'TRC0804342', 'TRANSFERENCIA DE CALOR', 3),
(103, 2, 8, 'ELI0805342', 'ELECTROTECNIA INDUSTRIAL', 3),
(104, 2, 9, 'INV0904342', 'INVESTIGACIÓN DE OPERACIONES II', 3),
(105, 2, 9, 'IEM0905342', 'INGENIERÍA DE MÉTODOS II', 3),
(106, 2, 9, 'CPQ0904342', 'CONTROL DE PRODUCCIÓN Y CALIDAD I', 3),
(107, 2, 9, 'MEI0904342', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(108, 2, 9, 'INE0904342', 'INGENIERÍA ECONÓMICA', 3),
(109, 2, 10, 'CPQ1005342', 'CONTROL DE PRODUCCIÓN Y CALIDAD II', 3),
(110, 2, 10, 'HIG1004342', 'HIGIENE Y SEGURIDAD INDUSTRIAL', 3),
(111, 2, 10, 'SMI1004342', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(112, 2, 10, 'MDS1004342', 'MANTENIMIENTO INDUSTRIAL', 3),
(113, 2, 11, 'TRI1106342', 'TRABAJO DE INVESTIGACIÓN I', 3),
(114, 2, 11, 'PRP1107442', 'PRÁCTICA PROFESIONAL', 4),
(115, 2, 11, 'ADP1104342', 'ADMINISTRACIÓN DE PERSONAL', 3),
(116, 2, 11, 'GPC1104342', 'GERENCIA DE PROYECTOS Y COSTOS', 3),
(117, 2, 12, 'TRI1208442', 'TRABAJO DE INVESTIGACIÓN II', 4),
(118, 2, 12, 'EDP1203342', 'ÉTICA Y DEONTOLOGÍA PROFESIONAL', 3),
(119, 2, 12, 'PLA1204342', 'PLANIFICACIÓN AGROINDUSTRIAL', 3),
(120, 1, 3, 'ESH0302201', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(121, 1, 4, 'ESH0402201', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(122, 1, 6, 'ESH0702201', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(123, 1, 9, 'ELP0904301', 'ELECTIVA PROFESIONAL 1', 3),
(124, 1, 10, 'ELP1004301', 'ELECTIVA PROFESIONAL 2', 3),
(125, 1, 11, 'ELP1104301', 'ELECTIVA PROFESIONAL 3', 3),
(126, 2, 4, 'ESH0402202', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(127, 2, 5, 'ESH0502202', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(128, 2, 10, 'ESH1002202', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(129, 2, 9, 'ELP0904302', 'ELECTIVA PROFESIONAL 1', 3),
(130, 2, 10, 'ELP1004302', 'ELECTIVA PROFESIONAL 2', 3),
(131, 2, 12, 'ELP1204302', 'ELECTIVA PROFESIONAL 3', 3),
(132, 3, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(133, 3, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(134, 3, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(135, 3, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(136, 3, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(137, 3, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(138, 3, 1, 'IAP0103332', 'INTRODUCCIÓN A LAS ARTES PLÁSTICAS', 3),
(139, 3, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(140, 3, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(141, 3, 2, 'HIS0203332', 'HISTORIA DEL ARTE I', 3),
(142, 3, 2, 'DIB0203332', 'DIBUJO ANALÍTICO I', 3),
(143, 3, 2, 'TEF0203332', 'TEORÍA DE LA FORMA', 3),
(144, 3, 2, 'TCO0203332', 'TEORÍA DEL COLOR', 3),
(145, 3, 3, 'ESH0302203', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(146, 3, 3, 'HIS0303332', 'HISTORIA DEL ARTE II', 3),
(147, 3, 3, 'DIB0303332', 'DIBUJO ANALÍTICO II', 3),
(148, 3, 3, 'TIP0303332', 'TIPOGRAFÍA I', 3),
(149, 3, 3, 'DIF0303332', 'DISEÑO FUNDAMENTAL I', 3),
(150, 3, 3, 'IIL0303332', 'ILUSTRACIÓN I', 3),
(151, 3, 4, 'ESH0402203', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(152, 3, 4, 'HIS0403332', 'HISTORIA DEL ARTE III', 3),
(153, 3, 4, 'TIP0403332', 'TIPOGRAFÍA II', 3),
(154, 3, 4, 'DIF0403332', 'DISEÑO FUNDAMENTAL II', 3),
(155, 3, 4, 'IIL0403332', 'ILUSTRACIÓN II', 3),
(156, 3, 4, 'COM0403332', 'COMPUTACIÓN GRÁFICA I', 3),
(157, 3, 5, 'ESH0502203', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(158, 3, 5, 'HDS0503332', 'HISTORIA DEL DISEÑO', 3),
(159, 3, 5, 'DIG0504332', 'DISEÑO GRÁFICO I', 3),
(160, 3, 5, 'FOT0503332', 'FOTOGRAFÍA I', 3),
(161, 3, 5, 'COM0503332', 'COMPUTACIÓN GRÁFICA II', 3),
(162, 3, 5, 'SEM0503332', 'SEMIOLOGÍA', 3),
(163, 3, 6, 'DIG0604332', 'DISEÑO GRÁFICO II', 3),
(164, 3, 6, 'FOT0603332', 'FOTOGRAFÍA II', 3),
(165, 3, 6, 'COM0603332', 'COMPUTACIÓN GRÁFICA III', 3),
(166, 3, 6, 'EST0603332', 'ESTÉTICA', 3),
(167, 3, 6, 'PUP0603332', 'PUBLICIDAD Y PROPAGANDA', 3),
(168, 3, 7, 'DIG0704332', 'DISEÑO GRÁFICO III', 3),
(169, 3, 7, 'TEP0703332', 'TÉCNICAS DE PRE-PRENSA', 3),
(170, 3, 7, 'COM0703332', 'COMPUTACIÓN GRÁFICA IV', 3),
(171, 3, 7, 'MAD0703332', 'MARKETING PARA DISEÑADORES', 3),
(172, 3, 7, 'DEI0703332', 'DISEÑO EDITORIAL I', 3),
(173, 3, 8, 'DIG0804332', 'DISEÑO GRÁFICO IV', 3),
(174, 3, 8, 'DEI0803332', 'DISEÑO EDITORIAL II', 3),
(175, 3, 8, 'DIP0803332', 'DISEÑO PUBLICITARIO I', 3),
(176, 3, 8, 'DIW0803332', 'DISEÑO WEB I', 3),
(177, 3, 8, 'PRO0803332', 'PRODUCCIÓN GRÁFICA', 3),
(178, 3, 9, 'ELP0904303', 'ELECTIVA PROFESIONAL 1', 3),
(179, 3, 9, 'DIP0903332', 'DISEÑO PUBLICITARIO II', 3),
(180, 3, 9, 'DIW0903332', 'DISEÑO WEB II', 3),
(181, 3, 9, 'MEI0904332', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(182, 3, 9, 'ETI0903332', 'ETIQUETA Y ENVASE', 3),
(183, 3, 10, 'ELP1004303', 'ELECTIVA PROFESIONAL 2', 3),
(184, 3, 10, 'SMI1004332', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(185, 3, 10, 'POF1003332', 'PORTAFOLIO', 3),
(186, 3, 10, 'GEP1003332', 'GERENCIA DE PROYECTOS', 3),
(187, 3, 10, 'IIM1003332', 'IDENTIDAD IMAGEN CORPORATIVA', 3),
(188, 3, 11, 'ELP1104303', 'ELECTIVA PROFESIONAL 3', 3),
(189, 3, 11, 'TRI1106332', 'TRABAJO DE INVESTIGACIÓN I', 3),
(190, 3, 11, 'PRP1107432', 'PRÁCTICA PROFESIONAL', 4),
(191, 3, 12, 'TRI1208432', 'TRABAJO DE INVESTIGACIÓN II', 4),
(192, 3, 12, 'EDP1203332', 'ÉTICA Y DEONTOLOGÍA PROFESIONAL', 3),
(193, 3, 12, 'PAS1203332', 'PASANTÍA', 3),
(256, 4, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(257, 4, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(258, 4, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(259, 4, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(260, 4, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(261, 4, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(262, 4, 1, 'IIM0103333', 'INTRODUCCIÓN A LOS IDIOMAS MODERNOS', 3),
(263, 4, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(264, 4, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(265, 4, 2, 'ING0204333', 'INGLÉS I', 3),
(266, 4, 2, 'FRA0204333', 'FRANCÉS I', 3),
(267, 4, 2, 'LIN0204333', 'LINGÜÍSTICA I', 3),
(268, 4, 2, 'CUL0204333', 'CULTURA Y CIVILIZACIÓN I', 3),
(269, 4, 3, 'ESH0302204', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(270, 4, 3, 'ING0304333', 'INGLÉS II', 3),
(271, 4, 3, 'FRA0304333', 'FRANCÉS II', 3),
(272, 4, 3, 'LIN0304333', 'LINGÜÍSTICA II', 3),
(273, 4, 3, 'CUL0304333', 'CULTURA Y CIVILIZACIÓN II', 3),
(274, 4, 3, 'FGE0304333', 'FONÉTICA GENERAL', 3),
(275, 4, 4, 'ESH0402204', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(276, 4, 4, 'ING0404333', 'INGLÉS III', 3),
(277, 4, 4, 'FRA0404333', 'FRANCÉS III', 3),
(278, 4, 4, 'FIN0404333', 'FONÉTICA INGLESA I', 3),
(279, 4, 4, 'FFR0404333', 'FONÉTICA FRANCESA I', 3),
(280, 4, 4, 'MOR0404333', 'MORFOSINTAXIS', 3),
(281, 4, 5, 'ESH0502204', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(282, 4, 5, 'ING0505333', 'INGLÉS IV', 3),
(283, 4, 5, 'FRA0505333', 'FRANCÉS IV', 3),
(284, 4, 5, 'FIN0504333', 'FONÉTICA INGLESA II', 3),
(285, 4, 5, 'FFR0504333', 'FONÉTICA FRANCESA II', 3),
(286, 4, 5, 'SEM0504333', 'SEMÁNTICA', 3),
(287, 4, 6, 'ING0605333', 'INGLÉS V', 3),
(288, 4, 6, 'FRA0605333', 'FRANCÉS V', 3),
(289, 4, 6, 'LIN0604333', 'LINGÜÍSTICA APLICADA', 3),
(290, 4, 6, 'TRD0604333', 'TEORÍA DE LA TRADUCCIÓN', 3),
(291, 4, 6, 'LIT0604333', 'LITERATURA ANGLÓFONA', 3),
(292, 4, 7, 'ING0705333', 'INGLÉS VI', 3),
(293, 4, 7, 'FRA0705333', 'FRANCÉS VI', 3),
(294, 4, 7, 'TRA0704333', 'TRADUCCIÓN I (INGLÉS)', 3),
(295, 4, 7, 'TRB0704333', 'TRADUCCIÓN I (FRANCÉS)', 3),
(296, 4, 7, 'LIT0704333', 'LITERATURA FRANCOFONA', 3),
(297, 4, 8, 'ITA0804333', 'ITALIANO I', 3),
(298, 4, 8, 'TRA0805333', 'TRADUCCIÓN II (INGLÉS)', 3),
(299, 4, 8, 'TRB0805333', 'TRADUCCIÓN II (FRANCÉS)', 3),
(300, 4, 8, 'DIC0804333', 'DICCIÓN Y ORATORIA', 3),
(301, 4, 8, 'MEI0804333', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(302, 4, 9, 'ELP0904304', 'ELECTIVA PROFESIONAL 1', 3),
(303, 4, 9, 'ITA0904333', 'ITALIANO II', 3),
(304, 4, 9, 'TRA0905333', 'TRADUCCIÓN III (INGLÉS)', 3),
(305, 4, 9, 'TRB0905333', 'TRADUCCIÓN III (FRANCÉS)', 3),
(306, 4, 9, 'SMI0904333', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(307, 4, 10, 'ELP1004304', 'ELECTIVA PROFESIONAL 2', 3),
(308, 4, 10, 'ITA1004333', 'ITALIANO III', 3),
(309, 4, 10, 'INT1004333', 'INTERPRETACIÓN I', 3),
(310, 4, 10, 'ETP1004333', 'ÉTICA PROFESIONAL', 3),
(311, 4, 10, 'MGR1004333', 'MODALIDAD DE GRADO (SEMINARIO)', 3),
(312, 4, 11, 'ELP1104304', 'ELECTIVA PROFESIONAL 3', 3),
(313, 4, 11, 'ITA1103233', 'ITALIANO IV', 2),
(314, 4, 11, 'MGP1106333', 'PASANTÍA I / PROYECTO I', 3),
(315, 4, 11, 'INT1104333', 'INTERPRETACIÓN II', 3),
(316, 4, 12, 'TRI1208433', 'TRABAJO DE GRADO / PASANTÍA II', 4),
(317, 4, 12, 'ITA1203233', 'ITALIANO V', 2),
(318, 4, 12, 'RDP1203333', 'REDACCIÓN Y ESTILO', 3),
(319, 5, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(320, 5, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(321, 5, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(322, 5, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(323, 5, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(324, 5, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(325, 5, 1, 'ICA0104311', 'INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES', 3),
(326, 5, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(327, 5, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(328, 5, 2, 'MAT0205311', 'MATEMÁTICA I', 3),
(329, 5, 2, 'CON0205311', 'CONTABILIDAD I', 3),
(330, 5, 2, 'ADM0204311', 'ADMINISTRACIÓN I', 3),
(331, 5, 2, 'SOC0204311', 'SOCIOLOGÍA', 3),
(332, 5, 3, 'ESH0302205', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(333, 5, 3, 'MAT0305311', 'MATEMÁTICA II', 3),
(334, 5, 3, 'CON0305311', 'CONTABILIDAD II', 3),
(335, 5, 3, 'ADM0304311', 'ADMINISTRACIÓN II', 3),
(336, 5, 3, 'DER0304311', 'DERECHO I', 3),
(337, 5, 3, 'MKT0304311', 'MERCADOTECNIA I', 3),
(338, 5, 4, 'ESH0402205', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(339, 5, 4, 'EST0405311', 'ESTADÍSTICA I', 3),
(340, 5, 4, 'CON0405311', 'CONTABILIDAD III', 3),
(341, 5, 4, 'ADM0404311', 'ADMINISTRACIÓN III', 3),
(342, 5, 4, 'DER0404311', 'DERECHO II', 3),
(343, 5, 4, 'MKT0404311', 'MERCADOTECNIA II', 3),
(344, 5, 5, 'ESH0502205', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(345, 5, 5, 'EST0505311', 'ESTADÍSTICA II', 3),
(346, 5, 5, 'ECO0504311', 'ECONOMÍA I', 3),
(347, 5, 5, 'ADM0504311', 'ADMINISTRACIÓN IV', 3),
(348, 5, 5, 'DER0504311', 'DERECHO III', 3),
(349, 5, 5, 'INF0504311', 'INFORMÁTICA', 3),
(350, 5, 6, 'ECO0604311', 'ECONOMÍA II', 3),
(351, 5, 6, 'ADM0604311', 'ADMINISTRACIÓN V', 3),
(352, 5, 6, 'MAT0604311', 'MATEMÁTICA FINANCIERA', 3),
(353, 5, 6, 'DER0604311', 'DERECHO IV', 3),
(354, 5, 6, 'SIS0604311', 'SISTEMAS Y PROCEDIMIENTOS', 3),
(355, 5, 7, 'FIN0704311', 'FINANZAS I', 3),
(356, 5, 7, 'ADM0704311', 'ADMINISTRACIÓN VI', 3),
(357, 5, 7, 'CON0704311', 'CONTABILIDAD DE COSTOS I', 3),
(358, 5, 7, 'DER0704311', 'DERECHO V', 3),
(359, 5, 7, 'MET0704311', 'MÉTODOS CUANTITATIVOS I', 3),
(360, 5, 8, 'FIN0804311', 'FINANZAS II', 3),
(361, 5, 8, 'ADM0804311', 'ADMINISTRACIÓN VII', 3),
(362, 5, 8, 'CON0804311', 'CONTABILIDAD DE COSTOS II', 3),
(363, 5, 8, 'MET0804311', 'MÉTODOS CUANTITATIVOS II', 3),
(364, 5, 8, 'PRE0804311', 'PRESUPUESTO I', 3),
(365, 5, 9, 'ELP0904305', 'ELECTIVA PROFESIONAL 1', 3),
(366, 5, 9, 'FIN0904311', 'FINANZAS III', 3),
(367, 5, 9, 'ADM0904311', 'ADMINISTRACIÓN VIII', 3),
(368, 5, 9, 'MET0904311', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(369, 5, 9, 'PRE0904311', 'PRESUPUESTO II', 3),
(370, 5, 10, 'ELP1004305', 'ELECTIVA PROFESIONAL 2', 3),
(371, 5, 10, 'ADM1004311', 'ADMINISTRACIÓN IX', 3),
(372, 5, 10, 'AUD1004311', 'AUDITORÍA ADMINISTRATIVA I', 3),
(373, 5, 10, 'SMI1004311', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(374, 5, 10, 'ETI1004311', 'ÉTICA PROFESIONAL', 3),
(375, 5, 11, 'ELP1104305', 'ELECTIVA PROFESIONAL 3', 3),
(376, 5, 11, 'TRI1106311', 'TRABAJO DE INVESTIGACIÓN I', 3),
(377, 5, 11, 'PRP1107411', 'PRÁCTICA PROFESIONAL', 4),
(378, 5, 11, 'AUD1104311', 'AUDITORÍA ADMINISTRATIVA II', 3),
(379, 5, 12, 'TRI1208411', 'TRABAJO DE INVESTIGACIÓN II', 4),
(380, 5, 12, 'PAS1203311', 'PASANTÍA', 3),
(381, 5, 12, 'DEO1203311', 'DEONTOLOGÍA PROFESIONAL', 3),
(382, 6, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(383, 6, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(384, 6, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(385, 6, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(386, 6, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(387, 6, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(388, 6, 1, 'ICC0104312', 'INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES', 3),
(389, 6, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(390, 6, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(391, 6, 2, 'MAT0205312', 'MATEMÁTICA I', 3),
(392, 6, 2, 'CON0205312', 'CONTABILIDAD I', 3),
(393, 6, 2, 'ADM0204312', 'ADMINISTRACIÓN I', 3),
(394, 6, 2, 'SOC0204312', 'SOCIOLOGÍA', 3),
(395, 6, 3, 'ESH0302206', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(396, 6, 3, 'MAT0305312', 'MATEMÁTICA II', 3),
(397, 6, 3, 'CON0305312', 'CONTABILIDAD II', 3),
(398, 6, 3, 'ADM0304312', 'ADMINISTRACIÓN II', 3),
(399, 6, 3, 'DER0304312', 'DERECHO I', 3),
(400, 6, 3, 'MKT0304312', 'MERCADOTECNIA I', 3),
(401, 6, 4, 'ESH0402206', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(402, 6, 4, 'EST0405312', 'ESTADÍSTICA I', 3),
(403, 6, 4, 'CON0405312', 'CONTABILIDAD III', 3),
(404, 6, 4, 'ADM0404312', 'ADMINISTRACIÓN III', 3),
(405, 6, 4, 'DER0404312', 'DERECHO II', 3),
(406, 6, 4, 'MAT0404312', 'MATEMÁTICA FINANCIERA', 3),
(407, 6, 5, 'ESH0502206', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(408, 6, 5, 'EST0505312', 'ESTADÍSTICA II', 3),
(409, 6, 5, 'CON0505312', 'CONTABILIDAD IV', 3),
(410, 6, 5, 'ECO0504312', 'ECONOMÍA I', 3),
(411, 6, 5, 'DER0504312', 'DERECHO III', 3),
(412, 6, 5, 'INF0504312', 'INFORMÁTICA', 3),
(413, 6, 6, 'CON0605312', 'CONTABILIDAD V', 3),
(414, 6, 6, 'ECO0604312', 'ECONOMÍA II', 3),
(415, 6, 6, 'CON0604312', 'CONTABILIDAD DE COSTOS I', 3),
(416, 6, 6, 'DER0604312', 'DERECHO IV', 3),
(417, 6, 6, 'SIS0604312', 'SISTEMAS Y PROCEDIMIENTOS', 3),
(418, 6, 7, 'CON0705312', 'CONTABILIDAD VI', 3),
(419, 6, 7, 'FIN0704312', 'FINANZAS I', 3),
(420, 6, 7, 'CON0704312', 'CONTABILIDAD DE COSTOS II', 3),
(421, 6, 7, 'DER0704312', 'DERECHO V', 3),
(422, 6, 7, 'MET0704312', 'MÉTODOS CUANTITATIVOS I', 3),
(423, 6, 8, 'CON0805312', 'CONTABILIDAD VII', 3),
(424, 6, 8, 'FIN0804312', 'FINANZAS II', 3),
(425, 6, 8, 'MET0804312', 'MÉTODOS CUANTITATIVOS II', 3),
(426, 6, 8, 'AUD0804312', 'AUDITORÍA I', 3),
(427, 6, 8, 'PRE0804312', 'PRESUPUESTO I', 3),
(428, 6, 9, 'ELP0904306', 'ELECTIVA PROFESIONAL 1', 3),
(429, 6, 9, 'CON0905312', 'CONTABILIDAD VIII', 3),
(430, 6, 9, 'AUD0904312', 'AUDITORÍA II', 3),
(431, 6, 9, 'MEI0904312', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(432, 6, 9, 'PRE0904312', 'PRESUPUESTO II', 3),
(433, 6, 10, 'ELP1004306', 'ELECTIVA PROFESIONAL 2', 3),
(434, 6, 10, 'AUD1004312', 'AUDITORÍA III', 3),
(435, 6, 10, 'SMI1004312', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(436, 6, 10, 'TRI1004312', 'TRIBUTACIÓN I', 3),
(437, 6, 10, 'ETP1004312', 'ÉTICA PROFESIONAL', 3),
(438, 6, 11, 'ELP1104306', 'ELECTIVA PROFESIONAL 3', 3),
(439, 6, 11, 'TRI1106312', 'TRABAJO DE INVESTIGACIÓN I', 3),
(440, 6, 11, 'PRP1107412', 'PRÁCTICA PROFESIONAL', 4),
(441, 6, 11, 'TRI1104312', 'TRIBUTACIÓN II', 3),
(442, 6, 12, 'TRI1208412', 'TRABAJO DE INVESTIGACIÓN II', 4),
(443, 6, 12, 'PAS1203312', 'PASANTÍA', 3),
(444, 6, 12, 'DEO1203312', 'DEONTOLOGÍA PROFESIONAL', 3),
(445, 5, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(446, 5, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(447, 5, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(448, 5, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(449, 5, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(450, 5, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(451, 5, 1, 'ICA0104311', 'INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES', 3),
(452, 5, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(453, 5, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(454, 5, 2, 'MAT0205311', 'MATEMÁTICA I', 3),
(455, 5, 2, 'CON0205311', 'CONTABILIDAD I', 3),
(456, 5, 2, 'ADM0204311', 'ADMINISTRACIÓN I', 3),
(457, 5, 2, 'SOC0204311', 'SOCIOLOGÍA', 3),
(458, 5, 3, 'ESH0302205', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(459, 5, 3, 'MAT0305311', 'MATEMÁTICA II', 3),
(460, 5, 3, 'CON0305311', 'CONTABILIDAD II', 3),
(461, 5, 3, 'ADM0304311', 'ADMINISTRACIÓN II', 3),
(462, 5, 3, 'DER0304311', 'DERECHO I', 3),
(463, 5, 3, 'MKT0304311', 'MERCADOTECNIA I', 3),
(464, 5, 4, 'ESH0402205', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(465, 5, 4, 'EST0405311', 'ESTADÍSTICA I', 3),
(466, 5, 4, 'CON0405311', 'CONTABILIDAD III', 3),
(467, 5, 4, 'ADM0404311', 'ADMINISTRACIÓN III', 3),
(468, 5, 4, 'DER0404311', 'DERECHO II', 3),
(469, 5, 4, 'MKT0404311', 'MERCADOTECNIA II', 3),
(470, 5, 5, 'ESH0502205', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(471, 5, 5, 'EST0505311', 'ESTADÍSTICA II', 3),
(472, 5, 5, 'ECO0504311', 'ECONOMÍA I', 3),
(473, 5, 5, 'ADM0504311', 'ADMINISTRACIÓN IV', 3),
(474, 5, 5, 'DER0504311', 'DERECHO III', 3),
(475, 5, 5, 'INF0504311', 'INFORMÁTICA', 3),
(476, 5, 6, 'ECO0604311', 'ECONOMÍA II', 3),
(477, 5, 6, 'ADM0604311', 'ADMINISTRACIÓN V', 3),
(478, 5, 6, 'MAT0604311', 'MATEMÁTICA FINANCIERA', 3),
(479, 5, 6, 'DER0604311', 'DERECHO IV', 3),
(480, 5, 6, 'SIS0604311', 'SISTEMAS Y PROCEDIMIENTOS', 3),
(481, 5, 7, 'FIN0704311', 'FINANZAS I', 3),
(482, 5, 7, 'ADM0704311', 'ADMINISTRACIÓN VI', 3),
(483, 5, 7, 'CON0704311', 'CONTABILIDAD DE COSTOS I', 3),
(484, 5, 7, 'DER0704311', 'DERECHO V', 3),
(485, 5, 7, 'MET0704311', 'MÉTODOS CUANTITATIVOS I', 3),
(486, 5, 8, 'FIN0804311', 'FINANZAS II', 3),
(487, 5, 8, 'ADM0804311', 'ADMINISTRACIÓN VII', 3),
(488, 5, 8, 'CON0804311', 'CONTABILIDAD DE COSTOS II', 3),
(489, 5, 8, 'MET0804311', 'MÉTODOS CUANTITATIVOS II', 3),
(490, 5, 8, 'PRE0804311', 'PRESUPUESTO I', 3),
(491, 5, 9, 'ELP0904305', 'ELECTIVA PROFESIONAL 1', 3),
(492, 5, 9, 'FIN0904311', 'FINANZAS III', 3),
(493, 5, 9, 'ADM0904311', 'ADMINISTRACIÓN VIII', 3),
(494, 5, 9, 'MET0904311', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(495, 5, 9, 'PRE0904311', 'PRESUPUESTO II', 3),
(496, 5, 10, 'ELP1004305', 'ELECTIVA PROFESIONAL 2', 3),
(497, 5, 10, 'ADM1004311', 'ADMINISTRACIÓN IX', 3),
(498, 5, 10, 'AUD1004311', 'AUDITORÍA ADMINISTRATIVA I', 3),
(499, 5, 10, 'SMI1004311', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(500, 5, 10, 'ETI1004311', 'ÉTICA PROFESIONAL', 3),
(501, 5, 11, 'ELP1104305', 'ELECTIVA PROFESIONAL 3', 3),
(502, 5, 11, 'TRI1106311', 'TRABAJO DE INVESTIGACIÓN I', 3),
(503, 5, 11, 'PRP1107411', 'PRÁCTICA PROFESIONAL', 4),
(504, 5, 11, 'AUD1104311', 'AUDITORÍA ADMINISTRATIVA II', 3),
(505, 5, 12, 'TRI1208411', 'TRABAJO DE INVESTIGACIÓN II', 4),
(506, 5, 12, 'PAS1203311', 'PASANTÍA', 3),
(507, 5, 12, 'DEO1203311', 'DEONTOLOGÍA PROFESIONAL', 3),
(508, 6, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(509, 6, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(510, 6, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(511, 6, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(512, 6, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(513, 6, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(514, 6, 1, 'ICC0104312', 'INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES', 3),
(515, 6, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(516, 6, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(517, 6, 2, 'MAT0205312', 'MATEMÁTICA I', 3),
(518, 6, 2, 'CON0205312', 'CONTABILIDAD I', 3),
(519, 6, 2, 'ADM0204312', 'ADMINISTRACIÓN I', 3),
(520, 6, 2, 'SOC0204312', 'SOCIOLOGÍA', 3),
(521, 6, 3, 'ESH0302206', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(522, 6, 3, 'MAT0305312', 'MATEMÁTICA II', 3),
(523, 6, 3, 'CON0305312', 'CONTABILIDAD II', 3),
(524, 6, 3, 'ADM0304312', 'ADMINISTRACIÓN II', 3),
(525, 6, 3, 'DER0304312', 'DERECHO I', 3),
(526, 6, 3, 'MKT0304312', 'MERCADOTECNIA I', 3),
(527, 6, 4, 'ESH0402206', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(528, 6, 4, 'EST0405312', 'ESTADÍSTICA I', 3),
(529, 6, 4, 'CON0405312', 'CONTABILIDAD III', 3),
(530, 6, 4, 'ADM0404312', 'ADMINISTRACIÓN III', 3),
(531, 6, 4, 'DER0404312', 'DERECHO II', 3),
(532, 6, 4, 'MAT0404312', 'MATEMÁTICA FINANCIERA', 3),
(533, 6, 5, 'ESH0502206', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(534, 6, 5, 'EST0505312', 'ESTADÍSTICA II', 3),
(535, 6, 5, 'CON0505312', 'CONTABILIDAD IV', 3),
(536, 6, 5, 'ECO0504312', 'ECONOMÍA I', 3),
(537, 6, 5, 'DER0504312', 'DERECHO III', 3),
(538, 6, 5, 'INF0504312', 'INFORMÁTICA', 3),
(539, 6, 6, 'CON0605312', 'CONTABILIDAD V', 3),
(540, 6, 6, 'ECO0604312', 'ECONOMÍA II', 3),
(541, 6, 6, 'CON0604312', 'CONTABILIDAD DE COSTOS I', 3),
(542, 6, 6, 'DER0604312', 'DERECHO IV', 3),
(543, 6, 6, 'SIS0604312', 'SISTEMAS Y PROCEDIMIENTOS', 3),
(544, 6, 7, 'CON0705312', 'CONTABILIDAD VI', 3),
(545, 6, 7, 'FIN0704312', 'FINANZAS I', 3),
(546, 6, 7, 'CON0704312', 'CONTABILIDAD DE COSTOS II', 3),
(547, 6, 7, 'DER0704312', 'DERECHO V', 3),
(548, 6, 7, 'MET0704312', 'MÉTODOS CUANTITATIVOS I', 3),
(549, 6, 8, 'CON0805312', 'CONTABILIDAD VII', 3),
(550, 6, 8, 'FIN0804312', 'FINANZAS II', 3),
(551, 6, 8, 'MET0804312', 'MÉTODOS CUANTITATIVOS II', 3),
(552, 6, 8, 'AUD0804312', 'AUDITORÍA I', 3),
(553, 6, 8, 'PRE0804312', 'PRESUPUESTO I', 3),
(554, 6, 9, 'ELP0904306', 'ELECTIVA PROFESIONAL 1', 3),
(555, 6, 9, 'CON0905312', 'CONTABILIDAD VIII', 3),
(556, 6, 9, 'AUD0904312', 'AUDITORÍA II', 3),
(557, 6, 9, 'MEI0904312', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(558, 6, 9, 'PRE0904312', 'PRESUPUESTO II', 3),
(559, 6, 10, 'ELP1004306', 'ELECTIVA PROFESIONAL 2', 3),
(560, 6, 10, 'AUD1004312', 'AUDITORÍA III', 3),
(561, 6, 10, 'SMI1004312', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(562, 6, 10, 'TRI1004312', 'TRIBUTACIÓN I', 3),
(563, 6, 10, 'ETP1004312', 'ÉTICA PROFESIONAL', 3),
(564, 6, 11, 'ELP1104306', 'ELECTIVA PROFESIONAL 3', 3),
(565, 6, 11, 'TRI1106312', 'TRABAJO DE INVESTIGACIÓN I', 3),
(566, 6, 11, 'PRP1107412', 'PRÁCTICA PROFESIONAL', 4),
(567, 6, 11, 'TRI1104312', 'TRIBUTACIÓN II', 3),
(568, 6, 12, 'TRI1208412', 'TRABAJO DE INVESTIGACIÓN II', 4),
(569, 6, 12, 'PAS1203312', 'PASANTÍA', 3),
(570, 6, 12, 'DEO1203312', 'DEONTOLOGÍA PROFESIONAL', 3),
(571, 7, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(572, 7, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(573, 7, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(574, 7, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(575, 7, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(576, 7, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(577, 7, 1, 'HID0104321', 'HISTORIA DEL DERECHO', 3),
(578, 7, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(579, 7, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(580, 7, 2, 'INT0204321', 'INTRODUCCIÓN AL DERECHO', 3),
(581, 7, 2, 'DER0204321', 'DERECHO ROMANO I', 3),
(582, 7, 2, 'FIL0204321', 'FILOSOFÍA DEL DERECHO', 3),
(583, 7, 2, 'DIP0204321', 'DERECHO INDIVIDUAL DEL TRABAJO', 3),
(584, 7, 3, 'ESH0302207', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(585, 7, 3, 'DER0304321', 'DERECHO ROMANO II', 3),
(586, 7, 3, 'CIV0304321', 'DERECHO CIVIL I (PERSONAS)', 3),
(587, 7, 3, 'CON0304321', 'DERECHO CONSTITUCIONAL I', 3),
(588, 7, 3, 'PEN0304321', 'DERECHO PENAL I', 3),
(589, 7, 3, 'DCO0304321', 'DERECHO COLECTIVO DEL TRABAJO', 3),
(590, 7, 4, 'ESH0402207', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(591, 7, 4, 'CIV0404321', 'DERECHO CIVIL II (BIENES)', 3),
(592, 7, 4, 'CON0404321', 'DERECHO CONSTITUCIONAL II', 3),
(593, 7, 4, 'PEN0404321', 'DERECHO PENAL II', 3),
(594, 7, 4, 'TEP0404321', 'TEORÍA GENERAL DEL PROCESO', 3),
(595, 7, 4, 'DEA0404321', 'DERECHO ADMINISTRATIVO I', 3),
(596, 7, 5, 'ESH0502207', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(597, 7, 5, 'CIV0504321', 'DERECHO CIVIL III (OBLIGACIONES I)', 3),
(598, 7, 5, 'PEN0504321', 'DERECHO PENAL III', 3),
(599, 7, 5, 'DPC0504321', 'DERECHO PROCESAL CIVIL I', 3),
(600, 7, 5, 'DEA0504321', 'DERECHO ADMINISTRATIVO II', 3),
(601, 7, 5, 'MED0504321', 'MEDICINA LEGAL', 3),
(602, 7, 6, 'CIV0604321', 'DERECHO CIVIL IV (OBLIGACIONES II)', 3),
(603, 7, 6, 'DPC0604321', 'DERECHO PROCESAL CIVIL II', 3),
(604, 7, 6, 'DEA0604321', 'DERECHO ADMINISTRATIVO III', 3),
(605, 7, 6, 'DPP0604321', 'DERECHO PROCESAL PENAL I', 3),
(606, 7, 6, 'DIT0604321', 'DERECHO INTERNACIONAL PÚBLICO', 3),
(607, 7, 7, 'CIV0704321', 'DERECHO CIVIL V (CONTRATOS)', 3),
(608, 7, 7, 'DPC0704321', 'DERECHO PROCESAL CIVIL III', 3),
(609, 7, 7, 'DPP0704321', 'DERECHO PROCESAL PENAL II', 3),
(610, 7, 7, 'DME0704321', 'DERECHO MERCANTIL I', 3),
(611, 7, 7, 'PRO0704321', 'PRÁCTICA FORENSE I', 3),
(612, 7, 8, 'CIV0804321', 'DERECHO CIVIL VI (GARANTÍAS)', 3),
(613, 7, 8, 'DME0804321', 'DERECHO MERCANTIL II', 3),
(614, 7, 8, 'DPR0804321', 'DERECHO PROCESAL DEL TRABAJO', 3),
(615, 7, 8, 'PRO0804321', 'PRÁCTICA FORENSE II', 3),
(616, 7, 8, 'MEI0804321', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3),
(617, 7, 9, 'ELP0904307', 'ELECTIVA PROFESIONAL 1', 3),
(618, 7, 9, 'CIV0904321', 'DERECHO CIVIL VII (FAMILIA)', 3),
(619, 7, 9, 'DME0904321', 'DERECHO MERCANTIL III', 3),
(620, 7, 9, 'DIP0904321', 'DERECHO INTERNACIONAL PRIVADO', 3),
(621, 7, 9, 'SMI0904321', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(622, 7, 10, 'ELP1004307', 'ELECTIVA PROFESIONAL 2', 3),
(623, 7, 10, 'CIV1004321', 'DERECHO CIVIL VIII (SUCESIONES)', 3),
(624, 7, 10, 'DTB1004321', 'DERECHO TRIBUTARIO', 3),
(625, 7, 10, 'MGR1004321', 'MODALIDAD DE GRADO (SEMINARIO)', 3),
(626, 7, 10, 'ETP1004321', 'ÉTICA PROFESIONAL', 3),
(627, 7, 11, 'ELP1104307', 'ELECTIVA PROFESIONAL 3', 3),
(628, 7, 11, 'TRI1106321', 'TRABAJO DE INVESTIGACIÓN I', 3),
(629, 7, 11, 'PRP1107421', 'PRÁCTICA PROFESIONAL', 4),
(630, 7, 11, 'MAR1104321', 'MÉTODOS ALTERNATIVOS DE RESOLUCIÓN DE CONFLICTOS', 3),
(631, 7, 12, 'TRI1208421', 'TRABAJO DE INVESTIGACIÓN II', 4),
(632, 7, 12, 'DEO1203321', 'DEONTOLOGÍA JURÍDICA', 3),
(633, 7, 12, 'PAS1203321', 'PASANTÍA', 3),
(634, 8, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3),
(635, 8, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3),
(636, 8, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3),
(637, 8, 1, 'INP0103335', 'INTRODUCCIÓN A LA PSICOLOGÍA', 3),
(638, 8, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3),
(639, 8, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3),
(640, 8, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1),
(641, 8, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3),
(642, 8, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3),
(643, 8, 2, 'PSB0204335', 'PSICOBIOLOGÍA', 3),
(644, 8, 2, 'PSE0204335', 'PSICOLOGÍA EVOLUTIVA I', 3),
(645, 8, 2, 'PSL0204335', 'PSICOLOGÍA SOCIAL I', 3),
(646, 8, 2, 'STA0204335', 'SISTEMAS Y TEORÍAS EN PSICOLOGÍA', 3),
(647, 8, 3, 'ESH0302208', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2),
(648, 8, 3, 'NEU0304335', 'NEUROCIENCIAS', 3),
(649, 8, 3, 'PSE0304335', 'PSICOLOGÍA EVOLUTIVA II', 3),
(650, 8, 3, 'PSL0304335', 'PSICOLOGÍA SOCIAL II', 3),
(651, 8, 3, 'PRO0304335', 'PROCESOS PSICOLÓGICOS BÁSICOS I', 3),
(652, 8, 3, 'EST0304335', 'ESTADÍSTICA I', 3),
(653, 8, 4, 'ESH0402208', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2),
(654, 8, 4, 'LNE0403135', 'LABORATORIO DE NEUROCIENCIAS', 1),
(655, 8, 4, 'PSP0404335', 'PSICOLOGÍA DE LA PERSONALIDAD I', 3),
(656, 8, 4, 'PRO0404335', 'PROCESOS PSICOLÓGICOS BÁSICOS II', 3),
(657, 8, 4, 'EST0404335', 'ESTADÍSTICA II', 3),
(658, 8, 4, 'MET0404335', 'METODOLOGÍA DE LA INVESTIGACIÓN I', 3),
(659, 8, 5, 'ESH0502208', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2),
(660, 8, 5, 'PSP0504335', 'PSICOLOGÍA DE LA PERSONALIDAD II', 3),
(661, 8, 5, 'PSF0504335', 'PSICOFISIOLOGÍA', 3),
(662, 8, 5, 'PSI0504335', 'PSICOMETRÍA I', 3),
(663, 8, 5, 'MET0504335', 'METODOLOGÍA DE LA INVESTIGACIÓN II', 3),
(664, 8, 5, 'PSM0504335', 'PSICOLOGÍA DE LA MOTIVACIÓN Y EMOCIÓN', 3),
(665, 8, 6, 'PSF0604335', 'PSICOPATOLOGÍA I', 3),
(666, 8, 6, 'PSI0604335', 'PSICOMETRÍA II', 3),
(667, 8, 6, 'EVA0604335', 'EVALUACIÓN PSICOLÓGICA I', 3),
(668, 8, 6, 'ORI0604335', 'ORIENTACIÓN PSICOLÓGICA', 3),
(669, 8, 6, 'DIN0604335', 'DINÁMICA DE GRUPOS', 3),
(670, 8, 7, 'PSF0704335', 'PSICOPATOLOGÍA II', 3),
(671, 8, 7, 'EVA0704335', 'EVALUACIÓN PSICOLÓGICA II', 3),
(672, 8, 7, 'MOD0704335', 'MODIFICACIÓN DE CONDUCTA', 3),
(673, 8, 7, 'PSI0704335', 'PSICOLOGÍA INSTITUCIONAL', 3),
(674, 8, 7, 'ENT0704335', 'ENTREVISTA PSICOLÓGICA', 3),
(675, 8, 8, 'PSF0804335', 'PSICOLOGÍA FAMILIAR', 3),
(676, 8, 8, 'PCO0804335', 'PSICOLOGÍA COMUNITARIA', 3),
(677, 8, 8, 'PSI0804335', 'PSICOLOGÍA INDUSTRIAL', 3),
(678, 8, 8, 'TEE0804335', 'TÉCNICAS DE EXPLORACIÓN PSICOLÓGICA', 3),
(679, 8, 8, 'PSC0804335', 'PSICOLOGÍA CLÍNICA', 3),
(680, 8, 9, 'ELP0904308', 'ELECTIVA PROFESIONAL 1', 3),
(681, 8, 9, 'MEI0904335', 'METODOLOGÍA DE LA INVESTIGACIÓN III', 3),
(682, 8, 9, 'PCA0904335', 'PSICOLOGÍA DEL APRENDIZAJE', 3),
(683, 8, 9, 'PDI0904335', 'PSICODIAGNÓSTICO', 3),
(684, 8, 9, 'PSI0904335', 'PSICOLOGÍA EXPERIMENTAL', 3),
(685, 8, 10, 'ELP1004308', 'ELECTIVA PROFESIONAL 2', 3),
(686, 8, 10, 'SMI1004335', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3),
(687, 8, 10, 'PPI1007435', 'PRÁCTICA PROFESIONAL INFANTO JUVENIL', 4),
(688, 8, 10, 'DEC1004335', 'DERECHOS HUMANOS Y PSICOLOGÍA', 3),
(689, 8, 10, 'ETP1004335', 'ÉTICA PROFESIONAL', 3),
(690, 8, 11, 'ELP1104308', 'ELECTIVA PROFESIONAL 3', 3),
(691, 8, 11, 'TRI1106335', 'TRABAJO DE INVESTIGACIÓN I', 3),
(692, 8, 11, 'PPA1107435', 'PRÁCTICA PROFESIONAL ADULTO', 4),
(693, 8, 11, 'PSI1104335', 'PSICOTERAPIA', 3),
(694, 8, 12, 'TRI1208435', 'TRABAJO DE INVESTIGACIÓN II', 4),
(695, 8, 12, 'PPC1207435', 'PRÁCTICA PROFESIONAL COMUNITARIA', 4),
(696, 8, 12, 'EDP1203335', 'ÉTICA Y DEONTOLOGÍA PROFESIONAL', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos_academicos`
--

CREATE TABLE `periodos_academicos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `es_actual` tinyint(1) DEFAULT 0,
  `fecha_limite_solicitud` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodos_academicos`
--

INSERT INTO `periodos_academicos` (`id`, `codigo`, `nombre`, `fecha_inicio`, `fecha_fin`, `es_actual`, `fecha_limite_solicitud`) VALUES
(1, '2026-I', 'Periodo I 2026 (Ene-Abr)', '2026-01-01', '2026-04-30', 0, '2026-01-15'),
(2, '2026-II', 'Periodo II 2026 (May-Ago)', '2026-05-01', '2026-08-31', 0, '2026-05-15'),
(3, '2026-III', 'Periodo III 2026 (Sep-Dic)', '2026-09-01', '2026-12-31', 1, '2026-09-15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sistema_config`
--

CREATE TABLE `sistema_config` (
  `clave` varchar(50) NOT NULL,
  `valor_int` int(11) DEFAULT 0,
  `valor_txt` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sistema_config`
--

INSERT INTO `sistema_config` (`clave`, `valor_int`, `valor_txt`) VALUES
('bypass_reglas', 0, NULL),
('mes_simulado', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periodo_id` int(11) DEFAULT NULL,
  `email_institucional` varchar(150) NOT NULL,
  `tipo_beca` varchar(100) NOT NULL,
  `promedio_notas` decimal(4,2) NOT NULL,
  `motivo_solicitud` text DEFAULT NULL,
  `departamento_asignado` varchar(100) DEFAULT NULL,
  `materias_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`materias_json`)),
  `estatus` enum('Pendiente','En Revisión','Revisión Especial','Renovacion','Aprobada','Rechazada') DEFAULT 'Pendiente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto_carnet` varchar(255) DEFAULT NULL,
  `copia_cedula` varchar(255) DEFAULT NULL,
  `constancia_residencia` varchar(255) DEFAULT NULL,
  `declaracion_manutencion` varchar(255) DEFAULT NULL,
  `informe_medico` varchar(255) DEFAULT NULL,
  `partida_nacimiento` varchar(255) DEFAULT NULL,
  `constancia_club` varchar(255) DEFAULT NULL,
  `constancia_notas` varchar(255) DEFAULT NULL,
  `notas_certificadas` varchar(255) DEFAULT NULL,
  `carnet_discapacidad` varchar(255) DEFAULT NULL,
  `documentos_filiacion` varchar(255) DEFAULT NULL,
  `planilla_inscripcion` varchar(255) DEFAULT NULL,
  `fecha_revision` datetime DEFAULT NULL COMMENT 'Fecha cuando pasó a estatus En Revisión',
  `fecha_decision` datetime DEFAULT NULL COMMENT 'Fecha cuando se Aprobó o Rechazó definitivamente',
  `observaciones_admin` text DEFAULT NULL COMMENT 'Notas del administrador sobre la decisión',
  `revisado_por` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ID del usuario administrador que gestionó la solicitud',
  `porcentaje_cobertura` int(11) DEFAULT 100 COMMENT 'Porcentaje de la beca otorgado (ej. 50, 100)',
  `categoria_rechazo` varchar(50) DEFAULT NULL COMMENT 'PROMEDIO_BAJO, INGRESOS_ALTOS, DOCUMENTOS_INCOMPLETOS, etc.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`) VALUES
(664, 10, 3, 'Roy@unimar.edu.ve', 'BECA SOCIAL', 20.00, '111', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"INV0804341\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES\",\"nota\":20},{\"codigo\":\"SIS0805341\",\"nombre\":\"SISTEMAS DE INFORMACIÓN\",\"nota\":20},{\"codigo\":\"RED0805341\",\"nombre\":\"REDES DE DATOS I\",\"nota\":20}],\"fecha_proceso\":\"2026-09-03T01:27:16.452Z\"}', 'En Revisión', '2026-09-03 01:27:16', '/uploads/1788398836468-Gemini_Generated_Image_bh7jk1bh7jk1bh7j.png', '/uploads/1788398836466-Gemini_Generated_Image_bh7jk1bh7jk1bh7j.png', NULL, NULL, '/uploads/1788398836461-Gemini_Generated_Image_bh7jk1bh7jk1bh7j.png', NULL, NULL, NULL, NULL, '/uploads/1788398836463-Gemini_Generated_Image_bh7jk1bh7jk1bh7j.png', NULL, NULL, '2026-09-02 22:06:05', NULL, NULL, NULL, 100, NULL),
(1065, 951, 3, 'test_user1@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 15.02, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":13.41},{\"codigo\":\"ING0404333\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":18.16},{\"codigo\":\"FRA0404333\",\"nombre\":\"FRANCÉS III\",\"creditos\":3,\"nota\":10.1},{\"codigo\":\"FIN0404333\",\"nombre\":\"FONÉTICA INGLESA I\",\"creditos\":3,\"nota\":17.79},{\"codigo\":\"FFR0404333\",\"nombre\":\"FONÉTICA FRANCESA I\",\"creditos\":3,\"nota\":15.65},{\"codigo\":\"MOR0404333\",\"nombre\":\"MORFOSINTAXIS\",\"creditos\":3,\"nota\":15.03}],\"fecha_proceso\":\"2026-10-16T02:35:32.054Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_1.png', '/uploads/mock_cedula_1.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1066, 952, 3, 'test_user2@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 16.22, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":18.68},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":13.58},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":17.95},{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":14.66},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":16.8},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":15.68},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":15.4}],\"fecha_proceso\":\"2026-10-16T02:35:32.063Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_2.png', '/uploads/mock_cedula_2.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_2.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1067, 953, 3, 'test_user3@unimar.edu.ve', 'BECA SOCIAL', 16.16, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":16.37},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":11.14},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":17.69},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":12.81},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":17.14},{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":17.64},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":13.3},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":19.98},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":18.87},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":16.62}],\"fecha_proceso\":\"2026-10-16T02:35:32.067Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_3.png', '/uploads/mock_cedula_3.png', '/uploads/mock_residencia_3.pdf', '/uploads/mock_manutencion_3.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1068, 954, 3, 'test_user4@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 14.22, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"INV0804342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES I\",\"creditos\":3,\"nota\":15.66},{\"codigo\":\"PRM0805342\",\"nombre\":\"PROCESOS DE MANUFACTURA II\",\"creditos\":3,\"nota\":14.03},{\"codigo\":\"IEM0804342\",\"nombre\":\"INGENIERÍA DE MÉTODOS I\",\"creditos\":3,\"nota\":17.35},{\"codigo\":\"TRC0804342\",\"nombre\":\"TRANSFERENCIA DE CALOR\",\"creditos\":3,\"nota\":12.1},{\"codigo\":\"ELI0805342\",\"nombre\":\"ELECTROTECNIA INDUSTRIAL\",\"creditos\":3,\"nota\":11.95}],\"fecha_proceso\":\"2026-10-16T02:35:32.071Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_4.png', '/uploads/mock_cedula_4.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1069, 955, 3, 'test_user5@unimar.edu.ve', 'BECA A LA EXCELENCIA', 14.13, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":14.85},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":10.1},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":18.6},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":11.61},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":15.03},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":16.26},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":15.29},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":10.74},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":14.03},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":14.74}],\"fecha_proceso\":\"2026-10-16T02:35:32.073Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_5.png', '/uploads/mock_cedula_5.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_5.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1070, 956, 3, 'test_user6@unimar.edu.ve', 'BECA SOCIAL', 16.19, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":13.71},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":13.55},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":12.32},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":18.63},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":16.32},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":19.66},{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":15.41},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":18.59},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":18.85},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":17.22},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":14.08},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":15.95}],\"fecha_proceso\":\"2026-10-16T02:35:32.078Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_6.png', '/uploads/mock_cedula_6.png', '/uploads/mock_residencia_6.pdf', '/uploads/mock_manutencion_6.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1071, 957, 3, 'test_user7@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 14.33, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":14.43},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":10.87},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":10.36},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":14.61},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":19.24},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":17.72},{\"codigo\":\"IIM0103333\",\"nombre\":\"INTRODUCCIÓN A LOS IDIOMAS MODERNOS\",\"creditos\":3,\"nota\":13.07}],\"fecha_proceso\":\"2026-10-16T02:35:32.082Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_7.png', '/uploads/mock_cedula_7.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1072, 958, 3, 'test_user8@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.52, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302203\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":17.42},{\"codigo\":\"HIS0303332\",\"nombre\":\"HISTORIA DEL ARTE II\",\"creditos\":3,\"nota\":15.87},{\"codigo\":\"DIB0303332\",\"nombre\":\"DIBUJO ANALÍTICO II\",\"creditos\":3,\"nota\":15.83},{\"codigo\":\"TIP0303332\",\"nombre\":\"TIPOGRAFÍA I\",\"creditos\":3,\"nota\":11.52},{\"codigo\":\"DIF0303332\",\"nombre\":\"DISEÑO FUNDAMENTAL I\",\"creditos\":3,\"nota\":19.18},{\"codigo\":\"IIL0303332\",\"nombre\":\"ILUSTRACIÓN I\",\"creditos\":3,\"nota\":13.3}],\"fecha_proceso\":\"2026-10-16T02:35:32.085Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_8.png', '/uploads/mock_cedula_8.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_8.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1073, 959, 3, 'test_user9@unimar.edu.ve', 'AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES', 14.68, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":19.42},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":12.7},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":15.27},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":13.46},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":18.45},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":17.94},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":11.45},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":12.06},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":12.39},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":14.64},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":13.45},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":14.22},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":13.63},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":16.44}],\"fecha_proceso\":\"2026-10-16T02:35:32.091Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_9.png', '/uploads/mock_cedula_9.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_9.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1074, 960, 3, 'test_user10@unimar.edu.ve', 'BECA SOCIAL', 14.70, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":14.56},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":13.51},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":18.2},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":15.91},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":13.12},{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":17.99},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":11.63},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":15.13},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":14.29},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":12.66}],\"fecha_proceso\":\"2026-10-16T02:35:32.101Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_10.png', '/uploads/mock_cedula_10.png', '/uploads/mock_residencia_10.pdf', '/uploads/mock_manutencion_10.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1075, 961, 3, 'test_user11@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 17.59, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"CIV0804321\",\"nombre\":\"DERECHO CIVIL VI (GARANTÍAS)\",\"creditos\":3,\"nota\":17.51},{\"codigo\":\"DME0804321\",\"nombre\":\"DERECHO MERCANTIL II\",\"creditos\":3,\"nota\":17.99},{\"codigo\":\"DPR0804321\",\"nombre\":\"DERECHO PROCESAL DEL TRABAJO\",\"creditos\":3,\"nota\":19.69},{\"codigo\":\"PRO0804321\",\"nombre\":\"PRÁCTICA FORENSE II\",\"creditos\":3,\"nota\":14.23},{\"codigo\":\"MEI0804321\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":18.55}],\"fecha_proceso\":\"2026-10-16T02:35:32.104Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_11.png', '/uploads/mock_cedula_11.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1076, 962, 3, 'test_user12@unimar.edu.ve', 'BECA A LA EXCELENCIA', 14.39, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"FIN0804311\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":12.87},{\"codigo\":\"ADM0804311\",\"nombre\":\"ADMINISTRACIÓN VII\",\"creditos\":3,\"nota\":14.32},{\"codigo\":\"CON0804311\",\"nombre\":\"CONTABILIDAD DE COSTOS II\",\"creditos\":3,\"nota\":15.75},{\"codigo\":\"MET0804311\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":19.77},{\"codigo\":\"PRE0804311\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":16.49},{\"codigo\":\"FIN0804311\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":15.75},{\"codigo\":\"ADM0804311\",\"nombre\":\"ADMINISTRACIÓN VII\",\"creditos\":3,\"nota\":11.92},{\"codigo\":\"CON0804311\",\"nombre\":\"CONTABILIDAD DE COSTOS II\",\"creditos\":3,\"nota\":11.9},{\"codigo\":\"MET0804311\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":10.11},{\"codigo\":\"PRE0804311\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":15.02}],\"fecha_proceso\":\"2026-10-16T02:35:32.105Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_12.png', '/uploads/mock_cedula_12.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_12.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1077, 963, 3, 'test_user13@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 16.04, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904308\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":18.49},{\"codigo\":\"MEI0904335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN III\",\"creditos\":3,\"nota\":10.02},{\"codigo\":\"PCA0904335\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"creditos\":3,\"nota\":19.93},{\"codigo\":\"PDI0904335\",\"nombre\":\"PSICODIAGNÓSTICO\",\"creditos\":3,\"nota\":18.45},{\"codigo\":\"PSI0904335\",\"nombre\":\"PSICOLOGÍA EXPERIMENTAL\",\"creditos\":3,\"nota\":13.32}],\"fecha_proceso\":\"2026-10-16T02:35:32.106Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_13.png', '/uploads/mock_cedula_13.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1078, 964, 3, 'test_user14@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 18.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004308\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":19.25},{\"codigo\":\"SMI1004335\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":17.91},{\"codigo\":\"PPI1007435\",\"nombre\":\"PRÁCTICA PROFESIONAL INFANTO JUVENIL\",\"creditos\":4,\"nota\":16.28},{\"codigo\":\"DEC1004335\",\"nombre\":\"DERECHOS HUMANOS Y PSICOLOGÍA\",\"creditos\":3,\"nota\":17.36},{\"codigo\":\"ETP1004335\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":19.48}],\"fecha_proceso\":\"2026-10-16T02:35:32.117Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_14.png', '/uploads/mock_cedula_14.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_14.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1079, 965, 3, 'test_user15@unimar.edu.ve', 'BECA APRENDIZAJE', 13.57, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904308\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":11.43},{\"codigo\":\"MEI0904335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN III\",\"creditos\":3,\"nota\":16.84},{\"codigo\":\"PCA0904335\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"creditos\":3,\"nota\":10.75},{\"codigo\":\"PDI0904335\",\"nombre\":\"PSICODIAGNÓSTICO\",\"creditos\":3,\"nota\":15.29},{\"codigo\":\"PSI0904335\",\"nombre\":\"PSICOLOGÍA EXPERIMENTAL\",\"creditos\":3,\"nota\":13.54}],\"fecha_proceso\":\"2026-10-16T02:35:32.119Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_15.png', '/uploads/mock_cedula_15.png', '/uploads/mock_residencia_15.pdf', '/uploads/mock_manutencion_15.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_15.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1080, 966, 3, 'test_user16@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 15.48, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"DIG0704332\",\"nombre\":\"DISEÑO GRÁFICO III\",\"creditos\":3,\"nota\":17.1},{\"codigo\":\"TEP0703332\",\"nombre\":\"TÉCNICAS DE PRE-PRENSA\",\"creditos\":3,\"nota\":17.11},{\"codigo\":\"COM0703332\",\"nombre\":\"COMPUTACIÓN GRÁFICA IV\",\"creditos\":3,\"nota\":16.66},{\"codigo\":\"MAD0703332\",\"nombre\":\"MARKETING PARA DISEÑADORES\",\"creditos\":3,\"nota\":14.38},{\"codigo\":\"DEI0703332\",\"nombre\":\"DISEÑO EDITORIAL I\",\"creditos\":3,\"nota\":12.14}],\"fecha_proceso\":\"2026-10-16T02:35:32.121Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_16.png', '/uploads/mock_cedula_16.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1081, 967, 3, 'test_user17@unimar.edu.ve', 'BECA A LA EXCELENCIA', 13.88, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208441\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.27},{\"codigo\":\"AUS1205341\",\"nombre\":\"AUDITORIA DE SISTEMAS\",\"creditos\":3,\"nota\":13.4},{\"codigo\":\"SIO1204341\",\"nombre\":\"SIMULACIÓN Y OPTIMIZACIÓN\",\"creditos\":3,\"nota\":10.56},{\"codigo\":\"EDP1203341\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.28}],\"fecha_proceso\":\"2026-10-16T02:35:32.122Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_17.png', '/uploads/mock_cedula_17.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_17.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1082, 968, 3, 'test_user18@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 13.85, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004303\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":16.75},{\"codigo\":\"SMI1004332\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":18.12},{\"codigo\":\"POF1003332\",\"nombre\":\"PORTAFOLIO\",\"creditos\":3,\"nota\":10.88},{\"codigo\":\"GEP1003332\",\"nombre\":\"GERENCIA DE PROYECTOS\",\"creditos\":3,\"nota\":11.6},{\"codigo\":\"IIM1003332\",\"nombre\":\"IDENTIDAD IMAGEN CORPORATIVA\",\"creditos\":3,\"nota\":11.9}],\"fecha_proceso\":\"2026-10-16T02:35:32.124Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_18.png', '/uploads/mock_cedula_18.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1083, 969, 3, 'test_user19@unimar.edu.ve', 'BECA SOCIAL', 15.35, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208442\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":19.88},{\"codigo\":\"EDP1203342\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.7},{\"codigo\":\"PLA1204342\",\"nombre\":\"PLANIFICACIÓN AGROINDUSTRIAL\",\"creditos\":3,\"nota\":11.3},{\"codigo\":\"ELP1204302\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":14.52}],\"fecha_proceso\":\"2026-10-16T02:35:32.132Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_19.png', '/uploads/mock_cedula_19.png', '/uploads/mock_residencia_19.pdf', '/uploads/mock_manutencion_19.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1084, 970, 3, 'test_user20@unimar.edu.ve', 'BECA A LA EXCELENCIA', 15.39, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502207\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":18.04},{\"codigo\":\"CIV0504321\",\"nombre\":\"DERECHO CIVIL III (OBLIGACIONES I)\",\"creditos\":3,\"nota\":11.41},{\"codigo\":\"PEN0504321\",\"nombre\":\"DERECHO PENAL III\",\"creditos\":3,\"nota\":13.38},{\"codigo\":\"DPC0504321\",\"nombre\":\"DERECHO PROCESAL CIVIL I\",\"creditos\":3,\"nota\":19.74},{\"codigo\":\"DEA0504321\",\"nombre\":\"DERECHO ADMINISTRATIVO II\",\"creditos\":3,\"nota\":13.36},{\"codigo\":\"MED0504321\",\"nombre\":\"MEDICINA LEGAL\",\"creditos\":3,\"nota\":16.39}],\"fecha_proceso\":\"2026-10-16T02:35:32.135Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_20.png', '/uploads/mock_cedula_20.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_20.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1085, 971, 3, 'test_user21@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 13.91, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":13.38},{\"codigo\":\"EST0505312\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":19.31},{\"codigo\":\"CON0505312\",\"nombre\":\"CONTABILIDAD IV\",\"creditos\":3,\"nota\":12.8},{\"codigo\":\"ECO0504312\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":12.7},{\"codigo\":\"DER0504312\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":11.89},{\"codigo\":\"INF0504312\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":19.43},{\"codigo\":\"ESH0502206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":13.93},{\"codigo\":\"EST0505312\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":10.3},{\"codigo\":\"CON0505312\",\"nombre\":\"CONTABILIDAD IV\",\"creditos\":3,\"nota\":15.05},{\"codigo\":\"ECO0504312\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":12.1},{\"codigo\":\"DER0504312\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":11.4},{\"codigo\":\"INF0504312\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":14.65}],\"fecha_proceso\":\"2026-10-16T02:35:32.136Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_21.png', '/uploads/mock_cedula_21.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1086, 972, 3, 'test_user22@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 17.51, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":13.49},{\"codigo\":\"ING0304333\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":18.79},{\"codigo\":\"FRA0304333\",\"nombre\":\"FRANCÉS II\",\"creditos\":3,\"nota\":19.57},{\"codigo\":\"LIN0304333\",\"nombre\":\"LINGÜÍSTICA II\",\"creditos\":3,\"nota\":19.52},{\"codigo\":\"CUL0304333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN II\",\"creditos\":3,\"nota\":16.28},{\"codigo\":\"FGE0304333\",\"nombre\":\"FONÉTICA GENERAL\",\"creditos\":3,\"nota\":17.4}],\"fecha_proceso\":\"2026-10-16T02:35:32.138Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_22.png', '/uploads/mock_cedula_22.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1087, 973, 3, 'test_user23@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 16.20, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208441\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":15.35},{\"codigo\":\"AUS1205341\",\"nombre\":\"AUDITORIA DE SISTEMAS\",\"creditos\":3,\"nota\":12.47},{\"codigo\":\"SIO1204341\",\"nombre\":\"SIMULACIÓN Y OPTIMIZACIÓN\",\"creditos\":3,\"nota\":18.86},{\"codigo\":\"EDP1203341\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":18.14}],\"fecha_proceso\":\"2026-10-16T02:35:32.139Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_23.png', '/uploads/mock_cedula_23.png', '/uploads/mock_residencia_23.pdf', '/uploads/mock_manutencion_23.pdf', '/uploads/mock_informe_medico_23.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_23.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1088, 974, 3, 'test_user24@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.08, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":19.55},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":14.88},{\"codigo\":\"MAT0205342\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":12.42},{\"codigo\":\"QUG0205342\",\"nombre\":\"QUÍMICA GENERAL I\",\"creditos\":3,\"nota\":14.86},{\"codigo\":\"DIB0203142\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":13.43},{\"codigo\":\"GEA0205342\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":15.36}],\"fecha_proceso\":\"2026-10-16T02:35:32.149Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_24.png', '/uploads/mock_cedula_24.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_24.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1089, 975, 3, 'test_user25@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904306\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":14.76},{\"codigo\":\"CON0905312\",\"nombre\":\"CONTABILIDAD VIII\",\"creditos\":3,\"nota\":10.42},{\"codigo\":\"AUD0904312\",\"nombre\":\"AUDITORÍA II\",\"creditos\":3,\"nota\":17.59},{\"codigo\":\"MEI0904312\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":10.27},{\"codigo\":\"PRE0904312\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":11.28},{\"codigo\":\"ELP0904306\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":17.93},{\"codigo\":\"CON0905312\",\"nombre\":\"CONTABILIDAD VIII\",\"creditos\":3,\"nota\":19.9},{\"codigo\":\"AUD0904312\",\"nombre\":\"AUDITORÍA II\",\"creditos\":3,\"nota\":15.4},{\"codigo\":\"MEI0904312\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":19.21},{\"codigo\":\"PRE0904312\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":13.85}],\"fecha_proceso\":\"2026-10-16T02:35:32.151Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_25.png', '/uploads/mock_cedula_25.png', '/uploads/mock_residencia_25.pdf', '/uploads/mock_manutencion_25.pdf', '/uploads/mock_informe_medico_25.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_25.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1090, 976, 3, 'test_user26@unimar.edu.ve', 'BECA SOCIAL', 14.18, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904303\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":14.2},{\"codigo\":\"DIP0903332\",\"nombre\":\"DISEÑO PUBLICITARIO II\",\"creditos\":3,\"nota\":12.99},{\"codigo\":\"DIW0903332\",\"nombre\":\"DISEÑO WEB II\",\"creditos\":3,\"nota\":14.46},{\"codigo\":\"MEI0904332\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":15.98},{\"codigo\":\"ETI0903332\",\"nombre\":\"ETIQUETA Y ENVASE\",\"creditos\":3,\"nota\":13.28}],\"fecha_proceso\":\"2026-10-16T02:35:32.154Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_26.png', '/uploads/mock_cedula_26.png', '/uploads/mock_residencia_26.pdf', '/uploads/mock_manutencion_26.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1091, 977, 3, 'test_user27@unimar.edu.ve', 'BECA APRENDIZAJE', 16.07, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904307\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":10.61},{\"codigo\":\"CIV0904321\",\"nombre\":\"DERECHO CIVIL VII (FAMILIA)\",\"creditos\":3,\"nota\":18.79},{\"codigo\":\"DME0904321\",\"nombre\":\"DERECHO MERCANTIL III\",\"creditos\":3,\"nota\":14.15},{\"codigo\":\"DIP0904321\",\"nombre\":\"DERECHO INTERNACIONAL PRIVADO\",\"creditos\":3,\"nota\":18.96},{\"codigo\":\"SMI0904321\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":17.84}],\"fecha_proceso\":\"2026-10-16T02:35:32.155Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_27.png', '/uploads/mock_cedula_27.png', '/uploads/mock_residencia_27.pdf', '/uploads/mock_manutencion_27.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_27.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1092, 978, 3, 'test_user28@unimar.edu.ve', 'AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES', 13.05, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208441\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":12.66},{\"codigo\":\"AUS1205341\",\"nombre\":\"AUDITORIA DE SISTEMAS\",\"creditos\":3,\"nota\":16.88},{\"codigo\":\"SIO1204341\",\"nombre\":\"SIMULACIÓN Y OPTIMIZACIÓN\",\"creditos\":3,\"nota\":10.02},{\"codigo\":\"EDP1203341\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":12.63}],\"fecha_proceso\":\"2026-10-16T02:35:32.156Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_28.png', '/uploads/mock_cedula_28.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_28.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1093, 979, 3, 'test_user29@unimar.edu.ve', 'BECA A LA EXCELENCIA', 13.39, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104305\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.63},{\"codigo\":\"TRI1106311\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":15.3},{\"codigo\":\"PRP1107411\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16.26},{\"codigo\":\"AUD1104311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA II\",\"creditos\":3,\"nota\":11.09},{\"codigo\":\"ELP1104305\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":16.67},{\"codigo\":\"TRI1106311\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":15.31},{\"codigo\":\"PRP1107411\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":10.47},{\"codigo\":\"AUD1104311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA II\",\"creditos\":3,\"nota\":10.38}],\"fecha_proceso\":\"2026-10-16T02:35:32.158Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_29.png', '/uploads/mock_cedula_29.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_29.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1094, 980, 3, 'test_user30@unimar.edu.ve', 'BECA APRENDIZAJE', 14.32, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":11.46},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":13.73},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":13.33},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":13.44},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":11.33},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":12.19},{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":14.12},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":18.21},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":13.88},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":14.86},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":15.77},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":19.52}],\"fecha_proceso\":\"2026-10-16T02:35:32.167Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_30.png', '/uploads/mock_cedula_30.png', '/uploads/mock_residencia_30.pdf', '/uploads/mock_manutencion_30.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_30.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1095, 981, 3, 'test_user31@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.52, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":17.21},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":15.77},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":10.92},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":18.87},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":18.88},{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":11.51},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":18.4},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":19.98},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":13.51},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":10.18}],\"fecha_proceso\":\"2026-10-16T02:35:32.170Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_31.png', '/uploads/mock_cedula_31.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_31.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1096, 982, 3, 'test_user32@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.94, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":18.03},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":11.25},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":10.03},{\"codigo\":\"IG0104341\",\"nombre\":\"INTRODUCCIÓN A LA INGENIERÍA DE SISTEMAS\",\"creditos\":3,\"nota\":17.09},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":16.87},{\"codigo\":\"ITI0104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":17.75},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":13.55}],\"fecha_proceso\":\"2026-10-16T02:35:32.172Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_32.png', '/uploads/mock_cedula_32.png', '/uploads/mock_residencia_32.pdf', '/uploads/mock_manutencion_32.pdf', '/uploads/mock_informe_medico_32.pdf', NULL, NULL, NULL, '/uploads/mock_notas_certificadas_32.pdf', '/uploads/mock_carnet_disc_32.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1097, 983, 3, 'test_user33@unimar.edu.ve', 'BECA APRENDIZAJE', 12.83, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":16.48},{\"codigo\":\"NEU0304335\",\"nombre\":\"NEUROCIENCIAS\",\"creditos\":3,\"nota\":16.36},{\"codigo\":\"PSE0304335\",\"nombre\":\"PSICOLOGÍA EVOLUTIVA II\",\"creditos\":3,\"nota\":10.02},{\"codigo\":\"PSL0304335\",\"nombre\":\"PSICOLOGÍA SOCIAL II\",\"creditos\":3,\"nota\":11.53},{\"codigo\":\"PRO0304335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS I\",\"creditos\":3,\"nota\":10.18},{\"codigo\":\"EST0304335\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":12.4}],\"fecha_proceso\":\"2026-10-16T02:35:32.173Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_33.png', '/uploads/mock_cedula_33.png', '/uploads/mock_residencia_33.pdf', '/uploads/mock_manutencion_33.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_33.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1098, 984, 3, 'test_user34@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.58, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":19.1},{\"codigo\":\"ING0404333\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":14.71},{\"codigo\":\"FRA0404333\",\"nombre\":\"FRANCÉS III\",\"creditos\":3,\"nota\":18.36},{\"codigo\":\"FIN0404333\",\"nombre\":\"FONÉTICA INGLESA I\",\"creditos\":3,\"nota\":10.56},{\"codigo\":\"FFR0404333\",\"nombre\":\"FONÉTICA FRANCESA I\",\"creditos\":3,\"nota\":10.84},{\"codigo\":\"MOR0404333\",\"nombre\":\"MORFOSINTAXIS\",\"creditos\":3,\"nota\":19.88}],\"fecha_proceso\":\"2026-10-16T02:35:32.174Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_34.png', '/uploads/mock_cedula_34.png', '/uploads/mock_residencia_34.pdf', '/uploads/mock_manutencion_34.pdf', '/uploads/mock_informe_medico_34.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_34.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1099, 985, 3, 'test_user35@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 14.18, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":14.81},{\"codigo\":\"PSP0504335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD II\",\"creditos\":3,\"nota\":10.24},{\"codigo\":\"PSF0504335\",\"nombre\":\"PSICOFISIOLOGÍA\",\"creditos\":3,\"nota\":14.6},{\"codigo\":\"PSI0504335\",\"nombre\":\"PSICOMETRÍA I\",\"creditos\":3,\"nota\":10.53},{\"codigo\":\"MET0504335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN II\",\"creditos\":3,\"nota\":15.98},{\"codigo\":\"PSM0504335\",\"nombre\":\"PSICOLOGÍA DE LA MOTIVACIÓN Y EMOCIÓN\",\"creditos\":3,\"nota\":18.92}],\"fecha_proceso\":\"2026-10-16T02:35:32.178Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_35.png', '/uploads/mock_cedula_35.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1100, 986, 3, 'test_user36@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.79, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"FIN0704311\",\"nombre\":\"FINANZAS I\",\"creditos\":3,\"nota\":11.86},{\"codigo\":\"ADM0704311\",\"nombre\":\"ADMINISTRACIÓN VI\",\"creditos\":3,\"nota\":17.73},{\"codigo\":\"CON0704311\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":11.29},{\"codigo\":\"DER0704311\",\"nombre\":\"DERECHO V\",\"creditos\":3,\"nota\":10.86},{\"codigo\":\"MET0704311\",\"nombre\":\"MÉTODOS CUANTITATIVOS I\",\"creditos\":3,\"nota\":11.73},{\"codigo\":\"FIN0704311\",\"nombre\":\"FINANZAS I\",\"creditos\":3,\"nota\":12.68},{\"codigo\":\"ADM0704311\",\"nombre\":\"ADMINISTRACIÓN VI\",\"creditos\":3,\"nota\":19.95},{\"codigo\":\"CON0704311\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":19.22},{\"codigo\":\"DER0704311\",\"nombre\":\"DERECHO V\",\"creditos\":3,\"nota\":18.31},{\"codigo\":\"MET0704311\",\"nombre\":\"MÉTODOS CUANTITATIVOS I\",\"creditos\":3,\"nota\":14.28}],\"fecha_proceso\":\"2026-10-16T02:35:32.183Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_36.png', '/uploads/mock_cedula_36.png', '/uploads/mock_residencia_36.pdf', '/uploads/mock_manutencion_36.pdf', '/uploads/mock_informe_medico_36.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_36.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1101, 987, 3, 'test_user37@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.71, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":19.05},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":14.87},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":15.86},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":10.05},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":19.31},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":17.48},{\"codigo\":\"HID0104321\",\"nombre\":\"HISTORIA DEL DERECHO\",\"creditos\":3,\"nota\":13.34}],\"fecha_proceso\":\"2026-10-16T02:35:32.186Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_37.png', '/uploads/mock_cedula_37.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_37.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1102, 988, 3, 'test_user38@unimar.edu.ve', 'BECA SOCIAL', 14.08, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":19.55},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.12},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":10.77},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":12.18},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":17.34},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":19.34},{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":11.64},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":13.5},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":12.36},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":11.59},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":16.02},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":14.51}],\"fecha_proceso\":\"2026-10-16T02:35:32.187Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_38.png', '/uploads/mock_cedula_38.png', '/uploads/mock_residencia_38.pdf', '/uploads/mock_manutencion_38.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1103, 989, 3, 'test_user39@unimar.edu.ve', 'BECA SOCIAL', 15.71, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004307\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":14.15},{\"codigo\":\"CIV1004321\",\"nombre\":\"DERECHO CIVIL VIII (SUCESIONES)\",\"creditos\":3,\"nota\":18},{\"codigo\":\"DTB1004321\",\"nombre\":\"DERECHO TRIBUTARIO\",\"creditos\":3,\"nota\":14.21},{\"codigo\":\"MGR1004321\",\"nombre\":\"MODALIDAD DE GRADO (SEMINARIO)\",\"creditos\":3,\"nota\":19.16},{\"codigo\":\"ETP1004321\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":13.01}],\"fecha_proceso\":\"2026-10-16T02:35:32.189Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_39.png', '/uploads/mock_cedula_39.png', '/uploads/mock_residencia_39.pdf', '/uploads/mock_manutencion_39.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1104, 990, 3, 'test_user40@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 16.49, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ING0605333\",\"nombre\":\"INGLÉS V\",\"creditos\":3,\"nota\":19.29},{\"codigo\":\"FRA0605333\",\"nombre\":\"FRANCÉS V\",\"creditos\":3,\"nota\":11.39},{\"codigo\":\"LIN0604333\",\"nombre\":\"LINGÜÍSTICA APLICADA\",\"creditos\":3,\"nota\":19.8},{\"codigo\":\"TRD0604333\",\"nombre\":\"TEORÍA DE LA TRADUCCIÓN\",\"creditos\":3,\"nota\":16.04},{\"codigo\":\"LIT0604333\",\"nombre\":\"LITERATURA ANGLÓFONA\",\"creditos\":3,\"nota\":15.92}],\"fecha_proceso\":\"2026-10-16T02:35:32.190Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_40.png', '/uploads/mock_cedula_40.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-16 01:31:35', NULL, NULL, NULL, 100, NULL),
(1105, 991, 3, 'test_user41@unimar.edu.ve', 'BECA APRENDIZAJE', 16.36, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"ITA0804333\",\"nombre\":\"ITALIANO I\",\"creditos\":3,\"nota\":16.11},{\"codigo\":\"TRA0805333\",\"nombre\":\"TRADUCCIÓN II (INGLÉS)\",\"creditos\":3,\"nota\":18.69},{\"codigo\":\"TRB0805333\",\"nombre\":\"TRADUCCIÓN II (FRANCÉS)\",\"creditos\":3,\"nota\":13.91},{\"codigo\":\"DIC0804333\",\"nombre\":\"DICCIÓN Y ORATORIA\",\"creditos\":3,\"nota\":18.04},{\"codigo\":\"MEI0804333\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":15.05}],\"fecha_proceso\":\"2026-10-16T02:35:32.194Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_41.png', '/uploads/mock_cedula_41.png', '/uploads/mock_residencia_41.pdf', '/uploads/mock_manutencion_41.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_41.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL);
INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`) VALUES
(1106, 992, 3, 'test_user42@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 15.87, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208433\",\"nombre\":\"TRABAJO DE GRADO / PASANTÍA II\",\"creditos\":4,\"nota\":19.87},{\"codigo\":\"ITA1203233\",\"nombre\":\"ITALIANO V\",\"creditos\":2,\"nota\":14.72},{\"codigo\":\"RDP1203333\",\"nombre\":\"REDACCIÓN Y ESTILO\",\"creditos\":3,\"nota\":13.03}],\"fecha_proceso\":\"2026-10-16T02:35:32.198Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_42.png', '/uploads/mock_cedula_42.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_42.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1107, 993, 3, 'test_user43@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.57, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"CEL0104300\",\"nombre\":\"COMPRENSIÓN Y EXPRESIÓN LINGÜÍSTICA\",\"creditos\":3,\"nota\":19.35},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":11.29},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":12.91},{\"codigo\":\"INI0104300\",\"nombre\":\"INTRODUCCIÓN A LA INGENIERÍA INDUSTRIAL\",\"creditos\":3,\"nota\":12.3},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":10.42},{\"codigo\":\"ITI0104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":16.17},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":12.57}],\"fecha_proceso\":\"2026-10-16T02:35:32.199Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_43.png', '/uploads/mock_cedula_43.png', '/uploads/mock_residencia_43.pdf', '/uploads/mock_manutencion_43.pdf', '/uploads/mock_informe_medico_43.pdf', NULL, NULL, NULL, '/uploads/mock_notas_certificadas_43.pdf', '/uploads/mock_carnet_disc_43.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1108, 994, 3, 'test_user44@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 15.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"FIN0804311\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":12.2},{\"codigo\":\"ADM0804311\",\"nombre\":\"ADMINISTRACIÓN VII\",\"creditos\":3,\"nota\":14.3},{\"codigo\":\"CON0804311\",\"nombre\":\"CONTABILIDAD DE COSTOS II\",\"creditos\":3,\"nota\":11.45},{\"codigo\":\"MET0804311\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":18.06},{\"codigo\":\"PRE0804311\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":18.74},{\"codigo\":\"FIN0804311\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":16.35},{\"codigo\":\"ADM0804311\",\"nombre\":\"ADMINISTRACIÓN VII\",\"creditos\":3,\"nota\":11.73},{\"codigo\":\"CON0804311\",\"nombre\":\"CONTABILIDAD DE COSTOS II\",\"creditos\":3,\"nota\":19.3},{\"codigo\":\"MET0804311\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":10.16},{\"codigo\":\"PRE0804311\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":18.28}],\"fecha_proceso\":\"2026-10-16T02:35:32.200Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_44.png', '/uploads/mock_cedula_44.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1109, 995, 3, 'test_user45@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 15.09, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":18.44},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":15.54},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":19.59},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":12.78},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":11.15},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":13.03}],\"fecha_proceso\":\"2026-10-16T02:35:32.202Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_45.png', '/uploads/mock_cedula_45.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1110, 996, 3, 'test_user46@unimar.edu.ve', 'AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES', 15.98, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"DIG0604332\",\"nombre\":\"DISEÑO GRÁFICO II\",\"creditos\":3,\"nota\":17.99},{\"codigo\":\"FOT0603332\",\"nombre\":\"FOTOGRAFÍA II\",\"creditos\":3,\"nota\":15.46},{\"codigo\":\"COM0603332\",\"nombre\":\"COMPUTACIÓN GRÁFICA III\",\"creditos\":3,\"nota\":17.34},{\"codigo\":\"EST0603332\",\"nombre\":\"ESTÉTICA\",\"creditos\":3,\"nota\":18.63},{\"codigo\":\"PUP0603332\",\"nombre\":\"PUBLICIDAD Y PROPAGANDA\",\"creditos\":3,\"nota\":10.48}],\"fecha_proceso\":\"2026-10-16T02:35:32.203Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_46.png', '/uploads/mock_cedula_46.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_46.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1111, 997, 3, 'test_user47@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.68, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004305\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":11.63},{\"codigo\":\"ADM1004311\",\"nombre\":\"ADMINISTRACIÓN IX\",\"creditos\":3,\"nota\":17.95},{\"codigo\":\"AUD1004311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA I\",\"creditos\":3,\"nota\":18.86},{\"codigo\":\"SMI1004311\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":15.6},{\"codigo\":\"ETI1004311\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":17.33},{\"codigo\":\"ELP1004305\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":11.93},{\"codigo\":\"ADM1004311\",\"nombre\":\"ADMINISTRACIÓN IX\",\"creditos\":3,\"nota\":14.18},{\"codigo\":\"AUD1004311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA I\",\"creditos\":3,\"nota\":18.04},{\"codigo\":\"SMI1004311\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":15.71},{\"codigo\":\"ETI1004311\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":15.58}],\"fecha_proceso\":\"2026-10-16T02:35:32.205Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_47.png', '/uploads/mock_cedula_47.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_47.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1112, 998, 3, 'test_user48@unimar.edu.ve', 'BECA A LA EXCELENCIA', 13.28, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":12.23},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":13.19},{\"codigo\":\"MAT0205341\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":17.5},{\"codigo\":\"ALD0204341\",\"nombre\":\"ÁLGEBRA DISCRETA\",\"creditos\":3,\"nota\":10.05},{\"codigo\":\"DIB0203141\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":11.85},{\"codigo\":\"GEA0205341\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":11.65},{\"codigo\":\"QUG0205341\",\"nombre\":\"QUÍMICA GENERAL\",\"creditos\":3,\"nota\":16.5}],\"fecha_proceso\":\"2026-10-16T02:35:32.207Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_48.png', '/uploads/mock_cedula_48.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_48.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1113, 999, 3, 'test_user49@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.53, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":10.49},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":12.99},{\"codigo\":\"HIS0203332\",\"nombre\":\"HISTORIA DEL ARTE I\",\"creditos\":3,\"nota\":12.29},{\"codigo\":\"DIB0203332\",\"nombre\":\"DIBUJO ANALÍTICO I\",\"creditos\":3,\"nota\":17.61},{\"codigo\":\"TEF0203332\",\"nombre\":\"TEORÍA DE LA FORMA\",\"creditos\":3,\"nota\":12.14},{\"codigo\":\"TCO0203332\",\"nombre\":\"TEORÍA DEL COLOR\",\"creditos\":3,\"nota\":15.68}],\"fecha_proceso\":\"2026-10-16T02:35:32.208Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_49.png', '/uploads/mock_cedula_49.png', '/uploads/mock_residencia_49.pdf', '/uploads/mock_manutencion_49.pdf', '/uploads/mock_informe_medico_49.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_49.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1114, 1000, 3, 'test_user50@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 14.48, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":10.19},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":18.58},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.88},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":13.16},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":12.22},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":13.94},{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":10.9},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":14.57},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":16.39},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":11.72},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":15.1},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":18.09}],\"fecha_proceso\":\"2026-10-16T02:35:32.212Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_50.png', '/uploads/mock_cedula_50.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_50.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1115, 1001, 3, 'test_user51@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.38, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"MAT0505342\",\"nombre\":\"MATEMÁTICA IV\",\"creditos\":3,\"nota\":16.54},{\"codigo\":\"FIS0505342\",\"nombre\":\"FÍSICA III\",\"creditos\":3,\"nota\":11.17},{\"codigo\":\"MER0505342\",\"nombre\":\"MECÁNICA RACIONAL I\",\"creditos\":3,\"nota\":14.95},{\"codigo\":\"ING0504342\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":19.71},{\"codigo\":\"LAF0503142\",\"nombre\":\"LABORATORIO DE FÍSICA II\",\"creditos\":1,\"nota\":11.35},{\"codigo\":\"ESH0502202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":12.57}],\"fecha_proceso\":\"2026-10-16T02:35:32.215Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_51.png', '/uploads/mock_cedula_51.png', '/uploads/mock_residencia_51.pdf', '/uploads/mock_manutencion_51.pdf', '/uploads/mock_informe_medico_51.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_51.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1116, 1002, 3, 'test_user52@unimar.edu.ve', 'BECA A LA EXCELENCIA', 14.87, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":11.99},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":15.6},{\"codigo\":\"MAT0205341\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":16.24},{\"codigo\":\"ALD0204341\",\"nombre\":\"ÁLGEBRA DISCRETA\",\"creditos\":3,\"nota\":16.59},{\"codigo\":\"DIB0203141\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":15.69},{\"codigo\":\"GEA0205341\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":13.16},{\"codigo\":\"QUG0205341\",\"nombre\":\"QUÍMICA GENERAL\",\"creditos\":3,\"nota\":14.8}],\"fecha_proceso\":\"2026-10-16T02:35:32.216Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_52.png', '/uploads/mock_cedula_52.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_52.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1117, 1003, 3, 'test_user53@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 12.56, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"TRI1106342\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":10.42},{\"codigo\":\"PRP1107442\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16.72},{\"codigo\":\"ADP1104342\",\"nombre\":\"ADMINISTRACIÓN DE PERSONAL\",\"creditos\":3,\"nota\":11.52},{\"codigo\":\"GPC1104342\",\"nombre\":\"GERENCIA DE PROYECTOS Y COSTOS\",\"creditos\":3,\"nota\":11.6}],\"fecha_proceso\":\"2026-10-16T02:35:32.217Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_53.png', '/uploads/mock_cedula_53.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1118, 1004, 3, 'test_user54@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 14.62, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":15.88},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":13.98},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":10.64},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":14.61},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":17.14},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":14.48},{\"codigo\":\"HID0104321\",\"nombre\":\"HISTORIA DEL DERECHO\",\"creditos\":3,\"nota\":15.58}],\"fecha_proceso\":\"2026-10-16T02:35:32.218Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_54.png', '/uploads/mock_cedula_54.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_54.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1119, 1005, 3, 'test_user55@unimar.edu.ve', 'BECA SOCIAL', 17.94, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"INV0804342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES I\",\"creditos\":3,\"nota\":19.99},{\"codigo\":\"PRM0805342\",\"nombre\":\"PROCESOS DE MANUFACTURA II\",\"creditos\":3,\"nota\":18.72},{\"codigo\":\"IEM0804342\",\"nombre\":\"INGENIERÍA DE MÉTODOS I\",\"creditos\":3,\"nota\":19.8},{\"codigo\":\"TRC0804342\",\"nombre\":\"TRANSFERENCIA DE CALOR\",\"creditos\":3,\"nota\":13.49},{\"codigo\":\"ELI0805342\",\"nombre\":\"ELECTROTECNIA INDUSTRIAL\",\"creditos\":3,\"nota\":17.72}],\"fecha_proceso\":\"2026-10-16T02:35:32.219Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_55.png', '/uploads/mock_cedula_55.png', '/uploads/mock_residencia_55.pdf', '/uploads/mock_manutencion_55.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-15 22:45:28', NULL, NULL, NULL, 100, NULL),
(1120, 1006, 3, 'test_user56@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 12.65, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":11.91},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.1},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":10.86},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":11.05},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":10.55},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":10.88},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":14.18},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":18.67},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.51},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":12.33},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":11.49},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":11.26}],\"fecha_proceso\":\"2026-10-16T02:35:32.221Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_56.png', '/uploads/mock_cedula_56.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_56.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1121, 1007, 3, 'test_user57@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 17.59, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":19.64},{\"codigo\":\"ING0304333\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":19.53},{\"codigo\":\"FRA0304333\",\"nombre\":\"FRANCÉS II\",\"creditos\":3,\"nota\":18.82},{\"codigo\":\"LIN0304333\",\"nombre\":\"LINGÜÍSTICA II\",\"creditos\":3,\"nota\":16.74},{\"codigo\":\"CUL0304333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN II\",\"creditos\":3,\"nota\":14.85},{\"codigo\":\"FGE0304333\",\"nombre\":\"FONÉTICA GENERAL\",\"creditos\":3,\"nota\":15.95}],\"fecha_proceso\":\"2026-10-16T02:35:32.222Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_57.png', '/uploads/mock_cedula_57.png', '/uploads/mock_residencia_57.pdf', '/uploads/mock_manutencion_57.pdf', '/uploads/mock_informe_medico_57.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_57.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1122, 1008, 3, 'test_user58@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.53, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":15.46},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":10.43},{\"codigo\":\"HIS0203332\",\"nombre\":\"HISTORIA DEL ARTE I\",\"creditos\":3,\"nota\":16.06},{\"codigo\":\"DIB0203332\",\"nombre\":\"DIBUJO ANALÍTICO I\",\"creditos\":3,\"nota\":11.08},{\"codigo\":\"TEF0203332\",\"nombre\":\"TEORÍA DE LA FORMA\",\"creditos\":3,\"nota\":12.98},{\"codigo\":\"TCO0203332\",\"nombre\":\"TEORÍA DEL COLOR\",\"creditos\":3,\"nota\":15.19}],\"fecha_proceso\":\"2026-10-16T02:35:32.223Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_58.png', '/uploads/mock_cedula_58.png', '/uploads/mock_residencia_58.pdf', '/uploads/mock_manutencion_58.pdf', '/uploads/mock_informe_medico_58.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_58.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1123, 1009, 3, 'test_user59@unimar.edu.ve', 'BECA APRENDIZAJE', 13.59, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":12.66},{\"codigo\":\"ING0404333\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":12.29},{\"codigo\":\"FRA0404333\",\"nombre\":\"FRANCÉS III\",\"creditos\":3,\"nota\":12.51},{\"codigo\":\"FIN0404333\",\"nombre\":\"FONÉTICA INGLESA I\",\"creditos\":3,\"nota\":18.63},{\"codigo\":\"FFR0404333\",\"nombre\":\"FONÉTICA FRANCESA I\",\"creditos\":3,\"nota\":11.28},{\"codigo\":\"MOR0404333\",\"nombre\":\"MORFOSINTAXIS\",\"creditos\":3,\"nota\":14.14}],\"fecha_proceso\":\"2026-10-16T02:35:32.225Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_59.png', '/uploads/mock_cedula_59.png', '/uploads/mock_residencia_59.pdf', '/uploads/mock_manutencion_59.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_59.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1124, 1010, 3, 'test_user60@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.07, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":10.42},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":11.05},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":14.96},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":19.79},{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17.44},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":12.37},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16.68},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":17.83}],\"fecha_proceso\":\"2026-10-16T02:35:32.230Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_60.png', '/uploads/mock_cedula_60.png', '/uploads/mock_residencia_60.pdf', '/uploads/mock_manutencion_60.pdf', '/uploads/mock_informe_medico_60.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_60.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1125, 1011, 3, 'test_user61@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 17.46, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":19.35},{\"codigo\":\"ING0304333\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":16.05},{\"codigo\":\"FRA0304333\",\"nombre\":\"FRANCÉS II\",\"creditos\":3,\"nota\":18.79},{\"codigo\":\"LIN0304333\",\"nombre\":\"LINGÜÍSTICA II\",\"creditos\":3,\"nota\":13.35},{\"codigo\":\"CUL0304333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN II\",\"creditos\":3,\"nota\":19.23},{\"codigo\":\"FGE0304333\",\"nombre\":\"FONÉTICA GENERAL\",\"creditos\":3,\"nota\":17.98}],\"fecha_proceso\":\"2026-10-16T02:35:32.232Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_61.png', '/uploads/mock_cedula_61.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1126, 1012, 3, 'test_user62@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004303\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":14.87},{\"codigo\":\"SMI1004332\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":13.4},{\"codigo\":\"POF1003332\",\"nombre\":\"PORTAFOLIO\",\"creditos\":3,\"nota\":14.44},{\"codigo\":\"GEP1003332\",\"nombre\":\"GERENCIA DE PROYECTOS\",\"creditos\":3,\"nota\":14.65},{\"codigo\":\"IIM1003332\",\"nombre\":\"IDENTIDAD IMAGEN CORPORATIVA\",\"creditos\":3,\"nota\":17.92}],\"fecha_proceso\":\"2026-10-16T02:35:32.235Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_62.png', '/uploads/mock_cedula_62.png', '/uploads/mock_residencia_62.pdf', '/uploads/mock_manutencion_62.pdf', '/uploads/mock_informe_medico_62.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_62.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1127, 1013, 3, 'test_user63@unimar.edu.ve', 'BECA APRENDIZAJE', 17.41, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904308\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":15.88},{\"codigo\":\"MEI0904335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN III\",\"creditos\":3,\"nota\":17.79},{\"codigo\":\"PCA0904335\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"creditos\":3,\"nota\":18.05},{\"codigo\":\"PDI0904335\",\"nombre\":\"PSICODIAGNÓSTICO\",\"creditos\":3,\"nota\":18},{\"codigo\":\"PSI0904335\",\"nombre\":\"PSICOLOGÍA EXPERIMENTAL\",\"creditos\":3,\"nota\":17.33}],\"fecha_proceso\":\"2026-10-16T02:35:32.238Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_63.png', '/uploads/mock_cedula_63.png', '/uploads/mock_residencia_63.pdf', '/uploads/mock_manutencion_63.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_63.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1128, 1014, 3, 'test_user64@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.82, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":10.25},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":16.93},{\"codigo\":\"INT0204321\",\"nombre\":\"INTRODUCCIÓN AL DERECHO\",\"creditos\":3,\"nota\":14.81},{\"codigo\":\"DER0204321\",\"nombre\":\"DERECHO ROMANO I\",\"creditos\":3,\"nota\":18.59},{\"codigo\":\"FIL0204321\",\"nombre\":\"FILOSOFÍA DEL DERECHO\",\"creditos\":3,\"nota\":16.43},{\"codigo\":\"DIP0204321\",\"nombre\":\"DERECHO INDIVIDUAL DEL TRABAJO\",\"creditos\":3,\"nota\":17.92}],\"fecha_proceso\":\"2026-10-16T02:35:32.240Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_64.png', '/uploads/mock_cedula_64.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_64.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1129, 1015, 3, 'test_user65@unimar.edu.ve', 'BECA A LA EXCELENCIA', 15.17, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104303\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":13.99},{\"codigo\":\"TRI1106332\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":14.66},{\"codigo\":\"PRP1107432\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16.87}],\"fecha_proceso\":\"2026-10-16T02:35:32.242Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_65.png', '/uploads/mock_cedula_65.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_65.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1130, 1016, 3, 'test_user66@unimar.edu.ve', 'BECA SOCIAL', 14.48, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104304\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":13.39},{\"codigo\":\"ITA1103233\",\"nombre\":\"ITALIANO IV\",\"creditos\":2,\"nota\":16.74},{\"codigo\":\"MGP1106333\",\"nombre\":\"PASANTÍA I / PROYECTO I\",\"creditos\":3,\"nota\":10.48},{\"codigo\":\"INT1104333\",\"nombre\":\"INTERPRETACIÓN II\",\"creditos\":3,\"nota\":17.3}],\"fecha_proceso\":\"2026-10-16T02:35:32.246Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_66.png', '/uploads/mock_cedula_66.png', '/uploads/mock_residencia_66.pdf', '/uploads/mock_manutencion_66.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1131, 1017, 3, 'test_user67@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 17.94, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"REI0705342\",\"nombre\":\"RESISTENCIA DE MATERIALES II\",\"creditos\":3,\"nota\":19.77},{\"codigo\":\"ESP0705342\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":19.88},{\"codigo\":\"TEI0705342\",\"nombre\":\"TERMODINÁMICA II\",\"creditos\":3,\"nota\":16.77},{\"codigo\":\"MFL0705342\",\"nombre\":\"MECÁNICA DE LOS FLUIDOS\",\"creditos\":3,\"nota\":18.72},{\"codigo\":\"PRM0704342\",\"nombre\":\"PROCESOS DE MANUFACTURA I\",\"creditos\":3,\"nota\":14.55}],\"fecha_proceso\":\"2026-10-16T02:35:32.247Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_67.png', '/uploads/mock_cedula_67.png', '/uploads/mock_residencia_67.pdf', '/uploads/mock_manutencion_67.pdf', '/uploads/mock_informe_medico_67.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_67.png', NULL, NULL, '2026-10-15 22:35:52', NULL, NULL, NULL, 100, NULL),
(1132, 1018, 3, 'test_user68@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.69, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":10.85},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":13.22},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":13.68},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":12.67},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":11.52},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":11.61},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":11.06},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":16.49},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.32},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":17.74},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":12.48},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":14.67}],\"fecha_proceso\":\"2026-10-16T02:35:32.252Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_68.png', '/uploads/mock_cedula_68.png', '/uploads/mock_residencia_68.pdf', '/uploads/mock_manutencion_68.pdf', '/uploads/mock_informe_medico_68.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_68.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1133, 1019, 3, 'test_user69@unimar.edu.ve', 'AYUDA ECONÓMICA GENERAL', 15.44, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":13.94},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":12.28},{\"codigo\":\"ING0204333\",\"nombre\":\"INGLÉS I\",\"creditos\":3,\"nota\":11.96},{\"codigo\":\"FRA0204333\",\"nombre\":\"FRANCÉS I\",\"creditos\":3,\"nota\":19.72},{\"codigo\":\"LIN0204333\",\"nombre\":\"LINGÜÍSTICA I\",\"creditos\":3,\"nota\":17.34},{\"codigo\":\"CUL0204333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN I\",\"creditos\":3,\"nota\":17.4}],\"fecha_proceso\":\"2026-10-16T02:35:32.254Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_69.png', '/uploads/mock_cedula_69.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1134, 1020, 3, 'test_user70@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.00, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"ITA0804333\",\"nombre\":\"ITALIANO I\",\"creditos\":3,\"nota\":11.91},{\"codigo\":\"TRA0805333\",\"nombre\":\"TRADUCCIÓN II (INGLÉS)\",\"creditos\":3,\"nota\":19},{\"codigo\":\"TRB0805333\",\"nombre\":\"TRADUCCIÓN II (FRANCÉS)\",\"creditos\":3,\"nota\":10.44},{\"codigo\":\"DIC0804333\",\"nombre\":\"DICCIÓN Y ORATORIA\",\"creditos\":3,\"nota\":11.99},{\"codigo\":\"MEI0804333\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":16.68}],\"fecha_proceso\":\"2026-10-16T02:35:32.255Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_70.png', '/uploads/mock_cedula_70.png', '/uploads/mock_residencia_70.pdf', '/uploads/mock_manutencion_70.pdf', '/uploads/mock_informe_medico_70.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_70.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1135, 1021, 3, 'test_user71@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.86, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"MAT0505341\",\"nombre\":\"MATEMÁTICA IV\",\"creditos\":3,\"nota\":10.48},{\"codigo\":\"ESD0504341\",\"nombre\":\"ESTRUCTURA DE DATOS\",\"creditos\":3,\"nota\":16.57},{\"codigo\":\"PRO0505341\",\"nombre\":\"PROGRAMACIÓN II\",\"creditos\":3,\"nota\":13.31},{\"codigo\":\"CIE0505341\",\"nombre\":\"CIRCUITOS ELÉCTRICOS\",\"creditos\":3,\"nota\":12.93},{\"codigo\":\"MER0505341\",\"nombre\":\"MECÁNICA RACIONAL\",\"creditos\":3,\"nota\":18.88},{\"codigo\":\"INI0504341\",\"nombre\":\"INGLÉS INSTRUMENTAL III\",\"creditos\":3,\"nota\":10.98}],\"fecha_proceso\":\"2026-10-16T02:35:32.257Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_71.png', '/uploads/mock_cedula_71.png', '/uploads/mock_residencia_71.pdf', '/uploads/mock_manutencion_71.pdf', '/uploads/mock_informe_medico_71.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_71.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1136, 1022, 3, 'test_user72@unimar.edu.ve', 'BECA APRENDIZAJE', 14.56, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":10.38},{\"codigo\":\"EST0505311\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":19.26},{\"codigo\":\"ECO0504311\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":18.53},{\"codigo\":\"ADM0504311\",\"nombre\":\"ADMINISTRACIÓN IV\",\"creditos\":3,\"nota\":18.72},{\"codigo\":\"DER0504311\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":18.22},{\"codigo\":\"INF0504311\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":11.9},{\"codigo\":\"ESH0502205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":13.5},{\"codigo\":\"EST0505311\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":18.33},{\"codigo\":\"ECO0504311\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":11.51},{\"codigo\":\"ADM0504311\",\"nombre\":\"ADMINISTRACIÓN IV\",\"creditos\":3,\"nota\":12.09},{\"codigo\":\"DER0504311\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":10.8},{\"codigo\":\"INF0504311\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":11.43}],\"fecha_proceso\":\"2026-10-16T02:35:32.259Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_72.png', '/uploads/mock_cedula_72.png', '/uploads/mock_residencia_72.pdf', '/uploads/mock_manutencion_72.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_72.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1137, 1023, 3, 'test_user73@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 15.31, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"INV0804342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES I\",\"creditos\":3,\"nota\":15.98},{\"codigo\":\"PRM0805342\",\"nombre\":\"PROCESOS DE MANUFACTURA II\",\"creditos\":3,\"nota\":14.77},{\"codigo\":\"IEM0804342\",\"nombre\":\"INGENIERÍA DE MÉTODOS I\",\"creditos\":3,\"nota\":18.31},{\"codigo\":\"TRC0804342\",\"nombre\":\"TRANSFERENCIA DE CALOR\",\"creditos\":3,\"nota\":15.28},{\"codigo\":\"ELI0805342\",\"nombre\":\"ELECTROTECNIA INDUSTRIAL\",\"creditos\":3,\"nota\":12.2}],\"fecha_proceso\":\"2026-10-16T02:35:32.263Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_73.png', '/uploads/mock_cedula_73.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1138, 1024, 3, 'test_user74@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 16.39, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"CPQ1005342\",\"nombre\":\"CONTROL DE PRODUCCIÓN Y CALIDAD II\",\"creditos\":3,\"nota\":16.61},{\"codigo\":\"HIG1004342\",\"nombre\":\"HIGIENE Y SEGURIDAD INDUSTRIAL\",\"creditos\":3,\"nota\":19.23},{\"codigo\":\"SMI1004342\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":11.95},{\"codigo\":\"MDS1004342\",\"nombre\":\"MANTENIMIENTO INDUSTRIAL\",\"creditos\":3,\"nota\":19.66},{\"codigo\":\"ESH1002202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":15.6},{\"codigo\":\"ELP1004302\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":15.26}],\"fecha_proceso\":\"2026-10-16T02:35:32.265Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_74.png', '/uploads/mock_cedula_74.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_74.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1139, 1025, 3, 'test_user75@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 14.59, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":15.71},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":10.89},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":16.11},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":14.23},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":14.43},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":14.86},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":16.32},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":14.33},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":12.78},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":16.24}],\"fecha_proceso\":\"2026-10-16T02:35:32.267Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_75.png', '/uploads/mock_cedula_75.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_75.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1140, 1026, 3, 'test_user76@unimar.edu.ve', 'AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES', 15.42, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104303\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.72},{\"codigo\":\"TRI1106332\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":18.16},{\"codigo\":\"PRP1107432\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16.37}],\"fecha_proceso\":\"2026-10-16T02:35:32.268Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_76.png', '/uploads/mock_cedula_76.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_76.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1141, 1027, 3, 'test_user77@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 12.93, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":11.06},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":12.88},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":10.62},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":12.13},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":11.63},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":19.25}],\"fecha_proceso\":\"2026-10-16T02:35:32.270Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_77.png', '/uploads/mock_cedula_77.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_77.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1142, 1028, 3, 'test_user78@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 14.52, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"INV0904342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES II\",\"creditos\":3,\"nota\":16.98},{\"codigo\":\"IEM0905342\",\"nombre\":\"INGENIERÍA DE MÉTODOS II\",\"creditos\":3,\"nota\":12.2},{\"codigo\":\"CPQ0904342\",\"nombre\":\"CONTROL DE PRODUCCIÓN Y CALIDAD I\",\"creditos\":3,\"nota\":12.17},{\"codigo\":\"MEI0904342\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":16.9},{\"codigo\":\"INE0904342\",\"nombre\":\"INGENIERÍA ECONÓMICA\",\"creditos\":3,\"nota\":11},{\"codigo\":\"ELP0904302\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":17.84}],\"fecha_proceso\":\"2026-10-16T02:35:32.272Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_78.png', '/uploads/mock_cedula_78.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_78.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1143, 1029, 3, 'test_user79@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.41, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":15.87},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":13.26},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":17.24},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":18.76},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":10.31},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":11.82},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":17.79},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":11.51},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":16.28},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":11.29}],\"fecha_proceso\":\"2026-10-16T02:35:32.273Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_79.png', '/uploads/mock_cedula_79.png', '/uploads/mock_residencia_79.pdf', '/uploads/mock_manutencion_79.pdf', '/uploads/mock_informe_medico_79.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_79.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1144, 1030, 3, 'test_user80@unimar.edu.ve', 'BECA SOCIAL', 14.47, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":15.52},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":16.23},{\"codigo\":\"MAT0205341\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":15.54},{\"codigo\":\"ALD0204341\",\"nombre\":\"ÁLGEBRA DISCRETA\",\"creditos\":3,\"nota\":10.55},{\"codigo\":\"DIB0203141\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":19.6},{\"codigo\":\"GEA0205341\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":12.52},{\"codigo\":\"QUG0205341\",\"nombre\":\"QUÍMICA GENERAL\",\"creditos\":3,\"nota\":11.35}],\"fecha_proceso\":\"2026-10-16T02:35:32.275Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_80.png', '/uploads/mock_cedula_80.png', '/uploads/mock_residencia_80.pdf', '/uploads/mock_manutencion_80.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1145, 1031, 3, 'test_user81@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 15.18, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":16.65},{\"codigo\":\"MAT0305311\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":11.59},{\"codigo\":\"CON0305311\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":17.1},{\"codigo\":\"ADM0304311\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":18.82},{\"codigo\":\"DER0304311\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":13.21},{\"codigo\":\"MKT0304311\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":18.51},{\"codigo\":\"ESH0302205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":10.17},{\"codigo\":\"MAT0305311\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":16.54},{\"codigo\":\"CON0305311\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":10.11},{\"codigo\":\"ADM0304311\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":19.56},{\"codigo\":\"DER0304311\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":19.08},{\"codigo\":\"MKT0304311\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":10.85}],\"fecha_proceso\":\"2026-10-16T02:35:32.280Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_81.png', '/uploads/mock_cedula_81.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1146, 1032, 3, 'test_user82@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 16.50, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"TRI1106342\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":19.93},{\"codigo\":\"PRP1107442\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":14.81},{\"codigo\":\"ADP1104342\",\"nombre\":\"ADMINISTRACIÓN DE PERSONAL\",\"creditos\":3,\"nota\":19.7},{\"codigo\":\"GPC1104342\",\"nombre\":\"GERENCIA DE PROYECTOS Y COSTOS\",\"creditos\":3,\"nota\":11.58}],\"fecha_proceso\":\"2026-10-16T02:35:32.282Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_82.png', '/uploads/mock_cedula_82.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1147, 1033, 3, 'test_user83@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 15.83, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.24},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.04},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.83},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":19.87},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":11.45},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":19.89},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.1},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":13.38},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":13.62},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":13.3},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":16.81},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":18.45}],\"fecha_proceso\":\"2026-10-16T02:35:32.283Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_83.png', '/uploads/mock_cedula_83.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL);
INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`) VALUES
(1148, 1034, 3, 'test_user84@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 15.16, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208441\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":17.12},{\"codigo\":\"AUS1205341\",\"nombre\":\"AUDITORIA DE SISTEMAS\",\"creditos\":3,\"nota\":18.38},{\"codigo\":\"SIO1204341\",\"nombre\":\"SIMULACIÓN Y OPTIMIZACIÓN\",\"creditos\":3,\"nota\":12.78},{\"codigo\":\"EDP1203341\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":12.35}],\"fecha_proceso\":\"2026-10-16T02:35:32.284Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_84.png', '/uploads/mock_cedula_84.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_84.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1149, 1035, 3, 'test_user85@unimar.edu.ve', 'BECA SOCIAL', 15.42, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402207\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":13.9},{\"codigo\":\"CIV0404321\",\"nombre\":\"DERECHO CIVIL II (BIENES)\",\"creditos\":3,\"nota\":19.18},{\"codigo\":\"CON0404321\",\"nombre\":\"DERECHO CONSTITUCIONAL II\",\"creditos\":3,\"nota\":10.73},{\"codigo\":\"PEN0404321\",\"nombre\":\"DERECHO PENAL II\",\"creditos\":3,\"nota\":12.42},{\"codigo\":\"TEP0404321\",\"nombre\":\"TEORÍA GENERAL DEL PROCESO\",\"creditos\":3,\"nota\":18.34},{\"codigo\":\"DEA0404321\",\"nombre\":\"DERECHO ADMINISTRATIVO I\",\"creditos\":3,\"nota\":17.92}],\"fecha_proceso\":\"2026-10-16T02:35:32.285Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_85.png', '/uploads/mock_cedula_85.png', '/uploads/mock_residencia_85.pdf', '/uploads/mock_manutencion_85.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1150, 1036, 3, 'test_user86@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 16.48, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":18.72},{\"codigo\":\"EST0505311\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":16.12},{\"codigo\":\"ECO0504311\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":19.45},{\"codigo\":\"ADM0504311\",\"nombre\":\"ADMINISTRACIÓN IV\",\"creditos\":3,\"nota\":18.53},{\"codigo\":\"DER0504311\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":11.03},{\"codigo\":\"INF0504311\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":19.61},{\"codigo\":\"ESH0502205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":14.15},{\"codigo\":\"EST0505311\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":19.47},{\"codigo\":\"ECO0504311\",\"nombre\":\"ECONOMÍA I\",\"creditos\":3,\"nota\":18.31},{\"codigo\":\"ADM0504311\",\"nombre\":\"ADMINISTRACIÓN IV\",\"creditos\":3,\"nota\":11.72},{\"codigo\":\"DER0504311\",\"nombre\":\"DERECHO III\",\"creditos\":3,\"nota\":18.77},{\"codigo\":\"INF0504311\",\"nombre\":\"INFORMÁTICA\",\"creditos\":3,\"nota\":11.83}],\"fecha_proceso\":\"2026-10-16T02:35:32.287Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_86.png', '/uploads/mock_cedula_86.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_86.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1151, 1037, 3, 'test_user87@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 14.21, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"SIO0904341\",\"nombre\":\"SISTEMAS OPERATIVOS\",\"creditos\":3,\"nota\":16.67},{\"codigo\":\"SIG0905341\",\"nombre\":\"SISTEMAS DE INFORMACIÓN GERENCIAL\",\"creditos\":3,\"nota\":11.79},{\"codigo\":\"SIC0905341\",\"nombre\":\"SISTEMAS DE CONTROLES\",\"creditos\":3,\"nota\":10.08},{\"codigo\":\"MEI0904341\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":12.04},{\"codigo\":\"INE0904341\",\"nombre\":\"INGENIERÍA ECONÓMICA\",\"creditos\":3,\"nota\":15.61},{\"codigo\":\"ELP0904301\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":19.05}],\"fecha_proceso\":\"2026-10-16T02:35:32.288Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_87.png', '/uploads/mock_cedula_87.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1152, 1038, 3, 'test_user88@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 15.40, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"HEG1004341\",\"nombre\":\"HERRAMIENTAS GERENCIALES\",\"creditos\":3,\"nota\":17.95},{\"codigo\":\"SIS1004341\",\"nombre\":\"SISTEMAS DE SEÑALES\",\"creditos\":3,\"nota\":13.59},{\"codigo\":\"RED1005341\",\"nombre\":\"REDES DE DATOS II\",\"creditos\":3,\"nota\":13.57},{\"codigo\":\"SMI1004341\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":18.03},{\"codigo\":\"MDS1004241\",\"nombre\":\"METODOLOGÍA DE DESARROLLO DE SOFTWARE\",\"creditos\":2,\"nota\":14.58},{\"codigo\":\"ELP1004301\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":14.67}],\"fecha_proceso\":\"2026-10-16T02:35:32.289Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_88.png', '/uploads/mock_cedula_88.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1153, 1039, 3, 'test_user89@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.23, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"CEL0104300\",\"nombre\":\"COMPRENSIÓN Y EXPRESIÓN LINGÜÍSTICA\",\"creditos\":3,\"nota\":19.44},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":16.16},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":19.87},{\"codigo\":\"INI0104300\",\"nombre\":\"INTRODUCCIÓN A LA INGENIERÍA INDUSTRIAL\",\"creditos\":3,\"nota\":10.73},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":13.25},{\"codigo\":\"ITI0104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":13.07},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":14.08}],\"fecha_proceso\":\"2026-10-16T02:35:32.290Z\"}', 'Pendiente', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_89.png', '/uploads/mock_cedula_89.png', '/uploads/mock_residencia_89.pdf', '/uploads/mock_manutencion_89.pdf', '/uploads/mock_informe_medico_89.pdf', NULL, NULL, NULL, '/uploads/mock_notas_certificadas_89.pdf', '/uploads/mock_carnet_disc_89.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1154, 1040, 3, 'test_user90@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 15.71, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":15},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":18.28},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":17.69},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":15.91},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":15.81},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":12.4},{\"codigo\":\"IAP0103332\",\"nombre\":\"INTRODUCCIÓN A LAS ARTES PLÁSTICAS\",\"creditos\":3,\"nota\":14.85}],\"fecha_proceso\":\"2026-10-16T02:35:32.293Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_90.png', '/uploads/mock_cedula_90.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_90.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1155, 1041, 3, 'test_user91@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 13.27, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":12.82},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":11.85},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":14.62},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":17.77},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":10.28},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":12.26}],\"fecha_proceso\":\"2026-10-16T02:35:32.298Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_91.png', '/uploads/mock_cedula_91.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1156, 1042, 3, 'test_user92@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES', 17.69, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.72},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":15.57},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":19.11},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":18.37},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":17.27},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":18.09}],\"fecha_proceso\":\"2026-10-16T02:35:32.299Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_92.png', '/uploads/mock_cedula_92.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_92.pdf', NULL, NULL, NULL, NULL, NULL, '2026-10-16 01:05:30', NULL, NULL, NULL, 100, NULL),
(1157, 1043, 3, 'test_user93@unimar.edu.ve', 'BECA SOCIAL', 15.72, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"CON0805312\",\"nombre\":\"CONTABILIDAD VII\",\"creditos\":3,\"nota\":17.34},{\"codigo\":\"FIN0804312\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":17.15},{\"codigo\":\"MET0804312\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":10.09},{\"codigo\":\"AUD0804312\",\"nombre\":\"AUDITORÍA I\",\"creditos\":3,\"nota\":19.53},{\"codigo\":\"PRE0804312\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":18.34},{\"codigo\":\"CON0805312\",\"nombre\":\"CONTABILIDAD VII\",\"creditos\":3,\"nota\":10.71},{\"codigo\":\"FIN0804312\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":18.69},{\"codigo\":\"MET0804312\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":12.85},{\"codigo\":\"AUD0804312\",\"nombre\":\"AUDITORÍA I\",\"creditos\":3,\"nota\":15.33},{\"codigo\":\"PRE0804312\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":17.14}],\"fecha_proceso\":\"2026-10-16T02:35:32.300Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_93.png', '/uploads/mock_cedula_93.png', '/uploads/mock_residencia_93.pdf', '/uploads/mock_manutencion_93.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1158, 1044, 3, 'test_user94@unimar.edu.ve', 'AYUDA ECONÓMICA PARA TRABAJADORES', 14.24, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":11.6},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":13.29},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":13.88},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":13.37},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":18.82},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":14.45}],\"fecha_proceso\":\"2026-10-16T02:35:32.302Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_94.png', '/uploads/mock_cedula_94.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1159, 1045, 3, 'test_user95@unimar.edu.ve', 'AYUDA ECONÓMICA FAMILIAR', 13.81, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"MAT0605341\",\"nombre\":\"MATEMÁTICA V\",\"creditos\":3,\"nota\":12.08},{\"codigo\":\"ESP0605341\",\"nombre\":\"ESTADÍSTICA Y PROBABILIDADES\",\"creditos\":3,\"nota\":19.16},{\"codigo\":\"PRO0605341\",\"nombre\":\"PROGRAMACIÓN III\",\"creditos\":3,\"nota\":11.37},{\"codigo\":\"ELE0606341\",\"nombre\":\"ELECTRÓNICA\",\"creditos\":3,\"nota\":12.73},{\"codigo\":\"ARC0604341\",\"nombre\":\"ARQUITECTURA DEL COMPUTADOR\",\"creditos\":3,\"nota\":16.05},{\"codigo\":\"ESH0702201\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":11.46}],\"fecha_proceso\":\"2026-10-16T02:35:32.303Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_95.png', '/uploads/mock_cedula_95.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_95.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1160, 1046, 3, 'test_user96@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 11.68, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104307\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.69},{\"codigo\":\"TRI1106321\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":13.82},{\"codigo\":\"PRP1107421\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":10.68},{\"codigo\":\"MAR1104321\",\"nombre\":\"MÉTODOS ALTERNATIVOS DE RESOLUCIÓN DE CONFLICTOS\",\"creditos\":3,\"nota\":10.52}],\"fecha_proceso\":\"2026-10-16T02:35:32.305Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_96.png', '/uploads/mock_cedula_96.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1161, 1047, 3, 'test_user97@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.57, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208441\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":18.44},{\"codigo\":\"AUS1205341\",\"nombre\":\"AUDITORIA DE SISTEMAS\",\"creditos\":3,\"nota\":16.36},{\"codigo\":\"SIO1204341\",\"nombre\":\"SIMULACIÓN Y OPTIMIZACIÓN\",\"creditos\":3,\"nota\":11.61},{\"codigo\":\"EDP1203341\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.89}],\"fecha_proceso\":\"2026-10-16T02:35:32.306Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_97.png', '/uploads/mock_cedula_97.png', '/uploads/mock_residencia_97.pdf', '/uploads/mock_manutencion_97.pdf', '/uploads/mock_informe_medico_97.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_97.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1162, 1048, 3, 'test_user98@unimar.edu.ve', 'AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES', 15.74, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":19.74},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":10.77},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":19.82},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":14.02},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":18.57},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":15.87},{\"codigo\":\"ESH0302206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":19.86},{\"codigo\":\"MAT0305312\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":14.97},{\"codigo\":\"CON0305312\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":11.87},{\"codigo\":\"ADM0304312\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":14.88},{\"codigo\":\"DER0304312\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":17.95},{\"codigo\":\"MKT0304312\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":10.58}],\"fecha_proceso\":\"2026-10-16T02:35:32.307Z\"}', 'En Revisión', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_98.png', '/uploads/mock_cedula_98.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_98.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1163, 1049, 3, 'test_user99@unimar.edu.ve', 'BECA APRENDIZAJE', 15.18, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"DIG0604332\",\"nombre\":\"DISEÑO GRÁFICO II\",\"creditos\":3,\"nota\":19.73},{\"codigo\":\"FOT0603332\",\"nombre\":\"FOTOGRAFÍA II\",\"creditos\":3,\"nota\":15.41},{\"codigo\":\"COM0603332\",\"nombre\":\"COMPUTACIÓN GRÁFICA III\",\"creditos\":3,\"nota\":13.74},{\"codigo\":\"EST0603332\",\"nombre\":\"ESTÉTICA\",\"creditos\":3,\"nota\":10.73},{\"codigo\":\"PUP0603332\",\"nombre\":\"PUBLICIDAD Y PROPAGANDA\",\"creditos\":3,\"nota\":16.29}],\"fecha_proceso\":\"2026-10-16T02:35:32.309Z\"}', 'Aprobada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_99.png', '/uploads/mock_cedula_99.png', '/uploads/mock_residencia_99.pdf', '/uploads/mock_manutencion_99.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_99.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1164, 1050, 3, 'test_user100@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 16.42, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208435\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.83},{\"codigo\":\"PPC1207435\",\"nombre\":\"PRÁCTICA PROFESIONAL COMUNITARIA\",\"creditos\":4,\"nota\":16.6},{\"codigo\":\"EDP1203335\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.82}],\"fecha_proceso\":\"2026-10-16T02:35:32.315Z\"}', 'Rechazada', '2026-10-16 02:35:32', '/uploads/mock_foto_carnet_100.png', '/uploads/mock_cedula_100.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL),
(1165, 1051, 3, 'wwwwwwwwww@unimar.edu.ve', 'Ayuda Económica para Hijos de Trabajadores', 10.00, 'jjhjhjhhjhjh', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"MER0605342\",\"nombre\":\"MECÁNICA RACIONAL II\",\"nota\":10},{\"codigo\":\"ESP0605342\",\"nombre\":\"ESTADÍSTICA I\",\"nota\":10},{\"codigo\":\"TEI0604342\",\"nombre\":\"TERMODINÁMICA I\",\"nota\":10},{\"codigo\":\"COI0604342\",\"nombre\":\"COMPUTACIÓN PARA INGENIEROS\",\"nota\":10},{\"codigo\":\"REI0605342\",\"nombre\":\"RESISTENCIA DE MATERIALES I\",\"nota\":10}],\"fecha_proceso\":\"2026-10-16T05:16:06.423Z\"}', 'Revisión Especial', '2026-10-16 05:16:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `sexo` enum('M','F') DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(20) NOT NULL,
  `carrera` varchar(150) NOT NULL,
  `semestre` int(11) NOT NULL,
  `indice_global` decimal(5,2) DEFAULT 0.00,
  `email` varchar(150) DEFAULT NULL,
  `municipio_residencia` varchar(100) DEFAULT NULL,
  `ha_tenido_beca` tinyint(1) DEFAULT 0 COMMENT 'Indica si el estudiante ya fue beneficiado alguna vez',
  `beca_perdida` tinyint(1) DEFAULT 0 COMMENT 'Indica si perdió la beca por bajo rendimiento o sanción',
  `motivo_exclusion` text DEFAULT NULL COMMENT 'Razón detallada de por qué no puede volver a solicitar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `nombre`, `apellido`, `cedula`, `sexo`, `fecha_nacimiento`, `telefono`, `carrera`, `semestre`, `indice_global`, `email`, `municipio_residencia`, `ha_tenido_beca`, `beca_perdida`, `motivo_exclusion`) VALUES
(10, 'Roy Vincent', 'Gomez Santana', '22652841', 'F', '1994-11-12', '04265860480', 'Ingeniería de Sistemas', 9, 20.00, 'Roy@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(12, 'Juan', 'Perez', '22652842', 'M', '2026-02-10', '042658414', 'Ingeniería de Sistemas', 5, 20.00, 'juan@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(114, 'mario', 'gomez', '22652800', 'M', '2026-03-04', '04265860480', 'Ingeniería Industrial', 9, 20.00, 'mario@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(115, 'roys', 'gomes', '22652843', 'M', '2024-08-01', '0426586040', 'Ingeniería de Sistemas', 9, 20.00, 'roys@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(948, 'ro', 'ro', '444', 'M', '2026-10-21', '4', 'Ingeniería de Sistemas', 9, 0.00, 'ro@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(949, 'royki', 'kiki', '22652848', 'M', '2007-07-13', '111111111', 'Administración', 8, 0.00, 'rgomez.2841@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(950, 'ttttttttttttt', 'ttttttttttt', '44444444', 'M', '2026-10-14', '44444444', 'Ingeniería Industrial', 8, 0.00, 'rgomez.28413@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(951, 'Estudiante1', 'Prueba1', '30000001', 'M', '2002-04-22', '04120000000', 'Idiomas Modernos', 4, 0.00, 'test_user1@unimar.edu.ve', 'García', 0, 0, NULL),
(952, 'Estudiante2', 'Prueba2', '30000002', 'M', '2007-09-16', '04120000000', 'Contaduría Pública', 11, 0.00, 'test_user2@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(953, 'Estudiante3', 'Prueba3', '30000003', 'M', '2001-11-27', '04120000000', 'Contaduría Pública', 6, 0.00, 'test_user3@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(954, 'Estudiante4', 'Prueba4', '30000004', 'M', '2007-09-14', '04120000000', 'Ingeniería Industrial', 8, 0.00, 'test_user4@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(955, 'Estudiante5', 'Prueba5', '30000005', 'M', '2001-02-11', '04120000000', 'Administración', 6, 0.00, 'test_user5@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(956, 'Estudiante6', 'Prueba6', '30000006', 'M', '2006-09-22', '04120000000', 'Contaduría Pública', 3, 0.00, 'test_user6@unimar.edu.ve', 'García', 0, 0, NULL),
(957, 'Estudiante7', 'Prueba7', '30000007', 'F', '2008-11-23', '04120000000', 'Idiomas Modernos', 1, 0.00, 'test_user7@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(958, 'Estudiante8', 'Prueba8', '30000008', 'M', '2001-06-22', '04120000000', 'Artes mención Diseño Gráfico', 3, 0.00, 'test_user8@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(959, 'Estudiante9', 'Prueba9', '30000009', 'F', '2004-12-28', '04120000000', 'Administración', 1, 0.00, 'test_user9@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(960, 'Estudiante10', 'Prueba10', '30000010', 'F', '2002-04-06', '04120000000', 'Contaduría Pública', 6, 0.00, 'test_user10@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(961, 'Estudiante11', 'Prueba11', '30000011', 'F', '2004-03-23', '04120000000', 'Derecho', 8, 0.00, 'test_user11@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(962, 'Estudiante12', 'Prueba12', '30000012', 'F', '2008-06-09', '04120000000', 'Administración', 8, 0.00, 'test_user12@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(963, 'Estudiante13', 'Prueba13', '30000013', 'M', '2006-01-20', '04120000000', 'Psicología', 9, 0.00, 'test_user13@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(964, 'Estudiante14', 'Prueba14', '30000014', 'F', '2007-06-27', '04120000000', 'Psicología', 10, 0.00, 'test_user14@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(965, 'Estudiante15', 'Prueba15', '30000015', 'F', '2002-01-15', '04120000000', 'Psicología', 9, 0.00, 'test_user15@unimar.edu.ve', 'García', 0, 0, NULL),
(966, 'Estudiante16', 'Prueba16', '30000016', 'M', '2004-09-25', '04120000000', 'Artes mención Diseño Gráfico', 7, 0.00, 'test_user16@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(967, 'Estudiante17', 'Prueba17', '30000017', 'M', '2007-11-08', '04120000000', 'Ingeniería de Sistemas', 12, 0.00, 'test_user17@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(968, 'Estudiante18', 'Prueba18', '30000018', 'M', '2001-01-12', '04120000000', 'Artes mención Diseño Gráfico', 10, 0.00, 'test_user18@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(969, 'Estudiante19', 'Prueba19', '30000019', 'F', '2005-07-24', '04120000000', 'Ingeniería Industrial', 12, 0.00, 'test_user19@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(970, 'Estudiante20', 'Prueba20', '30000020', 'M', '2004-07-05', '04120000000', 'Derecho', 5, 0.00, 'test_user20@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(971, 'Estudiante21', 'Prueba21', '30000021', 'M', '2002-09-12', '04120000000', 'Contaduría Pública', 5, 0.00, 'test_user21@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(972, 'Estudiante22', 'Prueba22', '30000022', 'M', '2008-08-09', '04120000000', 'Idiomas Modernos', 3, 0.00, 'test_user22@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(973, 'Estudiante23', 'Prueba23', '30000023', 'M', '2001-08-25', '04120000000', 'Ingeniería de Sistemas', 12, 0.00, 'test_user23@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(974, 'Estudiante24', 'Prueba24', '30000024', 'F', '2006-06-10', '04120000000', 'Ingeniería Industrial', 2, 0.00, 'test_user24@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(975, 'Estudiante25', 'Prueba25', '30000025', 'M', '2008-07-21', '04120000000', 'Contaduría Pública', 9, 0.00, 'test_user25@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(976, 'Estudiante26', 'Prueba26', '30000026', 'F', '2005-10-13', '04120000000', 'Artes mención Diseño Gráfico', 9, 0.00, 'test_user26@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(977, 'Estudiante27', 'Prueba27', '30000027', 'M', '2004-10-03', '04120000000', 'Derecho', 9, 0.00, 'test_user27@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(978, 'Estudiante28', 'Prueba28', '30000028', 'M', '2002-02-24', '04120000000', 'Ingeniería de Sistemas', 12, 0.00, 'test_user28@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(979, 'Estudiante29', 'Prueba29', '30000029', 'F', '2002-07-07', '04120000000', 'Administración', 11, 0.00, 'test_user29@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(980, 'Estudiante30', 'Prueba30', '30000030', 'F', '2005-09-27', '04120000000', 'Contaduría Pública', 3, 0.00, 'test_user30@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(981, 'Estudiante31', 'Prueba31', '30000031', 'M', '2003-07-03', '04120000000', 'Contaduría Pública', 10, 0.00, 'test_user31@unimar.edu.ve', 'García', 0, 0, NULL),
(982, 'Estudiante32', 'Prueba32', '30000032', 'M', '2003-08-05', '04120000000', 'Ingeniería de Sistemas', 1, 0.00, 'test_user32@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(983, 'Estudiante33', 'Prueba33', '30000033', 'M', '2005-07-03', '04120000000', 'Psicología', 3, 0.00, 'test_user33@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(984, 'Estudiante34', 'Prueba34', '30000034', 'F', '2001-09-24', '04120000000', 'Idiomas Modernos', 4, 0.00, 'test_user34@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(985, 'Estudiante35', 'Prueba35', '30000035', 'M', '2007-12-01', '04120000000', 'Psicología', 5, 0.00, 'test_user35@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(986, 'Estudiante36', 'Prueba36', '30000036', 'F', '2001-12-13', '04120000000', 'Administración', 7, 0.00, 'test_user36@unimar.edu.ve', 'Villalba', 0, 0, NULL),
(987, 'Estudiante37', 'Prueba37', '30000037', 'M', '2007-10-14', '04120000000', 'Derecho', 1, 0.00, 'test_user37@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(988, 'Estudiante38', 'Prueba38', '30000038', 'M', '2001-08-07', '04120000000', 'Contaduría Pública', 4, 0.00, 'test_user38@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(989, 'Estudiante39', 'Prueba39', '30000039', 'F', '2003-11-05', '04120000000', 'Derecho', 10, 0.00, 'test_user39@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(990, 'Estudiante40', 'Prueba40', '30000040', 'M', '2006-03-05', '04120000000', 'Idiomas Modernos', 6, 0.00, 'test_user40@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(991, 'Estudiante41', 'Prueba41', '30000041', 'F', '2008-04-15', '04120000000', 'Idiomas Modernos', 8, 0.00, 'test_user41@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(992, 'Estudiante42', 'Prueba42', '30000042', 'F', '2005-12-11', '04120000000', 'Idiomas Modernos', 12, 0.00, 'test_user42@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(993, 'Estudiante43', 'Prueba43', '30000043', 'M', '2006-04-07', '04120000000', 'Ingeniería Industrial', 1, 0.00, 'test_user43@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(994, 'Estudiante44', 'Prueba44', '30000044', 'M', '2004-12-24', '04120000000', 'Administración', 8, 0.00, 'test_user44@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(995, 'Estudiante45', 'Prueba45', '30000045', 'M', '2008-04-10', '04120000000', 'Psicología', 4, 0.00, 'test_user45@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(996, 'Estudiante46', 'Prueba46', '30000046', 'F', '2002-03-20', '04120000000', 'Artes mención Diseño Gráfico', 6, 0.00, 'test_user46@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(997, 'Estudiante47', 'Prueba47', '30000047', 'M', '2004-10-14', '04120000000', 'Administración', 10, 0.00, 'test_user47@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(998, 'Estudiante48', 'Prueba48', '30000048', 'M', '2003-10-12', '04120000000', 'Ingeniería de Sistemas', 2, 0.00, 'test_user48@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(999, 'Estudiante49', 'Prueba49', '30000049', 'F', '2002-05-24', '04120000000', 'Artes mención Diseño Gráfico', 2, 0.00, 'test_user49@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(1000, 'Estudiante50', 'Prueba50', '30000050', 'F', '2007-09-14', '04120000000', 'Contaduría Pública', 4, 0.00, 'test_user50@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(1001, 'Estudiante51', 'Prueba51', '30000051', 'F', '2008-06-13', '04120000000', 'Ingeniería Industrial', 5, 0.00, 'test_user51@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(1002, 'Estudiante52', 'Prueba52', '30000052', 'F', '2004-11-25', '04120000000', 'Ingeniería de Sistemas', 2, 0.00, 'test_user52@unimar.edu.ve', 'García', 0, 0, NULL),
(1003, 'Estudiante53', 'Prueba53', '30000053', 'M', '2001-10-09', '04120000000', 'Ingeniería Industrial', 11, 0.00, 'test_user53@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(1004, 'Estudiante54', 'Prueba54', '30000054', 'F', '2001-05-01', '04120000000', 'Derecho', 1, 0.00, 'test_user54@unimar.edu.ve', 'García', 0, 0, NULL),
(1005, 'Estudiante55', 'Prueba55', '30000055', 'M', '2005-02-22', '04120000000', 'Ingeniería Industrial', 8, 0.00, 'test_user55@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(1006, 'Estudiante56', 'Prueba56', '30000056', 'F', '2007-07-22', '04120000000', 'Administración', 4, 0.00, 'test_user56@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(1007, 'Estudiante57', 'Prueba57', '30000057', 'M', '2006-10-27', '04120000000', 'Idiomas Modernos', 3, 0.00, 'test_user57@unimar.edu.ve', 'Villalba', 0, 0, NULL),
(1008, 'Estudiante58', 'Prueba58', '30000058', 'F', '2001-01-26', '04120000000', 'Artes mención Diseño Gráfico', 2, 0.00, 'test_user58@unimar.edu.ve', 'García', 0, 0, NULL),
(1009, 'Estudiante59', 'Prueba59', '30000059', 'F', '2004-10-12', '04120000000', 'Idiomas Modernos', 4, 0.00, 'test_user59@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(1010, 'Estudiante60', 'Prueba60', '30000060', 'F', '2002-02-28', '04120000000', 'Contaduría Pública', 11, 0.00, 'test_user60@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(1011, 'Estudiante61', 'Prueba61', '30000061', 'F', '2001-02-16', '04120000000', 'Idiomas Modernos', 3, 0.00, 'test_user61@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1012, 'Estudiante62', 'Prueba62', '30000062', 'F', '2007-12-11', '04120000000', 'Artes mención Diseño Gráfico', 10, 0.00, 'test_user62@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1013, 'Estudiante63', 'Prueba63', '30000063', 'M', '2004-03-21', '04120000000', 'Psicología', 9, 0.00, 'test_user63@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(1014, 'Estudiante64', 'Prueba64', '30000064', 'M', '2003-12-18', '04120000000', 'Derecho', 2, 0.00, 'test_user64@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1015, 'Estudiante65', 'Prueba65', '30000065', 'F', '2004-02-07', '04120000000', 'Artes mención Diseño Gráfico', 11, 0.00, 'test_user65@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(1016, 'Estudiante66', 'Prueba66', '30000066', 'M', '2005-01-04', '04120000000', 'Idiomas Modernos', 11, 0.00, 'test_user66@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1017, 'Estudiante67', 'Prueba67', '30000067', 'M', '2007-01-20', '04120000000', 'Ingeniería Industrial', 7, 0.00, 'test_user67@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(1018, 'Estudiante68', 'Prueba68', '30000068', 'F', '2003-05-27', '04120000000', 'Administración', 4, 0.00, 'test_user68@unimar.edu.ve', 'Villalba', 0, 0, NULL),
(1019, 'Estudiante69', 'Prueba69', '30000069', 'M', '2001-09-18', '04120000000', 'Idiomas Modernos', 2, 0.00, 'test_user69@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(1020, 'Estudiante70', 'Prueba70', '30000070', 'M', '2007-10-01', '04120000000', 'Idiomas Modernos', 8, 0.00, 'test_user70@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(1021, 'Estudiante71', 'Prueba71', '30000071', 'M', '2008-01-14', '04120000000', 'Ingeniería de Sistemas', 5, 0.00, 'test_user71@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(1022, 'Estudiante72', 'Prueba72', '30000072', 'F', '2008-06-10', '04120000000', 'Administración', 5, 0.00, 'test_user72@unimar.edu.ve', 'García', 0, 0, NULL),
(1023, 'Estudiante73', 'Prueba73', '30000073', 'M', '2004-01-03', '04120000000', 'Ingeniería Industrial', 8, 0.00, 'test_user73@unimar.edu.ve', 'Villalba', 0, 0, NULL),
(1024, 'Estudiante74', 'Prueba74', '30000074', 'F', '2002-07-28', '04120000000', 'Ingeniería Industrial', 10, 0.00, 'test_user74@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(1025, 'Estudiante75', 'Prueba75', '30000075', 'F', '2003-12-16', '04120000000', 'Administración', 6, 0.00, 'test_user75@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(1026, 'Estudiante76', 'Prueba76', '30000076', 'F', '2004-06-03', '04120000000', 'Artes mención Diseño Gráfico', 11, 0.00, 'test_user76@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1027, 'Estudiante77', 'Prueba77', '30000077', 'M', '2005-08-23', '04120000000', 'Psicología', 4, 0.00, 'test_user77@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(1028, 'Estudiante78', 'Prueba78', '30000078', 'F', '2008-08-04', '04120000000', 'Ingeniería Industrial', 9, 0.00, 'test_user78@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(1029, 'Estudiante79', 'Prueba79', '30000079', 'M', '2006-05-07', '04120000000', 'Administración', 6, 0.00, 'test_user79@unimar.edu.ve', 'García', 0, 0, NULL),
(1030, 'Estudiante80', 'Prueba80', '30000080', 'F', '2001-05-02', '04120000000', 'Ingeniería de Sistemas', 2, 0.00, 'test_user80@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(1031, 'Estudiante81', 'Prueba81', '30000081', 'F', '2008-03-25', '04120000000', 'Administración', 3, 0.00, 'test_user81@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1032, 'Estudiante82', 'Prueba82', '30000082', 'M', '2004-11-16', '04120000000', 'Ingeniería Industrial', 11, 0.00, 'test_user82@unimar.edu.ve', 'Villalba', 0, 0, NULL),
(1033, 'Estudiante83', 'Prueba83', '30000083', 'F', '2003-10-03', '04120000000', 'Administración', 4, 0.00, 'test_user83@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1034, 'Estudiante84', 'Prueba84', '30000084', 'F', '2008-03-16', '04120000000', 'Ingeniería de Sistemas', 12, 0.00, 'test_user84@unimar.edu.ve', 'Arismendi', 0, 0, NULL),
(1035, 'Estudiante85', 'Prueba85', '30000085', 'F', '2004-09-09', '04120000000', 'Derecho', 4, 0.00, 'test_user85@unimar.edu.ve', 'Tubores', 0, 0, NULL),
(1036, 'Estudiante86', 'Prueba86', '30000086', 'M', '2007-08-24', '04120000000', 'Administración', 5, 0.00, 'test_user86@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(1037, 'Estudiante87', 'Prueba87', '30000087', 'F', '2007-04-24', '04120000000', 'Ingeniería de Sistemas', 9, 0.00, 'test_user87@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(1038, 'Estudiante88', 'Prueba88', '30000088', 'M', '2005-12-10', '04120000000', 'Ingeniería de Sistemas', 10, 0.00, 'test_user88@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1039, 'Estudiante89', 'Prueba89', '30000089', 'M', '2007-11-16', '04120000000', 'Ingeniería Industrial', 1, 0.00, 'test_user89@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1040, 'Estudiante90', 'Prueba90', '30000090', 'F', '2006-11-21', '04120000000', 'Artes mención Diseño Gráfico', 1, 0.00, 'test_user90@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1041, 'Estudiante91', 'Prueba91', '30000091', 'M', '2005-09-01', '04120000000', 'Psicología', 4, 0.00, 'test_user91@unimar.edu.ve', 'García', 0, 0, NULL),
(1042, 'Estudiante92', 'Prueba92', '30000092', 'M', '2005-02-20', '04120000000', 'Psicología', 4, 0.00, 'test_user92@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1043, 'Estudiante93', 'Prueba93', '30000093', 'F', '2007-10-09', '04120000000', 'Contaduría Pública', 8, 0.00, 'test_user93@unimar.edu.ve', 'Maneiro', 0, 0, NULL),
(1044, 'Estudiante94', 'Prueba94', '30000094', 'F', '2008-03-22', '04120000000', 'Psicología', 4, 0.00, 'test_user94@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL),
(1045, 'Estudiante95', 'Prueba95', '30000095', 'M', '2006-04-19', '04120000000', 'Ingeniería de Sistemas', 6, 0.00, 'test_user95@unimar.edu.ve', 'Mariño', 0, 0, NULL),
(1046, 'Estudiante96', 'Prueba96', '30000096', 'F', '2002-02-10', '04120000000', 'Derecho', 11, 0.00, 'test_user96@unimar.edu.ve', 'Marcano', 0, 0, NULL),
(1047, 'Estudiante97', 'Prueba97', '30000097', 'F', '2007-07-28', '04120000000', 'Ingeniería de Sistemas', 12, 0.00, 'test_user97@unimar.edu.ve', 'Díaz', 0, 0, NULL),
(1048, 'Estudiante98', 'Prueba98', '30000098', 'F', '2008-05-13', '04120000000', 'Contaduría Pública', 3, 0.00, 'test_user98@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL),
(1049, 'Estudiante99', 'Prueba99', '30000099', 'F', '2007-05-21', '04120000000', 'Artes mención Diseño Gráfico', 6, 0.00, 'test_user99@unimar.edu.ve', 'García', 0, 0, NULL),
(1050, 'Estudiante100', 'Prueba100', '30000100', 'F', '2001-07-26', '04120000000', 'Psicología', 12, 0.00, 'test_user100@unimar.edu.ve', 'Gómez', 0, 0, NULL),
(1051, 'xzxzx', 'xzxzx', '111111', 'M', '2012-10-10', '1111', 'Ingeniería Industrial', 7, 10.00, 'wwwwwwwwww@unimar.edu.ve', 'Marcano', 0, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('estudiante','admin') DEFAULT 'estudiante',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`) VALUES
(0, 'sistema@unimar.edu.ve', 'SYSTEM_BOT_NO_LOGIN', 'admin', '2026-02-18 18:52:39'),
(1, 'Admin@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'admin', '2026-02-12 05:17:42'),
(10, 'Roy@unimar.edu.ve', '$2b$10$Mf0zMQTBQq5hNSwgy8cL4u9qPM1uzrI84Cgv34ayHSilo4QeukECq', 'estudiante', '2026-02-16 03:15:01'),
(12, 'juan@unimar.edu.ve', '$2b$10$N98KOBodUhts7/9UrB/EQ.uCPispBch2MARnDuHCcjdxJcQH460iC', 'estudiante', '2026-02-21 01:42:00'),
(114, 'mario@unimar.edu.ve', '$2b$10$I61aE0Cgupp8FhhsPcSx1eqVFr1ZMJgzl6Md4LM0txUd921gD7dtK', 'estudiante', '2026-03-04 06:52:03'),
(115, 'roys@unimar.edu.ve', '$2b$10$sgG.L.6OCVv7JI9dxBBwo.hp53LWAyiSfaNHYcZzKt5SU7UPdBa9q', 'estudiante', '2026-08-06 15:53:19'),
(116, 'luis.rodriguez1@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(117, 'andres.gomez2@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(118, 'carlos.flores3@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(119, 'daniela.rodriguez4@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(120, 'carlos.ramirez5@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(121, 'luis.flores6@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(122, 'daniel.flores7@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(123, 'luis.rodriguez8@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(124, 'alejandro.ramirez9@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(125, 'alejandro.hernandez10@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(126, 'sofia.rodriguez11@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(127, 'gabriel.gomez12@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(128, 'mariana.ramirez13@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(129, 'gabriel.flores14@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(130, 'valeria.flores15@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(131, 'maria.flores16@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(132, 'alejandro.diaz17@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(133, 'luis.gomez18@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(134, 'gabriel.vargas19@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(135, 'maria.torres20@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(136, 'miguel.torres21@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(137, 'miguel.diaz22@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(138, 'andres.torres23@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(139, 'gabriela.gomez24@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(140, 'andrea.diaz25@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(141, 'gabriela.ramirez26@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(142, 'victoria.torres27@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(143, 'jose.perez28@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(144, 'miguel.gomez29@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(145, 'gabriel.gomez30@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'estudiante', '2026-08-20 01:26:28'),
(948, 'ro@unimar.edu.ve', '$2b$10$FJBUZ6.QotOyNfbqwAlbIeP/l9uUycDRpkPR8k0jHKgBHRQJ5JJ4G', 'estudiante', '2026-10-12 21:27:17'),
(949, 'rgomez.2841@unimar.edu.ve', '$2b$10$ITrd9x9p5DdHzcSYlsQGoOiNxhPehDea2sgsV924qhTT.HS9KIJUq', 'estudiante', '2026-10-16 01:09:44'),
(950, 'rgomez.28413@unimar.edu.ve', '$2b$10$sZoxCn0Bz3um6Vra4x8pWeXpDwg7DIZ7Ef/nK8ThGjx7lRF/fW/Xu', 'estudiante', '2026-10-16 01:36:14'),
(951, 'test_user1@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(952, 'test_user2@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(953, 'test_user3@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(954, 'test_user4@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(955, 'test_user5@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(956, 'test_user6@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(957, 'test_user7@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(958, 'test_user8@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(959, 'test_user9@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(960, 'test_user10@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(961, 'test_user11@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(962, 'test_user12@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(963, 'test_user13@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(964, 'test_user14@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(965, 'test_user15@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(966, 'test_user16@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(967, 'test_user17@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(968, 'test_user18@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(969, 'test_user19@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(970, 'test_user20@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(971, 'test_user21@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(972, 'test_user22@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(973, 'test_user23@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(974, 'test_user24@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(975, 'test_user25@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(976, 'test_user26@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(977, 'test_user27@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(978, 'test_user28@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(979, 'test_user29@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(980, 'test_user30@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(981, 'test_user31@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(982, 'test_user32@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(983, 'test_user33@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(984, 'test_user34@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(985, 'test_user35@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(986, 'test_user36@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(987, 'test_user37@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(988, 'test_user38@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(989, 'test_user39@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(990, 'test_user40@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(991, 'test_user41@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(992, 'test_user42@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(993, 'test_user43@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(994, 'test_user44@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(995, 'test_user45@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(996, 'test_user46@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(997, 'test_user47@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(998, 'test_user48@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(999, 'test_user49@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1000, 'test_user50@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1001, 'test_user51@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1002, 'test_user52@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1003, 'test_user53@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1004, 'test_user54@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1005, 'test_user55@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1006, 'test_user56@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1007, 'test_user57@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1008, 'test_user58@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1009, 'test_user59@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1010, 'test_user60@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1011, 'test_user61@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1012, 'test_user62@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1013, 'test_user63@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1014, 'test_user64@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1015, 'test_user65@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1016, 'test_user66@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1017, 'test_user67@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1018, 'test_user68@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1019, 'test_user69@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1020, 'test_user70@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1021, 'test_user71@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1022, 'test_user72@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1023, 'test_user73@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1024, 'test_user74@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1025, 'test_user75@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1026, 'test_user76@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1027, 'test_user77@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1028, 'test_user78@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1029, 'test_user79@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1030, 'test_user80@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1031, 'test_user81@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1032, 'test_user82@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1033, 'test_user83@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1034, 'test_user84@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1035, 'test_user85@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1036, 'test_user86@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1037, 'test_user87@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1038, 'test_user88@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1039, 'test_user89@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1040, 'test_user90@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1041, 'test_user91@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1042, 'test_user92@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1043, 'test_user93@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1044, 'test_user94@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1045, 'test_user95@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1046, 'test_user96@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1047, 'test_user97@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1048, 'test_user98@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1049, 'test_user99@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1050, 'test_user100@unimar.edu.ve', '$2b$10$Fr0uiDDz8VaBaJLvCR2Jzur/TyG3sypIMeS3U6jWUvDd5D8U21y86', 'estudiante', '2026-10-16 02:35:32'),
(1051, 'wwwwwwwwww@unimar.edu.ve', '$2b$10$Qf9Glh2qjuO4jjs8r.Ikau.skjJY6sheq5oZN0J4bTN4nvB7lPrFy', 'estudiante', '2026-10-16 05:13:41');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carreras`
--
ALTER TABLE `carreras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_verification_email` (`email`);

--
-- Indices de la tabla `estudios_socioeconomicos`
--
ALTER TABLE `estudios_socioeconomicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unico_por_tipo` (`student_id`,`tipo`),
  ADD UNIQUE KEY `student_id` (`student_id`,`tipo`),
  ADD UNIQUE KEY `unique_estudio_periodo` (`student_id`,`periodo_id`,`tipo`);

--
-- Indices de la tabla `historial_aprobaciones`
--
ALTER TABLE `historial_aprobaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_verificacion` (`token_verificacion`),
  ADD KEY `fk_historial_solicitud` (`solicitud_id`),
  ADD KEY `fk_historial_periodo` (`periodo_id`),
  ADD KEY `fk_historial_admin` (`admin_id`);

--
-- Indices de la tabla `pensum_materias`
--
ALTER TABLE `pensum_materias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carrera_id` (`carrera_id`);

--
-- Indices de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sistema_config`
--
ALTER TABLE `sistema_config`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_periodo_idx` (`user_id`,`periodo_id`),
  ADD KEY `fk_solicitud_periodo` (`periodo_id`);

--
-- Indices de la tabla `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carreras`
--
ALTER TABLE `carreras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `estudios_socioeconomicos`
--
ALTER TABLE `estudios_socioeconomicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=762;

--
-- AUTO_INCREMENT de la tabla `historial_aprobaciones`
--
ALTER TABLE `historial_aprobaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `pensum_materias`
--
ALTER TABLE `pensum_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=697;

--
-- AUTO_INCREMENT de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1166;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1052;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `estudios_socioeconomicos`
--
ALTER TABLE `estudios_socioeconomicos`
  ADD CONSTRAINT `estudios_socioeconomicos_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Filtros para la tabla `historial_aprobaciones`
--
ALTER TABLE `historial_aprobaciones`
  ADD CONSTRAINT `fk_historial_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_historial_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id`),
  ADD CONSTRAINT `fk_historial_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pensum_materias`
--
ALTER TABLE `pensum_materias`
  ADD CONSTRAINT `pensum_materias_ibfk_1` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `fk_solicitud_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id`),
  ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
