-- =====================================================
-- TABELA DE BANCAS - Data Palpite
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar tabela de bancas
CREATE TABLE IF NOT EXISTS bancas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    saldo_inicial DECIMAL(12,2) NOT NULL DEFAULT 0,
    meta_roi TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscar bancas do usuário
CREATE INDEX IF NOT EXISTS idx_bancas_user_id ON bancas(user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bancas_updated_at ON bancas;
CREATE TRIGGER bancas_updated_at
    BEFORE UPDATE ON bancas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE bancas ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê suas bancas
DROP POLICY IF EXISTS "Usuários veem suas bancas" ON bancas;
CREATE POLICY "Usuários veem suas bancas"
    ON bancas FOR SELECT
    USING (auth.uid() = user_id);

-- Política: usuário só insere nas suas bancas
DROP POLICY IF EXISTS "Usuários inserem suas bancas" ON bancas;
CREATE POLICY "Usuários inserem suas bancas"
    ON bancas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: usuário só edita suas bancas
DROP POLICY IF EXISTS "Usuários editam suas bancas" ON bancas;
CREATE POLICY "Usuários editam suas bancas"
    ON bancas FOR UPDATE
    USING (auth.uid() = user_id);

-- Política: usuário só exclui suas bancas
DROP POLICY IF EXISTS "Usuários excluem suas bancas" ON bancas;
CREATE POLICY "Usuários excluem suas bancas"
    ON bancas FOR DELETE
    USING (auth.uid() = user_id);
