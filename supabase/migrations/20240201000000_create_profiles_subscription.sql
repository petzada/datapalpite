-- Migração: Sistema de Assinaturas com Trial de 7 dias
-- Data: 2024-02-01

-- 1. Criar ENUMs para os tipos de plano e status
CREATE TYPE plano_tier AS ENUM ('trial', 'easy', 'pro');
CREATE TYPE assinatura_status AS ENUM ('active', 'canceled', 'past_due', 'expired');

-- 2. Criar tabela profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,

    -- Controle de Plano
    plano plano_tier DEFAULT 'trial',
    status assinatura_status DEFAULT 'active',

    -- Controle de Vencimento (Trial = 7 dias a partir do cadastro)
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),

    -- Controle de Uso Diário (Consultas IA)
    ai_queries_today INTEGER DEFAULT 0,
    last_ai_query_date DATE DEFAULT CURRENT_DATE,

    -- Stripe (para integração futura)
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar índices para performance
CREATE INDEX idx_profiles_valid_until ON profiles(valid_until);
CREATE INDEX idx_profiles_plano ON profiles(plano);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS - Usuário só pode ver/editar seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 6. Função para criar profile automaticamente quando um novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger que executa a função quando um novo usuário é criado
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Função para resetar contagem de consultas IA diariamente
CREATE OR REPLACE FUNCTION public.reset_daily_ai_queries()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_ai_query_date IS DISTINCT FROM CURRENT_DATE THEN
        NEW.ai_queries_today := 0;
        NEW.last_ai_query_date := CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger para reset diário de consultas IA
CREATE TRIGGER reset_ai_queries_daily
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.reset_daily_ai_queries();

-- 12. Função para incrementar contador de consultas IA
CREATE OR REPLACE FUNCTION public.increment_ai_query(user_id UUID)
RETURNS TABLE(success BOOLEAN, queries_used INTEGER, queries_limit INTEGER) AS $$
DECLARE
    user_profile profiles%ROWTYPE;
    daily_limit INTEGER;
BEGIN
    -- Buscar perfil do usuário
    SELECT * INTO user_profile FROM profiles WHERE id = user_id;

    -- Definir limite baseado no plano
    CASE user_profile.plano
        WHEN 'trial' THEN daily_limit := 999999; -- Ilimitado
        WHEN 'easy' THEN daily_limit := 1;
        WHEN 'pro' THEN daily_limit := 999999; -- Ilimitado
    END CASE;

    -- Reset se for um novo dia
    IF user_profile.last_ai_query_date IS DISTINCT FROM CURRENT_DATE THEN
        UPDATE profiles
        SET ai_queries_today = 1, last_ai_query_date = CURRENT_DATE
        WHERE id = user_id;
        RETURN QUERY SELECT TRUE, 1, daily_limit;
        RETURN;
    END IF;

    -- Verificar limite
    IF user_profile.ai_queries_today >= daily_limit THEN
        RETURN QUERY SELECT FALSE, user_profile.ai_queries_today, daily_limit;
        RETURN;
    END IF;

    -- Incrementar contador
    UPDATE profiles
    SET ai_queries_today = ai_queries_today + 1
    WHERE id = user_id;

    RETURN QUERY SELECT TRUE, user_profile.ai_queries_today + 1, daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Comentários para documentação
COMMENT ON TABLE profiles IS 'Perfis de usuários com controle de assinatura e limites';
COMMENT ON COLUMN profiles.plano IS 'Plano atual: trial (7 dias), easy ou pro';
COMMENT ON COLUMN profiles.valid_until IS 'Data de expiração do plano/trial';
COMMENT ON COLUMN profiles.ai_queries_today IS 'Número de consultas IA feitas hoje';
