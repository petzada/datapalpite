-- ============================================================
-- Migration: Remover coluna CPF da tabela profiles
-- Data: 2025-02-02
-- Motivo: CPF não é mais coletado no cadastro de usuários
-- ============================================================

-- Remove a coluna cpf da tabela profiles (se existir)
ALTER TABLE profiles DROP COLUMN IF EXISTS cpf;

-- Remove qualquer índice relacionado ao CPF (se existir)
DROP INDEX IF EXISTS idx_profiles_cpf;

-- Comentário de registro
COMMENT ON TABLE profiles IS 'Perfis de usuários - CPF removido em 2025-02-02';
