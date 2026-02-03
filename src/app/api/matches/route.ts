import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CachedMatch {
    id: string;
    external_id: number;
    home_team: string;
    away_team: string;
    home_team_short: string | null;
    away_team_short: string | null;
    score_home: number | null;
    score_away: number | null;
    match_date: string;
    matchday: number | null;
    status: string;
    league_code: string;
    league_name: string | null;
    last_updated_at: string;
}

interface FormattedMatch {
    id: string;
    externalId: number;
    mandante: string;
    visitante: string;
    mandanteSigla: string | null;
    visitanteSigla: string | null;
    placar: string;
    data: string;
    rodada: number | null;
    status: string;
    competicao: string;
}

function formatMatch(match: CachedMatch): FormattedMatch {
    const matchDate = new Date(match.match_date);

    let placar = "A jogar";
    if (match.status === "FINISHED") {
        placar = `${match.score_home ?? 0} x ${match.score_away ?? 0}`;
    } else if (match.status === "IN_PLAY" || match.status === "PAUSED") {
        placar = `${match.score_home ?? 0} x ${match.score_away ?? 0} (ao vivo)`;
    }

    return {
        id: match.id,
        externalId: match.external_id,
        mandante: match.home_team,
        visitante: match.away_team,
        mandanteSigla: match.home_team_short,
        visitanteSigla: match.away_team_short,
        placar,
        data: matchDate.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
        }),
        rodada: match.matchday,
        status: match.status,
        competicao: match.league_name || match.league_code,
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Parâmetros de filtro
    const league = searchParams.get("league"); // Ex: BSA, PL, PD
    const status = searchParams.get("status"); // SCHEDULED, FINISHED, IN_PLAY
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        const supabase = await createClient();

        let query = supabase
            .from("cached_matches")
            .select("*", { count: "exact" });

        // Aplica filtros
        if (league) {
            query = query.eq("league_code", league.toUpperCase());
        }

        if (status) {
            const statuses = status.toUpperCase().split(",");
            query = query.in("status", statuses);
        }

        // Ordena por data do jogo
        query = query
            .order("match_date", { ascending: status === "FINISHED" ? false : true })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("[API Matches] Supabase error:", error);
            return NextResponse.json(
                { erro: "Erro ao buscar partidas do cache" },
                { status: 500 }
            );
        }

        const matches = (data as CachedMatch[]).map(formatMatch);

        return NextResponse.json({
            partidas: matches,
            total: count || 0,
            limit,
            offset,
            filtros: {
                league: league?.toUpperCase() || null,
                status: status?.toUpperCase() || null,
            },
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("[API Matches] Error:", errorMessage);

        return NextResponse.json(
            { erro: "Erro interno ao processar requisição" },
            { status: 500 }
        );
    }
}

// Configuração de cache HTTP para CDN/Edge
export const revalidate = 60; // Revalida a cada 60 segundos
