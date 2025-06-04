/*
  Warnings:

  - You are about to drop the column `archivo_alumno` on the `informesalumno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `informesalumno` DROP COLUMN `archivo_alumno`,
    ADD COLUMN `archivo` VARCHAR(300) NULL;
