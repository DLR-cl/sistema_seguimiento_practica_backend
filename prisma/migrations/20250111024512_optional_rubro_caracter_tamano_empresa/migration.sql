-- AlterTable
ALTER TABLE `Empresas` MODIFY `rubro` VARCHAR(100) NULL,
    MODIFY `caracter_empresa` ENUM('PRIVADA', 'PUBLICA') NULL,
    MODIFY `tamano_empresa` VARCHAR(100) NULL;
