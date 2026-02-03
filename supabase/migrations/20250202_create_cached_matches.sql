-- ============================================================
-- Tabela: cached_matches
-- Propósito: Cache de partidas da API football-data.org
-- Padrão: Backend-for-Frontend (BFF) com sincronização periódica
-- ============================================================

CREATE TABLE IF NOT EXISTS cached_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador único da API externa (para upsert)
    external_id INTEGER NOT NULL UNIQUE,

    -- Dados do jogo
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_team_short TEXT,
    away_team_short TEXT,
    score_home INTEGER,
    score_away INTEGER,

    -- Metadados da partida
    match_date TIMESTAMPTZ NOT NULL,
    matchday INTEGER,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    -- Valores possíveis: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, CANCELLED

    -- Competição
    league_code TEXT NOT NULL,
    league_name TEXT,

    -- Controle de cache
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Índices para consultas comuns
    CONSTRAINT valid_status CHECK (
        status IN ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED', 'SUSPENDED', 'AWARDED')
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cached_matches_league ON cached_matches(league_code);
CREATE INDEX IF NOT EXISTS idx_cached_matches_status ON cached_matches(status);
CREATE INDEX IF NOT EXISTS idx_cached_matches_date ON cached_matches(match_date);
CREATE INDEX IF NOT EXISTS idx_cached_matches_league_status ON cached_matches(league_code, status);

-- Comentários
COMMENT ON TABLE cached_matches IS 'Cache de partidas da API football-data.org para evitar rate limiting';
COMMENT ON COLUMN cached_matches.external_id IS 'ID único da partida na API football-data.org';
COMMENT ON COLUMN cached_matches.last_updated_at IS 'Timestamp da última sincronização com a API externa';

-- RLS (Row Level Security) - Leitura pública, escrita apenas por service role
ALTER TABLE cached_matches ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (qualquer usuário autenticado pode ler)
CREATE POLICY "cached_matches_select_policy" ON cached_matches
    FOR SELECT
    TO authenticated
    USING (true);

-- Política de leitura anônima (para SSR/SSG se necessário)
CREATE POLICY "cached_matches_anon_select_policy" ON cached_matches
    FOR SELECT
    TO anon
    USING (true);

-- Nota: INSERT/UPDATE/DELETE só podem ser feitos via service_role key (usado no cron job)
