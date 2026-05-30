/*
  Warnings:

  - Added the required column `criador_id` to the `norma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargo` to the `solicitacoes_normas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `solicitacoes_normas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `norma` ADD COLUMN `criador_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `solicitacoes_normas` ADD COLUMN `cargo` VARCHAR(40) NOT NULL,
    ADD COLUMN `telefone` VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE `norma` ADD CONSTRAINT `norma_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
