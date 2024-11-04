/*
  Warnings:

  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_alumno` on the `usuario` table. All the data in the column will be lost.
  - You are about to alter the column `rut` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `Char(12)` to `Char(10)`.
  - Added the required column `id_usuario` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `usuario_password_key` ON `usuario`;

-- AlterTable
ALTER TABLE `usuario` DROP PRIMARY KEY,
    DROP COLUMN `id_alumno`,
    ADD COLUMN `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `rut` CHAR(10) NOT NULL,
    ADD PRIMARY KEY (`id_usuario`);

-- CreateTable
CREATE TABLE `alumno_practica` (
    `id_user` INTEGER NOT NULL,
    `primer_practica` BOOLEAN NOT NULL DEFAULT false,
    `segunda_practica` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jefe_alumno` (
    `id_user` INTEGER NOT NULL,
    `cargo` VARCHAR(60) NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academico` (
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `alumno_practica` ADD CONSTRAINT `alumno_practica_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academico` ADD CONSTRAINT `academico_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
