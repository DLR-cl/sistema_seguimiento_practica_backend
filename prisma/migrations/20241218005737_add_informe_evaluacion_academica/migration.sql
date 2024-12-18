-- AlterTable
ALTER TABLE `preguntas` MODIFY `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARROLLO_PROFESIONAL', 'REVISION_ACADEMICA') NOT NULL;

-- CreateTable
CREATE TABLE `InformeEvaluacionAcademicos` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_academico` INTEGER NOT NULL,
    `id_informe_alumno` INTEGER NOT NULL,
    `id_informe_confidencial` INTEGER NOT NULL,
    `fecha_revision` DATE NOT NULL,

    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_alumno_key`(`id_informe_alumno`),
    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_confidencial_key`(`id_informe_confidencial`),
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

    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_alumno_fkey` FOREIGN KEY (`id_informe_alumno`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_confidencial_fkey` FOREIGN KEY (`id_informe_confidencial`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeEvaluacion` ADD CONSTRAINT `PreguntasImplementadasInformeEvaluacion_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeEvaluacionAcademicos`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeEvaluacion`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;
