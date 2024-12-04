/*
  Warnings:

  - You are about to alter the column `codigo` on the `asignaturas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `semestre` on the `asignaturas` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.
  - The primary key for the `asignaturasenrespuestasinforme` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `asignaturasenrespuestasinforme` DROP FOREIGN KEY `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey`;

-- AlterTable
ALTER TABLE `asignaturas` MODIFY `codigo` VARCHAR(100) NOT NULL,
    MODIFY `semestre` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `asignaturasenrespuestasinforme` DROP PRIMARY KEY,
    MODIFY `nombre_asignatura` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_informe`, `id_pregunta`, `nombre_asignatura`);

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey` FOREIGN KEY (`nombre_asignatura`) REFERENCES `Asignaturas`(`nombre`) ON DELETE RESTRICT ON UPDATE CASCADE;
