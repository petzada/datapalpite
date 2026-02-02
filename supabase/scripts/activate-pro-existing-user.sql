-- Script para criar profile e ativar plano Pro para usuario existente
-- Usuario: marciopetigrosso@gmail.com
--
-- INSTRUCOES:
-- 1. Acesse o Supabase Dashboard
-- 2. Va em SQL Editor
-- 3. Execute primeiro a migracao (se ainda nao executou):
--    supabase/migrations/20240201000000_create_profiles_subscription.sql
-- 4. Depois execute este script

-- Criar profile para usuario existente e ativar plano Pro
INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    plano,
    status,
    valid_until,
    created_at,
    updated_at
)
SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    u.email,
    u.raw_user_meta_data->>'avatar_url',
    'pro'::plano_tier,           -- Plano Pro
    'active'::assinatura_status, -- Status ativo
    now() + interval '1 year',   -- Valido por 1 ano
    now(),
    now()
FROM auth.users u
WHERE u.email = 'marciopetigrosso@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    plano = 'pro'::plano_tier,
    status = 'active'::assinatura_status,
    valid_until = now() + interval '1 year',
    updated_at = now();

-- Verificar resultado
SELECT
    id,
    full_name,
    email,
    plano,
    status,
    valid_until,
    created_at
FROM public.profiles
WHERE email = 'marciopetigrosso@gmail.com';
