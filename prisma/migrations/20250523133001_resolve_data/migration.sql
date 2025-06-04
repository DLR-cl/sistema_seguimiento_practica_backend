/*
  Warnings:

  - You are about to drop the column `archivo` on the `informesalumno` table. All the data in the column will be lost.
  - You are about to drop the column `perfil` on the `usuario` table. All the data in the column will be lost.
  - Added the required column `fecha_termino` to the `InformesAlumno` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `empresas` MODIFY `rubro` VARCHAR(100) NULL,
    MODIFY `caracter_empresa` ENUM('PRIVADA', 'PUBLICA') NULL,
    MODIFY `tamano_empresa` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `informesalumno` DROP COLUMN `archivo`,
    ADD COLUMN `archivo_alumno` VARCHAR(300) NULL,
    ADD COLUMN `fecha_termino` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `perfil`;
