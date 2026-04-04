/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(0))`.
  - Added the required column `nome` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users`
  ADD COLUMN `nome` VARCHAR(100) NOT NULL DEFAULT 'Administrador',
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL,
  MODIFY COLUMN `role` ENUM('ADMIN', 'VISUALIZADOR') NOT NULL DEFAULT 'VISUALIZADOR',
  ADD COLUMN `ativo` TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `users` ALTER COLUMN `nome` DROP DEFAULT;