import { createClient } from "@supabase/supabase-js";

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

// Ligas que vamos sincronizar (Free Tier do football-data.org)
const LEAGUES_TO_SYNC = ["BSA", "PL", "PD", "SA", "BL1", "FL1", "CL"] as const;

interface ApiMatch {
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    homeTeam: {
        name: string;
        shortName: string;
    };
    awayTeam: {
        name: string;
        shortName: string;
    };
    score: {
        fullTime: {
            home: number | null;
            away: number | null;
        };
    };
}

interface ApiResponse {
    matches?: ApiMatch[];
    competition?: {
        name: string;
        code: string;
    };
    errorCode?: number;
    message?: string;
}

interface SyncResult {
    success: boolean;
    league: string;
    matchesUpserted?: number;
    error?: string;
}

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing Supabase environment variables for admin client");
    }

    return createClient(url, serviceKey);
}

async function fetchMatchesFromApi(leagueCode: string): Promise<ApiResponse> {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
        throw new Error("FOOTBALL_DATA_API_KEY not configured");
    }

    const response = await fetch(
        `${FOOTBALL_DATA_BASE_URL}/competitions/${leagueCode}/matches`,
        {
            headers: {
                "X-Auth-Token": apiKey,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    if (response.status === 429) {
        throw new Error(`Rate limit exceeded for league ${leagueCode}`);
    }

    if (!response.ok) {
        throw new Error(`API error ${response.status} for league ${leagueCode}`);
    }

    return response.json();
}

async function upsertMatches(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    matches: ApiMatch[],
    leagueCode: string,
    leagueName: string
): Promise<number> {
    if (matches.length === 0) return 0;

    const matchesForUpsert = matches.map((match) => ({
        external_id: match.id,
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        home_team_short: match.homeTeam.shortName,
        away_team_short: match.awayTeam.shortName,
        score_home: match.score.fullTime.home,
        score_away: match.score.fullTime.away,
        match_date: match.utcDate,
        matchday: match.matchday,
        status: match.status,
        league_code: leagueCode,
        league_name: leagueName,
        last_updated_at: new Date().toISOString(),
    }));

    // Upsert em batch usando external_id como chave de conflito
    const { error } = await supabase
        .from("cached_matches")
        .upsert(matchesForUpsert, {
            onConflict: "external_id",
            ignoreDuplicates: false,
        });

    if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`);
    }

    return matchesForUpsert.length;
}

export async function syncLeague(leagueCode: string): Promise<SyncResult> {
    try {
        const supabase = getSupabaseAdmin();
        const data = await fetchMatchesFromApi(leagueCode);

        if (!data.matches || data.matches.length === 0) {
            return {
                success: true,
                league: leagueCode,
                matchesUpserted: 0,
            };
        }

        const leagueName = data.competition?.name || leagueCode;
        const count = await upsertMatches(supabase, data.matches, leagueCode, leagueName);

        return {
            success: true,
            league: leagueCode,
            matchesUpserted: count,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return {
            success: false,
            league: leagueCode,
            error: errorMessage,
        };
    }
}

export async function syncAllLeagues(): Promise<{
    success: boolean;
    results: SyncResult[];
    totalMatches: number;
    errors: string[];
}> {
    const results: SyncResult[] = [];
    const errors: string[] = [];
    let totalMatches = 0;

    // Sincroniza uma liga por vez para respeitar rate limit (10 req/min)
    // Com 7 ligas, fica dentro do limite
    for (const leagueCode of LEAGUES_TO_SYNC) {
        const result = await syncLeague(leagueCode);
        results.push(result);

        if (result.success && result.matchesUpserted) {
            totalMatches += result.matchesUpserted;
        }

        if (!result.success && result.error) {
            errors.push(`${leagueCode}: ${result.error}`);

            // Se atingiu rate limit, para de sincronizar
            if (result.error.includes("Rate limit")) {
                break;
            }
        }

        // Delay de 6 segundos entre requisições (10 req/min = 1 req a cada 6s)
        if (LEAGUES_TO_SYNC.indexOf(leagueCode) < LEAGUES_TO_SYNC.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 6000));
        }
    }

    return {
        success: errors.length === 0,
        results,
        totalMatches,
        errors,
    };
}

// Exporta as ligas disponíveis
export { LEAGUES_TO_SYNC };
