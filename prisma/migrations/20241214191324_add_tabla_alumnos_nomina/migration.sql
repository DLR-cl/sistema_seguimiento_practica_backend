-- CreateTable
CREATE TABLE `AlumnasNomina` (
    `id_alumno` INTEGER NOT NULL AUTO_INCREMENT,
    `rut` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(200) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_alumno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
