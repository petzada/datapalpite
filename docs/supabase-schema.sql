-- ============================================
-- Schema SQL: Chatbot Data Palpite
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de cache para respostas da API Football-Data
CREATE TABLE IF NOT EXISTS cache_api (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    endpoint TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_cache_api_key ON cache_api(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_api_updated ON cache_api(updated_at);

-- Tabela de conversas (chats)
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Nova conversa',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar chats por usuário
CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar mensagens por chat
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- RLS (Row Level Security)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_api ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para chats
CREATE POLICY "Usuários podem ver seus próprios chats"
    ON chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios chats"
    ON chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios chats"
    ON chats FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas de segurança para mensagens
CREATE POLICY "Usuários podem ver mensagens dos seus chats"
    ON messages FOR SELECT
    USING (
        chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
    );

CREATE POLICY "Usuários podem criar mensagens nos seus chats"
    ON messages FOR INSERT
    WITH CHECK (
        chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
    );

-- Cache é acessível via service role (server-side)
CREATE POLICY "Cache é acessível via service role"
    ON cache_api FOR ALL
    USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática
DROP TRIGGER IF EXISTS update_cache_api_updated_at ON cache_api;
CREATE TRIGGER update_cache_api_updated_at
    BEFORE UPDATE ON cache_api
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Função para limpar cache antigo (rodar via cron/scheduled function)
CREATE OR REPLACE FUNCTION clean_old_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cache_api WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
