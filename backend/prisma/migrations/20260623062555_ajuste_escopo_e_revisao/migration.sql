/*
  Warnings:

  - You are about to alter the column `revisao` on the `norma` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Char(1)`.

*/
-- AlterTable
ALTER TABLE `norma` MODIFY `revisao` CHAR(1) NOT NULL,
    MODIFY `escopo` TEXT NULL;
