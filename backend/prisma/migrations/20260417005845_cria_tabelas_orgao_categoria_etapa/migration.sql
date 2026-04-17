/*
  Warnings:

  - You are about to drop the column `categoria` on the `norma` table. All the data in the column will be lost.
  - You are about to drop the column `etapa_projeto` on the `norma` table. All the data in the column will be lost.
  - You are about to drop the column `orgao_emissor` on the `norma` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `norma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgao_emissor_id` to the `norma` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `norma` DROP COLUMN `categoria`,
    DROP COLUMN `etapa_projeto`,
    DROP COLUMN `orgao_emissor`,
    ADD COLUMN `categoria_id` INTEGER NOT NULL,
    ADD COLUMN `etapa_projeto_id` INTEGER NULL,
    ADD COLUMN `orgao_emissor_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `orgao_emissor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `orgao_emissor_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `categoria_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etapa_projeto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `etapa_projeto_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `norma` ADD CONSTRAINT `norma_orgao_emissor_id_fkey` FOREIGN KEY (`orgao_emissor_id`) REFERENCES `orgao_emissor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `norma` ADD CONSTRAINT `norma_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `norma` ADD CONSTRAINT `norma_etapa_projeto_id_fkey` FOREIGN KEY (`etapa_projeto_id`) REFERENCES `etapa_projeto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
