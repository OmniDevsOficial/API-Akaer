/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'TECNICO', 'CHECKER') NOT NULL DEFAULT 'CHECKER';

-- CreateTable
CREATE TABLE `solicitacoes_normas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('Pendente', 'Reprovada', 'Aprovada', 'Concluida') NOT NULL DEFAULT 'Pendente',
    `tipo_solicitacao` ENUM('Inclusao', 'Alteracao', 'Exclusao') NOT NULL,
    `norma_id` VARCHAR(50) NULL,
    `dados_propostos` JSON NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuario_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `solicitacoes_normas` ADD CONSTRAINT `solicitacoes_normas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitacoes_normas` ADD CONSTRAINT `solicitacoes_normas_norma_id_fkey` FOREIGN KEY (`norma_id`) REFERENCES `norma`(`codigo`) ON DELETE SET NULL ON UPDATE CASCADE;
