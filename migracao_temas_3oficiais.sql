-- ================================================================
-- MIGRAÇÃO DE TEMAS - SISTEMA OFICIAL (3 TEMAS ÚNICOS)
-- Execução: Limpar banco de dados e migrar para apenas 3 temas
-- Data: 25/11/2025
-- ================================================================

BEGIN TRANSACTION;

-- 1. MIGRAR USUÁRIOS PARA OS 3 TEMAS OFICIAIS
UPDATE "User"
SET "themePreset" = CASE
  -- Manter os 3 temas oficiais
  WHEN "themePreset" IN ('simples', 'moderado', 'moderno') THEN "themePreset"
  
  -- Migrar temas antigos para equivalentes
  WHEN "themePreset" = 'padrao-light' THEN 'simples'
  WHEN "themePreset" = 'padrao-dark' THEN 'moderno'
  WHEN "themePreset" = 'blue-light' THEN 'simples'
  WHEN "themePreset" = 'blue-dark' THEN 'moderno'
  WHEN "themePreset" = 'green-light' THEN 'simples'
  WHEN "themePreset" = 'green-dark' THEN 'moderado'
  WHEN "themePreset" = 'purple-light' THEN 'moderado'
  WHEN "themePreset" = 'purple-dark' THEN 'moderno'
  
  -- Se não estiver mapeado ou for NULL, usar simples
  ELSE 'simples'
END
WHERE "themePreset" IS NOT NULL;

-- 2. MIGRAR GLOBALSET TINGS PARA OS 3 TEMAS OFICIAIS
UPDATE "GlobalSettings"
SET "superadminThemePreset" = CASE
  -- Manter os 3 temas oficiais
  WHEN "superadminThemePreset" IN ('simples', 'moderado', 'moderno') THEN "superadminThemePreset"
  
  -- Migrar temas antigos para equivalentes
  WHEN "superadminThemePreset" = 'padrao-light' THEN 'simples'
  WHEN "superadminThemePreset" = 'padrao-dark' THEN 'moderno'
  WHEN "superadminThemePreset" = 'blue-light' THEN 'simples'
  WHEN "superadminThemePreset" = 'blue-dark' THEN 'moderno'
  WHEN "superadminThemePreset" = 'green-light' THEN 'simples'
  WHEN "superadminThemePreset" = 'green-dark' THEN 'moderado'
  WHEN "superadminThemePreset" = 'purple-light' THEN 'moderado'
  WHEN "superadminThemePreset" = 'purple-dark' THEN 'moderno'
  
  -- Se não estiver mapeado, usar simples
  ELSE 'simples'
END;

-- 3. ATUALIZAR updatedAt DO GLOBALSETTINGS
UPDATE "GlobalSettings"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 1;

-- 4. VERIFICAR RESULTADOS
-- Verificar temas únicos nos usuários
SELECT "themePreset", COUNT(*) as total
FROM "User"
WHERE "themePreset" IS NOT NULL
GROUP BY "themePreset"
ORDER BY "themePreset";

-- Verificar tema global
SELECT "superadminThemePreset", "allowOfficeOverride", "allowUserOverride"
FROM "GlobalSettings"
WHERE id = 1;

-- 5. RESULTADO ESPERADO:
-- User.themePreset deve ter APENAS: simples, moderado, moderno (e NULL)
-- GlobalSettings.superadminThemePreset deve ser: simples, moderado ou moderno

COMMIT;

-- EM CASO DE ERRO, EXECUTAR:
-- ROLLBACK;
