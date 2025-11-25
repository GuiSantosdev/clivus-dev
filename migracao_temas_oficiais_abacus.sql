-- ========================================
-- MIGRAÇÃO OFICIAL DE TEMAS ABACUS
-- Apenas 3 temas oficiais: simples, moderado, moderno
-- Este script garante que o banco de dados tenha APENAS os temas oficiais
-- ========================================

BEGIN TRANSACTION;

-- ========================================
-- PASSO 1: Atualizar temas de usuários para os temas oficiais
-- Mapeia temas antigos para os novos
-- ========================================

PRINT 'Atualizando temas de usuários...';

-- Mapear temas antigos para novos
-- padrao-light, blue-light, green-light, padrao -> simples
UPDATE "User"
SET "themePreset" = 'simples'
WHERE "themePreset" IN ('padrao-light', 'padrao', 'blue-light', 'green-light');

-- purple-light -> moderado
UPDATE "User"
SET "themePreset" = 'moderado'
WHERE "themePreset" = 'purple-light';

-- padrao-dark, blue-dark, green-dark, purple-dark -> moderno
UPDATE "User"
SET "themePreset" = 'moderno'
WHERE "themePreset" IN ('padrao-dark', 'blue-dark', 'green-dark', 'purple-dark');

-- Qualquer tema inválido ou NULL -> simples (padrão)
UPDATE "User"
SET "themePreset" = 'simples'
WHERE "themePreset" NOT IN ('simples', 'moderado', 'moderno')
   OR "themePreset" IS NULL;

PRINT 'Temas de usuários atualizados com sucesso.';

-- ========================================
-- PASSO 2: Atualizar GlobalSettings
-- Garantir que o tema global seja um dos 3 oficiais
-- ========================================

PRINT 'Atualizando GlobalSettings...';

-- Atualizar tema do SuperAdmin para um dos oficiais
UPDATE "GlobalSettings"
SET "superadminThemePreset" = CASE
  WHEN "superadminThemePreset" IN ('padrao-light', 'padrao', 'blue-light', 'green-light') THEN 'simples'
  WHEN "superadminThemePreset" = 'purple-light' THEN 'moderado'
  WHEN "superadminThemePreset" IN ('padrao-dark', 'blue-dark', 'green-dark', 'purple-dark') THEN 'moderno'
  WHEN "superadminThemePreset" IN ('simples', 'moderado', 'moderno') THEN "superadminThemePreset"
  ELSE 'simples'
END,
"updatedAt" = NOW()
WHERE id = 1;

-- Criar registro se não existir
INSERT INTO "GlobalSettings" (id, "superadminThemePreset", "allowOfficeOverride", "allowUserOverride", "createdAt", "updatedAt")
SELECT 1, 'simples', false, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "GlobalSettings" WHERE id = 1);

PRINT 'GlobalSettings atualizadas com sucesso.';

-- ========================================
-- PASSO 3: Verificar resultados
-- ========================================

PRINT 'Verificando resultados...';
PRINT '';
PRINT 'Temas de usuários:';
SELECT "themePreset", COUNT(*) as total
FROM "User"
WHERE "themePreset" IS NOT NULL
GROUP BY "themePreset"
ORDER BY "themePreset";

PRINT '';
PRINT 'GlobalSettings:';
SELECT id, "superadminThemePreset", "allowUserOverride", "allowOfficeOverride"
FROM "GlobalSettings"
WHERE id = 1;

PRINT '';
PRINT '========================================';  
PRINT 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
PRINT 'Temas oficiais no sistema: simples, moderado, moderno';
PRINT '========================================';

-- Se tudo estiver OK, commita as mudanças
COMMIT;

-- Em caso de erro, reverte tudo
-- ROLLBACK;
