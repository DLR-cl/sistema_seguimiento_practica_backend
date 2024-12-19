/*
  Warnings:

  - You are about to drop the `subdimensionesevaluativas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `caracter_empresa` to the `Empresas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamano_empresa` to the `Empresas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_telefono` to the `jefe_alumno` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `preguntas` DROP FOREIGN KEY `Preguntas_id_dimension_fkey`;

-- DropForeignKey
ALTER TABLE `subdimensionesevaluativas` DROP FOREIGN KEY `SubDimensionesEvaluativas_idDimensionPadre_fkey`;

-- AlterTable
ALTER TABLE `empresas` ADD COLUMN `caracter_empresa` ENUM('PRIVADA', 'PUBLICA') NOT NULL,
    ADD COLUMN `tamano_empresa` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `jefe_alumno` ADD COLUMN `numero_telefono` VARCHAR(30) NOT NULL;

-- DropTable
DROP TABLE `subdimensionesevaluativas`;

-- AddForeignKey
ALTER TABLE `Preguntas` ADD CONSTRAINT `Preguntas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;
