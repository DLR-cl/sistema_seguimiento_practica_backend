/*
  Warnings:

  - The values [SECRETARIA] on the enum `usuario_tipo_usuario` will be removed. If these variants are still used in the database, this will fail.
  - The values [SECRETARIA] on the enum `usuario_tipo_usuario` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `administrador` MODIFY `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA_DEPARTAMENTO', 'SECRETARIA_CARRERA', 'JEFE_EMPLEADOR', 'ACADEMICO', 'ADMINISTRADOR') NOT NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA_DEPARTAMENTO', 'SECRETARIA_CARRERA', 'JEFE_EMPLEADOR', 'ACADEMICO', 'ADMINISTRADOR') NOT NULL;
