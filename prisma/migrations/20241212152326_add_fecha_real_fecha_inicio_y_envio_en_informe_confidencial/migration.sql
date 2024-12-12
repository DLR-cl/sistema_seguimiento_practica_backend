/*
  Warnings:

  - Added the required column `fecha_inicio` to the `InformeConfidencial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `informeconfidencial` ADD COLUMN `fecha_envio` DATETIME(3) NULL,
    ADD COLUMN `fecha_inicio` DATETIME(3) NOT NULL,
    ADD COLUMN `fecha_real_revision` DATE NULL,
    MODIFY `horas_practicas_regulares` INTEGER NULL,
    MODIFY `horas_practicas_extraordinarias` INTEGER NULL,
    MODIFY `total_horas` INTEGER NULL,
    MODIFY `horas_inasistencia` INTEGER NULL;
