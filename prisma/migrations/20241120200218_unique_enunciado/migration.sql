/*
  Warnings:

  - You are about to drop the column `id_informe_alumno` on the `practicas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[enunciado_pregunta]` on the table `Preguntas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `practicas` DROP COLUMN `id_informe_alumno`;

-- CreateIndex
CREATE UNIQUE INDEX `Preguntas_enunciado_pregunta_key` ON `Preguntas`(`enunciado_pregunta`);
