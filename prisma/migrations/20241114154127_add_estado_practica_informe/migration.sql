/*
  Warnings:

  - You are about to drop the `secretarias` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `estado` to the `InformesAlumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `Practicas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `secretarias` DROP FOREIGN KEY `Secretarias_id_user_fkey`;

-- AlterTable
ALTER TABLE `informesalumno` ADD COLUMN `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA') NOT NULL;

-- AlterTable
ALTER TABLE `practicas` ADD COLUMN `estado` ENUM('CURSANDO', 'REVISION_INFORME_ALUMNO', 'CORRECCION_INFORME_ALUMNO', 'ESPERA_INFORME_CONFIDENCIAL', 'REVISION_GENERAL', 'APROBADA', 'DESAPROBADA', 'FINALIZADA') NOT NULL;

-- DropTable
DROP TABLE `secretarias`;
