/*
  Warnings:

  - You are about to drop the `administrador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alumnasnomina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asignaturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asignaturasenrespuestasinforme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comentariospractica` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dimensionesevaluativas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `empresas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `informeconfidencial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `informeevaluacionacademicos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `informesalumno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `practicas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preguntas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preguntasimplementadasinformealumno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preguntasimplementadasinformeconfidencial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `preguntasimplementadasinformeevaluacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `respuestasinformealumno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `respuestasinformeconfidencial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `respuestasinformeevaluacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `asignaturasenrespuestasinforme` DROP FOREIGN KEY `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `asignaturasenrespuestasinforme` DROP FOREIGN KEY `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey`;

-- DropForeignKey
ALTER TABLE `comentariospractica` DROP FOREIGN KEY `comentariosPractica_id_informe_fkey`;

-- DropForeignKey
ALTER TABLE `comentariospractica` DROP FOREIGN KEY `comentariosPractica_id_usuario_fkey`;

-- DropForeignKey
ALTER TABLE `informeconfidencial` DROP FOREIGN KEY `InformeConfidencial_id_academico_fkey`;

-- DropForeignKey
ALTER TABLE `informeconfidencial` DROP FOREIGN KEY `InformeConfidencial_id_practica_fkey`;

-- DropForeignKey
ALTER TABLE `informeconfidencial` DROP FOREIGN KEY `InformeConfidencial_id_supervisor_fkey`;

-- DropForeignKey
ALTER TABLE `informeevaluacionacademicos` DROP FOREIGN KEY `InformeEvaluacionAcademicos_id_academico_fkey`;

-- DropForeignKey
ALTER TABLE `informeevaluacionacademicos` DROP FOREIGN KEY `InformeEvaluacionAcademicos_id_informe_alumno_fkey`;

-- DropForeignKey
ALTER TABLE `informeevaluacionacademicos` DROP FOREIGN KEY `InformeEvaluacionAcademicos_id_informe_confidencial_fkey`;

-- DropForeignKey
ALTER TABLE `informesalumno` DROP FOREIGN KEY `InformesAlumno_id_academico_fkey`;

-- DropForeignKey
ALTER TABLE `informesalumno` DROP FOREIGN KEY `InformesAlumno_id_alumno_fkey`;

-- DropForeignKey
ALTER TABLE `informesalumno` DROP FOREIGN KEY `InformesAlumno_id_practica_fkey`;

-- DropForeignKey
ALTER TABLE `jefe_alumno` DROP FOREIGN KEY `jefe_alumno_id_empresa_fkey`;

-- DropForeignKey
ALTER TABLE `practicas` DROP FOREIGN KEY `Practicas_id_alumno_fkey`;

-- DropForeignKey
ALTER TABLE `practicas` DROP FOREIGN KEY `Practicas_id_supervisor_fkey`;

-- DropForeignKey
ALTER TABLE `preguntas` DROP FOREIGN KEY `Preguntas_id_dimension_fkey`;

-- DropForeignKey
ALTER TABLE `preguntasimplementadasinformealumno` DROP FOREIGN KEY `PreguntasImplementadasInformeAlumno_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `preguntasimplementadasinformeconfidencial` DROP FOREIGN KEY `PreguntasImplementadasInformeConfidencial_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `preguntasimplementadasinformeevaluacion` DROP FOREIGN KEY `PreguntasImplementadasInformeEvaluacion_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformealumno` DROP FOREIGN KEY `RespuestasInformeAlumno_id_informe_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformealumno` DROP FOREIGN KEY `RespuestasInformeAlumno_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformeconfidencial` DROP FOREIGN KEY `RespuestasInformeConfidencial_informe_id_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformeconfidencial` DROP FOREIGN KEY `RespuestasInformeConfidencial_pregunta_id_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformeevaluacion` DROP FOREIGN KEY `RespuestasInformeEvaluacion_informe_id_fkey`;

-- DropForeignKey
ALTER TABLE `respuestasinformeevaluacion` DROP FOREIGN KEY `RespuestasInformeEvaluacion_pregunta_id_fkey`;

-- DropTable
DROP TABLE `administrador`;

-- DropTable
DROP TABLE `alumnasnomina`;

-- DropTable
DROP TABLE `asignaturas`;

-- DropTable
DROP TABLE `asignaturasenrespuestasinforme`;

-- DropTable
DROP TABLE `comentariospractica`;

-- DropTable
DROP TABLE `dimensionesevaluativas`;

-- DropTable
DROP TABLE `empresas`;

-- DropTable
DROP TABLE `informeconfidencial`;

-- DropTable
DROP TABLE `informeevaluacionacademicos`;

-- DropTable
DROP TABLE `informesalumno`;

-- DropTable
DROP TABLE `practicas`;

-- DropTable
DROP TABLE `preguntas`;

-- DropTable
DROP TABLE `preguntasimplementadasinformealumno`;

-- DropTable
DROP TABLE `preguntasimplementadasinformeconfidencial`;

-- DropTable
DROP TABLE `preguntasimplementadasinformeevaluacion`;

-- DropTable
DROP TABLE `respuestasinformealumno`;

-- DropTable
DROP TABLE `respuestasinformeconfidencial`;

-- DropTable
DROP TABLE `respuestasinformeevaluacion`;

-- CreateTable
CREATE TABLE `AlumnasNomina` (
    `id_alumno` INTEGER NOT NULL AUTO_INCREMENT,
    `rut` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `AlumnasNomina_rut_key`(`rut`),
    PRIMARY KEY (`id_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Administrador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `correo` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA_DEPARTAMENTO', 'SECRETARIA_CARRERA', 'JEFE_EMPLEADOR', 'ACADEMICO', 'ADMINISTRADOR') NOT NULL,
    `primerSesion` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Administrador_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresas` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_razon_social` VARCHAR(100) NOT NULL,
    `ubicacion` VARCHAR(100) NOT NULL,
    `rubro` VARCHAR(100) NULL,
    `caracter_empresa` ENUM('PRIVADA', 'PUBLICA') NULL,
    `tamano_empresa` VARCHAR(100) NULL,

    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Practicas` (
    `id_practica` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_practica` ENUM('PRACTICA_UNO', 'PRACTICA_DOS') NOT NULL,
    `estado` ENUM('CURSANDO', 'ESPERA_INFORMES', 'REVISION_GENERAL', 'FINALIZADA', 'INFORMES_RECIBIDOS') NOT NULL,
    `cantidad_horas` INTEGER NOT NULL,
    `horas_semanales` INTEGER NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_termino` DATETIME(3) NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'SEMI_PRESENCIAL', 'REMOTO') NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `id_supervisor` INTEGER NOT NULL,

    INDEX `Practicas_id_alumno_fkey`(`id_alumno`),
    INDEX `Practicas_id_supervisor_fkey`(`id_supervisor`),
    PRIMARY KEY (`id_practica`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformesAlumno` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_practica` INTEGER NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `archivo` VARCHAR(300) NULL,
    `archivo_correccion` VARCHAR(300) NULL,
    `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA', 'ESPERA') NOT NULL,
    `id_academico` INTEGER NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_termino` DATETIME(3) NOT NULL,
    `intentos` INTEGER NOT NULL DEFAULT 3,
    `fecha_inicio_revision` DATE NULL,
    `fecha_termino_revision` DATE NULL,

    UNIQUE INDEX `InformesAlumno_id_practica_key`(`id_practica`),
    INDEX `InformesAlumno_id_academico_fkey`(`id_academico`),
    INDEX `InformesAlumno_id_alumno_fkey`(`id_alumno`),
    PRIMARY KEY (`id_informe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentariosPractica` (
    `comentario` VARCHAR(300) NOT NULL,
    `id_informe` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    INDEX `comentariosPractica_id_usuario_fkey`(`id_usuario`),
    PRIMARY KEY (`id_informe`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeAlumno` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `texto` VARCHAR(300) NULL,
    `puntaje` INTEGER NULL,
    `nota` DECIMAL(5, 1) NULL,

    INDEX `RespuestasInformeAlumno_id_pregunta_fkey`(`id_pregunta`),
    PRIMARY KEY (`id_informe`, `id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignaturasEnRespuestasInforme` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `nombre_asignatura` VARCHAR(191) NOT NULL,

    INDEX `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey`(`nombre_asignatura`),
    PRIMARY KEY (`id_informe`, `id_pregunta`, `nombre_asignatura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformeConfidencial` (
    `id_informe_confidencial` INTEGER NOT NULL AUTO_INCREMENT,
    `horas_practicas_regulares` INTEGER NULL,
    `horas_practicas_extraordinarias` INTEGER NULL,
    `total_horas` INTEGER NULL,
    `horas_semanales` INTEGER NULL,
    `horas_inasistencia` INTEGER NULL,
    `nota_evaluacion` DECIMAL(5, 1) NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_envio` DATETIME(3) NULL,
    `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA', 'ESPERA') NOT NULL,
    `fecha_inicio_revision` DATE NULL,
    `fecha_termino_revision` DATE NULL,
    `fecha_inicio_practica` DATE NULL,
    `fecha_fin_practica` DATE NULL,
    `fecha_real_revision` DATE NULL,
    `id_supervisor` INTEGER NOT NULL,
    `id_alumno_evaluado` INTEGER NOT NULL,
    `id_practica` INTEGER NOT NULL,
    `id_academico` INTEGER NULL,

    UNIQUE INDEX `InformeConfidencial_id_practica_key`(`id_practica`),
    INDEX `InformeConfidencial_id_academico_fkey`(`id_academico`),
    INDEX `InformeConfidencial_id_supervisor_fkey`(`id_supervisor`),
    PRIMARY KEY (`id_informe_confidencial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformeEvaluacionAcademicos` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_academico` INTEGER NOT NULL,
    `id_informe_alumno` INTEGER NULL,
    `id_informe_confidencial` INTEGER NOT NULL,
    `fecha_revision` DATE NOT NULL,

    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_alumno_key`(`id_informe_alumno`),
    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_confidencial_key`(`id_informe_confidencial`),
    INDEX `InformeEvaluacionAcademicos_id_academico_fkey`(`id_academico`),
    PRIMARY KEY (`id_informe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeEvaluacion` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeEvaluacion` (
    `respuesta_texto` VARCHAR(300) NULL,
    `puntos` INTEGER NULL,
    `pregunta_id` INTEGER NOT NULL,
    `informe_id` INTEGER NOT NULL,

    INDEX `RespuestasInformeEvaluacion_informe_id_fkey`(`informe_id`),
    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeAlumno` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preguntas` (
    `id_pregunta` INTEGER NOT NULL AUTO_INCREMENT,
    `enunciado_pregunta` VARCHAR(400) NOT NULL,
    `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARROLLO_PROFESIONAL', 'REVISION_ACADEMICA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO') NOT NULL,
    `id_dimension` INTEGER NOT NULL,

    UNIQUE INDEX `Preguntas_enunciado_pregunta_key`(`enunciado_pregunta`),
    INDEX `Preguntas_id_dimension_fkey`(`id_dimension`),
    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeConfidencial` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeConfidencial` (
    `respuesta_texto` VARCHAR(300) NULL,
    `puntos` INTEGER NULL,
    `pregunta_id` INTEGER NOT NULL,
    `informe_id` INTEGER NOT NULL,

    INDEX `RespuestasInformeConfidencial_informe_id_fkey`(`informe_id`),
    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DimensionesEvaluativas` (
    `id_dimension` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` VARCHAR(400) NOT NULL,

    PRIMARY KEY (`id_dimension`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignaturas` (
    `nombre` VARCHAR(100) NOT NULL,
    `tipo_asignatura` ENUM('FORMACION_BASICA', 'FORMACION_GENERAL', 'FORMACION_PROFESIONAL') NOT NULL,
    `semestre` DECIMAL(5, 1) NOT NULL,
    `codigo` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`nombre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `Empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `PreguntasImplementadasInformeAlumno`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey` FOREIGN KEY (`id_informe`, `id_pregunta`) REFERENCES `RespuestasInformeAlumno`(`id_informe`, `id_pregunta`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey` FOREIGN KEY (`nombre_asignatura`) REFERENCES `Asignaturas`(`nombre`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_alumno_fkey` FOREIGN KEY (`id_informe_alumno`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_confidencial_fkey` FOREIGN KEY (`id_informe_confidencial`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeEvaluacion` ADD CONSTRAINT `PreguntasImplementadasInformeEvaluacion_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeEvaluacionAcademicos`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeEvaluacion`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeAlumno` ADD CONSTRAINT `PreguntasImplementadasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preguntas` ADD CONSTRAINT `Preguntas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeConfidencial` ADD CONSTRAINT `PreguntasImplementadasInformeConfidencial_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeConfidencial`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;
