/*
  Warnings:

  - A unique constraint covering the columns `[rut]` on the table `AlumnasNomina` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AlumnasNomina_rut_key` ON `AlumnasNomina`(`rut`);
