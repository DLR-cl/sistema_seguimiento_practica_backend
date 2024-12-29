/*
  Warnings:

  - A unique constraint covering the columns `[id_informe_alumno,id_informe_confidencial]` on the table `InformeEvaluacionAcademicos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` DROP FOREIGN KEY `InformeEvaluacionAcademicos_id_informe_alumno_fkey`;

-- AlterTable
ALTER TABLE `InformeEvaluacionAcademicos` MODIFY `id_informe_alumno` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_alumno_id_informe_con_key` ON `InformeEvaluacionAcademicos`(`id_informe_alumno`, `id_informe_confidencial`);

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_alumno_fkey` FOREIGN KEY (`id_informe_alumno`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE SET NULL ON UPDATE CASCADE;
