/*
  Warnings:

  - You are about to drop the column `puntaje_respuesta` on the `preguntas` table. All the data in the column will be lost.
  - The values [DESARRROLLO_PROFESIONAL] on the enum `Preguntas_tipo_pregunta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `preguntas` DROP COLUMN `puntaje_respuesta`,
    MODIFY `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARROLLO_PROFESIONAL') NOT NULL;
