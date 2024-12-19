-- CreateTable
CREATE TABLE `AlumnasNomina` (
    `id_alumno` INTEGER NOT NULL AUTO_INCREMENT,
    `rut` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `AlumnasNomina_rut_key`(`rut`),
    PRIMARY KEY (`id_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(250) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `rut` CHAR(10) NOT NULL,
    `primerSesion` BOOLEAN NOT NULL DEFAULT true,
    `tipo_usuario` ENUM('JEFE_CARRERA', 'ALUMNO_PRACTICA', 'JEFE_DEPARTAMENTO', 'SECRETARIA', 'JEFE_EMPLEADOR', 'ACADEMICO', 'ADMINISTRADOR') NOT NULL,

    UNIQUE INDEX `usuario_correo_key`(`correo`),
    UNIQUE INDEX `usuario_rut_key`(`rut`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `id_empresa` INTEGER NOT NULL,
    `numero_telefono` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academico` (
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresas` (
    `id_empresa` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_razon_social` VARCHAR(100) NOT NULL,
    `ubicacion` VARCHAR(100) NOT NULL,
    `rubro` VARCHAR(100) NOT NULL,
    `caracter_empresa` ENUM('PRIVADA', 'PUBLICA') NOT NULL,
    `tamano_empresa` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_empresa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Practicas` (
    `id_practica` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_practica` ENUM('PRACTICA_UNO', 'PRACTICA_DOS') NOT NULL,
    `estado` ENUM('CURSANDO', 'ESPERA_INFORMES', 'REVISION_GENERAL', 'FINALIZADA', 'INFORMES_RECIBIDOS') NOT NULL,
    `cantidad_horas` INTEGER NOT NULL,
    `horas_semanales` INTEGER NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_termino` DATETIME(3) NOT NULL,
    `modalidad` ENUM('PRESENCIAL', 'SEMI_PRESENCIAL', 'REMOTO') NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `id_supervisor` INTEGER NOT NULL,

    PRIMARY KEY (`id_practica`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformesAlumno` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_practica` INTEGER NOT NULL,
    `id_alumno` INTEGER NOT NULL,
    `archivo` VARCHAR(300) NULL,
    `archivo_correccion` VARCHAR(300) NULL,
    `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA', 'ESPERA') NOT NULL,
    `id_academico` INTEGER NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `intentos` INTEGER NOT NULL DEFAULT 3,
    `fecha_inicio_revision` DATE NULL,
    `fecha_termino_revision` DATE NULL,

    UNIQUE INDEX `InformesAlumno_id_practica_key`(`id_practica`),
    PRIMARY KEY (`id_informe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentariosPractica` (
    `comentario` VARCHAR(300) NOT NULL,
    `id_informe` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id_informe`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeAlumno` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `texto` VARCHAR(300) NULL,
    `puntaje` INTEGER NULL,
    `nota` DECIMAL(5, 1) NULL,

    PRIMARY KEY (`id_informe`, `id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AsignaturasEnRespuestasInforme` (
    `id_informe` INTEGER NOT NULL,
    `id_pregunta` INTEGER NOT NULL,
    `nombre_asignatura` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_informe`, `id_pregunta`, `nombre_asignatura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformeConfidencial` (
    `id_informe_confidencial` INTEGER NOT NULL AUTO_INCREMENT,
    `horas_practicas_regulares` INTEGER NULL,
    `horas_practicas_extraordinarias` INTEGER NULL,
    `total_horas` INTEGER NULL,
    `horas_semanales` INTEGER NULL,
    `horas_inasistencia` INTEGER NULL,
    `nota_evaluacion` DECIMAL(5, 1) NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_envio` DATETIME(3) NULL,
    `estado` ENUM('ENVIADA', 'REVISION', 'APROBADA', 'CORRECCION', 'DESAPROBADA', 'ESPERA') NOT NULL,
    `fecha_inicio_revision` DATE NULL,
    `fecha_termino_revision` DATE NULL,
    `fecha_inicio_practica` DATE NULL,
    `fecha_fin_practica` DATE NULL,
    `fecha_real_revision` DATE NULL,
    `id_supervisor` INTEGER NOT NULL,
    `id_alumno_evaluado` INTEGER NOT NULL,
    `id_practica` INTEGER NOT NULL,
    `id_academico` INTEGER NULL,

    UNIQUE INDEX `InformeConfidencial_id_practica_key`(`id_practica`),
    PRIMARY KEY (`id_informe_confidencial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InformeEvaluacionAcademicos` (
    `id_informe` INTEGER NOT NULL AUTO_INCREMENT,
    `id_academico` INTEGER NOT NULL,
    `id_informe_alumno` INTEGER NOT NULL,
    `id_informe_confidencial` INTEGER NOT NULL,
    `fecha_revision` DATE NOT NULL,

    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_alumno_key`(`id_informe_alumno`),
    UNIQUE INDEX `InformeEvaluacionAcademicos_id_informe_confidencial_key`(`id_informe_confidencial`),
    PRIMARY KEY (`id_informe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeEvaluacion` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeEvaluacion` (
    `respuesta_texto` VARCHAR(300) NULL,
    `puntos` INTEGER NULL,
    `pregunta_id` INTEGER NOT NULL,
    `informe_id` INTEGER NOT NULL,

    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeAlumno` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Preguntas` (
    `id_pregunta` INTEGER NOT NULL AUTO_INCREMENT,
    `enunciado_pregunta` VARCHAR(400) NOT NULL,
    `tipo_pregunta` ENUM('ABIERTA', 'CERRADA', 'EVALUATIVA', 'DESARROLLO_PROFESIONAL', 'REVISION_ACADEMICA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO') NOT NULL,
    `id_dimension` INTEGER NOT NULL,

    UNIQUE INDEX `Preguntas_enunciado_pregunta_key`(`enunciado_pregunta`),
    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreguntasImplementadasInformeConfidencial` (
    `id_pregunta` INTEGER NOT NULL,

    PRIMARY KEY (`id_pregunta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RespuestasInformeConfidencial` (
    `respuesta_texto` VARCHAR(300) NULL,
    `puntos` INTEGER NULL,
    `pregunta_id` INTEGER NOT NULL,
    `informe_id` INTEGER NOT NULL,

    PRIMARY KEY (`pregunta_id`, `informe_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DimensionesEvaluativas` (
    `id_dimension` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `descripcion` VARCHAR(400) NOT NULL,

    PRIMARY KEY (`id_dimension`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignaturas` (
    `nombre` VARCHAR(100) NOT NULL,
    `tipo_asignatura` ENUM('FORMACION_BASICA', 'FORMACION_GENERAL', 'FORMACION_PROFESIONAL') NOT NULL,
    `semestre` DECIMAL(5, 1) NOT NULL,
    `codigo` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`nombre`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `alumno_practica` ADD CONSTRAINT `alumno_practica_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jefe_alumno` ADD CONSTRAINT `jefe_alumno_id_empresa_fkey` FOREIGN KEY (`id_empresa`) REFERENCES `Empresas`(`id_empresa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academico` ADD CONSTRAINT `academico_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Practicas` ADD CONSTRAINT `Practicas_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_alumno_fkey` FOREIGN KEY (`id_alumno`) REFERENCES `alumno_practica`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformesAlumno` ADD CONSTRAINT `InformesAlumno_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeAlumno` ADD CONSTRAINT `RespuestasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `PreguntasImplementadasInformeAlumno`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_id_informe_id_pregunta_fkey` FOREIGN KEY (`id_informe`, `id_pregunta`) REFERENCES `RespuestasInformeAlumno`(`id_informe`, `id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AsignaturasEnRespuestasInforme` ADD CONSTRAINT `AsignaturasEnRespuestasInforme_nombre_asignatura_fkey` FOREIGN KEY (`nombre_asignatura`) REFERENCES `Asignaturas`(`nombre`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_practica_fkey` FOREIGN KEY (`id_practica`) REFERENCES `Practicas`(`id_practica`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeConfidencial` ADD CONSTRAINT `InformeConfidencial_id_supervisor_fkey` FOREIGN KEY (`id_supervisor`) REFERENCES `jefe_alumno`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_academico_fkey` FOREIGN KEY (`id_academico`) REFERENCES `academico`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_alumno_fkey` FOREIGN KEY (`id_informe_alumno`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InformeEvaluacionAcademicos` ADD CONSTRAINT `InformeEvaluacionAcademicos_id_informe_confidencial_fkey` FOREIGN KEY (`id_informe_confidencial`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeEvaluacion` ADD CONSTRAINT `PreguntasImplementadasInformeEvaluacion_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeEvaluacionAcademicos`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeEvaluacion` ADD CONSTRAINT `RespuestasInformeEvaluacion_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeEvaluacion`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeAlumno` ADD CONSTRAINT `PreguntasImplementadasInformeAlumno_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Preguntas` ADD CONSTRAINT `Preguntas_id_dimension_fkey` FOREIGN KEY (`id_dimension`) REFERENCES `DimensionesEvaluativas`(`id_dimension`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreguntasImplementadasInformeConfidencial` ADD CONSTRAINT `PreguntasImplementadasInformeConfidencial_id_pregunta_fkey` FOREIGN KEY (`id_pregunta`) REFERENCES `Preguntas`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_informe_id_fkey` FOREIGN KEY (`informe_id`) REFERENCES `InformeConfidencial`(`id_informe_confidencial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RespuestasInformeConfidencial` ADD CONSTRAINT `RespuestasInformeConfidencial_pregunta_id_fkey` FOREIGN KEY (`pregunta_id`) REFERENCES `PreguntasImplementadasInformeConfidencial`(`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;
