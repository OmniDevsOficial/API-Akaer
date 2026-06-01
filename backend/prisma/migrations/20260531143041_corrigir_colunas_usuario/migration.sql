/*
  Warnings:

  - You are about to drop the column `cargo` on the `solicitacoes_normas` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `solicitacoes_normas` table. All the data in the column will be lost.
  - Added the required column `cargo` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `solicitacoes_normas` DROP COLUMN `cargo`,
    DROP COLUMN `telefone`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `cargo` VARCHAR(40) NOT NULL,
    ADD COLUMN `telefone` VARCHAR(30) NULL,
    MODIFY `role` ENUM('ADMIN', 'VISUALIZADOR', 'CHECKER') NOT NULL DEFAULT 'VISUALIZADOR';
