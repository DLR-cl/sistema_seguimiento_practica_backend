-- AlterTable
ALTER TABLE `preguntas` MODIFY `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARROLLO_PROFESIONAL', 'REVISION_ACADEMICA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO') NOT NULL;
