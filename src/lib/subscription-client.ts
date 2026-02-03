'use client'

import { createClient } from './supabase/client'
import type { PlanoTier, Profile, AccessStatus, PlanLimits } from './subscription'

// Re-exportar tipos
export type { PlanoTier, Profile, AccessStatus, PlanLimits }

// Limites por plano (duplicado para uso client-side)
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
 * Busca o perfil do usuário atual (client-side)
 */
export async function getProfileClient(): Promise<Profile | null> {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Seleciona apenas os campos necessários para evitar over-fetching
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, plano, status, valid_until, ai_queries_today, last_ai_query_date')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
    }

    return profile as Profile
}

/**
 * Verifica o status de acesso do usuário (client-side)
 */
export async function checkAccessStatusClient(): Promise<AccessStatus> {
    const profile = await getProfileClient()

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
 * Retorna os limites do plano especificado
 */
export function getPlanLimitsClient(plan: PlanoTier): PlanLimits {
    return PLAN_LIMITS[plan]
}

/**
 * Verifica se o usuário pode criar uma nova banca (client-side)
 */
export async function canCreateBancaClient(): Promise<{
    allowed: boolean
    reason?: string
    currentCount?: number
    maxAllowed?: number
}> {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { allowed: false, reason: 'Usuário não autenticado' }
    }

    const profile = await getProfileClient()
    if (!profile) {
        return { allowed: false, reason: 'Perfil não encontrado' }
    }

    // Verificar se o plano está válido
    const accessStatus = await checkAccessStatusClient()
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
 * Verifica se o usuário pode usar a IA (client-side)
 */
export async function canUseAIClient(): Promise<{
    allowed: boolean
    reason?: string
    queriesUsed?: number
    queriesLimit?: number
}> {
    const profile = await getProfileClient()

    if (!profile) {
        return { allowed: false, reason: 'Perfil não encontrado' }
    }

    // Verificar se o plano está válido
    const accessStatus = await checkAccessStatusClient()
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
