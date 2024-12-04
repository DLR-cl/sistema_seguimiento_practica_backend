/*
  Warnings:

  - The primary key for the `asignaturas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `codigo` on the `asignaturas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `asignaturas` DROP PRIMARY KEY,
    MODIFY `nombre` VARCHAR(200) NOT NULL,
    MODIFY `codigo` VARCHAR(100) NOT NULL,
    ADD PRIMARY KEY (`nombre`);
