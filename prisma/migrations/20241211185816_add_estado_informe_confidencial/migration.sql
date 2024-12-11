/*
  Warnings:

  - Added the required column `estado` to the `InformeConfidencial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `informeconfidencial` ADD COLUMN `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA') NOT NULL;
