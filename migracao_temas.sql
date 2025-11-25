-- =====================================================
-- MIGRAÇÃO DO SISTEMA DE TEMAS
-- De: padrao, simples, moderado, moderno
-- Para: blue-light, blue-dark, green-light, green-dark, purple-light, purple-dark
-- =====================================================

-- Backup dos dados antes da migração (opcional)
-- CREATE TABLE "User_backup" AS SELECT * FROM "User";
-- CREATE TABLE "GlobalSettings_backup" AS SELECT * FROM "GlobalSettings";

BEGIN TRANSACTION;

-- Atualizar tabela User
-- Mapear temas antigos para novos equivalentes
UPDATE "User" SET "themePreset" = 'blue-light' WHERE "themePreset" = 'padrao';
UPDATE "User" SET "themePreset" = 'green-light' WHERE "themePreset" = 'simples';
UPDATE "User" SET "themePreset" = 'purple-light' WHERE "themePreset" = 'moderado';
UPDATE "User" SET "themePreset" = 'blue-dark' WHERE "themePreset" = 'moderno';

-- Atualizar tabela GlobalSettings
UPDATE "GlobalSettings" SET "superadminThemePreset" = 'blue-light' WHERE "superadminThemePreset" = 'padrao';
UPDATE "GlobalSettings" SET "superadminThemePreset" = 'green-light' WHERE "superadminThemePreset" = 'simples';
UPDATE "GlobalSettings" SET "superadminThemePreset" = 'purple-light' WHERE "superadminThemePreset" = 'moderado';
UPDATE "GlobalSettings" SET "superadminThemePreset" = 'blue-dark' WHERE "superadminThemePreset" = 'moderno';

-- Atualizar updatedAt timestamp
UPDATE "GlobalSettings" SET "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;

-- Verificar migração
SELECT 
  "themePreset", 
  COUNT(*) as total 
FROM "User" 
WHERE "themePreset" IS NOT NULL 
GROUP BY "themePreset";

SELECT 
  "superadminThemePreset", 
  "allowOfficeOverride", 
  "allowUserOverride" 
FROM "GlobalSettings" 
WHERE id = 1;

-- Se houver erros, use ROLLBACK em vez de COMMIT
