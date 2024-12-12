/*
  Warnings:

  - Added the required column `fecha_inicio` to the `InformesAlumno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `informesalumno` ADD COLUMN `fecha_inicio` DATETIME(3) NOT NULL;
