-- DropIndex
DROP INDEX `categoria_nome_key` ON `categoria`;

-- AlterTable
ALTER TABLE `categoria` ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `nivel` TINYINT NOT NULL DEFAULT 1,
    ADD COLUMN `ordem` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `parent_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `categoria_parent_id_idx` ON `categoria`(`parent_id`);

-- AddForeignKey
ALTER TABLE `categoria` ADD CONSTRAINT `categoria_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
