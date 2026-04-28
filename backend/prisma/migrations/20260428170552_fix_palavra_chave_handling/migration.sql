/*
  Warnings:

  - You are about to drop the column `palavrasChave` on the `norma` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `norma` DROP COLUMN `palavrasChave`,
    ADD COLUMN `palavras_chave` JSON NULL;
