-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2026 a las 19:55:49
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `observaciones_solicitante` text DEFAULT NULL COMMENT 'Observaciones declaradas por el solicitante en la encuesta',
  `socio_trabajo_direccion` varchar(255) DEFAULT NULL COMMENT 'Dirección del lugar de trabajo del solicitante',
  `socio_trabajo_telefono` varchar(30) DEFAULT NULL COMMENT 'Teléfono del lugar de trabajo del solicitante',
  `socio_condicion_laboral_tipo` varchar(60) DEFAULT NULL COMMENT 'Comerciante / Economía Informal / Empleado / Otro',
  `socio_condicion_laboral_desc` varchar(255) DEFAULT NULL COMMENT 'Especificación de condición laboral',
  `padre_nacionalidad` varchar(50) DEFAULT NULL,
  `padre_instruccion` varchar(100) DEFAULT NULL,
  `madre_nacionalidad` varchar(50) DEFAULT NULL,
  `madre_instruccion` varchar(100) DEFAULT NULL,
  `familia_estatus_conyugal` varchar(60) DEFAULT NULL COMMENT 'Matrimonio Civil / Concubinato / Separados / Divorciados',
  `familia_hermanos_uni_sn` varchar(10) DEFAULT NULL COMMENT 'Si / No hermanos universitarios',
  `familia_nucleo_json` longtext DEFAULT NULL COMMENT 'Conformación del núcleo familiar (nombre, edad, sexo, parentesco, instrucción, ocupación)',
  `monto_ingreso_rentas` decimal(10,2) DEFAULT 0.00,
  `monto_ingreso_otros` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_suntuarios` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_estudios` decimal(10,2) DEFAULT 0.00,
  `monto_egreso_recreacion` decimal(10,2) DEFAULT 0.00,
  `serv_telefono` varchar(10) DEFAULT 'off',
  `serv_cloacas` varchar(10) DEFAULT 'off',
  `equip_aire` varchar(10) DEFAULT 'off',
  `equip_ventilador` varchar(10) DEFAULT 'off',
  `equip_tv` varchar(10) DEFAULT 'off',
  `equip_cocina` varchar(10) DEFAULT 'off',
  `equip_microondas` varchar(10) DEFAULT 'off',
  `equip_sonido` varchar(10) DEFAULT 'off',
  `equip_computadora` varchar(10) DEFAULT 'off',
  `equip_celular` varchar(10) DEFAULT 'off',
  `familia_problema_sn` varchar(10) DEFAULT NULL,
  `familia_problema_desc` text DEFAULT NULL,
  `organizacion_activa` varchar(100) DEFAULT NULL COMMENT 'Deportiva / Cultural / Vecinal / Religiosa / Ninguna'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudios_socioeconomicos`
--

INSERT INTO `estudios_socioeconomicos` (`id`, `student_id`, `periodo_id`, `tipo`, `evaluador_id`, `socio_lugar_nac`, `socio_nacionalidad`, `socio_estado_civil`, `socio_telf_hab`, `direccion_completa`, `socio_trabajo_empresa`, `socio_trabajo_cargo`, `monto_ingreso_sueldo`, `monto_ingreso_extra`, `monto_ingreso_pension`, `monto_ingreso_ayuda`, `monto_ingreso_familiar`, `socio_ue_procedencia`, `socio_otros_estudios`, `socio_fecha_unimar`, `socio_modalidad`, `padre_nombre`, `padre_edad`, `padre_ocupacion`, `padre_trabajo`, `madre_nombre`, `madre_edad`, `madre_ocupacion`, `madre_trabajo`, `rango_ingreso_familiar`, `vivienda_tipo`, `vivienda_estatus`, `serv_internet`, `familia_num_hermanos`, `familia_hermanos_uni`, `monto_egreso_mercado`, `monto_egreso_vivienda`, `monto_egreso_salud`, `monto_egreso_servicios`, `situacion_laboral_jefe`, `salud_condicion_especial`, `serv_agua`, `serv_gas`, `serv_aseo`, `equip_lavadora`, `equip_nevera`, `serv_luz`, `equip_cable`, `salud_enfermedad_desc`, `salud_tratamiento`, `familia_relacion`, `puntaje`, `nivel_riesgo`, `created_at`, `observaciones_solicitante`, `socio_trabajo_direccion`, `socio_trabajo_telefono`, `socio_condicion_laboral_tipo`, `socio_condicion_laboral_desc`, `padre_nacionalidad`, `padre_instruccion`, `madre_nacionalidad`, `madre_instruccion`, `familia_estatus_conyugal`, `familia_hermanos_uni_sn`, `familia_nucleo_json`, `monto_ingreso_rentas`, `monto_ingreso_otros`, `monto_egreso_suntuarios`, `monto_egreso_estudios`, `monto_egreso_recreacion`, `serv_telefono`, `serv_cloacas`, `equip_aire`, `equip_ventilador`, `equip_tv`, `equip_cocina`, `equip_microondas`, `equip_sonido`, `equip_computadora`, `equip_celular`, `familia_problema_sn`, `familia_problema_desc`, `organizacion_activa`) VALUES
(1046, 1001, 3, 'estudiante', NULL, 'Porlamar Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952622841', 'Urb. Playa El Ángel, Calle 3, Mun. Maneiro', 'Ninguna2', 'presidente', 333.00, 50.00, 0.00, 30.00, 100.00, 'UEP Instituto Nueva Esparta', 'Curso Básico de Inglés Técnico', '2024-01-15', 'P', 'sdsadsad', 40, 'sadssad', 'adsadsad', 'sadsadsadsa', 40, 'dsad', 'sadsads', '1', 'otro estructura', 'otro vivienda', 'off', 3, 1, 100.00, 150.00, 20.00, 200.00, 'Si', 'Si', 'off', 'off', 'off', 'off', 'off', 'on', 'off', 'asma', 'remedio para asma', 'Buena', 64, 'Alto', '2026-11-26 15:47:42', 'ninguna', 'porlamar city', '02952534281', 'Empleado', 'Presidente de ninguna2', 'Venezolano', 'ssssss', 'Venezolano', 'ssssssssss', 'Ninguna', 'Si', '[{\"nombre\":\"Keyris andrade\",\"edad\":\"22\",\"sexo\":\"F\",\"parentesco\":\"Pareja\",\"instruccion\":\"Bachiller\",\"ocupacion\":\"Trabajadora independiente\"},{\"nombre\":\"julio gomez\",\"edad\":\"70\",\"sexo\":\"M\",\"parentesco\":\"Padre\",\"instruccion\":\"Bachiller\",\"ocupacion\":\"Maestro de obra\"}]', 0.00, 100.00, 45.00, 800.00, 0.00, 'off', 'off', 'off', 'on', 'off', 'off', 'off', 'off', 'off', 'off', 'Si', 'cero convivencia', 'Cultural'),
(1047, 1002, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952929652', 'Sector Díaz, Calle Principal #22', 'NO', 'NO', 0.00, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Curso Básico de Inglés Técnico', '2026-03-24', 'P', 'cvvzxvxzvxzvx', 54, 'cxcxcxcxcxc', 'xcxcxcxzc', 'xcxczxcxzcxcxcx', 45, 'cxcxzcxzcxcxcx', 'xzcxzcxzcxzcxcxzc', '1', 'Casa', 'Residencia', 'off', 0, 0, 0.00, 0.00, 0.00, 0.00, 'No', 'No', 'off', 'on', 'off', 'on', 'off', 'off', 'off', 'NO', 'NO', 'Buena', 0, 'Bajo', '2026-11-25 02:33:11', NULL, 'NO', 'NO', 'No aplica', 'NO', 'Venezolano', 'xcxxcxzcxzc', 'Venezolano', 'xcxzcxzcxc', 'Ninguna', 'No', '[]', 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'on', 'off', 'off', 'off', 'off', 'off', 'on', 'off', 'No', NULL, 'Ninguna'),
(1048, 1003, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952933973', 'Sector García, Calle Principal #23', 'NO', 'NO', 0.00, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Diplomado Introductorio en Gestión Administrativa', '2025-11-24', 'S', 'aaaaaaaaaaaaaaaa', 41, 'fdfdf', 'fdfdf', 'aaaaaaaaaaaaaaaaaaaaa', 41, 'aaaaaaaaaaa', 'dfdfd', '1', 'Casa', 'Propia', 'off', 10, 10, 0.00, 0.00, 0.00, 0.00, 'No', 'No', 'off', 'off', 'on', 'off', 'off', 'off', 'off', 'NO', 'NO', 'Buena', 34, 'Medio', '2026-11-25 03:25:39', NULL, 'NO', 'NO', 'No aplica', 'NO', 'Venezolano', 'fdfdfd', 'Venezolano/a', 'fdfd', 'Matrimonio Civil', 'Si', '[]', 0.00, 1000.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'No', NULL, 'Ninguna'),
(1049, 1004, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Soltero/a', '02952938294', 'Sector Gómez, Calle Principal #24', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Ninguno', '2025-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1050, 1005, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952942615', 'Sector Maneiro, Calle Principal #25', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Certificación en Ofimática y Hojas de Cálculo', '2025-03-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1051, 1006, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952946936', 'Sector Marcano, Calle Principal #26', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Curso Básico de Inglés Técnico', '2024-11-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1052, 1007, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952951257', 'Sector Mariño, Calle Principal #27', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Diplomado Introductorio en Gestión Administrativa', '2024-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1053, 1008, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Extranjero/a', 'Soltero/a', '02952955578', 'Sector Península de Macanao, Calle Principal #28', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Ninguno', '2024-03-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1054, 1009, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Soltero/a', '02952959899', 'Sector Tubores, Calle Principal #29', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Certificación en Ofimática y Hojas de Cálculo', '2023-11-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1055, 1010, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952964220', 'Sector Villalba, Calle Principal #30', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Curso Básico de Inglés Técnico', '2023-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1056, 1011, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952968541', 'Sector Arismendi, Calle Principal #31', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Diplomado Introductorio en Gestión Administrativa', '2026-09-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1057, 1012, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952972862', 'Sector Antolín del Campo, Calle Principal #32', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Ninguno', '2026-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1058, 1013, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952977183', 'Sector Díaz, Calle Principal #33', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Certificación en Ofimática y Hojas de Cálculo', '2026-03-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1059, 1014, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Casado/a', '02952981504', 'Sector García, Calle Principal #34', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Curso Básico de Inglés Técnico', '2025-11-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1060, 1015, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952985825', 'Sector Gómez, Calle Principal #35', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Diplomado Introductorio en Gestión Administrativa', '2025-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1061, 1016, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952990146', 'Sector Maneiro, Calle Principal #36', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Ninguno', '2025-03-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1062, 1017, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Extranjero/a', 'Soltero/a', '02952994467', 'Sector Marcano, Calle Principal #37', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Certificación en Ofimática y Hojas de Cálculo', '2024-11-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1063, 1018, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952998788', 'Sector Mariño, Calle Principal #38', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Curso Básico de Inglés Técnico', '2024-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1064, 1019, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Concubinato', '02952603110', 'Sector Península de Macanao, Calle Principal #39', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Diplomado Introductorio en Gestión Administrativa', '2024-03-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1065, 1020, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952607431', 'Sector Tubores, Calle Principal #40', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Ninguno', '2023-11-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1066, 1021, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952611752', 'Sector Villalba, Calle Principal #41', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Certificación en Ofimática y Hojas de Cálculo', '2023-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1067, 1022, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952616073', 'Sector Arismendi, Calle Principal #42', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Curso Básico de Inglés Técnico', '2026-09-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1068, 1023, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952620394', 'Sector Antolín del Campo, Calle Principal #43', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Diplomado Introductorio en Gestión Administrativa', '2026-07-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1069, 1024, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Soltero/a', '02952624715', 'Sector Díaz, Calle Principal #44', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Ninguno', '2026-03-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1070, 1025, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952629036', 'Sector García, Calle Principal #45', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Certificación en Ofimática y Hojas de Cálculo', '2025-11-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1071, 1026, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Extranjero/a', 'Casado/a', '02952633357', 'Sector Gómez, Calle Principal #46', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Curso Básico de Inglés Técnico', '2025-07-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1072, 1027, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952637678', 'Sector Maneiro, Calle Principal #47', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Diplomado Introductorio en Gestión Administrativa', '2025-03-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1073, 1028, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952641999', 'Sector Marcano, Calle Principal #48', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Ninguno', '2024-11-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1074, 1029, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Soltero/a', '02952646320', 'Sector Mariño, Calle Principal #49', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Certificación en Ofimática y Hojas de Cálculo', '2024-07-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1075, 1030, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952650641', 'Sector Península de Macanao, Calle Principal #50', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Curso Básico de Inglés Técnico', '2024-03-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1076, 1031, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952654962', 'Sector Tubores, Calle Principal #51', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Diplomado Introductorio en Gestión Administrativa', '2023-11-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1077, 1032, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952659283', 'Sector Villalba, Calle Principal #52', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Ninguno', '2023-07-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1078, 1033, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952663604', 'Sector Arismendi, Calle Principal #53', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Certificación en Ofimática y Hojas de Cálculo', '2026-09-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1079, 1034, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Casado/a', '02952667925', 'Sector Antolín del Campo, Calle Principal #54', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Curso Básico de Inglés Técnico', '2026-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1080, 1035, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Extranjero/a', 'Concubinato', '02952672246', 'Sector Díaz, Calle Principal #55', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Diplomado Introductorio en Gestión Administrativa', '2026-03-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1081, 1036, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952676567', 'Sector García, Calle Principal #56', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Ninguno', '2025-11-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1082, 1037, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952680888', 'Sector Gómez, Calle Principal #57', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Certificación en Ofimática y Hojas de Cálculo', '2025-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1083, 1038, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952685209', 'Sector Maneiro, Calle Principal #58', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Curso Básico de Inglés Técnico', '2025-03-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1084, 1039, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Concubinato', '02952689530', 'Sector Marcano, Calle Principal #59', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Diplomado Introductorio en Gestión Administrativa', '2024-11-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1085, 1040, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952693851', 'Sector Mariño, Calle Principal #60', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Ninguno', '2024-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1086, 1041, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952698172', 'Sector Península de Macanao, Calle Principal #61', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Certificación en Ofimática y Hojas de Cálculo', '2024-03-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1087, 1042, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952702493', 'Sector Tubores, Calle Principal #62', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Curso Básico de Inglés Técnico', '2023-11-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1088, 1043, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952706814', 'Sector Villalba, Calle Principal #63', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Diplomado Introductorio en Gestión Administrativa', '2023-07-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1089, 1044, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Extranjero/a', 'Soltero/a', '02952711135', 'Sector Arismendi, Calle Principal #64', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Ninguno', '2026-09-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1090, 1045, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952715456', 'Sector Antolín del Campo, Calle Principal #65', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Certificación en Ofimática y Hojas de Cálculo', '2026-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1091, 1046, 3, 'estudiante', NULL, 'La Asunción, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952719777', 'Sector Díaz, Calle Principal #66', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.N. Creación Valle Verde', 'Curso Básico de Inglés Técnico', '2026-03-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1092, 1047, 3, 'estudiante', NULL, 'Juan Griego, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952724098', 'Sector García, Calle Principal #67', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Dr. Francisco Antonio Rísquez', 'Diplomado Introductorio en Gestión Administrativa', '2025-11-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1093, 1048, 3, 'estudiante', NULL, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952728419', 'Sector Gómez, Calle Principal #68', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Ninguno', '2025-07-24', 'S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1094, 1049, 3, 'estudiante', NULL, 'Caracas, Distrito Capital', 'Venezolano/a', 'Soltero/a', '02952732740', 'Sector Maneiro, Calle Principal #69', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E.P. Instituto Nueva Esparta', 'Certificación en Ofimática y Hojas de Cálculo', '2025-03-24', 'V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1095, 1050, 3, 'estudiante', NULL, 'Porlamar, Nueva Esparta', 'Venezolano/a', 'Casado/a', '02952737061', 'Sector Marcano, Calle Principal #70', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Virgen del Valle', 'Curso Básico de Inglés Técnico', '2024-11-24', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-24 19:44:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1132, 1003, 3, 'administrador', 1, 'Pampatar, Nueva Esparta', 'Venezolano/a', 'Concubinato', '02952933973', 'Sector García, Calle Principal #23', 'NO', 'NO', 0.00, 0.00, 0.00, 0.00, 0.00, 'U.E. Colegio Guayamurí', 'Diplomado Introductorio en Gestión Administrativa', '0000-00-00', 'S', 'aaaaaaaaaaaaaaaa', 41, 'fdfdf', 'fdfdf', 'aaaaaaaaaaaaaaaaaaaaa', 41, 'aaaaaaaaaaa', 'dfdfd', '1', 'Casa', 'Propia', 'off', 10, 10, 0.00, 0.00, 0.00, 0.00, 'No', 'No', 'off', 'off', 'on', 'off', 'off', 'off', 'off', 'NO', 'NO', 'Buena', 34, 'Medio', '2026-11-25 03:36:50', 'No', 'NO', 'NO', 'No aplica', 'NO', 'Venezolano', 'fdfdfd', 'Venezolano/a', 'fdfd', 'Matrimonio Civil', 'Si', '[]', 0.00, 1000.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'No', 'No', 'Ninguna'),
(1133, 1001, 3, 'administrador', 1, 'Porlamar Nueva Esparta', 'Venezolano/a', 'Soltero/a', '02952622841', 'Urb. Playa El Ángel, Calle 3, Mun. Maneiro', 'Ninguna2', 'presidente', 333.00, 50.00, 0.00, 30.00, 100.00, 'UEP Instituto Nueva Esparta', 'Curso Básico de Inglés Técnico', '0000-00-00', 'P', 'sdsadsad', 40, 'sadssad', 'adsadsad', 'sadsadsadsa', 40, 'dsad', 'sadsads', '1', 'otro estructura', 'otro vivienda', 'off', 3, 1, 100.00, 150.00, 20.00, 200.00, 'Si', 'Si', 'off', 'off', 'off', 'off', 'off', 'on', 'off', 'asma', 'remedio para asma', 'Buena', 64, 'Alto', '2026-11-25 16:58:45', 'ninguna', 'porlamar city', '02952534281', 'Empleado', 'Presidente de ninguna2', 'Venezolano', 'ssssss', 'Venezolano', 'ssssssssss', 'Ninguna', 'Si', '[{\"nombre\":\"Keyris andrade\",\"edad\":\"22\",\"sexo\":\"F\",\"parentesco\":\"Pareja\",\"instruccion\":\"Bachiller\",\"ocupacion\":\"Trabajadora independiente\"},{\"nombre\":\"julio gomez\",\"edad\":\"70\",\"sexo\":\"M\",\"parentesco\":\"Padre\",\"instruccion\":\"Bachiller\",\"ocupacion\":\"Maestro de obra\"}]', 0.00, 100.00, 45.00, 800.00, 0.00, 'off', 'off', 'off', 'on', 'off', 'off', 'off', 'off', 'off', 'off', 'Si', 'cero convivencia', 'Cultural'),
(1236, 1178, 3, 'estudiante', NULL, 'Cumaná, Sucre', 'Venezolano/a', 'Soltero/a', '02952605362', 'Av. Bolívar, Residencias El Morro, Mun. Gómez', NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 'ffffffffffffffffffff', 'Certificación en Ofimática y Hojas de Cálculo', '2026-05-19', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'off', NULL, NULL, 0.00, 0.00, 0.00, 0.00, NULL, NULL, 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL, 0, 'Bajo', '2026-11-26 15:51:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1371, 1303, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1372, 1304, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1373, 1305, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1374, 1306, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1375, 1307, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1376, 1308, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1377, 1309, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1378, 1310, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1379, 1311, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1380, 1312, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1381, 1313, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1382, 1314, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1383, 1315, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1384, 1316, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL);
INSERT INTO `estudios_socioeconomicos` (`id`, `student_id`, `periodo_id`, `tipo`, `evaluador_id`, `socio_lugar_nac`, `socio_nacionalidad`, `socio_estado_civil`, `socio_telf_hab`, `direccion_completa`, `socio_trabajo_empresa`, `socio_trabajo_cargo`, `monto_ingreso_sueldo`, `monto_ingreso_extra`, `monto_ingreso_pension`, `monto_ingreso_ayuda`, `monto_ingreso_familiar`, `socio_ue_procedencia`, `socio_otros_estudios`, `socio_fecha_unimar`, `socio_modalidad`, `padre_nombre`, `padre_edad`, `padre_ocupacion`, `padre_trabajo`, `madre_nombre`, `madre_edad`, `madre_ocupacion`, `madre_trabajo`, `rango_ingreso_familiar`, `vivienda_tipo`, `vivienda_estatus`, `serv_internet`, `familia_num_hermanos`, `familia_hermanos_uni`, `monto_egreso_mercado`, `monto_egreso_vivienda`, `monto_egreso_salud`, `monto_egreso_servicios`, `situacion_laboral_jefe`, `salud_condicion_especial`, `serv_agua`, `serv_gas`, `serv_aseo`, `equip_lavadora`, `equip_nevera`, `serv_luz`, `equip_cable`, `salud_enfermedad_desc`, `salud_tratamiento`, `familia_relacion`, `puntaje`, `nivel_riesgo`, `created_at`, `observaciones_solicitante`, `socio_trabajo_direccion`, `socio_trabajo_telefono`, `socio_condicion_laboral_tipo`, `socio_condicion_laboral_desc`, `padre_nacionalidad`, `padre_instruccion`, `madre_nacionalidad`, `madre_instruccion`, `familia_estatus_conyugal`, `familia_hermanos_uni_sn`, `familia_nucleo_json`, `monto_ingreso_rentas`, `monto_ingreso_otros`, `monto_egreso_suntuarios`, `monto_egreso_estudios`, `monto_egreso_recreacion`, `serv_telefono`, `serv_cloacas`, `equip_aire`, `equip_ventilador`, `equip_tv`, `equip_cocina`, `equip_microondas`, `equip_sonido`, `equip_computadora`, `equip_celular`, `familia_problema_sn`, `familia_problema_desc`, `organizacion_activa`) VALUES
(1385, 1317, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1386, 1318, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1387, 1319, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1388, 1320, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1389, 1321, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1390, 1322, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1391, 1323, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1392, 1324, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1393, 1325, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1394, 1326, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1395, 1327, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1396, 1328, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1397, 1329, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1398, 1330, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1399, 1331, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1400, 1332, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1401, 1333, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1402, 1334, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1403, 1335, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1404, 1336, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1405, 1337, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1406, 1338, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1407, 1339, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1408, 1340, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1409, 1341, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1410, 1342, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1411, 1343, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1412, 1344, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1413, 1345, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1414, 1346, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1415, 1347, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1416, 1348, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1417, 1349, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1418, 1350, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1419, 1351, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1420, 1352, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1421, 1353, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1422, 1354, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1423, 1355, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1424, 1356, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1425, 1357, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1426, 1358, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1427, 1359, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1428, 1360, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1429, 1361, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1430, 1362, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1431, 1363, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1432, 1364, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1433, 1365, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1434, 1366, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1435, 1367, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1436, 1368, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1437, 1369, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1438, 1370, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1439, 1371, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1440, 1372, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1441, 1373, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1442, 1374, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1443, 1375, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1444, 1376, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1445, 1377, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1446, 1378, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1447, 1379, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1448, 1380, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1449, 1381, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1450, 1382, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL);
INSERT INTO `estudios_socioeconomicos` (`id`, `student_id`, `periodo_id`, `tipo`, `evaluador_id`, `socio_lugar_nac`, `socio_nacionalidad`, `socio_estado_civil`, `socio_telf_hab`, `direccion_completa`, `socio_trabajo_empresa`, `socio_trabajo_cargo`, `monto_ingreso_sueldo`, `monto_ingreso_extra`, `monto_ingreso_pension`, `monto_ingreso_ayuda`, `monto_ingreso_familiar`, `socio_ue_procedencia`, `socio_otros_estudios`, `socio_fecha_unimar`, `socio_modalidad`, `padre_nombre`, `padre_edad`, `padre_ocupacion`, `padre_trabajo`, `madre_nombre`, `madre_edad`, `madre_ocupacion`, `madre_trabajo`, `rango_ingreso_familiar`, `vivienda_tipo`, `vivienda_estatus`, `serv_internet`, `familia_num_hermanos`, `familia_hermanos_uni`, `monto_egreso_mercado`, `monto_egreso_vivienda`, `monto_egreso_salud`, `monto_egreso_servicios`, `situacion_laboral_jefe`, `salud_condicion_especial`, `serv_agua`, `serv_gas`, `serv_aseo`, `equip_lavadora`, `equip_nevera`, `serv_luz`, `equip_cable`, `salud_enfermedad_desc`, `salud_tratamiento`, `familia_relacion`, `puntaje`, `nivel_riesgo`, `created_at`, `observaciones_solicitante`, `socio_trabajo_direccion`, `socio_trabajo_telefono`, `socio_condicion_laboral_tipo`, `socio_condicion_laboral_desc`, `padre_nacionalidad`, `padre_instruccion`, `madre_nacionalidad`, `madre_instruccion`, `familia_estatus_conyugal`, `familia_hermanos_uni_sn`, `familia_nucleo_json`, `monto_ingreso_rentas`, `monto_ingreso_otros`, `monto_egreso_suntuarios`, `monto_egreso_estudios`, `monto_egreso_recreacion`, `serv_telefono`, `serv_cloacas`, `equip_aire`, `equip_ventilador`, `equip_tv`, `equip_cocina`, `equip_microondas`, `equip_sonido`, `equip_computadora`, `equip_celular`, `familia_problema_sn`, `familia_problema_desc`, `organizacion_activa`) VALUES
(1451, 1383, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1452, 1384, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1453, 1385, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1454, 1386, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1455, 1387, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1456, 1388, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1457, 1389, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1458, 1390, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1459, 1391, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1460, 1392, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1461, 1393, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1462, 1394, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1463, 1395, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1464, 1396, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1465, 1397, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1466, 1398, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1467, 1399, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1468, 1400, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1469, 1401, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL),
(1470, 1402, 3, 'estudiante', NULL, 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo', '2026-11-26 17:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'off', NULL, NULL, NULL);

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

--
-- Volcado de datos para la tabla `historial_aprobaciones`
--

INSERT INTO `historial_aprobaciones` (`id`, `solicitud_id`, `user_id`, `periodo_id`, `admin_id`, `promedio_ciclo`, `trimestre`, `puntaje_baremo_`, `nivel_riesgo`, `tipo_beca_snapshot`, `estatus_previo`, `estatus_nuevo`, `observacion_admin`, `materias_snapshot_json`, `indice_global_snapshot`, `fecha_aprobacion`, `token_verificacion`, `ip_accion`) VALUES
(108, 1294, 1178, 3, 1, 18.50, 1, 0, 'Bajo', 'BECA SOCIAL APRENDIZAJE', 'Concurso Anual', 'Aprobada', 'Concurso Anual Beca Social Aprendizaje (Art. 6): prueba concurso social | Plantel: ffffffffffffffffffff | Prom. Bachillerato: 18.50 pts.', '{\"trimestre\":1,\"materias\":[],\"fecha_proceso\":\"2026-11-26T15:51:16.651Z\",\"origen_concurso_social\":true,\"promedio_bachillerato\":18.5}', 18.50, '2026-11-26 15:51:16', '4e3da39b-7129-4b29-b692-b4cc7d6ce275', '127.0.0.1'),
(117, 1281, 1001, 13, 0, 16.80, 12, 64, 'Alto', 'AYUDA ECONÓMICA A TRABAJADORES', 'Pendiente', 'Pendiente', 'Actualización automática de notas del Trimestre 11 (promedio 16.80 pts) para lista de espera en el periodo vigente.', '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ECP1104341\",\"nombre\":\"EVALUACIÓN Y CONTROL DE PROYECTOS\",\"creditos\":3,\"nota\":16},{\"codigo\":\"ELP1104301\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17},{\"codigo\":\"INT1105341\",\"nombre\":\"INTRODUCCIÓN A LAS TELECOMUNICACIONES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"PRP1107441\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16},{\"codigo\":\"TRI1106341\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17}],\"fecha_proceso\":\"2026-11-26T15:54:32.592Z\"}', 15.84, '2026-11-26 15:54:32', '2f03bdec-7a06-45b6-8640-b95cf0408b71', '127.0.0.1'),
(130, 1311, 1178, 13, 0, 18.57, 2, 0, 'Bajo', 'BECA SOCIAL APRENDIZAJE', 'Aprobada', 'Aprobada', 'Renovación automática aprobada (Trimestre 1): promedio trimestral de 18.57 pts cumple el mínimo reglamentario de 16.00 pts para BECA SOCIAL APRENDIZAJE con todas las asignaturas aprobadas.', '{\"trimestre\":1,\"materias\":[{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":18},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":19},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":20},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":18},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":18}],\"fecha_proceso\":\"2026-11-26T15:54:32.975Z\"}', 18.57, '2026-11-26 15:54:32', 'c7b9bac2-4e71-4b83-8d85-92706a5e8a38', '127.0.0.1'),
(141, 1281, 1001, 3, 1, 16.80, 12, 64, 'Alto', 'AYUDA ECONÓMICA A TRABAJADORES', 'Pendiente', 'Convocado a Entrevista', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ECP1104341\",\"nombre\":\"EVALUACIÓN Y CONTROL DE PROYECTOS\",\"creditos\":3,\"nota\":16},{\"codigo\":\"ELP1104301\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17},{\"codigo\":\"INT1105341\",\"nombre\":\"INTRODUCCIÓN A LAS TELECOMUNICACIONES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"PRP1107441\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16},{\"codigo\":\"TRI1106341\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17}],\"fecha_proceso\":\"2026-11-26T15:54:32.592Z\"}', 15.84, '2026-11-26 16:15:02', 'd5ed3bce-1cdd-4380-93a1-7c3f3d205281', '127.0.0.1'),
(142, 1281, 1001, 3, 1, 16.80, 12, 64, 'Alto', 'AYUDA ECONÓMICA A TRABAJADORES', 'Convocado a Entrevista', 'En Revisión', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ECP1104341\",\"nombre\":\"EVALUACIÓN Y CONTROL DE PROYECTOS\",\"creditos\":3,\"nota\":16},{\"codigo\":\"ELP1104301\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17},{\"codigo\":\"INT1105341\",\"nombre\":\"INTRODUCCIÓN A LAS TELECOMUNICACIONES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"PRP1107441\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16},{\"codigo\":\"TRI1106341\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17}],\"fecha_proceso\":\"2026-11-26T15:54:32.592Z\"}', 15.84, '2026-11-26 16:15:07', '184ca21b-1a3b-484d-91cb-595d531baaf8', '127.0.0.1');

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
(3, '2026-III', 'Periodo III 2026 (Sep-Dic)', '2026-09-01', '2026-12-31', 1, '2026-09-15'),
(13, '2027-I', 'Periodo I 2027 (Ene-Abr)', '2027-01-01', '2027-04-30', 0, '2027-01-15'),
(14, '2027-II', 'Periodo II 2027 (May-Ago)', '2027-05-01', '2027-08-31', 0, '2027-05-15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `record_academico`
--

CREATE TABLE `record_academico` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `pensum_materia_id` int(11) NOT NULL,
  `trimestre_cursado` int(11) NOT NULL,
  `codigo_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(150) NOT NULL,
  `unidades_credito` int(11) NOT NULL DEFAULT 3,
  `nota` decimal(4,2) NOT NULL CHECK (`nota` >= 0.00 and `nota` <= 20.00),
  `aprobada` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `record_academico`
--

INSERT INTO `record_academico` (`id`, `student_id`, `pensum_materia_id`, `trimestre_cursado`, `codigo_materia`, `nombre_materia`, `unidades_credito`, `nota`, `aprobada`, `created_at`) VALUES
(4532, 1001, 7, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1, 16.00, 1, '2026-11-25 22:18:31'),
(4533, 1001, 2, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4534, 1001, 1, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4535, 1001, 4, 1, 'IG0104341', 'INTRODUCCIÓN A LA INGENIERÍA DE SISTEMAS', 3, 6.00, 0, '2026-11-25 22:18:31'),
(4536, 1001, 5, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4537, 1001, 6, 1, 'ITI0104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4538, 1001, 3, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4539, 1001, 11, 2, 'ALD0204341', 'ÁLGEBRA DISCRETA', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4540, 1001, 9, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4541, 1001, 12, 2, 'DIB0203141', 'DIBUJO I', 1, 16.00, 1, '2026-11-25 22:18:31'),
(4542, 1001, 13, 2, 'GEA0205341', 'GEOMETRÍA ANALÍTICA', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4543, 1001, 8, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4544, 1001, 10, 2, 'MAT0205341', 'MATEMÁTICA I', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4545, 1001, 14, 2, 'QUG0205341', 'QUÍMICA GENERAL', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4546, 1001, 120, 3, 'ESH0302201', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2, 13.00, 1, '2026-11-25 22:18:31'),
(4547, 1001, 16, 3, 'FIS0304341', 'FÍSICA I', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4548, 1001, 17, 3, 'INI0304341', 'INGLÉS INSTRUMENTAL I', 3, 19.00, 1, '2026-11-25 22:18:31'),
(4549, 1001, 19, 3, 'LQU0303141', 'LABORATORIO DE QUÍMICA GENERAL', 1, 17.00, 1, '2026-11-25 22:18:31'),
(4550, 1001, 15, 3, 'MAT0305341', 'MATEMÁTICA II', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4551, 1001, 18, 3, 'TEP0304341', 'TÉCNICAS DE PROGRAMACIÓN', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4552, 1001, 121, 4, 'ESH0402201', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2, 18.00, 1, '2026-11-25 22:18:31'),
(4553, 1001, 20, 4, 'FIS0405341', 'FÍSICA II', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4554, 1001, 22, 4, 'INI0404341', 'INGLÉS INSTRUMENTAL II', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4555, 1001, 24, 4, 'LAF0403141', 'LABORATORIO DE FÍSICA I', 1, 14.00, 1, '2026-11-25 22:18:31'),
(4556, 1001, 21, 4, 'MAT0405341', 'MATEMÁTICA III', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4557, 1001, 23, 4, 'PRO0405341', 'PROGRAMACIÓN I', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4558, 1001, 28, 5, 'CIE0505341', 'CIRCUITOS ELÉCTRICOS', 3, 15.00, 1, '2026-11-25 22:18:31'),
(4559, 1001, 26, 5, 'ESD0504341', 'ESTRUCTURA DE DATOS', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4560, 1001, 30, 5, 'INI0504341', 'INGLÉS INSTRUMENTAL III', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4561, 1001, 25, 5, 'MAT0505341', 'MATEMÁTICA IV', 3, 15.00, 1, '2026-11-25 22:18:31'),
(4562, 1001, 29, 5, 'MER0505341', 'MECÁNICA RACIONAL', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4563, 1001, 27, 5, 'PRO0505341', 'PROGRAMACIÓN II', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4564, 1001, 35, 6, 'ARC0604341', 'ARQUITECTURA DEL COMPUTADOR', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4565, 1001, 34, 6, 'ELE0606341', 'ELECTRÓNICA', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4566, 1001, 122, 6, 'ESH0702201', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2, 18.00, 1, '2026-11-25 22:18:31'),
(4567, 1001, 32, 6, 'ESP0605341', 'ESTADÍSTICA Y PROBABILIDADES', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4568, 1001, 31, 6, 'MAT0605341', 'MATEMÁTICA V', 3, 15.00, 1, '2026-11-25 22:18:31'),
(4569, 1001, 33, 6, 'PRO0605341', 'PROGRAMACIÓN III', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4570, 1001, 38, 7, 'ESA0704341', 'ESTADÍSTICA APLICADA', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4571, 1001, 36, 7, 'PRO0705341', 'PROGRAMACIÓN IV', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4572, 1001, 37, 7, 'SID0705341', 'SISTEMAS DIGITALES', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4573, 1001, 39, 8, 'INV0804341', 'INVESTIGACIÓN DE OPERACIONES', 3, 18.00, 1, '2026-11-25 22:18:31'),
(4574, 1001, 41, 8, 'RED0805341', 'REDES DE DATOS I', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4575, 1001, 40, 8, 'SIS0805341', 'SISTEMAS DE INFORMACIÓN', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4576, 1001, 123, 9, 'ELP0904301', 'ELECTIVA PROFESIONAL 1', 3, 19.00, 1, '2026-11-25 22:18:31'),
(4577, 1001, 46, 9, 'INE0904341', 'INGENIERÍA ECONÓMICA', 3, 14.00, 1, '2026-11-25 22:18:31'),
(4578, 1001, 45, 9, 'MEI0904341', 'METODOLOGÍA DE LA INVESTIGACIÓN', 3, 13.00, 1, '2026-11-25 22:18:31'),
(4579, 1001, 44, 9, 'SIC0905341', 'SISTEMAS DE CONTROLES', 3, 19.00, 1, '2026-11-25 22:18:31'),
(4580, 1001, 43, 9, 'SIG0905341', 'SISTEMAS DE INFORMACIÓN GERENCIAL', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4581, 1001, 42, 9, 'SIO0904341', 'SISTEMAS OPERATIVOS', 3, 15.00, 1, '2026-11-25 22:18:31'),
(4582, 1001, 124, 10, 'ELP1004301', 'ELECTIVA PROFESIONAL 2', 3, 16.00, 1, '2026-11-25 22:18:31'),
(4583, 1001, 47, 10, 'HEG1004341', 'HERRAMIENTAS GERENCIALES', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4584, 1001, 51, 10, 'MDS1004241', 'METODOLOGÍA DE DESARROLLO DE SOFTWARE', 2, 17.00, 1, '2026-11-25 22:18:31'),
(4585, 1001, 49, 10, 'RED1005341', 'REDES DE DATOS II', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4586, 1001, 48, 10, 'SIS1004341', 'SISTEMAS DE SEÑALES', 3, 17.00, 1, '2026-11-25 22:18:31'),
(4587, 1001, 50, 10, 'SMI1004341', 'SEMINARIO METODOLÓGICO DE INVESTIGACIÓN', 3, 15.00, 1, '2026-11-25 22:18:31'),
(5308, 1001, 53, 11, 'ECP1104341', 'EVALUACIÓN Y CONTROL DE PROYECTOS', 3, 16.00, 1, '2026-11-26 15:54:32'),
(5309, 1001, 125, 11, 'ELP1104301', 'ELECTIVA PROFESIONAL 3', 3, 17.00, 1, '2026-11-26 15:54:32'),
(5310, 1001, 54, 11, 'INT1105341', 'INTRODUCCIÓN A LAS TELECOMUNICACIONES', 3, 18.00, 1, '2026-11-26 15:54:32'),
(5311, 1001, 55, 11, 'PRP1107441', 'PRÁCTICA PROFESIONAL', 4, 16.00, 1, '2026-11-26 15:54:32'),
(5312, 1001, 52, 11, 'TRI1106341', 'TRABAJO DE INVESTIGACIÓN I', 3, 17.00, 1, '2026-11-26 15:54:32'),
(5377, 1178, 324, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1, 18.00, 1, '2026-11-26 15:54:32'),
(5378, 1178, 320, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3, 19.00, 1, '2026-11-26 15:54:32'),
(5379, 1178, 319, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3, 20.00, 1, '2026-11-26 15:54:32'),
(5380, 1178, 325, 1, 'ICA0104311', 'INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES', 3, 18.00, 1, '2026-11-26 15:54:32'),
(5381, 1178, 322, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3, 19.00, 1, '2026-11-26 15:54:32'),
(5382, 1178, 323, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3, 18.00, 1, '2026-11-26 15:54:32'),
(5383, 1178, 321, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3, 18.00, 1, '2026-11-26 15:54:32'),
(8717, 1372, 640, 1, 'ADR0102100', 'ACTIVIDADES DEPORTIVAS Y RECREATIVAS', 1, 15.00, 1, '2026-11-26 18:24:40'),
(8718, 1372, 635, 1, 'FOC0104300', 'FORMACIÓN CIUDADANA', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8719, 1372, 634, 1, 'GRL0104300', 'GRAMÁTICA Y LECTURA', 3, 14.00, 1, '2026-11-26 18:24:40'),
(8720, 1372, 638, 1, 'INM0104300', 'INTRODUCCIÓN A LA MATEMÁTICA', 3, 16.00, 1, '2026-11-26 18:24:40'),
(8721, 1372, 637, 1, 'INP0103335', 'INTRODUCCIÓN A LA PSICOLOGÍA', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8722, 1372, 639, 1, 'IT10104300', 'INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN', 3, 19.00, 1, '2026-11-26 18:24:40'),
(8723, 1372, 636, 1, 'TEE0104300', 'TÉCNICAS DE ESTUDIO', 3, 18.00, 1, '2026-11-26 18:24:40'),
(8724, 1372, 642, 2, 'AMS0204300', 'AMBIENTE SOSTENIBLE', 3, 16.00, 1, '2026-11-26 18:24:40'),
(8725, 1372, 641, 2, 'IDR0204300', 'IDENTIDAD REGIONAL', 3, 18.00, 1, '2026-11-26 18:24:40'),
(8726, 1372, 643, 2, 'PSB0204335', 'PSICOBIOLOGÍA', 3, 16.00, 1, '2026-11-26 18:24:40'),
(8727, 1372, 644, 2, 'PSE0204335', 'PSICOLOGÍA EVOLUTIVA I', 3, 14.00, 1, '2026-11-26 18:24:40'),
(8728, 1372, 645, 2, 'PSL0204335', 'PSICOLOGÍA SOCIAL I', 3, 14.00, 1, '2026-11-26 18:24:40'),
(8729, 1372, 646, 2, 'STA0204335', 'SISTEMAS Y TEORÍAS EN PSICOLOGÍA', 3, 19.00, 1, '2026-11-26 18:24:40'),
(8730, 1372, 647, 3, 'ESH0302208', 'ELECTIVA SOCIO-HUMANÍSTICA 1', 2, 17.00, 1, '2026-11-26 18:24:40'),
(8731, 1372, 652, 3, 'EST0304335', 'ESTADÍSTICA I', 3, 16.00, 1, '2026-11-26 18:24:40'),
(8732, 1372, 648, 3, 'NEU0304335', 'NEUROCIENCIAS', 3, 14.00, 1, '2026-11-26 18:24:40'),
(8733, 1372, 651, 3, 'PRO0304335', 'PROCESOS PSICOLÓGICOS BÁSICOS I', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8734, 1372, 649, 3, 'PSE0304335', 'PSICOLOGÍA EVOLUTIVA II', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8735, 1372, 650, 3, 'PSL0304335', 'PSICOLOGÍA SOCIAL II', 3, 17.00, 1, '2026-11-26 18:24:40'),
(8736, 1372, 653, 4, 'ESH0402208', 'ELECTIVA SOCIO-HUMANÍSTICA 2', 2, 8.00, 0, '2026-11-26 18:24:40'),
(8737, 1372, 657, 4, 'EST0404335', 'ESTADÍSTICA II', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8738, 1372, 654, 4, 'LNE0403135', 'LABORATORIO DE NEUROCIENCIAS', 1, 16.00, 1, '2026-11-26 18:24:40'),
(8739, 1372, 658, 4, 'MET0404335', 'METODOLOGÍA DE LA INVESTIGACIÓN I', 3, 15.00, 1, '2026-11-26 18:24:40'),
(8740, 1372, 656, 4, 'PRO0404335', 'PROCESOS PSICOLÓGICOS BÁSICOS II', 3, 17.00, 1, '2026-11-26 18:24:40'),
(8741, 1372, 655, 4, 'PSP0404335', 'PSICOLOGÍA DE LA PERSONALIDAD I', 3, 19.00, 1, '2026-11-26 18:24:40'),
(8742, 1372, 659, 5, 'ESH0502208', 'ELECTIVA SOCIO-HUMANÍSTICA 3', 2, 18.00, 1, '2026-11-26 18:24:40'),
(8743, 1372, 663, 5, 'MET0504335', 'METODOLOGÍA DE LA INVESTIGACIÓN II', 3, 18.00, 1, '2026-11-26 18:24:40'),
(8744, 1372, 661, 5, 'PSF0504335', 'PSICOFISIOLOGÍA', 3, 17.00, 1, '2026-11-26 18:24:40'),
(8745, 1372, 662, 5, 'PSI0504335', 'PSICOMETRÍA I', 3, 13.00, 1, '2026-11-26 18:24:40'),
(8746, 1372, 664, 5, 'PSM0504335', 'PSICOLOGÍA DE LA MOTIVACIÓN Y EMOCIÓN', 3, 17.00, 1, '2026-11-26 18:24:40'),
(8747, 1372, 660, 5, 'PSP0504335', 'PSICOLOGÍA DE LA PERSONALIDAD II', 3, 19.00, 1, '2026-11-26 18:24:40'),
(8748, 1372, 669, 6, 'DIN0604335', 'DINÁMICA DE GRUPOS', 3, 15.00, 1, '2026-11-26 18:24:40'),
(8749, 1372, 667, 6, 'EVA0604335', 'EVALUACIÓN PSICOLÓGICA I', 3, 19.00, 1, '2026-11-26 18:24:40'),
(8750, 1372, 668, 6, 'ORI0604335', 'ORIENTACIÓN PSICOLÓGICA', 3, 18.00, 1, '2026-11-26 18:24:40'),
(8751, 1372, 665, 6, 'PSF0604335', 'PSICOPATOLOGÍA I', 3, 18.00, 1, '2026-11-26 18:24:40'),
(8752, 1372, 666, 6, 'PSI0604335', 'PSICOMETRÍA II', 3, 17.00, 1, '2026-11-26 18:24:40');

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
  `estatus` enum('Pendiente','Convocado a Entrevista','En Revisión','Revisión Especial','Renovacion','Aprobada','Rechazada') DEFAULT 'Pendiente',
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
  `categoria_rechazo` varchar(50) DEFAULT NULL COMMENT 'PROMEDIO_BAJO, INGRESOS_ALTOS, DOCUMENTOS_INCOMPLETOS, etc.',
  `fecha_convocatoria` datetime DEFAULT NULL COMMENT 'Fecha y hora asignada para la entrevista en Bienestar Estudiantil'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`, `fecha_convocatoria`) VALUES
(1281, 1001, 3, 'rgomez.2841@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 16.80, 'sssssssssssssssssssssssssssssssssss', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ECP1104341\",\"nombre\":\"EVALUACIÓN Y CONTROL DE PROYECTOS\",\"creditos\":3,\"nota\":16},{\"codigo\":\"ELP1104301\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17},{\"codigo\":\"INT1105341\",\"nombre\":\"INTRODUCCIÓN A LAS TELECOMUNICACIONES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"PRP1107441\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":16},{\"codigo\":\"TRI1106341\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17}],\"fecha_proceso\":\"2026-11-26T15:54:32.592Z\"}', 'En Revisión', '2026-11-26 15:47:42', '/uploads/1795708062453-Captura_de_pantalla_2026-07-26_162510.png', '/uploads/1795708062453-Captura_de_pantalla_2026-07-26_162510.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-26 12:15:07', NULL, NULL, 1, 100, NULL, NULL),
(1294, 1178, 3, 'rgomez@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 18.50, 'Ingreso por Concurso Anual de Beca Social Aprendizaje — ffffffffffffffffffff.', 'Biblioteca', '{\"trimestre\":1,\"materias\":[],\"fecha_proceso\":\"2026-11-26T15:51:16.651Z\",\"origen_concurso_social\":true,\"promedio_bachillerato\":18.5}', 'Aprobada', '2026-11-26 15:51:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-26 11:51:16', 'Concurso Anual Beca Social Aprendizaje (Art. 6): prueba concurso social | Plantel: ffffffffffffffffffff | Prom. Bachillerato: 18.50 pts.', 1, 100, NULL, NULL),
(1311, 1178, 13, 'rgomez@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 18.57, 'Ingreso por Concurso Anual de Beca Social Aprendizaje — ffffffffffffffffffff.', 'Biblioteca', '{\"trimestre\":1,\"materias\":[{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":18},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":19},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":20},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":18},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":18},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":18}],\"fecha_proceso\":\"2026-11-26T15:54:32.975Z\"}', 'Aprobada', '2026-11-26 15:54:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-26 11:54:32', 'Renovación automática aprobada (Trimestre 1): promedio trimestral de 18.57 pts cumple el mínimo reglamentario de 16.00 pts para BECA SOCIAL APRENDIZAJE con todas las asignaturas aprobadas.', 0, 100, NULL, NULL),
(1473, 1303, 3, 'test_user1@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 14.50, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"PSF0604335\",\"nombre\":\"PSICOPATOLOGÍA I\",\"creditos\":3,\"nota\":11.53},{\"codigo\":\"PSI0604335\",\"nombre\":\"PSICOMETRÍA II\",\"creditos\":3,\"nota\":18.81},{\"codigo\":\"EVA0604335\",\"nombre\":\"EVALUACIÓN PSICOLÓGICA I\",\"creditos\":3,\"nota\":11.07},{\"codigo\":\"ORI0604335\",\"nombre\":\"ORIENTACIÓN PSICOLÓGICA\",\"creditos\":3,\"nota\":19.1},{\"codigo\":\"DIN0604335\",\"nombre\":\"DINÁMICA DE GRUPOS\",\"creditos\":3,\"nota\":12.01}],\"fecha_proceso\":\"2026-11-26T17:07:46.948Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_1.png', '/uploads/mock_cedula_1.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_1.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1474, 1304, 3, 'test_user2@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.20, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":15.02},{\"codigo\":\"ING0304333\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":18.49},{\"codigo\":\"FRA0304333\",\"nombre\":\"FRANCÉS II\",\"creditos\":3,\"nota\":11.74},{\"codigo\":\"LIN0304333\",\"nombre\":\"LINGÜÍSTICA II\",\"creditos\":3,\"nota\":11.67},{\"codigo\":\"CUL0304333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN II\",\"creditos\":3,\"nota\":11.41},{\"codigo\":\"FGE0304333\",\"nombre\":\"FONÉTICA GENERAL\",\"creditos\":3,\"nota\":16.84}],\"fecha_proceso\":\"2026-11-26T17:07:46.955Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_2.png', '/uploads/mock_cedula_2.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1475, 1305, 3, 'test_user3@unimar.edu.ve', 'BECA APRENDIZAJE', 14.91, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":12.49},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":16.14},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":15.14},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":18.46},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":14.41},{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":18.32},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":10.42},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":13.98},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":14.34},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":15.44}],\"fecha_proceso\":\"2026-11-26T17:07:46.960Z\"}', 'Pendiente', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_3.png', '/uploads/mock_cedula_3.png', '/uploads/mock_residencia_3.pdf', '/uploads/mock_manutencion_3.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_3.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1476, 1306, 3, 'test_user4@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.82, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":13.49},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":12.31},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":19.72},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19.84},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":19.96},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":15.42},{\"codigo\":\"ICC0104312\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":10.51},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":10.07},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":16.48},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":12.86},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":13.17},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":19.26},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":11.29},{\"codigo\":\"ICC0104312\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":13.04}],\"fecha_proceso\":\"2026-11-26T17:07:46.962Z\"}', 'Pendiente', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_4.png', '/uploads/mock_cedula_4.png', '/uploads/mock_residencia_4.pdf', '/uploads/mock_manutencion_4.pdf', '/uploads/mock_informe_medico_4.pdf', NULL, NULL, NULL, '/uploads/mock_notas_certificadas_4.pdf', '/uploads/mock_carnet_disc_4.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1477, 1307, 3, 'test_user5@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.71, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"FIS0405342\",\"nombre\":\"FÍSICA II\",\"creditos\":3,\"nota\":10.45},{\"codigo\":\"MAT0405342\",\"nombre\":\"MATEMÁTICA III\",\"creditos\":3,\"nota\":15.03},{\"codigo\":\"ALN0404342\",\"nombre\":\"ALGEBRA LINEAL\",\"creditos\":3,\"nota\":10.29},{\"codigo\":\"ING0404342\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":13.3},{\"codigo\":\"LAF0403142\",\"nombre\":\"LABORATORIO DE FÍSICA I\",\"creditos\":1,\"nota\":16.07},{\"codigo\":\"ESH0402202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":17.12}],\"fecha_proceso\":\"2026-11-26T17:07:46.964Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_5.png', '/uploads/mock_cedula_5.png', '/uploads/mock_residencia_5.pdf', '/uploads/mock_manutencion_5.pdf', '/uploads/mock_informe_medico_5.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_5.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1478, 1308, 3, 'test_user6@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 15.38, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":19.18},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":11.85},{\"codigo\":\"MAT0205342\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":16.79},{\"codigo\":\"QUG0205342\",\"nombre\":\"QUÍMICA GENERAL I\",\"creditos\":3,\"nota\":17.83},{\"codigo\":\"DIB0203142\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":14},{\"codigo\":\"GEA0205342\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":12.62}],\"fecha_proceso\":\"2026-11-26T17:07:46.965Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_6.png', '/uploads/mock_cedula_6.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1479, 1309, 3, 'test_user7@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 15.61, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104308\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":18.05},{\"codigo\":\"TRI1106335\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":14.95},{\"codigo\":\"PPA1107435\",\"nombre\":\"PRÁCTICA PROFESIONAL ADULTO\",\"creditos\":4,\"nota\":15.37},{\"codigo\":\"PSI1104335\",\"nombre\":\"PSICOTERAPIA\",\"creditos\":3,\"nota\":14.06}],\"fecha_proceso\":\"2026-11-26T17:07:46.969Z\"}', 'Rechazada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_7.png', '/uploads/mock_cedula_7.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_7.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1480, 1310, 3, 'test_user8@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 15.95, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"MAT0505342\",\"nombre\":\"MATEMÁTICA IV\",\"creditos\":3,\"nota\":19.3},{\"codigo\":\"FIS0505342\",\"nombre\":\"FÍSICA III\",\"creditos\":3,\"nota\":11.57},{\"codigo\":\"MER0505342\",\"nombre\":\"MECÁNICA RACIONAL I\",\"creditos\":3,\"nota\":17.22},{\"codigo\":\"ING0504342\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":14.69},{\"codigo\":\"LAF0503142\",\"nombre\":\"LABORATORIO DE FÍSICA II\",\"creditos\":1,\"nota\":15.76},{\"codigo\":\"ESH0502202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.17}],\"fecha_proceso\":\"2026-11-26T17:07:46.972Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_8.png', '/uploads/mock_cedula_8.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_8.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1481, 1311, 3, 'test_user9@unimar.edu.ve', 'BECA APRENDIZAJE', 16.00, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":14.17},{\"codigo\":\"NEU0304335\",\"nombre\":\"NEUROCIENCIAS\",\"creditos\":3,\"nota\":16.77},{\"codigo\":\"PSE0304335\",\"nombre\":\"PSICOLOGÍA EVOLUTIVA II\",\"creditos\":3,\"nota\":17.89},{\"codigo\":\"PSL0304335\",\"nombre\":\"PSICOLOGÍA SOCIAL II\",\"creditos\":3,\"nota\":19.3},{\"codigo\":\"PRO0304335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS I\",\"creditos\":3,\"nota\":17.1},{\"codigo\":\"EST0304335\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.76}],\"fecha_proceso\":\"2026-11-26T17:07:46.975Z\"}', 'Pendiente', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_9.png', '/uploads/mock_cedula_9.png', '/uploads/mock_residencia_9.pdf', '/uploads/mock_manutencion_9.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_9.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1482, 1312, 3, 'test_user10@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 14.09, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104304\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":18.3},{\"codigo\":\"ITA1103233\",\"nombre\":\"ITALIANO IV\",\"creditos\":2,\"nota\":11.86},{\"codigo\":\"MGP1106333\",\"nombre\":\"PASANTÍA I / PROYECTO I\",\"creditos\":3,\"nota\":13.27},{\"codigo\":\"INT1104333\",\"nombre\":\"INTERPRETACIÓN II\",\"creditos\":3,\"nota\":12.91}],\"fecha_proceso\":\"2026-11-26T17:07:46.995Z\"}', 'Aprobada', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_10.png', '/uploads/mock_cedula_10.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_10.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1483, 1313, 3, 'test_user11@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 13.51, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"MAT0505341\",\"nombre\":\"MATEMÁTICA IV\",\"creditos\":3,\"nota\":15.41},{\"codigo\":\"ESD0504341\",\"nombre\":\"ESTRUCTURA DE DATOS\",\"creditos\":3,\"nota\":10.19},{\"codigo\":\"PRO0505341\",\"nombre\":\"PROGRAMACIÓN II\",\"creditos\":3,\"nota\":17.97},{\"codigo\":\"CIE0505341\",\"nombre\":\"CIRCUITOS ELÉCTRICOS\",\"creditos\":3,\"nota\":10.9},{\"codigo\":\"MER0505341\",\"nombre\":\"MECÁNICA RACIONAL\",\"creditos\":3,\"nota\":13.41},{\"codigo\":\"INI0504341\",\"nombre\":\"INGLÉS INSTRUMENTAL III\",\"creditos\":3,\"nota\":13.15}],\"fecha_proceso\":\"2026-11-26T17:07:46.996Z\"}', 'En Revisión', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_11.png', '/uploads/mock_cedula_11.png', '/uploads/mock_residencia_11.pdf', '/uploads/mock_manutencion_11.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1484, 1314, 3, 'test_user12@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 14.32, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":18.21},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":13.81},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":12.2},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":10.06},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":17.12},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":15.95},{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":14.45},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":17.06},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":11.77},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":10.6},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":12.58},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":18.06}],\"fecha_proceso\":\"2026-11-26T17:07:46.997Z\"}', 'En Revisión', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_12.png', '/uploads/mock_cedula_12.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_12.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1485, 1315, 3, 'test_user13@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.60, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":14.59},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":15.84},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":17.04},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":18.24},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":18.94},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":17.07},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":16.75},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":10.73},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":10.03},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":16.78}],\"fecha_proceso\":\"2026-11-26T17:07:46.999Z\"}', 'En Revisión', '2026-11-26 17:07:46', '/uploads/mock_foto_carnet_13.png', '/uploads/mock_cedula_13.png', '/uploads/mock_residencia_13.pdf', '/uploads/mock_manutencion_13.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1486, 1316, 3, 'test_user14@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 16.83, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":13.08},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":12.72},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":17.14},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19.98},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":18.6},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":16.5},{\"codigo\":\"HID0104321\",\"nombre\":\"HISTORIA DEL DERECHO\",\"creditos\":3,\"nota\":19.78}],\"fecha_proceso\":\"2026-11-26T17:07:47.000Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_14.png', '/uploads/mock_cedula_14.png', '/uploads/mock_residencia_14.pdf', '/uploads/mock_manutencion_14.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_notas_certificadas_14.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1487, 1317, 3, 'test_user15@unimar.edu.ve', 'AYUDA ECONÓMICA', 15.82, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208433\",\"nombre\":\"TRABAJO DE GRADO / PASANTÍA II\",\"creditos\":4,\"nota\":15.14},{\"codigo\":\"ITA1203233\",\"nombre\":\"ITALIANO V\",\"creditos\":2,\"nota\":15.35},{\"codigo\":\"RDP1203333\",\"nombre\":\"REDACCIÓN Y ESTILO\",\"creditos\":3,\"nota\":16.96}],\"fecha_proceso\":\"2026-11-26T17:07:47.022Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_15.png', '/uploads/mock_cedula_15.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1488, 1318, 3, 'test_user16@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 11.84, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208433\",\"nombre\":\"TRABAJO DE GRADO / PASANTÍA II\",\"creditos\":4,\"nota\":11.23},{\"codigo\":\"ITA1203233\",\"nombre\":\"ITALIANO V\",\"creditos\":2,\"nota\":12.99},{\"codigo\":\"RDP1203333\",\"nombre\":\"REDACCIÓN Y ESTILO\",\"creditos\":3,\"nota\":11.3}],\"fecha_proceso\":\"2026-11-26T17:07:47.027Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_16.png', '/uploads/mock_cedula_16.png', '/uploads/mock_residencia_16.pdf', '/uploads/mock_manutencion_16.pdf', '/uploads/mock_informe_medico_16.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_16.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1489, 1319, 3, 'test_user17@unimar.edu.ve', 'AYUDA ECONÓMICA', 16.72, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":16.84},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":17.44},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":17.65},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":13.35},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":19.3},{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":18.01},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":18.66},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":11.47},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":18.25},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":16.22}],\"fecha_proceso\":\"2026-11-26T17:07:47.030Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_17.png', '/uploads/mock_cedula_17.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1490, 1320, 3, 'test_user18@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 15.14, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"INV0904342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES II\",\"creditos\":3,\"nota\":10.98},{\"codigo\":\"IEM0905342\",\"nombre\":\"INGENIERÍA DE MÉTODOS II\",\"creditos\":3,\"nota\":20},{\"codigo\":\"CPQ0904342\",\"nombre\":\"CONTROL DE PRODUCCIÓN Y CALIDAD I\",\"creditos\":3,\"nota\":12.05},{\"codigo\":\"MEI0904342\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":17.09},{\"codigo\":\"INE0904342\",\"nombre\":\"INGENIERÍA ECONÓMICA\",\"creditos\":3,\"nota\":14.13},{\"codigo\":\"ELP0904302\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":16.59}],\"fecha_proceso\":\"2026-11-26T17:07:47.036Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_18.png', '/uploads/mock_cedula_18.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_18.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1491, 1321, 3, 'test_user19@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.43, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"PSF0804335\",\"nombre\":\"PSICOLOGÍA FAMILIAR\",\"creditos\":3,\"nota\":14.19},{\"codigo\":\"PCO0804335\",\"nombre\":\"PSICOLOGÍA COMUNITARIA\",\"creditos\":3,\"nota\":15.58},{\"codigo\":\"PSI0804335\",\"nombre\":\"PSICOLOGÍA INDUSTRIAL\",\"creditos\":3,\"nota\":14.34},{\"codigo\":\"TEE0804335\",\"nombre\":\"TÉCNICAS DE EXPLORACIÓN PSICOLÓGICA\",\"creditos\":3,\"nota\":16.79},{\"codigo\":\"PSC0804335\",\"nombre\":\"PSICOLOGÍA CLÍNICA\",\"creditos\":3,\"nota\":16.27}],\"fecha_proceso\":\"2026-11-26T17:07:47.038Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_19.png', '/uploads/mock_cedula_19.png', '/uploads/mock_residencia_19.pdf', '/uploads/mock_manutencion_19.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1492, 1322, 3, 'test_user20@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 15.07, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":19.9},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.74},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":12.55},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":11.99},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":14.95},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":19.2},{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":14.46},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":12.47},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.4},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":18.14},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":14.73},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":13.31}],\"fecha_proceso\":\"2026-11-26T17:07:47.041Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_20.png', '/uploads/mock_cedula_20.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_20.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1493, 1323, 3, 'test_user21@unimar.edu.ve', 'AYUDA ECONÓMICA', 15.02, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":18.43},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":17.07},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":14.22},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":13.49},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":12.68},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":10.11},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":14.74},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":15.56},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.9},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":16.46},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":17.31},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":11.3}],\"fecha_proceso\":\"2026-11-26T17:07:47.043Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_21.png', '/uploads/mock_cedula_21.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1494, 1324, 3, 'test_user22@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 15.41, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"PSF0804335\",\"nombre\":\"PSICOLOGÍA FAMILIAR\",\"creditos\":3,\"nota\":19.5},{\"codigo\":\"PCO0804335\",\"nombre\":\"PSICOLOGÍA COMUNITARIA\",\"creditos\":3,\"nota\":12.28},{\"codigo\":\"PSI0804335\",\"nombre\":\"PSICOLOGÍA INDUSTRIAL\",\"creditos\":3,\"nota\":14.41},{\"codigo\":\"TEE0804335\",\"nombre\":\"TÉCNICAS DE EXPLORACIÓN PSICOLÓGICA\",\"creditos\":3,\"nota\":16.32},{\"codigo\":\"PSC0804335\",\"nombre\":\"PSICOLOGÍA CLÍNICA\",\"creditos\":3,\"nota\":14.52}],\"fecha_proceso\":\"2026-11-26T17:07:47.045Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_22.png', '/uploads/mock_cedula_22.png', '/uploads/mock_residencia_22.pdf', '/uploads/mock_manutencion_22.pdf', '/uploads/mock_informe_medico_22.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_22.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1495, 1325, 3, 'test_user23@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.20, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":13.13},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":10.19},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":17.28},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":18.73},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":16.71},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":18.16},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":19.09},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":12},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":14.28},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":10.21},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":10.28},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":10.33}],\"fecha_proceso\":\"2026-11-26T17:07:47.047Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_23.png', '/uploads/mock_cedula_23.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1496, 1326, 3, 'test_user24@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 13.95, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":12.7},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":12.54},{\"codigo\":\"MAT0205342\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":16.29},{\"codigo\":\"QUG0205342\",\"nombre\":\"QUÍMICA GENERAL I\",\"creditos\":3,\"nota\":17.05},{\"codigo\":\"DIB0203142\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":13.04},{\"codigo\":\"GEA0205342\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":12.1}],\"fecha_proceso\":\"2026-11-26T17:07:47.049Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_24.png', '/uploads/mock_cedula_24.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_24.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1497, 1327, 3, 'test_user25@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 15.74, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"CEL0104300\",\"nombre\":\"COMPRENSIÓN Y EXPRESIÓN LINGÜÍSTICA\",\"creditos\":3,\"nota\":17.02},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":18.91},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":16.78},{\"codigo\":\"INI0104300\",\"nombre\":\"INTRODUCCIÓN A LA INGENIERÍA INDUSTRIAL\",\"creditos\":3,\"nota\":14.13},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":11.29},{\"codigo\":\"ITI0104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":12.92},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":19.16}],\"fecha_proceso\":\"2026-11-26T17:07:47.051Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_25.png', '/uploads/mock_cedula_25.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_25.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1498, 1328, 3, 'test_user26@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 18.29, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":19.48},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":18.84},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":18.81},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19.9},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":19.61},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":13.77},{\"codigo\":\"IIM0103333\",\"nombre\":\"INTRODUCCIÓN A LOS IDIOMAS MODERNOS\",\"creditos\":3,\"nota\":17.61}],\"fecha_proceso\":\"2026-11-26T17:07:47.053Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_26.png', '/uploads/mock_cedula_26.png', '/uploads/mock_residencia_26.pdf', '/uploads/mock_manutencion_26.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_notas_certificadas_26.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1499, 1329, 3, 'test_user27@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.35, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"PSF0704335\",\"nombre\":\"PSICOPATOLOGÍA II\",\"creditos\":3,\"nota\":16.36},{\"codigo\":\"EVA0704335\",\"nombre\":\"EVALUACIÓN PSICOLÓGICA II\",\"creditos\":3,\"nota\":13.83},{\"codigo\":\"MOD0704335\",\"nombre\":\"MODIFICACIÓN DE CONDUCTA\",\"creditos\":3,\"nota\":11.51},{\"codigo\":\"PSI0704335\",\"nombre\":\"PSICOLOGÍA INSTITUCIONAL\",\"creditos\":3,\"nota\":19.84},{\"codigo\":\"ENT0704335\",\"nombre\":\"ENTREVISTA PSICOLÓGICA\",\"creditos\":3,\"nota\":10.19}],\"fecha_proceso\":\"2026-11-26T17:07:47.055Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_27.png', '/uploads/mock_cedula_27.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1500, 1330, 3, 'test_user28@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 13.93, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":12.66},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":15.76},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":18.29},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":10.84},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":14.08},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":12},{\"codigo\":\"IIM0103333\",\"nombre\":\"INTRODUCCIÓN A LOS IDIOMAS MODERNOS\",\"creditos\":3,\"nota\":13.91}],\"fecha_proceso\":\"2026-11-26T17:07:47.058Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_28.png', '/uploads/mock_cedula_28.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_28.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1501, 1331, 3, 'test_user29@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 13.16, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"PSF0704335\",\"nombre\":\"PSICOPATOLOGÍA II\",\"creditos\":3,\"nota\":13.21},{\"codigo\":\"EVA0704335\",\"nombre\":\"EVALUACIÓN PSICOLÓGICA II\",\"creditos\":3,\"nota\":13.12},{\"codigo\":\"MOD0704335\",\"nombre\":\"MODIFICACIÓN DE CONDUCTA\",\"creditos\":3,\"nota\":12.06},{\"codigo\":\"PSI0704335\",\"nombre\":\"PSICOLOGÍA INSTITUCIONAL\",\"creditos\":3,\"nota\":10.01},{\"codigo\":\"ENT0704335\",\"nombre\":\"ENTREVISTA PSICOLÓGICA\",\"creditos\":3,\"nota\":17.41}],\"fecha_proceso\":\"2026-11-26T17:07:47.061Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_29.png', '/uploads/mock_cedula_29.png', '/uploads/mock_residencia_29.pdf', '/uploads/mock_manutencion_29.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1502, 1332, 3, 'test_user30@unimar.edu.ve', 'BECA APRENDIZAJE', 16.91, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"HEG1004341\",\"nombre\":\"HERRAMIENTAS GERENCIALES\",\"creditos\":3,\"nota\":19.25},{\"codigo\":\"SIS1004341\",\"nombre\":\"SISTEMAS DE SEÑALES\",\"creditos\":3,\"nota\":11.24},{\"codigo\":\"RED1005341\",\"nombre\":\"REDES DE DATOS II\",\"creditos\":3,\"nota\":15.63},{\"codigo\":\"SMI1004341\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":19},{\"codigo\":\"MDS1004241\",\"nombre\":\"METODOLOGÍA DE DESARROLLO DE SOFTWARE\",\"creditos\":2,\"nota\":18.38},{\"codigo\":\"ELP1004301\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":17.96}],\"fecha_proceso\":\"2026-11-26T17:07:47.062Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_30.png', '/uploads/mock_cedula_30.png', '/uploads/mock_residencia_30.pdf', '/uploads/mock_manutencion_30.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_30.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1503, 1333, 3, 'test_user31@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 13.38, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ING0605333\",\"nombre\":\"INGLÉS V\",\"creditos\":3,\"nota\":13.82},{\"codigo\":\"FRA0605333\",\"nombre\":\"FRANCÉS V\",\"creditos\":3,\"nota\":15.69},{\"codigo\":\"LIN0604333\",\"nombre\":\"LINGÜÍSTICA APLICADA\",\"creditos\":3,\"nota\":11.25},{\"codigo\":\"TRD0604333\",\"nombre\":\"TEORÍA DE LA TRADUCCIÓN\",\"creditos\":3,\"nota\":10.75},{\"codigo\":\"LIT0604333\",\"nombre\":\"LITERATURA ANGLÓFONA\",\"creditos\":3,\"nota\":15.4}],\"fecha_proceso\":\"2026-11-26T17:07:47.064Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_31.png', '/uploads/mock_cedula_31.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_31.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1504, 1334, 3, 'test_user32@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 17.01, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104304\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.75},{\"codigo\":\"ITA1103233\",\"nombre\":\"ITALIANO IV\",\"creditos\":2,\"nota\":18.63},{\"codigo\":\"MGP1106333\",\"nombre\":\"PASANTÍA I / PROYECTO I\",\"creditos\":3,\"nota\":19.12},{\"codigo\":\"INT1104333\",\"nombre\":\"INTERPRETACIÓN II\",\"creditos\":3,\"nota\":18.54}],\"fecha_proceso\":\"2026-11-26T17:07:47.066Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_32.png', '/uploads/mock_cedula_32.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_32.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1505, 1335, 3, 'test_user33@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.56, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104303\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":17.81},{\"codigo\":\"TRI1106332\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":12.28},{\"codigo\":\"PRP1107432\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":10.59}],\"fecha_proceso\":\"2026-11-26T17:07:47.067Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_33.png', '/uploads/mock_cedula_33.png', '/uploads/mock_residencia_33.pdf', '/uploads/mock_manutencion_33.pdf', '/uploads/mock_informe_medico_33.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_33.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1506, 1336, 3, 'test_user34@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 12.80, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208412\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":13.45},{\"codigo\":\"PAS1203312\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":16.25},{\"codigo\":\"DEO1203312\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":10.4},{\"codigo\":\"TRI1208412\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":10.14},{\"codigo\":\"PAS1203312\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":10.21},{\"codigo\":\"DEO1203312\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":16.37}],\"fecha_proceso\":\"2026-11-26T17:07:47.069Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_34.png', '/uploads/mock_cedula_34.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1507, 1337, 3, 'test_user35@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 17.13, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"TRI1106341\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":18.74},{\"codigo\":\"ECP1104341\",\"nombre\":\"EVALUACIÓN Y CONTROL DE PROYECTOS\",\"creditos\":3,\"nota\":15.85},{\"codigo\":\"INT1105341\",\"nombre\":\"INTRODUCCIÓN A LAS TELECOMUNICACIONES\",\"creditos\":3,\"nota\":14.92},{\"codigo\":\"PRP1107441\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":19.49},{\"codigo\":\"ELP1104301\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":16.64}],\"fecha_proceso\":\"2026-11-26T17:07:47.071Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_35.png', '/uploads/mock_cedula_35.png', '/uploads/mock_residencia_35.pdf', '/uploads/mock_manutencion_35.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1508, 1338, 3, 'test_user36@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 14.94, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904307\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":16.48},{\"codigo\":\"CIV0904321\",\"nombre\":\"DERECHO CIVIL VII (FAMILIA)\",\"creditos\":3,\"nota\":10.8},{\"codigo\":\"DME0904321\",\"nombre\":\"DERECHO MERCANTIL III\",\"creditos\":3,\"nota\":14.49},{\"codigo\":\"DIP0904321\",\"nombre\":\"DERECHO INTERNACIONAL PRIVADO\",\"creditos\":3,\"nota\":13.18},{\"codigo\":\"SMI0904321\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":19.75}],\"fecha_proceso\":\"2026-11-26T17:07:47.073Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_36.png', '/uploads/mock_cedula_36.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_36.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1509, 1339, 3, 'test_user37@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 16.44, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"MAT0305341\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":17.49},{\"codigo\":\"FIS0304341\",\"nombre\":\"FÍSICA I\",\"creditos\":3,\"nota\":18.75},{\"codigo\":\"INI0304341\",\"nombre\":\"INGLÉS INSTRUMENTAL I\",\"creditos\":3,\"nota\":16.24},{\"codigo\":\"TEP0304341\",\"nombre\":\"TÉCNICAS DE PROGRAMACIÓN\",\"creditos\":3,\"nota\":15.8},{\"codigo\":\"LQU0303141\",\"nombre\":\"LABORATORIO DE QUÍMICA GENERAL\",\"creditos\":1,\"nota\":14.42},{\"codigo\":\"ESH0302201\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":15.94}],\"fecha_proceso\":\"2026-11-26T17:07:47.074Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_37.png', '/uploads/mock_cedula_37.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1510, 1340, 3, 'test_user38@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 11.09, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104304\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":10.56},{\"codigo\":\"ITA1103233\",\"nombre\":\"ITALIANO IV\",\"creditos\":2,\"nota\":10.13},{\"codigo\":\"MGP1106333\",\"nombre\":\"PASANTÍA I / PROYECTO I\",\"creditos\":3,\"nota\":10.32},{\"codigo\":\"INT1104333\",\"nombre\":\"INTERPRETACIÓN II\",\"creditos\":3,\"nota\":13.34}],\"fecha_proceso\":\"2026-11-26T17:07:47.076Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_38.png', '/uploads/mock_cedula_38.png', '/uploads/mock_residencia_38.pdf', '/uploads/mock_manutencion_38.pdf', '/uploads/mock_informe_medico_38.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_38.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1511, 1341, 3, 'test_user39@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 14.33, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":16.92},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":14.94},{\"codigo\":\"MAT0205311\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":11.56},{\"codigo\":\"CON0205311\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":13.06},{\"codigo\":\"ADM0204311\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":12.29},{\"codigo\":\"SOC0204311\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":16.2},{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":13.38},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":13.98},{\"codigo\":\"MAT0205311\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":17.68},{\"codigo\":\"CON0205311\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":10.51},{\"codigo\":\"ADM0204311\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":16.89},{\"codigo\":\"SOC0204311\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":14.5}],\"fecha_proceso\":\"2026-11-26T17:07:47.077Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_39.png', '/uploads/mock_cedula_39.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1512, 1342, 3, 'test_user40@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 16.44, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208411\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":18.91},{\"codigo\":\"PAS1203311\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":19.18},{\"codigo\":\"DEO1203311\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":18.12},{\"codigo\":\"TRI1208411\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":13.84},{\"codigo\":\"PAS1203311\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":13.39},{\"codigo\":\"DEO1203311\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.17}],\"fecha_proceso\":\"2026-11-26T17:07:47.079Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_40.png', '/uploads/mock_cedula_40.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_40.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL);
INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`, `fecha_convocatoria`) VALUES
(1513, 1343, 3, 'test_user41@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 14.36, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302203\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":17.83},{\"codigo\":\"HIS0303332\",\"nombre\":\"HISTORIA DEL ARTE II\",\"creditos\":3,\"nota\":15.63},{\"codigo\":\"DIB0303332\",\"nombre\":\"DIBUJO ANALÍTICO II\",\"creditos\":3,\"nota\":14.35},{\"codigo\":\"TIP0303332\",\"nombre\":\"TIPOGRAFÍA I\",\"creditos\":3,\"nota\":10.98},{\"codigo\":\"DIF0303332\",\"nombre\":\"DISEÑO FUNDAMENTAL I\",\"creditos\":3,\"nota\":12.87},{\"codigo\":\"IIL0303332\",\"nombre\":\"ILUSTRACIÓN I\",\"creditos\":3,\"nota\":14.51}],\"fecha_proceso\":\"2026-11-26T17:07:47.080Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_41.png', '/uploads/mock_cedula_41.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_41.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1514, 1344, 3, 'test_user42@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 13.10, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904308\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":12.32},{\"codigo\":\"MEI0904335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN III\",\"creditos\":3,\"nota\":17.12},{\"codigo\":\"PCA0904335\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"creditos\":3,\"nota\":12.74},{\"codigo\":\"PDI0904335\",\"nombre\":\"PSICODIAGNÓSTICO\",\"creditos\":3,\"nota\":13.14},{\"codigo\":\"PSI0904335\",\"nombre\":\"PSICOLOGÍA EXPERIMENTAL\",\"creditos\":3,\"nota\":10.19}],\"fecha_proceso\":\"2026-11-26T17:07:47.098Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_42.png', '/uploads/mock_cedula_42.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_42.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1515, 1345, 3, 'test_user43@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 12.97, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":12.86},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":11.68},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":10.98},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":11.63},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":10.75},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":16.48},{\"codigo\":\"IIM0103333\",\"nombre\":\"INTRODUCCIÓN A LOS IDIOMAS MODERNOS\",\"creditos\":3,\"nota\":16.43}],\"fecha_proceso\":\"2026-11-26T17:07:47.102Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_43.png', '/uploads/mock_cedula_43.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1516, 1346, 3, 'test_user44@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 18.14, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208433\",\"nombre\":\"TRABAJO DE GRADO / PASANTÍA II\",\"creditos\":4,\"nota\":17.12},{\"codigo\":\"ITA1203233\",\"nombre\":\"ITALIANO V\",\"creditos\":2,\"nota\":18.12},{\"codigo\":\"RDP1203333\",\"nombre\":\"REDACCIÓN Y ESTILO\",\"creditos\":3,\"nota\":19.18}],\"fecha_proceso\":\"2026-11-26T17:07:47.105Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_44.png', '/uploads/mock_cedula_44.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_44.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1517, 1347, 3, 'test_user45@unimar.edu.ve', 'BECA APRENDIZAJE', 13.11, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":11.28},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":18.66},{\"codigo\":\"HIS0203332\",\"nombre\":\"HISTORIA DEL ARTE I\",\"creditos\":3,\"nota\":10.53},{\"codigo\":\"DIB0203332\",\"nombre\":\"DIBUJO ANALÍTICO I\",\"creditos\":3,\"nota\":13.39},{\"codigo\":\"TEF0203332\",\"nombre\":\"TEORÍA DE LA FORMA\",\"creditos\":3,\"nota\":12.35},{\"codigo\":\"TCO0203332\",\"nombre\":\"TEORÍA DEL COLOR\",\"creditos\":3,\"nota\":12.44}],\"fecha_proceso\":\"2026-11-26T17:07:47.107Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_45.png', '/uploads/mock_cedula_45.png', '/uploads/mock_residencia_45.pdf', '/uploads/mock_manutencion_45.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_45.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1518, 1348, 3, 'test_user46@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 17.11, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"HEG1004341\",\"nombre\":\"HERRAMIENTAS GERENCIALES\",\"creditos\":3,\"nota\":14.22},{\"codigo\":\"SIS1004341\",\"nombre\":\"SISTEMAS DE SEÑALES\",\"creditos\":3,\"nota\":17.71},{\"codigo\":\"RED1005341\",\"nombre\":\"REDES DE DATOS II\",\"creditos\":3,\"nota\":17.62},{\"codigo\":\"SMI1004341\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":18.76},{\"codigo\":\"MDS1004241\",\"nombre\":\"METODOLOGÍA DE DESARROLLO DE SOFTWARE\",\"creditos\":2,\"nota\":19.48},{\"codigo\":\"ELP1004301\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":14.85}],\"fecha_proceso\":\"2026-11-26T17:07:47.111Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_46.png', '/uploads/mock_cedula_46.png', '/uploads/mock_residencia_46.pdf', '/uploads/mock_manutencion_46.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1519, 1349, 3, 'test_user47@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 16.71, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402203\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":16.94},{\"codigo\":\"HIS0403332\",\"nombre\":\"HISTORIA DEL ARTE III\",\"creditos\":3,\"nota\":12.7},{\"codigo\":\"TIP0403332\",\"nombre\":\"TIPOGRAFÍA II\",\"creditos\":3,\"nota\":18.31},{\"codigo\":\"DIF0403332\",\"nombre\":\"DISEÑO FUNDAMENTAL II\",\"creditos\":3,\"nota\":17.3},{\"codigo\":\"IIL0403332\",\"nombre\":\"ILUSTRACIÓN II\",\"creditos\":3,\"nota\":16.42},{\"codigo\":\"COM0403332\",\"nombre\":\"COMPUTACIÓN GRÁFICA I\",\"creditos\":3,\"nota\":18.57}],\"fecha_proceso\":\"2026-11-26T17:07:47.114Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_47.png', '/uploads/mock_cedula_47.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1520, 1350, 3, 'test_user48@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 14.56, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":16},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":14.8},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":13.84},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":15.82},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":12.63},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":12.09},{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":17.24},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":13.95},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":12.5},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":12.24},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":16.89},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":16.72}],\"fecha_proceso\":\"2026-11-26T17:07:47.115Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_48.png', '/uploads/mock_cedula_48.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_48.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1521, 1351, 3, 'test_user49@unimar.edu.ve', 'AYUDA ECONÓMICA', 13.30, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"INV0904342\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES II\",\"creditos\":3,\"nota\":12.25},{\"codigo\":\"IEM0905342\",\"nombre\":\"INGENIERÍA DE MÉTODOS II\",\"creditos\":3,\"nota\":15.16},{\"codigo\":\"CPQ0904342\",\"nombre\":\"CONTROL DE PRODUCCIÓN Y CALIDAD I\",\"creditos\":3,\"nota\":11.27},{\"codigo\":\"MEI0904342\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":13.01},{\"codigo\":\"INE0904342\",\"nombre\":\"INGENIERÍA ECONÓMICA\",\"creditos\":3,\"nota\":15.6},{\"codigo\":\"ELP0904302\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":12.54}],\"fecha_proceso\":\"2026-11-26T17:07:47.117Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_49.png', '/uploads/mock_cedula_49.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1522, 1352, 3, 'test_user50@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.16, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":12.64},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":11.24},{\"codigo\":\"ING0204333\",\"nombre\":\"INGLÉS I\",\"creditos\":3,\"nota\":14.27},{\"codigo\":\"FRA0204333\",\"nombre\":\"FRANCÉS I\",\"creditos\":3,\"nota\":17.18},{\"codigo\":\"LIN0204333\",\"nombre\":\"LINGÜÍSTICA I\",\"creditos\":3,\"nota\":11.77},{\"codigo\":\"CUL0204333\",\"nombre\":\"CULTURA Y CIVILIZACIÓN I\",\"creditos\":3,\"nota\":17.87}],\"fecha_proceso\":\"2026-11-26T17:07:47.120Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_50.png', '/uploads/mock_cedula_50.png', '/uploads/mock_residencia_50.pdf', '/uploads/mock_manutencion_50.pdf', '/uploads/mock_informe_medico_50.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_50.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1523, 1353, 3, 'test_user51@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 14.62, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"CON0805312\",\"nombre\":\"CONTABILIDAD VII\",\"creditos\":3,\"nota\":10.68},{\"codigo\":\"FIN0804312\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":15.48},{\"codigo\":\"MET0804312\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":17.24},{\"codigo\":\"AUD0804312\",\"nombre\":\"AUDITORÍA I\",\"creditos\":3,\"nota\":11.65},{\"codigo\":\"PRE0804312\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":13.82},{\"codigo\":\"CON0805312\",\"nombre\":\"CONTABILIDAD VII\",\"creditos\":3,\"nota\":18.28},{\"codigo\":\"FIN0804312\",\"nombre\":\"FINANZAS II\",\"creditos\":3,\"nota\":11.69},{\"codigo\":\"MET0804312\",\"nombre\":\"MÉTODOS CUANTITATIVOS II\",\"creditos\":3,\"nota\":12.53},{\"codigo\":\"AUD0804312\",\"nombre\":\"AUDITORÍA I\",\"creditos\":3,\"nota\":18.05},{\"codigo\":\"PRE0804312\",\"nombre\":\"PRESUPUESTO I\",\"creditos\":3,\"nota\":16.74}],\"fecha_proceso\":\"2026-11-26T17:07:47.124Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_51.png', '/uploads/mock_cedula_51.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_51.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1524, 1354, 3, 'test_user52@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.86, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004304\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":13.06},{\"codigo\":\"ITA1004333\",\"nombre\":\"ITALIANO III\",\"creditos\":3,\"nota\":16.81},{\"codigo\":\"INT1004333\",\"nombre\":\"INTERPRETACIÓN I\",\"creditos\":3,\"nota\":15.23},{\"codigo\":\"ETP1004333\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":19.98},{\"codigo\":\"MGR1004333\",\"nombre\":\"MODALIDAD DE GRADO (SEMINARIO)\",\"creditos\":3,\"nota\":19.21}],\"fecha_proceso\":\"2026-11-26T17:07:47.126Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_52.png', '/uploads/mock_cedula_52.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_52.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1525, 1355, 3, 'test_user53@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 15.70, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904306\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":16.99},{\"codigo\":\"CON0905312\",\"nombre\":\"CONTABILIDAD VIII\",\"creditos\":3,\"nota\":15.39},{\"codigo\":\"AUD0904312\",\"nombre\":\"AUDITORÍA II\",\"creditos\":3,\"nota\":15.33},{\"codigo\":\"MEI0904312\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":12.26},{\"codigo\":\"PRE0904312\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":18.67},{\"codigo\":\"ELP0904306\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":19.25},{\"codigo\":\"CON0905312\",\"nombre\":\"CONTABILIDAD VIII\",\"creditos\":3,\"nota\":11.5},{\"codigo\":\"AUD0904312\",\"nombre\":\"AUDITORÍA II\",\"creditos\":3,\"nota\":18.67},{\"codigo\":\"MEI0904312\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":12.89},{\"codigo\":\"PRE0904312\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":16.06}],\"fecha_proceso\":\"2026-11-26T17:07:47.127Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_53.png', '/uploads/mock_cedula_53.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_53.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1526, 1356, 3, 'test_user54@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 14.68, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":14.4},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":15.34},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":14.98},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":15.64},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":11.64},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":13.28},{\"codigo\":\"IAP0103332\",\"nombre\":\"INTRODUCCIÓN A LAS ARTES PLÁSTICAS\",\"creditos\":3,\"nota\":17.49}],\"fecha_proceso\":\"2026-11-26T17:07:47.128Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_54.png', '/uploads/mock_cedula_54.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1527, 1357, 3, 'test_user55@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 14.17, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208421\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.16},{\"codigo\":\"DEO1203321\",\"nombre\":\"DEONTOLOGÍA JURÍDICA\",\"creditos\":3,\"nota\":15.32},{\"codigo\":\"PAS1203321\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":11.04}],\"fecha_proceso\":\"2026-11-26T17:07:47.129Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_55.png', '/uploads/mock_cedula_55.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_55.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1528, 1358, 3, 'test_user56@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 15.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904305\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":17.88},{\"codigo\":\"FIN0904311\",\"nombre\":\"FINANZAS III\",\"creditos\":3,\"nota\":18.53},{\"codigo\":\"ADM0904311\",\"nombre\":\"ADMINISTRACIÓN VIII\",\"creditos\":3,\"nota\":13.54},{\"codigo\":\"MET0904311\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":12.76},{\"codigo\":\"PRE0904311\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":10.38},{\"codigo\":\"ELP0904305\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":16.93},{\"codigo\":\"FIN0904311\",\"nombre\":\"FINANZAS III\",\"creditos\":3,\"nota\":19.02},{\"codigo\":\"ADM0904311\",\"nombre\":\"ADMINISTRACIÓN VIII\",\"creditos\":3,\"nota\":14.83},{\"codigo\":\"MET0904311\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":13.12},{\"codigo\":\"PRE0904311\",\"nombre\":\"PRESUPUESTO II\",\"creditos\":3,\"nota\":13.61}],\"fecha_proceso\":\"2026-11-26T17:07:47.131Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_56.png', '/uploads/mock_cedula_56.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1529, 1359, 3, 'test_user57@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 14.80, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208411\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":13.3},{\"codigo\":\"PAS1203311\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":17.37},{\"codigo\":\"DEO1203311\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.22},{\"codigo\":\"TRI1208411\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.1},{\"codigo\":\"PAS1203311\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":15.54},{\"codigo\":\"DEO1203311\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":11.27}],\"fecha_proceso\":\"2026-11-26T17:07:47.132Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_57.png', '/uploads/mock_cedula_57.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_57.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1530, 1360, 3, 'test_user58@unimar.edu.ve', 'AYUDA ECONÓMICA', 15.87, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":10.37},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17.97},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":19.95},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":16.69},{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":13.76},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":13.34},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":19.77},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":15.14}],\"fecha_proceso\":\"2026-11-26T17:07:47.133Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_58.png', '/uploads/mock_cedula_58.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1531, 1361, 3, 'test_user59@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 13.04, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":14.76},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":10.19},{\"codigo\":\"MAT0205341\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":12.23},{\"codigo\":\"ALD0204341\",\"nombre\":\"ÁLGEBRA DISCRETA\",\"creditos\":3,\"nota\":11.96},{\"codigo\":\"DIB0203141\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":10.71},{\"codigo\":\"GEA0205341\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":18.25},{\"codigo\":\"QUG0205341\",\"nombre\":\"QUÍMICA GENERAL\",\"creditos\":3,\"nota\":13.21}],\"fecha_proceso\":\"2026-11-26T17:07:47.134Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_59.png', '/uploads/mock_cedula_59.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_59.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1532, 1362, 3, 'test_user60@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.76, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":18.26},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":19.79},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":16.67},{\"codigo\":\"INP0103335\",\"nombre\":\"INTRODUCCIÓN A LA PSICOLOGÍA\",\"creditos\":3,\"nota\":19.69},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":14.49},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":12.53},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":15.9}],\"fecha_proceso\":\"2026-11-26T17:07:47.135Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_60.png', '/uploads/mock_cedula_60.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_60.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1533, 1363, 3, 'test_user61@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 15.28, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":18.88},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":14.91},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":15.29},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":13.27},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":12.23},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":18.83},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":11.49},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":16.57},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":16.45},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":14.92}],\"fecha_proceso\":\"2026-11-26T17:07:47.136Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_61.png', '/uploads/mock_cedula_61.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_61.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1534, 1364, 3, 'test_user62@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 13.19, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104305\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":13.79},{\"codigo\":\"TRI1106311\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":14.39},{\"codigo\":\"PRP1107411\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":11.84},{\"codigo\":\"AUD1104311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA II\",\"creditos\":3,\"nota\":12.33},{\"codigo\":\"ELP1104305\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.21},{\"codigo\":\"TRI1106311\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":11.44},{\"codigo\":\"PRP1107411\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":14.37},{\"codigo\":\"AUD1104311\",\"nombre\":\"AUDITORÍA ADMINISTRATIVA II\",\"creditos\":3,\"nota\":16.14}],\"fecha_proceso\":\"2026-11-26T17:07:47.138Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_62.png', '/uploads/mock_cedula_62.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_62.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1535, 1365, 3, 'test_user63@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.66, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":18.23},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":14.57},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":13.76},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":17.61},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":16.23},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":10.37},{\"codigo\":\"IAP0103332\",\"nombre\":\"INTRODUCCIÓN A LAS ARTES PLÁSTICAS\",\"creditos\":3,\"nota\":11.87}],\"fecha_proceso\":\"2026-11-26T17:07:47.140Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_63.png', '/uploads/mock_cedula_63.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1536, 1366, 3, 'test_user64@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.69, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402203\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":15.76},{\"codigo\":\"HIS0403332\",\"nombre\":\"HISTORIA DEL ARTE III\",\"creditos\":3,\"nota\":12.49},{\"codigo\":\"TIP0403332\",\"nombre\":\"TIPOGRAFÍA II\",\"creditos\":3,\"nota\":12.75},{\"codigo\":\"DIF0403332\",\"nombre\":\"DISEÑO FUNDAMENTAL II\",\"creditos\":3,\"nota\":14.24},{\"codigo\":\"IIL0403332\",\"nombre\":\"ILUSTRACIÓN II\",\"creditos\":3,\"nota\":19.16},{\"codigo\":\"COM0403332\",\"nombre\":\"COMPUTACIÓN GRÁFICA I\",\"creditos\":3,\"nota\":13.74}],\"fecha_proceso\":\"2026-11-26T17:07:47.142Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_64.png', '/uploads/mock_cedula_64.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1537, 1367, 3, 'test_user65@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 13.60, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004304\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":19.26},{\"codigo\":\"ITA1004333\",\"nombre\":\"ITALIANO III\",\"creditos\":3,\"nota\":10.7},{\"codigo\":\"INT1004333\",\"nombre\":\"INTERPRETACIÓN I\",\"creditos\":3,\"nota\":14.69},{\"codigo\":\"ETP1004333\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":10.02},{\"codigo\":\"MGR1004333\",\"nombre\":\"MODALIDAD DE GRADO (SEMINARIO)\",\"creditos\":3,\"nota\":13.34}],\"fecha_proceso\":\"2026-11-26T17:07:47.144Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_65.png', '/uploads/mock_cedula_65.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_65.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1538, 1368, 3, 'test_user66@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.84, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"MAT0505342\",\"nombre\":\"MATEMÁTICA IV\",\"creditos\":3,\"nota\":19.44},{\"codigo\":\"FIS0505342\",\"nombre\":\"FÍSICA III\",\"creditos\":3,\"nota\":11.12},{\"codigo\":\"MER0505342\",\"nombre\":\"MECÁNICA RACIONAL I\",\"creditos\":3,\"nota\":13.95},{\"codigo\":\"ING0504342\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":16.59},{\"codigo\":\"LAF0503142\",\"nombre\":\"LABORATORIO DE FÍSICA II\",\"creditos\":1,\"nota\":10.73},{\"codigo\":\"ESH0502202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.23}],\"fecha_proceso\":\"2026-11-26T17:07:47.145Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_66.png', '/uploads/mock_cedula_66.png', '/uploads/mock_residencia_66.pdf', '/uploads/mock_manutencion_66.pdf', '/uploads/mock_informe_medico_66.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_66.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1539, 1369, 3, 'test_user67@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 16.54, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"ING0705333\",\"nombre\":\"INGLÉS VI\",\"creditos\":3,\"nota\":14.51},{\"codigo\":\"FRA0705333\",\"nombre\":\"FRANCÉS VI\",\"creditos\":3,\"nota\":15.05},{\"codigo\":\"TRA0704333\",\"nombre\":\"TRADUCCIÓN I (INGLÉS)\",\"creditos\":3,\"nota\":17.62},{\"codigo\":\"TRB0704333\",\"nombre\":\"TRADUCCIÓN I (FRANCÉS)\",\"creditos\":3,\"nota\":18.31},{\"codigo\":\"LIT0704333\",\"nombre\":\"LITERATURA FRANCOFONA\",\"creditos\":3,\"nota\":17.21}],\"fecha_proceso\":\"2026-11-26T17:07:47.147Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_67.png', '/uploads/mock_cedula_67.png', '/uploads/mock_residencia_67.pdf', '/uploads/mock_manutencion_67.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1540, 1370, 3, 'test_user68@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 15.11, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":19.29},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":12.1},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":19.71},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":19.04},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":11.37},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":11.36},{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":12.1},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":13.26},{\"codigo\":\"MAT0205312\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":17.59},{\"codigo\":\"CON0205312\",\"nombre\":\"CONTABILIDAD I\",\"creditos\":3,\"nota\":13.41},{\"codigo\":\"ADM0204312\",\"nombre\":\"ADMINISTRACIÓN I\",\"creditos\":3,\"nota\":15.23},{\"codigo\":\"SOC0204312\",\"nombre\":\"SOCIOLOGÍA\",\"creditos\":3,\"nota\":16.81}],\"fecha_proceso\":\"2026-11-26T17:07:47.149Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_68.png', '/uploads/mock_cedula_68.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_68.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1541, 1371, 3, 'test_user69@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.13, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":19.73},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":18.72},{\"codigo\":\"INT0204321\",\"nombre\":\"INTRODUCCIÓN AL DERECHO\",\"creditos\":3,\"nota\":16.19},{\"codigo\":\"DER0204321\",\"nombre\":\"DERECHO ROMANO I\",\"creditos\":3,\"nota\":14.42},{\"codigo\":\"FIL0204321\",\"nombre\":\"FILOSOFÍA DEL DERECHO\",\"creditos\":3,\"nota\":15.59},{\"codigo\":\"DIP0204321\",\"nombre\":\"DERECHO INDIVIDUAL DEL TRABAJO\",\"creditos\":3,\"nota\":12.14}],\"fecha_proceso\":\"2026-11-26T17:07:47.150Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_69.png', '/uploads/mock_cedula_69.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_69.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1542, 1372, 3, 'test_user70@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES', 17.26, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"PSF0704335\",\"nombre\":\"PSICOPATOLOGÍA II\",\"creditos\":3,\"nota\":14.93},{\"codigo\":\"EVA0704335\",\"nombre\":\"EVALUACIÓN PSICOLÓGICA II\",\"creditos\":3,\"nota\":19.98},{\"codigo\":\"MOD0704335\",\"nombre\":\"MODIFICACIÓN DE CONDUCTA\",\"creditos\":3,\"nota\":13.45},{\"codigo\":\"PSI0704335\",\"nombre\":\"PSICOLOGÍA INSTITUCIONAL\",\"creditos\":3,\"nota\":18.91},{\"codigo\":\"ENT0704335\",\"nombre\":\"ENTREVISTA PSICOLÓGICA\",\"creditos\":3,\"nota\":19.03}],\"fecha_proceso\":\"2026-11-26T17:07:47.152Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_70.png', '/uploads/mock_cedula_70.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_70.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1543, 1373, 3, 'test_user71@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.60, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":14.73},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":17.42},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":17.37},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":18.16},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":16.35},{\"codigo\":\"ECO0604311\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":11.23},{\"codigo\":\"ADM0604311\",\"nombre\":\"ADMINISTRACIÓN V\",\"creditos\":3,\"nota\":13.06},{\"codigo\":\"MAT0604311\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":18.56},{\"codigo\":\"DER0604311\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":10.53},{\"codigo\":\"SIS0604311\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":18.58}],\"fecha_proceso\":\"2026-11-26T17:07:47.153Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_71.png', '/uploads/mock_cedula_71.png', '/uploads/mock_residencia_71.pdf', '/uploads/mock_manutencion_71.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1544, 1374, 3, 'test_user72@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 12.74, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.45},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":16.17},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":13.74},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":11.69},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":12.77},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":11.87},{\"codigo\":\"ESH0402205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":10.44},{\"codigo\":\"EST0405311\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":11.26},{\"codigo\":\"CON0405311\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":10.31},{\"codigo\":\"ADM0404311\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":10.49},{\"codigo\":\"DER0404311\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":13.5},{\"codigo\":\"MKT0404311\",\"nombre\":\"MERCADOTECNIA II\",\"creditos\":3,\"nota\":13.15}],\"fecha_proceso\":\"2026-11-26T17:07:47.158Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_72.png', '/uploads/mock_cedula_72.png', '/uploads/mock_residencia_72.pdf', '/uploads/mock_manutencion_72.pdf', '/uploads/mock_informe_medico_72.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_72.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1545, 1375, 3, 'test_user73@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.72, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"CIV0704321\",\"nombre\":\"DERECHO CIVIL V (CONTRATOS)\",\"creditos\":3,\"nota\":14},{\"codigo\":\"DPC0704321\",\"nombre\":\"DERECHO PROCESAL CIVIL III\",\"creditos\":3,\"nota\":18.33},{\"codigo\":\"DPP0704321\",\"nombre\":\"DERECHO PROCESAL PENAL II\",\"creditos\":3,\"nota\":13.9},{\"codigo\":\"DME0704321\",\"nombre\":\"DERECHO MERCANTIL I\",\"creditos\":3,\"nota\":18.37},{\"codigo\":\"PRO0704321\",\"nombre\":\"PRÁCTICA FORENSE I\",\"creditos\":3,\"nota\":19.02}],\"fecha_proceso\":\"2026-11-26T17:07:47.160Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_73.png', '/uploads/mock_cedula_73.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_73.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1546, 1376, 3, 'test_user74@unimar.edu.ve', 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES', 14.48, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"DIG0804332\",\"nombre\":\"DISEÑO GRÁFICO IV\",\"creditos\":3,\"nota\":15.3},{\"codigo\":\"DEI0803332\",\"nombre\":\"DISEÑO EDITORIAL II\",\"creditos\":3,\"nota\":10.17},{\"codigo\":\"DIP0803332\",\"nombre\":\"DISEÑO PUBLICITARIO I\",\"creditos\":3,\"nota\":15.27},{\"codigo\":\"DIW0803332\",\"nombre\":\"DISEÑO WEB I\",\"creditos\":3,\"nota\":17.02},{\"codigo\":\"PRO0803332\",\"nombre\":\"PRODUCCIÓN GRÁFICA\",\"creditos\":3,\"nota\":14.63}],\"fecha_proceso\":\"2026-11-26T17:07:47.161Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_74.png', '/uploads/mock_cedula_74.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/mock_filiacion_74.pdf', NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1547, 1377, 3, 'test_user75@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 16.14, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":7,\"materias\":[{\"codigo\":\"PSF0704335\",\"nombre\":\"PSICOPATOLOGÍA II\",\"creditos\":3,\"nota\":18.96},{\"codigo\":\"EVA0704335\",\"nombre\":\"EVALUACIÓN PSICOLÓGICA II\",\"creditos\":3,\"nota\":17.96},{\"codigo\":\"MOD0704335\",\"nombre\":\"MODIFICACIÓN DE CONDUCTA\",\"creditos\":3,\"nota\":17.58},{\"codigo\":\"PSI0704335\",\"nombre\":\"PSICOLOGÍA INSTITUCIONAL\",\"creditos\":3,\"nota\":11.54},{\"codigo\":\"ENT0704335\",\"nombre\":\"ENTREVISTA PSICOLÓGICA\",\"creditos\":3,\"nota\":14.67}],\"fecha_proceso\":\"2026-11-26T17:07:47.162Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_75.png', '/uploads/mock_cedula_75.png', '/uploads/mock_residencia_75.pdf', '/uploads/mock_manutencion_75.pdf', '/uploads/mock_informe_medico_75.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_75.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1548, 1378, 3, 'test_user76@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.19, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"CIV0604321\",\"nombre\":\"DERECHO CIVIL IV (OBLIGACIONES II)\",\"creditos\":3,\"nota\":18.28},{\"codigo\":\"DPC0604321\",\"nombre\":\"DERECHO PROCESAL CIVIL II\",\"creditos\":3,\"nota\":13.78},{\"codigo\":\"DEA0604321\",\"nombre\":\"DERECHO ADMINISTRATIVO III\",\"creditos\":3,\"nota\":13.21},{\"codigo\":\"DPP0604321\",\"nombre\":\"DERECHO PROCESAL PENAL I\",\"creditos\":3,\"nota\":18.38},{\"codigo\":\"DIT0604321\",\"nombre\":\"DERECHO INTERNACIONAL PÚBLICO\",\"creditos\":3,\"nota\":17.32}],\"fecha_proceso\":\"2026-11-26T17:07:47.163Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_76.png', '/uploads/mock_cedula_76.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_76.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1549, 1379, 3, 'test_user77@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 17.70, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"INV0804341\",\"nombre\":\"INVESTIGACIÓN DE OPERACIONES\",\"creditos\":3,\"nota\":17.46},{\"codigo\":\"SIS0805341\",\"nombre\":\"SISTEMAS DE INFORMACIÓN\",\"creditos\":3,\"nota\":18.65},{\"codigo\":\"RED0805341\",\"nombre\":\"REDES DE DATOS I\",\"creditos\":3,\"nota\":16.98}],\"fecha_proceso\":\"2026-11-26T17:07:47.164Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_77.png', '/uploads/mock_cedula_77.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1550, 1380, 3, 'test_user78@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 16.07, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.18},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":12.85},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":17.25},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":19.72},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":19.58},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":11.97},{\"codigo\":\"ESH0402206\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":17.89},{\"codigo\":\"EST0405312\",\"nombre\":\"ESTADÍSTICA I\",\"creditos\":3,\"nota\":13.59},{\"codigo\":\"CON0405312\",\"nombre\":\"CONTABILIDAD III\",\"creditos\":3,\"nota\":18.01},{\"codigo\":\"ADM0404312\",\"nombre\":\"ADMINISTRACIÓN III\",\"creditos\":3,\"nota\":12.32},{\"codigo\":\"DER0404312\",\"nombre\":\"DERECHO II\",\"creditos\":3,\"nota\":17.66},{\"codigo\":\"MAT0404312\",\"nombre\":\"MATEMÁTICA FINANCIERA\",\"creditos\":3,\"nota\":14.77}],\"fecha_proceso\":\"2026-11-26T17:07:47.165Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_78.png', '/uploads/mock_cedula_78.png', '/uploads/mock_residencia_78.pdf', '/uploads/mock_manutencion_78.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1551, 1381, 3, 'test_user79@unimar.edu.ve', 'BECA APRENDIZAJE', 13.62, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502207\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":12.19},{\"codigo\":\"CIV0504321\",\"nombre\":\"DERECHO CIVIL III (OBLIGACIONES I)\",\"creditos\":3,\"nota\":14.91},{\"codigo\":\"PEN0504321\",\"nombre\":\"DERECHO PENAL III\",\"creditos\":3,\"nota\":10.13},{\"codigo\":\"DPC0504321\",\"nombre\":\"DERECHO PROCESAL CIVIL I\",\"creditos\":3,\"nota\":17.6},{\"codigo\":\"DEA0504321\",\"nombre\":\"DERECHO ADMINISTRATIVO II\",\"creditos\":3,\"nota\":12.65},{\"codigo\":\"MED0504321\",\"nombre\":\"MEDICINA LEGAL\",\"creditos\":3,\"nota\":14.25}],\"fecha_proceso\":\"2026-11-26T17:07:47.166Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_79.png', '/uploads/mock_cedula_79.png', '/uploads/mock_residencia_79.pdf', '/uploads/mock_manutencion_79.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_79.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1552, 1382, 3, 'test_user80@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 14.87, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":16.1},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":17.5},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":17.74},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":18.36},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":12.23},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":17.46},{\"codigo\":\"ICC0104312\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":13.67},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":10.11},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":11.83},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":16.77},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":11.3},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":14.96},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":18.26},{\"codigo\":\"ICC0104312\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":11.94}],\"fecha_proceso\":\"2026-11-26T17:07:47.168Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_80.png', '/uploads/mock_cedula_80.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_80.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1553, 1383, 3, 'test_user81@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 14.97, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":16.06},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":19.42},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":16.11},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":17.45},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":12.5},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":10.39},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":13.7},{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":10.55},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":15.82},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":17.88},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":19.97},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":11.91},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":16.91},{\"codigo\":\"ICA0104311\",\"nombre\":\"INTRODUC. A LAS CIENCIAS ECONÓMICAS, ADMINISTRATIVAS Y CONTABLES\",\"creditos\":3,\"nota\":10.97}],\"fecha_proceso\":\"2026-11-26T17:07:47.169Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_81.png', '/uploads/mock_cedula_81.png', '/uploads/mock_residencia_81.pdf', '/uploads/mock_manutencion_81.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_notas_certificadas_81.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL);
INSERT INTO `solicitudes` (`id`, `user_id`, `periodo_id`, `email_institucional`, `tipo_beca`, `promedio_notas`, `motivo_solicitud`, `departamento_asignado`, `materias_json`, `estatus`, `fecha_registro`, `foto_carnet`, `copia_cedula`, `constancia_residencia`, `declaracion_manutencion`, `informe_medico`, `partida_nacimiento`, `constancia_club`, `constancia_notas`, `notas_certificadas`, `carnet_discapacidad`, `documentos_filiacion`, `planilla_inscripcion`, `fecha_revision`, `fecha_decision`, `observaciones_admin`, `revisado_por`, `porcentaje_cobertura`, `categoria_rechazo`, `fecha_convocatoria`) VALUES
(1554, 1384, 3, 'test_user82@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.33, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"DIG0804332\",\"nombre\":\"DISEÑO GRÁFICO IV\",\"creditos\":3,\"nota\":16.22},{\"codigo\":\"DEI0803332\",\"nombre\":\"DISEÑO EDITORIAL II\",\"creditos\":3,\"nota\":17.29},{\"codigo\":\"DIP0803332\",\"nombre\":\"DISEÑO PUBLICITARIO I\",\"creditos\":3,\"nota\":19.55},{\"codigo\":\"DIW0803332\",\"nombre\":\"DISEÑO WEB I\",\"creditos\":3,\"nota\":13.26},{\"codigo\":\"PRO0803332\",\"nombre\":\"PRODUCCIÓN GRÁFICA\",\"creditos\":3,\"nota\":10.32}],\"fecha_proceso\":\"2026-11-26T17:07:47.188Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_82.png', '/uploads/mock_cedula_82.png', '/uploads/mock_residencia_82.pdf', '/uploads/mock_manutencion_82.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1555, 1385, 3, 'test_user83@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 15.34, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208412\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":17.09},{\"codigo\":\"PAS1203312\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":19.29},{\"codigo\":\"DEO1203312\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":12.47},{\"codigo\":\"TRI1208412\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.09},{\"codigo\":\"PAS1203312\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":11.89},{\"codigo\":\"DEO1203312\",\"nombre\":\"DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":15.23}],\"fecha_proceso\":\"2026-11-26T17:07:47.192Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_83.png', '/uploads/mock_cedula_83.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1556, 1386, 3, 'test_user84@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 16.52, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"MAT0605341\",\"nombre\":\"MATEMÁTICA V\",\"creditos\":3,\"nota\":19.62},{\"codigo\":\"ESP0605341\",\"nombre\":\"ESTADÍSTICA Y PROBABILIDADES\",\"creditos\":3,\"nota\":17.42},{\"codigo\":\"PRO0605341\",\"nombre\":\"PROGRAMACIÓN III\",\"creditos\":3,\"nota\":12.72},{\"codigo\":\"ELE0606341\",\"nombre\":\"ELECTRÓNICA\",\"creditos\":3,\"nota\":16.6},{\"codigo\":\"ARC0604341\",\"nombre\":\"ARQUITECTURA DEL COMPUTADOR\",\"creditos\":3,\"nota\":17.78},{\"codigo\":\"ESH0702201\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":14.98}],\"fecha_proceso\":\"2026-11-26T17:07:47.194Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_84.png', '/uploads/mock_cedula_84.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_84.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1557, 1387, 3, 'test_user85@unimar.edu.ve', 'AYUDA ECONÓMICA A TRABAJADORES', 14.02, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":11,\"materias\":[{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":10.08},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":18.46},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":12.63},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":15.87},{\"codigo\":\"ELP1104306\",\"nombre\":\"ELECTIVA PROFESIONAL 3\",\"creditos\":3,\"nota\":11.78},{\"codigo\":\"TRI1106312\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN I\",\"creditos\":3,\"nota\":14.35},{\"codigo\":\"PRP1107412\",\"nombre\":\"PRÁCTICA PROFESIONAL\",\"creditos\":4,\"nota\":11.03},{\"codigo\":\"TRI1104312\",\"nombre\":\"TRIBUTACIÓN II\",\"creditos\":3,\"nota\":17.99}],\"fecha_proceso\":\"2026-11-26T17:07:47.196Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_85.png', '/uploads/mock_cedula_85.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1558, 1388, 3, 'test_user86@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 12.76, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208432\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":12.95},{\"codigo\":\"EDP1203332\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":13.72},{\"codigo\":\"PAS1203332\",\"nombre\":\"PASANTÍA\",\"creditos\":3,\"nota\":11.61}],\"fecha_proceso\":\"2026-11-26T17:07:47.198Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_86.png', '/uploads/mock_cedula_86.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_86.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1559, 1389, 3, 'test_user87@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 13.96, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":12,\"materias\":[{\"codigo\":\"TRI1208435\",\"nombre\":\"TRABAJO DE INVESTIGACIÓN II\",\"creditos\":4,\"nota\":16.43},{\"codigo\":\"PPC1207435\",\"nombre\":\"PRÁCTICA PROFESIONAL COMUNITARIA\",\"creditos\":4,\"nota\":11.08},{\"codigo\":\"EDP1203335\",\"nombre\":\"ÉTICA Y DEONTOLOGÍA PROFESIONAL\",\"creditos\":3,\"nota\":14.36}],\"fecha_proceso\":\"2026-11-26T17:07:47.201Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_87.png', '/uploads/mock_cedula_87.png', '/uploads/mock_residencia_87.pdf', '/uploads/mock_manutencion_87.pdf', '/uploads/mock_informe_medico_87.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_87.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1560, 1390, 3, 'test_user88@unimar.edu.ve', 'AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES', 15.58, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402204\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":19.76},{\"codigo\":\"ING0404333\",\"nombre\":\"INGLÉS III\",\"creditos\":3,\"nota\":18.32},{\"codigo\":\"FRA0404333\",\"nombre\":\"FRANCÉS III\",\"creditos\":3,\"nota\":16.65},{\"codigo\":\"FIN0404333\",\"nombre\":\"FONÉTICA INGLESA I\",\"creditos\":3,\"nota\":11.86},{\"codigo\":\"FFR0404333\",\"nombre\":\"FONÉTICA FRANCESA I\",\"creditos\":3,\"nota\":16.38},{\"codigo\":\"MOR0404333\",\"nombre\":\"MORFOSINTAXIS\",\"creditos\":3,\"nota\":10.51}],\"fecha_proceso\":\"2026-11-26T17:07:47.202Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_88.png', '/uploads/mock_cedula_88.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1561, 1391, 3, 'test_user89@unimar.edu.ve', 'AYUDA ECONÓMICA', 12.01, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":2,\"materias\":[{\"codigo\":\"IDR0204300\",\"nombre\":\"IDENTIDAD REGIONAL\",\"creditos\":3,\"nota\":10.14},{\"codigo\":\"AMS0204300\",\"nombre\":\"AMBIENTE SOSTENIBLE\",\"creditos\":3,\"nota\":10.15},{\"codigo\":\"MAT0205341\",\"nombre\":\"MATEMÁTICA I\",\"creditos\":3,\"nota\":13.47},{\"codigo\":\"ALD0204341\",\"nombre\":\"ÁLGEBRA DISCRETA\",\"creditos\":3,\"nota\":10.39},{\"codigo\":\"DIB0203141\",\"nombre\":\"DIBUJO I\",\"creditos\":1,\"nota\":14.42},{\"codigo\":\"GEA0205341\",\"nombre\":\"GEOMETRÍA ANALÍTICA\",\"creditos\":3,\"nota\":10.74},{\"codigo\":\"QUG0205341\",\"nombre\":\"QUÍMICA GENERAL\",\"creditos\":3,\"nota\":14.73}],\"fecha_proceso\":\"2026-11-26T17:07:47.203Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_89.png', '/uploads/mock_cedula_89.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1562, 1392, 3, 'test_user90@unimar.edu.ve', 'AYUDA ECONÓMICA', 16.04, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":8,\"materias\":[{\"codigo\":\"DIG0804332\",\"nombre\":\"DISEÑO GRÁFICO IV\",\"creditos\":3,\"nota\":19.62},{\"codigo\":\"DEI0803332\",\"nombre\":\"DISEÑO EDITORIAL II\",\"creditos\":3,\"nota\":19.4},{\"codigo\":\"DIP0803332\",\"nombre\":\"DISEÑO PUBLICITARIO I\",\"creditos\":3,\"nota\":10.83},{\"codigo\":\"DIW0803332\",\"nombre\":\"DISEÑO WEB I\",\"creditos\":3,\"nota\":12.59},{\"codigo\":\"PRO0803332\",\"nombre\":\"PRODUCCIÓN GRÁFICA\",\"creditos\":3,\"nota\":17.76}],\"fecha_proceso\":\"2026-11-26T17:07:47.205Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_90.png', '/uploads/mock_cedula_90.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1563, 1393, 3, 'test_user91@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.34, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":6,\"materias\":[{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":19.48},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":11.94},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":19.07},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":19.22},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":12.97},{\"codigo\":\"CON0605312\",\"nombre\":\"CONTABILIDAD V\",\"creditos\":3,\"nota\":12.49},{\"codigo\":\"ECO0604312\",\"nombre\":\"ECONOMÍA II\",\"creditos\":3,\"nota\":15.37},{\"codigo\":\"CON0604312\",\"nombre\":\"CONTABILIDAD DE COSTOS I\",\"creditos\":3,\"nota\":15.12},{\"codigo\":\"DER0604312\",\"nombre\":\"DERECHO IV\",\"creditos\":3,\"nota\":16.34},{\"codigo\":\"SIS0604312\",\"nombre\":\"SISTEMAS Y PROCEDIMIENTOS\",\"creditos\":3,\"nota\":11.45}],\"fecha_proceso\":\"2026-11-26T17:07:47.209Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_91.png', '/uploads/mock_cedula_91.png', '/uploads/mock_residencia_91.pdf', '/uploads/mock_manutencion_91.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1564, 1394, 3, 'test_user92@unimar.edu.ve', 'BECA APRENDIZAJE', 16.57, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"CPQ1005342\",\"nombre\":\"CONTROL DE PRODUCCIÓN Y CALIDAD II\",\"creditos\":3,\"nota\":19.04},{\"codigo\":\"HIG1004342\",\"nombre\":\"HIGIENE Y SEGURIDAD INDUSTRIAL\",\"creditos\":3,\"nota\":10.98},{\"codigo\":\"SMI1004342\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":19.06},{\"codigo\":\"MDS1004342\",\"nombre\":\"MANTENIMIENTO INDUSTRIAL\",\"creditos\":3,\"nota\":17.74},{\"codigo\":\"ESH1002202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":15.25},{\"codigo\":\"ELP1004302\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":17.38}],\"fecha_proceso\":\"2026-11-26T17:07:47.211Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_92.png', '/uploads/mock_cedula_92.png', '/uploads/mock_residencia_92.pdf', '/uploads/mock_manutencion_92.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_92.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1565, 1395, 3, 'test_user93@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 15.97, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"ESH0402208\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 2\",\"creditos\":2,\"nota\":18.3},{\"codigo\":\"LNE0403135\",\"nombre\":\"LABORATORIO DE NEUROCIENCIAS\",\"creditos\":1,\"nota\":13.63},{\"codigo\":\"PSP0404335\",\"nombre\":\"PSICOLOGÍA DE LA PERSONALIDAD I\",\"creditos\":3,\"nota\":17.74},{\"codigo\":\"PRO0404335\",\"nombre\":\"PROCESOS PSICOLÓGICOS BÁSICOS II\",\"creditos\":3,\"nota\":13.77},{\"codigo\":\"EST0404335\",\"nombre\":\"ESTADÍSTICA II\",\"creditos\":3,\"nota\":14.5},{\"codigo\":\"MET0404335\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN I\",\"creditos\":3,\"nota\":17.88}],\"fecha_proceso\":\"2026-11-26T17:07:47.213Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_93.png', '/uploads/mock_cedula_93.png', '/uploads/mock_residencia_93.pdf', '/uploads/mock_manutencion_93.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1566, 1396, 3, 'test_user94@unimar.edu.ve', 'BECA APRENDIZAJE', 17.08, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":9,\"materias\":[{\"codigo\":\"ELP0904303\",\"nombre\":\"ELECTIVA PROFESIONAL 1\",\"creditos\":3,\"nota\":17.29},{\"codigo\":\"DIP0903332\",\"nombre\":\"DISEÑO PUBLICITARIO II\",\"creditos\":3,\"nota\":16.44},{\"codigo\":\"DIW0903332\",\"nombre\":\"DISEÑO WEB II\",\"creditos\":3,\"nota\":17.87},{\"codigo\":\"MEI0904332\",\"nombre\":\"METODOLOGÍA DE LA INVESTIGACIÓN\",\"creditos\":3,\"nota\":18.48},{\"codigo\":\"ETI0903332\",\"nombre\":\"ETIQUETA Y ENVASE\",\"creditos\":3,\"nota\":15.33}],\"fecha_proceso\":\"2026-11-26T17:07:47.214Z\"}', 'En Revisión', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_94.png', '/uploads/mock_cedula_94.png', '/uploads/mock_residencia_94.pdf', '/uploads/mock_manutencion_94.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_94.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1567, 1397, 3, 'test_user95@unimar.edu.ve', 'BECA A LA EXCELENCIA ACADÉMICA', 14.03, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":10,\"materias\":[{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":14.01},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":14.8},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":12.32},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":10.97},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":17.23},{\"codigo\":\"ELP1004306\",\"nombre\":\"ELECTIVA PROFESIONAL 2\",\"creditos\":3,\"nota\":13.55},{\"codigo\":\"AUD1004312\",\"nombre\":\"AUDITORÍA III\",\"creditos\":3,\"nota\":12.79},{\"codigo\":\"SMI1004312\",\"nombre\":\"SEMINARIO METODOLÓGICO DE INVESTIGACIÓN\",\"creditos\":3,\"nota\":13.78},{\"codigo\":\"TRI1004312\",\"nombre\":\"TRIBUTACIÓN I\",\"creditos\":3,\"nota\":15.8},{\"codigo\":\"ETP1004312\",\"nombre\":\"ÉTICA PROFESIONAL\",\"creditos\":3,\"nota\":15}],\"fecha_proceso\":\"2026-11-26T17:07:47.216Z\"}', 'Aprobada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_95.png', '/uploads/mock_cedula_95.png', NULL, NULL, NULL, NULL, NULL, '/uploads/mock_constancia_notas_95.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1568, 1398, 3, 'test_user96@unimar.edu.ve', 'BECA SOCIAL APRENDIZAJE', 14.74, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":10.38},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":14.49},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":18.81},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":15.23},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":13.63},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":15.6},{\"codigo\":\"HID0104321\",\"nombre\":\"HISTORIA DEL DERECHO\",\"creditos\":3,\"nota\":15.03}],\"fecha_proceso\":\"2026-11-26T17:07:47.217Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_96.png', '/uploads/mock_cedula_96.png', '/uploads/mock_residencia_96.pdf', '/uploads/mock_manutencion_96.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_notas_certificadas_96.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1569, 1399, 3, 'test_user97@unimar.edu.ve', 'BECA APRENDIZAJE', 14.16, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":1,\"materias\":[{\"codigo\":\"GRL0104300\",\"nombre\":\"GRAMÁTICA Y LECTURA\",\"creditos\":3,\"nota\":14.31},{\"codigo\":\"FOC0104300\",\"nombre\":\"FORMACIÓN CIUDADANA\",\"creditos\":3,\"nota\":15.87},{\"codigo\":\"TEE0104300\",\"nombre\":\"TÉCNICAS DE ESTUDIO\",\"creditos\":3,\"nota\":17.06},{\"codigo\":\"INM0104300\",\"nombre\":\"INTRODUCCIÓN A LA MATEMÁTICA\",\"creditos\":3,\"nota\":14.64},{\"codigo\":\"IT10104300\",\"nombre\":\"INTRODUCCIÓN A LA TECNOLOGÍA DE LA INFORMACIÓN\",\"creditos\":3,\"nota\":10.43},{\"codigo\":\"ADR0102100\",\"nombre\":\"ACTIVIDADES DEPORTIVAS Y RECREATIVAS\",\"creditos\":1,\"nota\":12.33},{\"codigo\":\"IAP0103332\",\"nombre\":\"INTRODUCCIÓN A LAS ARTES PLÁSTICAS\",\"creditos\":3,\"nota\":14.47}],\"fecha_proceso\":\"2026-11-26T17:07:47.219Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_97.png', '/uploads/mock_cedula_97.png', '/uploads/mock_residencia_97.pdf', '/uploads/mock_manutencion_97.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_97.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1570, 1400, 3, 'test_user98@unimar.edu.ve', 'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN', 15.30, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":3,\"materias\":[{\"codigo\":\"ESH0302205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":11.43},{\"codigo\":\"MAT0305311\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":11.74},{\"codigo\":\"CON0305311\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":11.45},{\"codigo\":\"ADM0304311\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":13.01},{\"codigo\":\"DER0304311\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":19.15},{\"codigo\":\"MKT0304311\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":14.42},{\"codigo\":\"ESH0302205\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":19.39},{\"codigo\":\"MAT0305311\",\"nombre\":\"MATEMÁTICA II\",\"creditos\":3,\"nota\":19.45},{\"codigo\":\"CON0305311\",\"nombre\":\"CONTABILIDAD II\",\"creditos\":3,\"nota\":12.04},{\"codigo\":\"ADM0304311\",\"nombre\":\"ADMINISTRACIÓN II\",\"creditos\":3,\"nota\":17.8},{\"codigo\":\"DER0304311\",\"nombre\":\"DERECHO I\",\"creditos\":3,\"nota\":15.13},{\"codigo\":\"MKT0304311\",\"nombre\":\"MERCADOTECNIA I\",\"creditos\":3,\"nota\":18.61}],\"fecha_proceso\":\"2026-11-26T17:07:47.222Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_98.png', '/uploads/mock_cedula_98.png', NULL, NULL, NULL, NULL, '/uploads/mock_club_98.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1571, 1401, 3, 'test_user99@unimar.edu.ve', 'BECA POR DISCAPACIDAD', 14.06, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":5,\"materias\":[{\"codigo\":\"ESH0502207\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 3\",\"creditos\":2,\"nota\":15.66},{\"codigo\":\"CIV0504321\",\"nombre\":\"DERECHO CIVIL III (OBLIGACIONES I)\",\"creditos\":3,\"nota\":10.08},{\"codigo\":\"PEN0504321\",\"nombre\":\"DERECHO PENAL III\",\"creditos\":3,\"nota\":12.31},{\"codigo\":\"DPC0504321\",\"nombre\":\"DERECHO PROCESAL CIVIL I\",\"creditos\":3,\"nota\":11.07},{\"codigo\":\"DEA0504321\",\"nombre\":\"DERECHO ADMINISTRATIVO II\",\"creditos\":3,\"nota\":17.71},{\"codigo\":\"MED0504321\",\"nombre\":\"MEDICINA LEGAL\",\"creditos\":3,\"nota\":17.55}],\"fecha_proceso\":\"2026-11-26T17:07:47.224Z\"}', 'Rechazada', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_99.png', '/uploads/mock_cedula_99.png', '/uploads/mock_residencia_99.pdf', '/uploads/mock_manutencion_99.pdf', '/uploads/mock_informe_medico_99.pdf', NULL, NULL, NULL, NULL, '/uploads/mock_carnet_disc_99.png', NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL),
(1572, 1402, 3, 'test_user100@unimar.edu.ve', 'BECA APRENDIZAJE', 14.07, 'Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.', NULL, '{\"trimestre\":4,\"materias\":[{\"codigo\":\"FIS0405342\",\"nombre\":\"FÍSICA II\",\"creditos\":3,\"nota\":17.85},{\"codigo\":\"MAT0405342\",\"nombre\":\"MATEMÁTICA III\",\"creditos\":3,\"nota\":19.91},{\"codigo\":\"ALN0404342\",\"nombre\":\"ALGEBRA LINEAL\",\"creditos\":3,\"nota\":11.35},{\"codigo\":\"ING0404342\",\"nombre\":\"INGLÉS II\",\"creditos\":3,\"nota\":10.98},{\"codigo\":\"LAF0403142\",\"nombre\":\"LABORATORIO DE FÍSICA I\",\"creditos\":1,\"nota\":14.15},{\"codigo\":\"ESH0402202\",\"nombre\":\"ELECTIVA SOCIO-HUMANÍSTICA 1\",\"creditos\":2,\"nota\":10.18}],\"fecha_proceso\":\"2026-11-26T17:07:47.227Z\"}', 'Pendiente', '2026-11-26 17:07:47', '/uploads/mock_foto_carnet_100.png', '/uploads/mock_cedula_100.png', '/uploads/mock_residencia_100.pdf', '/uploads/mock_manutencion_100.pdf', NULL, NULL, NULL, '/uploads/mock_constancia_notas_100.pdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 100, NULL, NULL);

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
  `motivo_exclusion` text DEFAULT NULL COMMENT 'Razón detallada de por qué no puede volver a solicitar',
  `beca_base_respaldo` varchar(100) DEFAULT NULL COMMENT 'Beca original conservada mientras el estudiante disfruta Beca a la Excelencia Académica',
  `departamento_base_respaldo` varchar(100) DEFAULT NULL COMMENT 'Departamento original asociado a la beca base de respaldo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `students`
--

INSERT INTO `students` (`id`, `nombre`, `apellido`, `cedula`, `sexo`, `fecha_nacimiento`, `telefono`, `carrera`, `semestre`, `indice_global`, `email`, `municipio_residencia`, `ha_tenido_beca`, `beca_perdida`, `motivo_exclusion`, `beca_base_respaldo`, `departamento_base_respaldo`) VALUES
(1001, 'Roy Vincent', 'Gomez Santana', '22652841', 'M', '1994-11-12', '04122265284', 'Ingeniería de Sistemas', 12, 15.84, 'rgomez.2841@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1002, 'Diego', 'Hernández', '25000274', 'F', '1986-11-24', '04161034778', 'Ingeniería Industrial', 3, 16.62, 'estudiante.sim2@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1003, 'María', 'Pérez', '25000411', 'M', '1985-11-24', '04241052167', 'Artes mención Diseño Gráfico', 5, 16.96, 'estudiante.sim3@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1004, 'Gabriel', 'Martínez', '25000548', 'F', '1984-11-24', '04261069556', 'Idiomas Modernos', 5, 12.84, 'estudiante.sim4@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1005, 'Valeria', 'González', '25000685', 'M', '1983-11-24', '04121086945', 'Administración', 6, 0.00, 'estudiante.sim5@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1006, 'Carlos', 'Díaz', '25000822', 'F', '1982-11-24', '04141104334', 'Contaduría Pública', 7, 0.00, 'estudiante.sim6@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1007, 'Daniela', 'Torres', '25000959', 'M', '1988-11-24', '04161121723', 'Derecho', 8, 0.00, 'estudiante.sim7@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1008, 'Andrés', 'Vargas', '25001096', 'F', '1987-11-24', '04241139112', 'Psicología', 9, 0.00, 'estudiante.sim8@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1009, 'Sofía', 'Flores', '25001233', 'M', '1986-11-24', '04261156501', 'Ingeniería de Sistemas', 10, 0.00, 'estudiante.sim9@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1010, 'Luis', 'Rodríguez', '25001370', 'F', '1985-11-24', '04121173890', 'Ingeniería Industrial', 11, 0.00, 'estudiante.sim10@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1011, 'Camila', 'Gómez', '25001507', 'M', '1984-11-24', '04141191279', 'Artes mención Diseño Gráfico', 1, 0.00, 'estudiante.sim11@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1012, 'Diego', 'Hernández', '25001644', 'F', '1983-11-24', '04161208668', 'Idiomas Modernos', 2, 0.00, 'estudiante.sim12@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1013, 'María', 'Pérez', '25001781', 'M', '1982-11-24', '04241226057', 'Administración', 3, 0.00, 'estudiante.sim13@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1014, 'Gabriel', 'Martínez', '25001918', 'F', '1988-11-24', '04261243446', 'Contaduría Pública', 4, 0.00, 'estudiante.sim14@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1015, 'Valeria', 'González', '25002055', 'M', '1987-11-24', '04121260835', 'Derecho', 5, 0.00, 'estudiante.sim15@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1016, 'Carlos', 'Díaz', '25002192', 'F', '1986-11-24', '04141278224', 'Psicología', 6, 0.00, 'estudiante.sim16@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1017, 'Daniela', 'Torres', '25002329', 'M', '1985-11-24', '04161295613', 'Ingeniería de Sistemas', 7, 0.00, 'estudiante.sim17@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1018, 'Andrés', 'Vargas', '25002466', 'F', '1984-11-24', '04241313002', 'Ingeniería Industrial', 8, 0.00, 'estudiante.sim18@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1019, 'Sofía', 'Flores', '25002603', 'M', '1983-11-24', '04261330391', 'Artes mención Diseño Gráfico', 9, 0.00, 'estudiante.sim19@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1020, 'Luis', 'Rodríguez', '25002740', 'F', '1982-11-24', '04121347780', 'Idiomas Modernos', 10, 0.00, 'estudiante.sim20@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1021, 'Camila', 'Gómez', '25002877', 'M', '1988-11-24', '04141365169', 'Administración', 11, 0.00, 'estudiante.sim21@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1022, 'Diego', 'Hernández', '25003014', 'F', '1987-11-24', '04161382558', 'Contaduría Pública', 1, 0.00, 'estudiante.sim22@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1023, 'María', 'Pérez', '25003151', 'M', '1986-11-24', '04241399947', 'Derecho', 2, 0.00, 'estudiante.sim23@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1024, 'Gabriel', 'Martínez', '25003288', 'F', '1985-11-24', '04261417336', 'Psicología', 3, 0.00, 'estudiante.sim24@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1025, 'Valeria', 'González', '25003425', 'M', '1984-11-24', '04121434725', 'Ingeniería de Sistemas', 4, 0.00, 'estudiante.sim25@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1026, 'Carlos', 'Díaz', '25003562', 'F', '1983-11-24', '04141452114', 'Ingeniería Industrial', 5, 0.00, 'estudiante.sim26@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1027, 'Daniela', 'Torres', '25003699', 'M', '1982-11-24', '04161469503', 'Artes mención Diseño Gráfico', 6, 0.00, 'estudiante.sim27@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1028, 'Andrés', 'Vargas', '25003836', 'F', '1988-11-24', '04241486892', 'Idiomas Modernos', 7, 0.00, 'estudiante.sim28@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1029, 'Sofía', 'Flores', '25003973', 'M', '1987-11-24', '04261504281', 'Administración', 8, 0.00, 'estudiante.sim29@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1030, 'Luis', 'Rodríguez', '25004110', 'F', '1986-11-24', '04121521670', 'Contaduría Pública', 9, 0.00, 'estudiante.sim30@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1031, 'Camila', 'Gómez', '25004247', 'M', '1985-11-24', '04141539059', 'Derecho', 10, 0.00, 'estudiante.sim31@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1032, 'Diego', 'Hernández', '25004384', 'F', '1984-11-24', '04161556448', 'Psicología', 11, 0.00, 'estudiante.sim32@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1033, 'María', 'Pérez', '25004521', 'M', '1983-11-24', '04241573837', 'Ingeniería de Sistemas', 1, 0.00, 'estudiante.sim33@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1034, 'Gabriel', 'Martínez', '25004658', 'F', '1982-11-24', '04261591226', 'Ingeniería Industrial', 2, 0.00, 'estudiante.sim34@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1035, 'Valeria', 'González', '25004795', 'M', '1988-11-24', '04121608615', 'Artes mención Diseño Gráfico', 3, 0.00, 'estudiante.sim35@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1036, 'Carlos', 'Díaz', '25004932', 'F', '1987-11-24', '04141626004', 'Idiomas Modernos', 4, 0.00, 'estudiante.sim36@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1037, 'Daniela', 'Torres', '25005069', 'M', '1986-11-24', '04161643393', 'Administración', 5, 0.00, 'estudiante.sim37@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1038, 'Andrés', 'Vargas', '25005206', 'F', '1985-11-24', '04241660782', 'Contaduría Pública', 6, 0.00, 'estudiante.sim38@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1039, 'Sofía', 'Flores', '25005343', 'M', '1984-11-24', '04261678171', 'Derecho', 7, 0.00, 'estudiante.sim39@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1040, 'Luis', 'Rodríguez', '25005480', 'F', '1983-11-24', '04121695560', 'Psicología', 8, 0.00, 'estudiante.sim40@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1041, 'Camila', 'Gómez', '25005617', 'M', '1982-11-24', '04141712949', 'Ingeniería de Sistemas', 9, 0.00, 'estudiante.sim41@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1042, 'Diego', 'Hernández', '25005754', 'F', '1988-11-24', '04161730338', 'Ingeniería Industrial', 10, 0.00, 'estudiante.sim42@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1043, 'María', 'Pérez', '25005891', 'M', '1987-11-24', '04241747727', 'Artes mención Diseño Gráfico', 11, 0.00, 'estudiante.sim43@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1044, 'Gabriel', 'Martínez', '25006028', 'F', '1986-11-24', '04261765116', 'Idiomas Modernos', 1, 0.00, 'estudiante.sim44@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1045, 'Valeria', 'González', '25006165', 'M', '1985-11-24', '04121782505', 'Administración', 2, 0.00, 'estudiante.sim45@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1046, 'Carlos', 'Díaz', '25006302', 'F', '1984-11-24', '04141799894', 'Contaduría Pública', 3, 0.00, 'estudiante.sim46@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1047, 'Daniela', 'Torres', '25006439', 'M', '1983-11-24', '04161817283', 'Derecho', 4, 0.00, 'estudiante.sim47@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1048, 'Andrés', 'Vargas', '25006576', 'F', '1982-11-24', '04241834672', 'Psicología', 5, 0.00, 'estudiante.sim48@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1049, 'Sofía', 'Flores', '25006713', 'M', '1988-11-24', '04261852061', 'Ingeniería de Sistemas', 6, 0.00, 'estudiante.sim49@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1050, 'Luis', 'Rodríguez', '25006850', 'F', '1987-11-24', '04121869450', 'Ingeniería Industrial', 7, 0.00, 'estudiante.sim50@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1178, 'Roy', 'Gomez', '22652840', 'M', '2007-01-15', '04120000000', 'Administración', 2, 18.57, 'rgomez@unimar.edu.ve', 'Gómez', 1, 0, NULL, NULL, NULL),
(1303, 'Estudiante1', 'Prueba1', '30000001', 'F', '2006-09-01', '04120000000', 'Psicología', 6, 14.50, 'test_user1@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1304, 'Estudiante2', 'Prueba2', '30000002', 'M', '2001-04-18', '04120000000', 'Idiomas Modernos', 3, 14.20, 'test_user2@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1305, 'Estudiante3', 'Prueba3', '30000003', 'F', '2008-07-28', '04120000000', 'Contaduría Pública', 6, 14.91, 'test_user3@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1306, 'Estudiante4', 'Prueba4', '30000004', 'F', '2002-07-16', '04120000000', 'Contaduría Pública', 1, 0.00, 'test_user4@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1307, 'Estudiante5', 'Prueba5', '30000005', 'F', '2007-11-14', '04120000000', 'Ingeniería Industrial', 4, 13.71, 'test_user5@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1308, 'Estudiante6', 'Prueba6', '30000006', 'M', '2005-11-06', '04120000000', 'Ingeniería Industrial', 2, 15.38, 'test_user6@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1309, 'Estudiante7', 'Prueba7', '30000007', 'F', '2008-01-07', '04120000000', 'Psicología', 11, 15.61, 'test_user7@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1310, 'Estudiante8', 'Prueba8', '30000008', 'F', '2006-09-19', '04120000000', 'Ingeniería Industrial', 5, 15.95, 'test_user8@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1311, 'Estudiante9', 'Prueba9', '30000009', 'M', '2001-06-07', '04120000000', 'Psicología', 3, 16.00, 'test_user9@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1312, 'Estudiante10', 'Prueba10', '30000010', 'F', '2005-10-20', '04120000000', 'Idiomas Modernos', 11, 14.09, 'test_user10@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1313, 'Estudiante11', 'Prueba11', '30000011', 'F', '2007-04-02', '04120000000', 'Ingeniería de Sistemas', 5, 13.51, 'test_user11@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1314, 'Estudiante12', 'Prueba12', '30000012', 'F', '2001-07-27', '04120000000', 'Contaduría Pública', 2, 14.32, 'test_user12@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1315, 'Estudiante13', 'Prueba13', '30000013', 'F', '2007-02-19', '04120000000', 'Administración', 6, 15.60, 'test_user13@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1316, 'Estudiante14', 'Prueba14', '30000014', 'F', '2006-06-23', '04120000000', 'Derecho', 1, 0.00, 'test_user14@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1317, 'Estudiante15', 'Prueba15', '30000015', 'F', '2002-11-21', '04120000000', 'Idiomas Modernos', 12, 15.82, 'test_user15@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1318, 'Estudiante16', 'Prueba16', '30000016', 'F', '2003-04-15', '04120000000', 'Idiomas Modernos', 12, 11.84, 'test_user16@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1319, 'Estudiante17', 'Prueba17', '30000017', 'F', '2001-08-16', '04120000000', 'Contaduría Pública', 10, 16.72, 'test_user17@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1320, 'Estudiante18', 'Prueba18', '30000018', 'F', '2006-02-06', '04120000000', 'Ingeniería Industrial', 9, 15.14, 'test_user18@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1321, 'Estudiante19', 'Prueba19', '30000019', 'F', '2001-03-21', '04120000000', 'Psicología', 8, 15.43, 'test_user19@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1322, 'Estudiante20', 'Prueba20', '30000020', 'F', '2007-07-08', '04120000000', 'Contaduría Pública', 4, 15.07, 'test_user20@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1323, 'Estudiante21', 'Prueba21', '30000021', 'F', '2007-12-06', '04120000000', 'Administración', 4, 15.02, 'test_user21@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1324, 'Estudiante22', 'Prueba22', '30000022', 'M', '2007-05-12', '04120000000', 'Psicología', 8, 15.41, 'test_user22@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1325, 'Estudiante23', 'Prueba23', '30000023', 'M', '2007-05-15', '04120000000', 'Administración', 4, 14.20, 'test_user23@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1326, 'Estudiante24', 'Prueba24', '30000024', 'F', '2008-05-17', '04120000000', 'Ingeniería Industrial', 2, 13.95, 'test_user24@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1327, 'Estudiante25', 'Prueba25', '30000025', 'F', '2008-02-24', '04120000000', 'Ingeniería Industrial', 1, 0.00, 'test_user25@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1328, 'Estudiante26', 'Prueba26', '30000026', 'F', '2008-12-14', '04120000000', 'Idiomas Modernos', 1, 0.00, 'test_user26@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1329, 'Estudiante27', 'Prueba27', '30000027', 'M', '2003-08-13', '04120000000', 'Psicología', 7, 14.35, 'test_user27@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1330, 'Estudiante28', 'Prueba28', '30000028', 'F', '2004-05-17', '04120000000', 'Idiomas Modernos', 1, 0.00, 'test_user28@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1331, 'Estudiante29', 'Prueba29', '30000029', 'F', '2002-08-28', '04120000000', 'Psicología', 7, 13.16, 'test_user29@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1332, 'Estudiante30', 'Prueba30', '30000030', 'M', '2006-11-19', '04120000000', 'Ingeniería de Sistemas', 10, 16.91, 'test_user30@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1333, 'Estudiante31', 'Prueba31', '30000031', 'M', '2002-06-27', '04120000000', 'Idiomas Modernos', 6, 13.38, 'test_user31@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1334, 'Estudiante32', 'Prueba32', '30000032', 'F', '2008-08-19', '04120000000', 'Idiomas Modernos', 11, 17.01, 'test_user32@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1335, 'Estudiante33', 'Prueba33', '30000033', 'M', '2006-02-02', '04120000000', 'Artes mención Diseño Gráfico', 11, 13.56, 'test_user33@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1336, 'Estudiante34', 'Prueba34', '30000034', 'M', '2008-11-20', '04120000000', 'Contaduría Pública', 12, 12.80, 'test_user34@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1337, 'Estudiante35', 'Prueba35', '30000035', 'F', '2001-07-12', '04120000000', 'Ingeniería de Sistemas', 11, 17.13, 'test_user35@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1338, 'Estudiante36', 'Prueba36', '30000036', 'M', '2002-09-01', '04120000000', 'Derecho', 9, 14.94, 'test_user36@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1339, 'Estudiante37', 'Prueba37', '30000037', 'F', '2003-05-18', '04120000000', 'Ingeniería de Sistemas', 3, 16.44, 'test_user37@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1340, 'Estudiante38', 'Prueba38', '30000038', 'M', '2007-12-26', '04120000000', 'Idiomas Modernos', 11, 11.09, 'test_user38@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1341, 'Estudiante39', 'Prueba39', '30000039', 'F', '2004-01-23', '04120000000', 'Administración', 2, 14.33, 'test_user39@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1342, 'Estudiante40', 'Prueba40', '30000040', 'F', '2008-10-27', '04120000000', 'Administración', 12, 16.44, 'test_user40@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1343, 'Estudiante41', 'Prueba41', '30000041', 'M', '2003-12-05', '04120000000', 'Artes mención Diseño Gráfico', 3, 14.36, 'test_user41@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1344, 'Estudiante42', 'Prueba42', '30000042', 'F', '2004-11-21', '04120000000', 'Psicología', 9, 13.10, 'test_user42@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1345, 'Estudiante43', 'Prueba43', '30000043', 'M', '2004-07-18', '04120000000', 'Idiomas Modernos', 1, 0.00, 'test_user43@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1346, 'Estudiante44', 'Prueba44', '30000044', 'F', '2004-04-16', '04120000000', 'Idiomas Modernos', 12, 18.14, 'test_user44@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1347, 'Estudiante45', 'Prueba45', '30000045', 'M', '2002-10-18', '04120000000', 'Artes mención Diseño Gráfico', 2, 13.11, 'test_user45@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1348, 'Estudiante46', 'Prueba46', '30000046', 'F', '2006-09-22', '04120000000', 'Ingeniería de Sistemas', 10, 17.11, 'test_user46@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1349, 'Estudiante47', 'Prueba47', '30000047', 'M', '2005-09-18', '04120000000', 'Artes mención Diseño Gráfico', 4, 16.71, 'test_user47@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1350, 'Estudiante48', 'Prueba48', '30000048', 'F', '2006-05-27', '04120000000', 'Contaduría Pública', 2, 14.56, 'test_user48@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1351, 'Estudiante49', 'Prueba49', '30000049', 'M', '2008-08-09', '04120000000', 'Ingeniería Industrial', 9, 13.30, 'test_user49@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1352, 'Estudiante50', 'Prueba50', '30000050', 'F', '2007-04-10', '04120000000', 'Idiomas Modernos', 2, 14.16, 'test_user50@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1353, 'Estudiante51', 'Prueba51', '30000051', 'F', '2008-01-22', '04120000000', 'Contaduría Pública', 8, 14.62, 'test_user51@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1354, 'Estudiante52', 'Prueba52', '30000052', 'F', '2006-11-17', '04120000000', 'Idiomas Modernos', 10, 16.86, 'test_user52@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1355, 'Estudiante53', 'Prueba53', '30000053', 'M', '2005-08-08', '04120000000', 'Contaduría Pública', 9, 15.70, 'test_user53@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1356, 'Estudiante54', 'Prueba54', '30000054', 'F', '2001-08-27', '04120000000', 'Artes mención Diseño Gráfico', 1, 0.00, 'test_user54@unimar.edu.ve', 'Marcano', 0, 0, NULL, NULL, NULL),
(1357, 'Estudiante55', 'Prueba55', '30000055', 'M', '2004-05-12', '04120000000', 'Derecho', 12, 14.17, 'test_user55@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1358, 'Estudiante56', 'Prueba56', '30000056', 'F', '2001-02-17', '04120000000', 'Administración', 9, 15.06, 'test_user56@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1359, 'Estudiante57', 'Prueba57', '30000057', 'F', '2002-05-02', '04120000000', 'Administración', 12, 14.80, 'test_user57@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1360, 'Estudiante58', 'Prueba58', '30000058', 'M', '2004-11-24', '04120000000', 'Contaduría Pública', 11, 15.87, 'test_user58@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1361, 'Estudiante59', 'Prueba59', '30000059', 'F', '2005-02-18', '04120000000', 'Ingeniería de Sistemas', 2, 13.04, 'test_user59@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1362, 'Estudiante60', 'Prueba60', '30000060', 'F', '2007-12-11', '04120000000', 'Psicología', 1, 0.00, 'test_user60@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1363, 'Estudiante61', 'Prueba61', '30000061', 'M', '2001-01-19', '04120000000', 'Administración', 6, 15.28, 'test_user61@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1364, 'Estudiante62', 'Prueba62', '30000062', 'M', '2004-02-08', '04120000000', 'Administración', 11, 13.19, 'test_user62@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1365, 'Estudiante63', 'Prueba63', '30000063', 'F', '2002-08-13', '04120000000', 'Artes mención Diseño Gráfico', 1, 0.00, 'test_user63@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1366, 'Estudiante64', 'Prueba64', '30000064', 'F', '2005-08-10', '04120000000', 'Artes mención Diseño Gráfico', 4, 14.69, 'test_user64@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1367, 'Estudiante65', 'Prueba65', '30000065', 'M', '2008-09-21', '04120000000', 'Idiomas Modernos', 10, 13.60, 'test_user65@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1368, 'Estudiante66', 'Prueba66', '30000066', 'F', '2002-12-12', '04120000000', 'Ingeniería Industrial', 5, 14.84, 'test_user66@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1369, 'Estudiante67', 'Prueba67', '30000067', 'F', '2004-05-04', '04120000000', 'Idiomas Modernos', 7, 16.54, 'test_user67@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1370, 'Estudiante68', 'Prueba68', '30000068', 'F', '2003-06-28', '04120000000', 'Contaduría Pública', 2, 15.11, 'test_user68@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1371, 'Estudiante69', 'Prueba69', '30000069', 'F', '2001-11-18', '04120000000', 'Derecho', 2, 16.13, 'test_user69@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1372, 'Estudiante70', 'Prueba70', '30000070', 'F', '2002-05-22', '04120000000', 'Psicología', 7, 15.89, 'test_user70@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1373, 'Estudiante71', 'Prueba71', '30000071', 'M', '2005-05-25', '04120000000', 'Administración', 6, 15.60, 'test_user71@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1374, 'Estudiante72', 'Prueba72', '30000072', 'M', '2002-06-25', '04120000000', 'Administración', 4, 12.74, 'test_user72@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1375, 'Estudiante73', 'Prueba73', '30000073', 'M', '2001-12-16', '04120000000', 'Derecho', 7, 16.72, 'test_user73@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1376, 'Estudiante74', 'Prueba74', '30000074', 'F', '2003-11-18', '04120000000', 'Artes mención Diseño Gráfico', 8, 14.48, 'test_user74@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1377, 'Estudiante75', 'Prueba75', '30000075', 'M', '2008-09-10', '04120000000', 'Psicología', 7, 16.14, 'test_user75@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1378, 'Estudiante76', 'Prueba76', '30000076', 'F', '2008-03-08', '04120000000', 'Derecho', 6, 16.19, 'test_user76@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1379, 'Estudiante77', 'Prueba77', '30000077', 'M', '2008-01-14', '04120000000', 'Ingeniería de Sistemas', 8, 17.70, 'test_user77@unimar.edu.ve', 'Díaz', 0, 0, NULL, NULL, NULL),
(1380, 'Estudiante78', 'Prueba78', '30000078', 'F', '2006-10-08', '04120000000', 'Contaduría Pública', 4, 16.07, 'test_user78@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1381, 'Estudiante79', 'Prueba79', '30000079', 'F', '2003-12-19', '04120000000', 'Derecho', 5, 13.62, 'test_user79@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1382, 'Estudiante80', 'Prueba80', '30000080', 'M', '2002-02-03', '04120000000', 'Contaduría Pública', 1, 0.00, 'test_user80@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1383, 'Estudiante81', 'Prueba81', '30000081', 'F', '2007-12-09', '04120000000', 'Administración', 1, 0.00, 'test_user81@unimar.edu.ve', 'Arismendi', 0, 0, NULL, NULL, NULL),
(1384, 'Estudiante82', 'Prueba82', '30000082', 'F', '2006-10-05', '04120000000', 'Artes mención Diseño Gráfico', 8, 15.33, 'test_user82@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1385, 'Estudiante83', 'Prueba83', '30000083', 'F', '2003-07-14', '04120000000', 'Contaduría Pública', 12, 15.34, 'test_user83@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1386, 'Estudiante84', 'Prueba84', '30000084', 'F', '2003-08-09', '04120000000', 'Ingeniería de Sistemas', 6, 16.52, 'test_user84@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1387, 'Estudiante85', 'Prueba85', '30000085', 'M', '2008-03-15', '04120000000', 'Contaduría Pública', 11, 14.02, 'test_user85@unimar.edu.ve', 'Gómez', 0, 0, NULL, NULL, NULL),
(1388, 'Estudiante86', 'Prueba86', '30000086', 'M', '2007-06-04', '04120000000', 'Artes mención Diseño Gráfico', 12, 12.76, 'test_user86@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1389, 'Estudiante87', 'Prueba87', '30000087', 'M', '2001-07-11', '04120000000', 'Psicología', 12, 13.96, 'test_user87@unimar.edu.ve', 'Villalba', 0, 0, NULL, NULL, NULL),
(1390, 'Estudiante88', 'Prueba88', '30000088', 'F', '2001-01-16', '04120000000', 'Idiomas Modernos', 4, 15.58, 'test_user88@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1391, 'Estudiante89', 'Prueba89', '30000089', 'M', '2006-04-12', '04120000000', 'Ingeniería de Sistemas', 2, 12.01, 'test_user89@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1392, 'Estudiante90', 'Prueba90', '30000090', 'M', '2003-09-22', '04120000000', 'Artes mención Diseño Gráfico', 8, 16.04, 'test_user90@unimar.edu.ve', 'Antolín del Campo', 0, 0, NULL, NULL, NULL),
(1393, 'Estudiante91', 'Prueba91', '30000091', 'F', '2006-12-18', '04120000000', 'Contaduría Pública', 6, 15.34, 'test_user91@unimar.edu.ve', 'Tubores', 0, 0, NULL, NULL, NULL),
(1394, 'Estudiante92', 'Prueba92', '30000092', 'F', '2002-11-22', '04120000000', 'Ingeniería Industrial', 10, 16.57, 'test_user92@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1395, 'Estudiante93', 'Prueba93', '30000093', 'F', '2002-07-27', '04120000000', 'Psicología', 4, 15.97, 'test_user93@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1396, 'Estudiante94', 'Prueba94', '30000094', 'F', '2004-06-06', '04120000000', 'Artes mención Diseño Gráfico', 9, 17.08, 'test_user94@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1397, 'Estudiante95', 'Prueba95', '30000095', 'F', '2001-01-07', '04120000000', 'Contaduría Pública', 10, 14.03, 'test_user95@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1398, 'Estudiante96', 'Prueba96', '30000096', 'F', '2003-09-26', '04120000000', 'Derecho', 1, 0.00, 'test_user96@unimar.edu.ve', 'Península de Macanao', 0, 0, NULL, NULL, NULL),
(1399, 'Estudiante97', 'Prueba97', '30000097', 'M', '2007-04-28', '04120000000', 'Artes mención Diseño Gráfico', 1, 0.00, 'test_user97@unimar.edu.ve', 'Mariño', 0, 0, NULL, NULL, NULL),
(1400, 'Estudiante98', 'Prueba98', '30000098', 'M', '2008-06-24', '04120000000', 'Administración', 3, 15.30, 'test_user98@unimar.edu.ve', 'Maneiro', 0, 0, NULL, NULL, NULL),
(1401, 'Estudiante99', 'Prueba99', '30000099', 'M', '2003-06-25', '04120000000', 'Derecho', 5, 14.06, 'test_user99@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL),
(1402, 'Estudiante100', 'Prueba100', '30000100', 'F', '2007-01-27', '04120000000', 'Ingeniería Industrial', 4, 14.07, 'test_user100@unimar.edu.ve', 'García', 0, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('estudiante','admin','secretaria') NOT NULL DEFAULT 'estudiante',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `created_at`) VALUES
(0, 'sistema@unimar.edu.ve', 'SYSTEM_BOT_NO_LOGIN', 'admin', '2026-02-18 18:52:39'),
(1, 'Admin@unimar.edu.ve', '$2b$10$yEWZ8SvgvU9n/.j/CDxR1uk9ZlVa5prL3fWmjntsGjneerZuVyjr2', 'admin', '2026-02-12 05:17:42'),
(1001, 'rgomez.2841@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1002, 'estudiante.sim2@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1003, 'estudiante.sim3@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1004, 'estudiante.sim4@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1005, 'estudiante.sim5@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1006, 'estudiante.sim6@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1007, 'estudiante.sim7@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1008, 'estudiante.sim8@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1009, 'estudiante.sim9@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1010, 'estudiante.sim10@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1011, 'estudiante.sim11@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1012, 'estudiante.sim12@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1013, 'estudiante.sim13@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1014, 'estudiante.sim14@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1015, 'estudiante.sim15@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1016, 'estudiante.sim16@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1017, 'estudiante.sim17@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1018, 'estudiante.sim18@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1019, 'estudiante.sim19@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1020, 'estudiante.sim20@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1021, 'estudiante.sim21@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1022, 'estudiante.sim22@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1023, 'estudiante.sim23@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1024, 'estudiante.sim24@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1025, 'estudiante.sim25@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1026, 'estudiante.sim26@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1027, 'estudiante.sim27@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1028, 'estudiante.sim28@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1029, 'estudiante.sim29@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1030, 'estudiante.sim30@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1031, 'estudiante.sim31@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1032, 'estudiante.sim32@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1033, 'estudiante.sim33@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1034, 'estudiante.sim34@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1035, 'estudiante.sim35@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1036, 'estudiante.sim36@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1037, 'estudiante.sim37@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1038, 'estudiante.sim38@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1039, 'estudiante.sim39@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1040, 'estudiante.sim40@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1041, 'estudiante.sim41@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1042, 'estudiante.sim42@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1043, 'estudiante.sim43@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1044, 'estudiante.sim44@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1045, 'estudiante.sim45@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1046, 'estudiante.sim46@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1047, 'estudiante.sim47@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1048, 'estudiante.sim48@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1049, 'estudiante.sim49@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1050, 'estudiante.sim50@unimar.edu.ve', '$2b$10$.aKIJ7DRNmTig/HB7xyUEeNrsO64WzpK0ZaCHd7ZEZGIjE2GNSegi', 'estudiante', '2026-11-24 19:44:27'),
(1153, 'SecretariaGeneral@unimar.edu.ve', '$2b$10$kL6kX3fla4DIgzdEYN9ToOsT9sNjUKPUQOhwTkikkXJVH60taytOS', 'secretaria', '2026-11-25 19:05:09'),
(1178, 'rgomez@unimar.edu.ve', '$2b$10$H4p5YuuK2F9rvyORqVoNHu5yUKnxqfCxSZ7wj1w5.s5tZcVYcLl5S', 'estudiante', '2026-11-26 15:51:16'),
(1303, 'test_user1@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1304, 'test_user2@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1305, 'test_user3@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1306, 'test_user4@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1307, 'test_user5@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1308, 'test_user6@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1309, 'test_user7@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1310, 'test_user8@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1311, 'test_user9@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1312, 'test_user10@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1313, 'test_user11@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1314, 'test_user12@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1315, 'test_user13@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1316, 'test_user14@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:46'),
(1317, 'test_user15@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1318, 'test_user16@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1319, 'test_user17@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1320, 'test_user18@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1321, 'test_user19@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1322, 'test_user20@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1323, 'test_user21@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1324, 'test_user22@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1325, 'test_user23@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1326, 'test_user24@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1327, 'test_user25@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1328, 'test_user26@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1329, 'test_user27@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1330, 'test_user28@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1331, 'test_user29@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1332, 'test_user30@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1333, 'test_user31@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1334, 'test_user32@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1335, 'test_user33@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1336, 'test_user34@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1337, 'test_user35@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1338, 'test_user36@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1339, 'test_user37@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1340, 'test_user38@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1341, 'test_user39@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1342, 'test_user40@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1343, 'test_user41@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1344, 'test_user42@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1345, 'test_user43@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1346, 'test_user44@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1347, 'test_user45@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1348, 'test_user46@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1349, 'test_user47@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1350, 'test_user48@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1351, 'test_user49@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1352, 'test_user50@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1353, 'test_user51@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1354, 'test_user52@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1355, 'test_user53@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1356, 'test_user54@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1357, 'test_user55@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1358, 'test_user56@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1359, 'test_user57@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1360, 'test_user58@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1361, 'test_user59@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1362, 'test_user60@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1363, 'test_user61@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1364, 'test_user62@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1365, 'test_user63@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1366, 'test_user64@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1367, 'test_user65@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1368, 'test_user66@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1369, 'test_user67@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1370, 'test_user68@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1371, 'test_user69@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1372, 'test_user70@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1373, 'test_user71@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1374, 'test_user72@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1375, 'test_user73@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1376, 'test_user74@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1377, 'test_user75@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1378, 'test_user76@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1379, 'test_user77@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1380, 'test_user78@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1381, 'test_user79@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1382, 'test_user80@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1383, 'test_user81@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1384, 'test_user82@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1385, 'test_user83@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1386, 'test_user84@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1387, 'test_user85@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1388, 'test_user86@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1389, 'test_user87@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1390, 'test_user88@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1391, 'test_user89@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1392, 'test_user90@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1393, 'test_user91@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1394, 'test_user92@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1395, 'test_user93@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1396, 'test_user94@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1397, 'test_user95@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1398, 'test_user96@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1399, 'test_user97@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1400, 'test_user98@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1401, 'test_user99@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47'),
(1402, 'test_user100@unimar.edu.ve', '$2b$10$lQcMBgKK3SJP..Zmbo0ZleEwzTTU6YYDyXB479GM.UBIL0pShMoju', 'estudiante', '2026-11-26 17:07:47');

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
-- Indices de la tabla `record_academico`
--
ALTER TABLE `record_academico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_record_student_materia` (`student_id`,`pensum_materia_id`),
  ADD UNIQUE KEY `uk_record_student_codigo_trim` (`student_id`,`codigo_materia`,`trimestre_cursado`),
  ADD KEY `idx_record_student_trimestre` (`student_id`,`trimestre_cursado`),
  ADD KEY `idx_record_student_aprobada` (`student_id`,`aprobada`),
  ADD KEY `fk_record_pensum` (`pensum_materia_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `estudios_socioeconomicos`
--
ALTER TABLE `estudios_socioeconomicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1471;

--
-- AUTO_INCREMENT de la tabla `historial_aprobaciones`
--
ALTER TABLE `historial_aprobaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

--
-- AUTO_INCREMENT de la tabla `pensum_materias`
--
ALTER TABLE `pensum_materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=697;

--
-- AUTO_INCREMENT de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `record_academico`
--
ALTER TABLE `record_academico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8753;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1573;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1403;

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
-- Filtros para la tabla `record_academico`
--
ALTER TABLE `record_academico`
  ADD CONSTRAINT `fk_record_pensum` FOREIGN KEY (`pensum_materia_id`) REFERENCES `pensum_materias` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_record_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

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
