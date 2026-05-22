/*
  Warnings:
  - The primary key for the `norma` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[codigo]` on the table `norma` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `norma` table without a default value. This is not possible if the table is not empty.
*/

-- 1. Desconecta as tabelas filhas temporariamente
ALTER TABLE `norma_notas` DROP FOREIGN KEY `norma_notas_norma_codigo_fkey`;
ALTER TABLE `solicitacoes_normas` DROP FOREIGN KEY `solicitacoes_normas_norma_id_fkey`;
ALTER TABLE `norma_relacionada` DROP FOREIGN KEY `norma_relacionada_norma_codigo_fkey`;
ALTER TABLE `norma_relacionada` DROP FOREIGN KEY `norma_relacionada_relacionada_codigo_fkey`;

-- 2. Tira a PK antiga e adiciona a coluna ID
ALTER TABLE `norma` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- 3. Transforma a coluna código em Única
CREATE UNIQUE INDEX `norma_codigo_key` ON `norma`(`codigo`);

-- 4. Reconecta as tabelas filhas apontando de volta para a coluna código
ALTER TABLE `norma_notas` ADD CONSTRAINT `norma_notas_norma_codigo_fkey` FOREIGN KEY (`norma_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `solicitacoes_normas` ADD CONSTRAINT `solicitacoes_normas_norma_id_fkey` FOREIGN KEY (`norma_id`) REFERENCES `norma`(`codigo`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `norma_relacionada` ADD CONSTRAINT `norma_relacionada_norma_codigo_fkey` FOREIGN KEY (`norma_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `norma_relacionada` ADD CONSTRAINT `norma_relacionada_relacionada_codigo_fkey` FOREIGN KEY (`relacionada_codigo`) REFERENCES `norma`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;