-- DropForeignKey
ALTER TABLE `subdimensionesevaluativas` DROP FOREIGN KEY `SubDimensionesEvaluativas_id_dimension_fkey`;

-- AddForeignKey
ALTER TABLE `SubDimensionesEvaluativas` ADD CONSTRAINT `SubDimensionesEvaluativas_idDimensionPadre_fkey` FOREIGN KEY (`idDimensionPadre`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;
