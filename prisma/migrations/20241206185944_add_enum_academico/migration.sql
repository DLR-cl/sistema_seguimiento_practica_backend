-- DropIndex
DROP INDEX `InformeConfidencial_id_alumno_evaluado_key` ON `informeconfidencial`;

-- AlterTable
ALTER TABLE `usuario` MODIFY `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA', 'JEFE_EMPLEADOR', 'ACADEMICO') NOT NULL;
