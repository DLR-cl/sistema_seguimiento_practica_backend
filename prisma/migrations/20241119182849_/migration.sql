/*
  Warnings:

  - You are about to drop the column `id_informe` on the `preguntas` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_asignatura` on the `respuestasinformealumno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `preguntas` DROP COLUMN `id_informe`;

-- AlterTable
ALTER TABLE `respuestasinformealumno` DROP COLUMN `nombre_asignatura`;
