-- ============================================================
-- Tabela: webhook_events
-- Propósito: Idempotência persistente para webhooks de pagamento
-- Evita processamento duplicado em caso de redeploy ou retry
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ID único do evento (do provedor de pagamento)
    event_id TEXT NOT NULL UNIQUE,

    -- Tipo do evento (billing.paid, etc)
    event_type TEXT NOT NULL,

    -- Provedor (abacatepay, stripe, etc)
    provider TEXT NOT NULL DEFAULT 'abacatepay',

    -- Dados processados (resumo)
    user_id UUID REFERENCES auth.users(id),
    plan_id TEXT,
    amount INTEGER,

    -- Status do processamento
    status TEXT NOT NULL DEFAULT 'processed',

    -- Timestamps
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Índice para busca rápida
    CONSTRAINT valid_status CHECK (status IN ('processed', 'failed', 'skipped'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- RLS - Apenas service role pode ler/escrever
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Sem políticas públicas - apenas service_role pode acessar

-- Comentários
COMMENT ON TABLE webhook_events IS 'Log de webhooks processados para idempotência';
COMMENT ON COLUMN webhook_events.event_id IS 'ID único do evento do provedor de pagamento';

-- Limpeza automática de eventos antigos (opcional, executar via cron)
-- DELETE FROM webhook_events WHERE processed_at < NOW() - INTERVAL '30 days';
