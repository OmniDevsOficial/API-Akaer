-- AlterTable
ALTER TABLE `norma` ADD COLUMN `descricao` TEXT NULL,
    ADD COLUMN `notas` TEXT NULL;

-- CreateTable
CREATE TABLE `norma_correlacao` (
    `norma_codigo` VARCHAR(50) NOT NULL,
    `correlacao_codigo` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`norma_codigo`, `correlacao_codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `norma_correlacao` ADD CONSTRAINT `norma_correlacao_norma_codigo_fkey` FOREIGN KEY (`norma_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `norma_correlacao` ADD CONSTRAINT `norma_correlacao_correlacao_codigo_fkey` FOREIGN KEY (`correlacao_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
