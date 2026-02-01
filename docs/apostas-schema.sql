-- =====================================================
-- TABELAS DE APOSTAS - Data Palpite
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Tabela principal de apostas
CREATE TABLE IF NOT EXISTS apostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banca_id UUID NOT NULL REFERENCES bancas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('simples', 'multipla')),
    data_aposta DATE NOT NULL,
    stake DECIMAL(12,2) NOT NULL,
    odds_total DECIMAL(8,3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ganha', 'perdida', 'anulada')),
    lucro_prejuizo DECIMAL(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Tabela de eventos (para apostas simples e múltiplas)
CREATE TABLE IF NOT EXISTS aposta_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aposta_id UUID NOT NULL REFERENCES apostas(id) ON DELETE CASCADE,
    esporte TEXT NOT NULL,
    evento TEXT NOT NULL,
    mercado TEXT NOT NULL,
    odd DECIMAL(8,3) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_apostas_user_id ON apostas(user_id);
CREATE INDEX IF NOT EXISTS idx_apostas_banca_id ON apostas(banca_id);
CREATE INDEX IF NOT EXISTS idx_apostas_status ON apostas(status);
CREATE INDEX IF NOT EXISTS idx_aposta_eventos_aposta_id ON aposta_eventos(aposta_id);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Apostas
ALTER TABLE apostas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem suas apostas" ON apostas;
CREATE POLICY "Usuários veem suas apostas"
    ON apostas FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários inserem suas apostas" ON apostas;
CREATE POLICY "Usuários inserem suas apostas"
    ON apostas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários editam suas apostas" ON apostas;
CREATE POLICY "Usuários editam suas apostas"
    ON apostas FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários excluem suas apostas" ON apostas;
CREATE POLICY "Usuários excluem suas apostas"
    ON apostas FOR DELETE
    USING (auth.uid() = user_id);

-- Aposta Eventos
ALTER TABLE aposta_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem eventos das suas apostas" ON aposta_eventos;
CREATE POLICY "Usuários veem eventos das suas apostas"
    ON aposta_eventos FOR SELECT
    USING (
        aposta_id IN (SELECT id FROM apostas WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Usuários inserem eventos nas suas apostas" ON aposta_eventos;
CREATE POLICY "Usuários inserem eventos nas suas apostas"
    ON aposta_eventos FOR INSERT
    WITH CHECK (
        aposta_id IN (SELECT id FROM apostas WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Usuários editam eventos das suas apostas" ON aposta_eventos;
CREATE POLICY "Usuários editam eventos das suas apostas"
    ON aposta_eventos FOR UPDATE
    USING (
        aposta_id IN (SELECT id FROM apostas WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Usuários excluem eventos das suas apostas" ON aposta_eventos;
CREATE POLICY "Usuários excluem eventos das suas apostas"
    ON aposta_eventos FOR DELETE
    USING (
        aposta_id IN (SELECT id FROM apostas WHERE user_id = auth.uid())
    );
