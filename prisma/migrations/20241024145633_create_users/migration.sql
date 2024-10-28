-- CreateTable
CREATE TABLE `usuario` (
    `id_alumno` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(250) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `rut` CHAR(12) NOT NULL,
    `tipo_usuario` VARCHAR(40) NOT NULL,

    UNIQUE INDEX `usuario_password_key`(`password`),
    UNIQUE INDEX `usuario_correo_key`(`correo`),
    UNIQUE INDEX `usuario_rut_key`(`rut`),
    PRIMARY KEY (`id_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
