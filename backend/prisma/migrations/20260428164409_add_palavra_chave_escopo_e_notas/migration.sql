-- AlterTable
ALTER TABLE `norma` ADD COLUMN `escopo` VARCHAR(191) NULL,
    ADD COLUMN `palavrasChave` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `norma_notas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `norma_codigo` VARCHAR(50) NOT NULL,
    `texto` TEXT NOT NULL,
    `ordem` SMALLINT NOT NULL DEFAULT 0,

    INDEX `norma_notas_norma_codigo_idx`(`norma_codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `norma_notas` ADD CONSTRAINT `norma_notas_norma_codigo_fkey` FOREIGN KEY (`norma_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
