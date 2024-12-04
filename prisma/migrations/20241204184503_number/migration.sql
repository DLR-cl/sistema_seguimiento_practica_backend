/*
  Warnings:

  - You are about to alter the column `semestre` on the `asignaturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,1)`.

*/
-- AlterTable
ALTER TABLE `asignaturas` MODIFY `semestre` DECIMAL(5, 1) NOT NULL;
