/*
  Warnings:

  - Added the required column `id_empresa` to the `jefe_alumno` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `academico` DROP FOREIGN KEY `academico_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `alumno_practica` DROP FOREIGN KEY `alumno_practica_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `jefe_alumno` DROP FOREIGN KEY `jefe_alumno_id_user_fkey`;

-- AlterTable
ALTER TABLE `jefe_alumno` ADD COLUMN `id_empresa` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Secretarias` (
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresas` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_razon_social` VARCHAR(100) NOT NULL,
    `ubicacion` VARCHAR(100) NOT NULL,
    `rubro` VARCHAR(100) NOT NULL,
    `nombre_gerente` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Practicas` (
    `id_practica` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_practica` ENUM('PRACTICA_UNO', 'PRACTICA_DOS') NOT NULL,
    `cantidad_horas` INTEGER NOT NULL,
    `horas_semanales` INTEGER NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_termino` DATETIME(3) NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'SEMI_PRESENCIAL', 'REMOTO') NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `id_supervisor` INTEGER NOT NULL,
    `id_informe_alumno` INTEGER NULL,

    PRIMARY KEY (`id_practica`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformesAlumno` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_practica` INTEGER NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `archivo` VARCHAR(300) NOT NULL,
    `id_academico` INTEGER NULL,

    UNIQUE INDEX `InformesAlumno_id_practica_key`(`id_practica`),
    PRIMARY KEY (`id_informe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeAlumno` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `texto` VARCHAR(300) NULL,
    `puntaje` INTEGER NULL,
    `nombre_asignatura` VARCHAR(100) NULL,

    PRIMARY KEY (`id_informe`, `id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignaturasEnRespuestasInforme` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `nombre_asignatura` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_informe`, `id_pregunta`, `nombre_asignatura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformeConfidencial` (
    `id_informe_confidencial` INTEGER NOT NULL AUTO_INCREMENT,
    `horas_practicas_regulares` INTEGER NOT NULL,
    `horas_practicas_extraordinarias` INTEGER NOT NULL,
    `total_horas` INTEGER NOT NULL,
    `horas_inasistencia` INTEGER NOT NULL,
    `nota_evaluacion` INTEGER NULL,
    `id_supervisor` INTEGER NOT NULL,
    `id_alumno_evaluado` INTEGER NOT NULL,
    `id_practica` INTEGER NOT NULL,
    `id_academico` INTEGER NULL,

    UNIQUE INDEX `InformeConfidencial_id_alumno_evaluado_key`(`id_alumno_evaluado`),
    UNIQUE INDEX `InformeConfidencial_id_practica_key`(`id_practica`),
    PRIMARY KEY (`id_informe_confidencial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeAlumno` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preguntas` (
    `id_pregunta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_informe` INTEGER NOT NULL,
    `enunciado_pregunta` VARCHAR(200) NOT NULL,
    `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARRROLLO_PROFESIONAL') NOT NULL,
    `id_dimension` INTEGER NOT NULL,
    `puntaje_respuesta` INTEGER NULL,

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

    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DimensionesEvaluativas` (
    `id_dimension` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id_dimension`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignaturas` (
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`nombre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Secretarias` ADD CONSTRAINT `Secretarias_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alumno_practica` ADD CONSTRAINT `alumno_practica_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `Empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academico` ADD CONSTRAINT `academico_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `PreguntasImplementadasInformeAlumno`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey` FOREIGN KEY (`id_informe`, `id_pregunta`) REFERENCES `RespuestasInformeAlumno`(`id_informe`, `id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey` FOREIGN KEY (`nombre_asignatura`) REFERENCES `Asignaturas`(`nombre`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeAlumno` ADD CONSTRAINT `PreguntasImplementadasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preguntas` ADD CONSTRAINT `Preguntas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeConfidencial` ADD CONSTRAINT `PreguntasImplementadasInformeConfidencial_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeConfidencial`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;
