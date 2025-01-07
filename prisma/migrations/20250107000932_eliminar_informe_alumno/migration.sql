-- DropForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` DROP FOREIGN KEY `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey`;

-- DropForeignKey
ALTER TABLE `RespuestasInformeAlumno` DROP FOREIGN KEY `RespuestasInformeAlumno_id_informe_fkey`;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey` FOREIGN KEY (`id_informe`, `id_pregunta`) REFERENCES `RespuestasInformeAlumno`(`id_informe`, `id_pregunta`) ON DELETE CASCADE ON UPDATE CASCADE;
