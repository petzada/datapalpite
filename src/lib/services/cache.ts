/**
 * Serviço de cache para API Football-Data
 * Verifica Supabase antes de fazer chamadas externas
 * TTL: 60 minutos
 */
import { createClient } from "@supabase/supabase-js";

const CACHE_TTL_MINUTES = 60;

// Cliente Supabase com service role para cache (server-side apenas)
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        console.warn("[Cache] Supabase não configurado, cache desabilitado");
        return null;
    }

    return createClient(url, serviceKey);
}

interface CacheEntry {
    id: string;
    cache_key: string;
    data: Record<string, unknown>;
    endpoint: string;
    updated_at: string;
}

/**
 * Gera uma chave de cache baseada no endpoint e parâmetros
 */
export function generateCacheKey(endpoint: string, params?: Record<string, string>): string {
    const sortedParams = params
        ? Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&")
        : "";
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ""}`;
}

/**
 * Verifica se o cache ainda é válido (menos de 60 minutos)
 */
function isCacheValid(updatedAt: string): boolean {
    const cacheDate = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - cacheDate.getTime()) / (1000 * 60);
    return diffMinutes < CACHE_TTL_MINUTES;
}

/**
 * Busca dados do cache se existirem e forem válidos
 */
export async function getFromCache(cacheKey: string): Promise<Record<string, unknown> | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from("cache_api")
            .select("*")
            .eq("cache_key", cacheKey)
            .single();

        if (error || !data) {
            return null;
        }

        const entry = data as CacheEntry;

        if (!isCacheValid(entry.updated_at)) {
            console.log(`[Cache] Cache expirado para: ${cacheKey}`);
            return null;
        }

        console.log(`[Cache] HIT para: ${cacheKey}`);
        return entry.data;
    } catch (err) {
        console.error("[Cache] Erro ao buscar cache:", err);
        return null;
    }
}

/**
 * Salva dados no cache (upsert)
 */
export async function saveToCache(
    cacheKey: string,
    endpoint: string,
    data: Record<string, unknown>
): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from("cache_api")
            .upsert(
                {
                    cache_key: cacheKey,
                    endpoint,
                    data,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "cache_key" }
            );

        if (error) {
            console.error("[Cache] Erro ao salvar:", error);
        } else {
            console.log(`[Cache] SAVED: ${cacheKey}`);
        }
    } catch (err) {
        console.error("[Cache] Erro ao salvar cache:", err);
    }
}
