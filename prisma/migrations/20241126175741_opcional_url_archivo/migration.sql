/*
  Warnings:

  - Added the required column `codigo` to the `Asignaturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semestre` to the `Asignaturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_asignatura` to the `Asignaturas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `asignaturas` ADD COLUMN `codigo` VARCHAR(191) NOT NULL,
    ADD COLUMN `semestre` INTEGER NOT NULL,
    ADD COLUMN `tipo_asignatura` ENUM('FORMACION_BASICA', 'FORMACION_GENERAL', 'FORMACION_PROFESIONAL') NOT NULL;

-- AlterTable
ALTER TABLE `informesalumno` MODIFY `archivo` VARCHAR(300) NULL;
