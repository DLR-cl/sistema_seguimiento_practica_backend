-- AlterTable
ALTER TABLE `informeconfidencial` ADD COLUMN `fecha_inicio_revision` DATE NULL,
    ADD COLUMN `fecha_termino_revision` DATE NULL;

-- AlterTable
ALTER TABLE `informesalumno` ADD COLUMN `fecha_inicio_revision` DATE NULL,
    ADD COLUMN `fecha_termino_revision` DATE NULL;
