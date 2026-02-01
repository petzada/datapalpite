-- =====================================================
-- MIGRAÇÃO: Adicionar stake_percentual à tabela bancas
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Remover coluna meta_roi (não mais utilizada)
ALTER TABLE bancas DROP COLUMN IF EXISTS meta_roi;

-- Adicionar coluna stake_percentual (% da banca por aposta)
ALTER TABLE bancas ADD COLUMN IF NOT EXISTS stake_percentual DECIMAL(5,2) DEFAULT 2.00;

-- Comentário explicativo
COMMENT ON COLUMN bancas.stake_percentual IS 'Percentual fixo de stake por aposta (ex: 2.00 = 2%)';
