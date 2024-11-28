/*
  Warnings:

  - The values [APROBADA,DESAPROBADA] on the enum `Practicas_estado` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `practicas` MODIFY `estado` ENUM('CURSANDO', 'REVISION_INFORME_ALUMNO', 'CORRECCION_INFORME_ALUMNO', 'ESPERA_INFORME_CONFIDENCIAL', 'REVISION_GENERAL', 'FINALIZADA') NOT NULL;
