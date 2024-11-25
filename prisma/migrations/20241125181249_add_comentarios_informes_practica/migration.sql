-- CreateTable
CREATE TABLE `comentariosPractica` (
    `comentario` VARCHAR(300) NOT NULL,
    `id_informe` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id_informe`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_informe_fkey` FOREIGN KEY (`id_informe`) REFERENCES `InformesAlumno`(`id_informe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentariosPractica` ADD CONSTRAINT `comentariosPractica_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
