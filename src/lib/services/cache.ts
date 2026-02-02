import { createClient } from "@supabase/supabase-js";

const CACHE_TTL_MINUTES = 60;

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) return null;

    return createClient(url, serviceKey);
}

interface CacheEntry {
    id: string;
    cache_key: string;
    data: Record<string, unknown>;
    endpoint: string;
    updated_at: string;
}

export function generateCacheKey(endpoint: string, params?: Record<string, string>): string {
    const sortedParams = params
        ? Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&")
        : "";
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ""}`;
}

function isCacheValid(updatedAt: string): boolean {
    const cacheDate = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - cacheDate.getTime()) / (1000 * 60);
    return diffMinutes < CACHE_TTL_MINUTES;
}

export async function getFromCache(cacheKey: string): Promise<Record<string, unknown> | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from("cache_api")
            .select("*")
            .eq("cache_key", cacheKey)
            .single();

        if (error || !data) return null;

        const entry = data as CacheEntry;
        if (!isCacheValid(entry.updated_at)) return null;

        return entry.data;
    } catch {
        return null;
    }
}

export async function saveToCache(
    cacheKey: string,
    endpoint: string,
    data: Record<string, unknown>
): Promise<void> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    try {
        await supabase
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
    } catch {
        // Silently fail cache writes
    }
}
