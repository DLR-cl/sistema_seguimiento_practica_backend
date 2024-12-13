/*
  Warnings:

  - You are about to alter the column `nota_evaluacion` on the `informeconfidencial` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(5,1)`.

*/
-- AlterTable
ALTER TABLE `informeconfidencial` MODIFY `nota_evaluacion` DECIMAL(5, 1) NULL;
