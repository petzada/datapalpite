import { createClient } from './supabase/server'

// Tipos
export type PlanoTier = 'trial' | 'easy' | 'pro'
export type AssinaturaStatus = 'active' | 'canceled' | 'past_due' | 'expired'

export interface Profile {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    plano: PlanoTier
    status: AssinaturaStatus
    valid_until: string
    ai_queries_today: number
    last_ai_query_date: string
    created_at: string
    updated_at: string
}

export interface AccessStatus {
    access: 'granted' | 'blocked'
    reason?: 'trial_expired' | 'subscription_expired'
    plan?: PlanoTier
    daysRemaining?: number
}

export interface PlanLimits {
    maxBancas: number
    maxAiQueriesPerDay: number
    canAccessRealtime: boolean
    canAccessFullHistory: boolean
}

// Limites por plano
const PLAN_LIMITS: Record<PlanoTier, PlanLimits> = {
    trial: {
        maxBancas: Infinity,
        maxAiQueriesPerDay: Infinity,
        canAccessRealtime: true,
        canAccessFullHistory: true,
    },
    easy: {
        maxBancas: 1,
        maxAiQueriesPerDay: 1,
        canAccessRealtime: false,
        canAccessFullHistory: false,
    },
    pro: {
        maxBancas: Infinity,
        maxAiQueriesPerDay: Infinity,
        canAccessRealtime: true,
        canAccessFullHistory: true,
    },
}

/**
 * Busca o perfil do usuário atual
 */
export async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
    }

    return profile as Profile
}

/**
 * Busca o perfil por ID do usuário
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
    }

    return profile as Profile
}

/**
 * Verifica o status de acesso do usuário
 * Retorna se o acesso está bloqueado ou liberado
 */
export async function checkAccessStatus(userId?: string): Promise<AccessStatus> {
    const supabase = await createClient()

    // Se não passou userId, busca do usuário logado
    let targetUserId = userId
    if (!targetUserId) {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        targetUserId = user?.id
    }

    if (!targetUserId) {
        return { access: 'blocked', reason: 'subscription_expired' }
    }

    const profile = await getProfileById(targetUserId)

    if (!profile) {
        return { access: 'blocked', reason: 'subscription_expired' }
    }

    const now = new Date()
    const validUntil = new Date(profile.valid_until)
    const daysRemaining = Math.ceil(
        (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Se o plano é Trial e já passou da data => BLOQUEIO TOTAL
    if (profile.plano === 'trial' && now > validUntil) {
        return {
            access: 'blocked',
            reason: 'trial_expired',
        }
    }

    // Se assinatura expirou e não é trial
    if (now > validUntil) {
        return {
            access: 'blocked',
            reason: 'subscription_expired',
        }
    }

    return {
        access: 'granted',
        plan: profile.plano,
        daysRemaining: Math.max(0, daysRemaining),
    }
}

/**
 * Retorna o plano atual e informações de validade
 */
export async function getCurrentPlan(): Promise<{
    plan: PlanoTier
    isValid: boolean
    daysRemaining: number
    limits: PlanLimits
} | null> {
    const profile = await getProfile()

    if (!profile) return null

    const now = new Date()
    const validUntil = new Date(profile.valid_until)
    const daysRemaining = Math.ceil(
        (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const isValid = now <= validUntil

    return {
        plan: profile.plano,
        isValid,
        daysRemaining: Math.max(0, daysRemaining),
        limits: PLAN_LIMITS[profile.plano],
    }
}

/**
 * Retorna os limites do plano especificado
 */
export function getPlanLimits(plan: PlanoTier): PlanLimits {
    return PLAN_LIMITS[plan]
}

/**
 * Verifica se o usuário pode criar uma nova banca
 */
export async function canCreateBanca(): Promise<{
    allowed: boolean
    reason?: string
    currentCount?: number
    maxAllowed?: number
}> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { allowed: false, reason: 'Usuário não autenticado' }
    }

    const profile = await getProfile()
    if (!profile) {
        return { allowed: false, reason: 'Perfil não encontrado' }
    }

    // Verificar se o plano está válido
    const accessStatus = await checkAccessStatus()
    if (accessStatus.access === 'blocked') {
        return { allowed: false, reason: 'Plano expirado' }
    }

    const limits = PLAN_LIMITS[profile.plano]

    // Se ilimitado, sempre pode
    if (limits.maxBancas === Infinity) {
        return { allowed: true }
    }

    // Contar bancas existentes
    const { count, error } = await supabase
        .from('bancas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (error) {
        console.error('Erro ao contar bancas:', error)
        return { allowed: false, reason: 'Erro ao verificar bancas' }
    }

    const currentCount = count || 0
    const maxAllowed = limits.maxBancas

    if (currentCount >= maxAllowed) {
        return {
            allowed: false,
            reason: `Plano ${profile.plano.toUpperCase()} permite apenas ${maxAllowed} banca${maxAllowed > 1 ? 's' : ''}. Faça upgrade para ter bancas ilimitadas.`,
            currentCount,
            maxAllowed,
        }
    }

    return { allowed: true, currentCount, maxAllowed }
}

/**
 * Verifica se o usuário pode usar a IA
 */
export async function canUseAI(): Promise<{
    allowed: boolean
    reason?: string
    queriesUsed?: number
    queriesLimit?: number
}> {
    const profile = await getProfile()

    if (!profile) {
        return { allowed: false, reason: 'Perfil não encontrado' }
    }

    // Verificar se o plano está válido
    const accessStatus = await checkAccessStatus()
    if (accessStatus.access === 'blocked') {
        return { allowed: false, reason: 'Plano expirado' }
    }

    const limits = PLAN_LIMITS[profile.plano]

    // Se ilimitado, sempre pode
    if (limits.maxAiQueriesPerDay === Infinity) {
        return { allowed: true }
    }

    // Verificar se é um novo dia (reset automático)
    const today = new Date().toISOString().split('T')[0]
    const lastQueryDate = profile.last_ai_query_date

    let queriesUsed = profile.ai_queries_today
    if (lastQueryDate !== today) {
        queriesUsed = 0 // Reset diário
    }

    if (queriesUsed >= limits.maxAiQueriesPerDay) {
        return {
            allowed: false,
            reason: `Limite diário de ${limits.maxAiQueriesPerDay} consulta${limits.maxAiQueriesPerDay > 1 ? 's' : ''} atingido. Faça upgrade para consultas ilimitadas.`,
            queriesUsed,
            queriesLimit: limits.maxAiQueriesPerDay,
        }
    }

    return {
        allowed: true,
        queriesUsed,
        queriesLimit: limits.maxAiQueriesPerDay,
    }
}

/**
 * Incrementa o contador de consultas IA
 */
export async function incrementAIQuery(): Promise<boolean> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase.rpc('increment_ai_query', {
        user_id: user.id,
    })

    if (error) {
        console.error('Erro ao incrementar consulta IA:', error)
        return false
    }

    return data?.[0]?.success ?? false
}

/**
 * Verifica se o usuário pode acessar análise em tempo real
 */
export async function canAccessRealtime(): Promise<boolean> {
    const profile = await getProfile()
    if (!profile) return false

    const accessStatus = await checkAccessStatus()
    if (accessStatus.access === 'blocked') return false

    return PLAN_LIMITS[profile.plano].canAccessRealtime
}

/**
 * Verifica se o usuário pode acessar histórico completo
 */
export async function canAccessFullHistory(): Promise<boolean> {
    const profile = await getProfile()
    if (!profile) return false

    const accessStatus = await checkAccessStatus()
    if (accessStatus.access === 'blocked') return false

    return PLAN_LIMITS[profile.plano].canAccessFullHistory
}
