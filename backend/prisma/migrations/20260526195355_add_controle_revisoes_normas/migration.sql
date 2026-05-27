-- Migration: add_controle_revisoes_normas
-- Adds `codigo_base`, makes `revisao` NOT NULL, and adds `is_vigente`
-- to the `norma` table to support append-only revision control.

-- -----------------------------------------------------------------------
-- STEP 1: Add new columns
-- -----------------------------------------------------------------------
ALTER TABLE `norma`
  ADD COLUMN `codigo_base` VARCHAR(50) NULL AFTER `codigo`;

ALTER TABLE `norma`
  ADD COLUMN `is_vigente` BOOLEAN NOT NULL DEFAULT FALSE AFTER `revisao`;

-- -----------------------------------------------------------------------
-- STEP 2: Backfill existing rows
-- -----------------------------------------------------------------------
UPDATE `norma`
SET `codigo_base` = `codigo`
WHERE `codigo_base` IS NULL;

UPDATE `norma`
SET `is_vigente` = TRUE
WHERE `status` = 'Ativa';

UPDATE `norma` n
INNER JOIN (
  SELECT codigo_base, MAX(data_publicacao) AS max_pub
  FROM `norma`
  WHERE is_vigente = TRUE
  GROUP BY codigo_base
  HAVING COUNT(*) > 1
) keeper ON n.codigo_base = keeper.codigo_base
SET n.is_vigente = FALSE,
    n.status     = 'Obsoleta'
WHERE n.is_vigente = TRUE
  AND n.data_publicacao < keeper.max_pub;

-- -----------------------------------------------------------------------
-- STEP 3: Enforce constraints
-- -----------------------------------------------------------------------
ALTER TABLE `norma`
  MODIFY COLUMN `codigo_base` VARCHAR(50) NOT NULL;

ALTER TABLE `norma`
  MODIFY COLUMN `revisao` VARCHAR(20) NOT NULL;

CREATE UNIQUE INDEX `norma_codigo_base_revisao_key`
  ON `norma`(`codigo_base`, `revisao`);

CREATE INDEX `norma_codigo_base_idx`
  ON `norma`(`codigo_base`);

CREATE INDEX `norma_is_vigente_idx`
  ON `norma`(`is_vigente`);