-- CreateTable
CREATE TABLE `norma` (
    `codigo` VARCHAR(50) NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `orgao_emissor` VARCHAR(25) NOT NULL,
    `categoria` VARCHAR(100) NOT NULL,
    `etapa_projeto` VARCHAR(100) NULL,
    `revisao` VARCHAR(20) NULL,
    `status` ENUM('Ativa', 'Obsoleta') NOT NULL DEFAULT 'Ativa',
    `data_publicacao` DATE NOT NULL,
    `arquivo` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
