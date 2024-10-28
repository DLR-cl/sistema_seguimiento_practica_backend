/*
  Warnings:

  - You are about to alter the column `tipo_usuario` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(40)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `usuario` MODIFY `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA', 'JEFE_EMPLEADOR') NOT NULL;
