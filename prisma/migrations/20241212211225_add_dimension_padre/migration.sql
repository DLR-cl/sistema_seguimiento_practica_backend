/*
  Warnings:

  - You are about to alter the column `descripcion` on the `dimensionesevaluativas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `preguntas` DROP FOREIGN KEY `Preguntas_id_dimension_fkey`;

-- AlterTable
ALTER TABLE `dimensionesevaluativas` MODIFY `nombre` VARCHAR(191) NOT NULL,
    MODIFY `descripcion` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `SubDimensionesEvaluativas` (
    `id_dimension` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `idDimensionPadre` INTEGER NOT NULL,

    PRIMARY KEY (`id_dimension`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Preguntas` ADD CONSTRAINT `Preguntas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `SubDimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubDimensionesEvaluativas` ADD CONSTRAINT `SubDimensionesEvaluativas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;
