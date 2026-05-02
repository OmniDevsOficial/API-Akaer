ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('ADMIN', 'TECNICO', 'VISUALIZADOR') NOT NULL DEFAULT 'VISUALIZADOR';

CREATE TABLE `norma_relacionada` (
  `norma_codigo` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `relacionada_codigo` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ordem` SMALLINT NOT NULL DEFAULT 0,

  PRIMARY KEY (`norma_codigo`, `relacionada_codigo`),
  INDEX `norma_relacionada_relacionada_codigo_idx`(`relacionada_codigo`),
  
  CONSTRAINT `norma_relacionada_norma_codigo_fkey`
    FOREIGN KEY (`norma_codigo`) REFERENCES `norma`(`codigo`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
    
  CONSTRAINT `norma_relacionada_relacionada_codigo_fkey`
    FOREIGN KEY (`relacionada_codigo`) REFERENCES `norma`(`codigo`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;