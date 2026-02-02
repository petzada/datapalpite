/**
 * API Route de Teste: Verificação do funcionamento do chatbot
 * Acesse: /api/chat/test para verificar se tudo está funcionando
 */
import { NextResponse } from "next/server";
import {
    getStandings,
    getMatches,
    getScorers,
    COMPETITION_CODES,
} from "@/lib/services/football-data";

export const maxDuration = 30;

interface StandingsResult {
    competicao?: string;
    temporada?: string;
    classificacao?: Array<{
        posicao: number;
        time: string;
        pontos: number;
    }>;
    erro?: string;
}

interface MatchesResult {
    competicao?: string;
    tipo?: string;
    partidas?: Array<{
        data: string;
        mandante: string;
        visitante: string;
        placar: string;
    }>;
    erro?: string;
}

interface ScorersResult {
    competicao?: string;
    temporada?: string;
    artilheiros?: Array<{
        jogador: string;
        time: string;
        gols: number;
    }>;
    erro?: string;
}

export async function GET() {
    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        environment: {
            GOOGLE_API_KEY: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            FOOTBALL_API_KEY: !!process.env.FOOTBALL_DATA_API_KEY,
            SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_ANON: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        competitions: COMPETITION_CODES,
        tests: {} as Record<string, unknown>,
    };

    // Teste 1: Buscar classificação da Premier League (PL é gratuita)
    console.log("[Test API] Testando getStandings PL...");
    try {
        const standings = await getStandings("PL") as StandingsResult;
        results.tests = {
            ...results.tests as Record<string, unknown>,
            standings: {
                success: !standings.erro,
                error: standings.erro || null,
                competicao: standings.competicao || null,
                totalTimes: standings.classificacao?.length || 0,
                primeiros3: standings.classificacao?.slice(0, 3) || [],
            },
        };
    } catch (err) {
        results.tests = {
            ...results.tests as Record<string, unknown>,
            standings: {
                success: false,
                error: err instanceof Error ? err.message : "Erro desconhecido",
            },
        };
    }

    // Teste 2: Buscar próximos jogos
    console.log("[Test API] Testando getMatches PL SCHEDULED...");
    try {
        const matches = await getMatches("PL", "SCHEDULED", 3) as MatchesResult;
        results.tests = {
            ...results.tests as Record<string, unknown>,
            upcomingMatches: {
                success: !matches.erro,
                error: matches.erro || null,
                totalPartidas: matches.partidas?.length || 0,
                partidas: matches.partidas?.slice(0, 3) || [],
            },
        };
    } catch (err) {
        results.tests = {
            ...results.tests as Record<string, unknown>,
            upcomingMatches: {
                success: false,
                error: err instanceof Error ? err.message : "Erro desconhecido",
            },
        };
    }

    // Teste 3: Buscar artilheiros
    console.log("[Test API] Testando getScorers PL...");
    try {
        const scorers = await getScorers("PL", 3) as ScorersResult;
        results.tests = {
            ...results.tests as Record<string, unknown>,
            scorers: {
                success: !scorers.erro,
                error: scorers.erro || null,
                totalArtilheiros: scorers.artilheiros?.length || 0,
                top3: scorers.artilheiros?.slice(0, 3) || [],
            },
        };
    } catch (err) {
        results.tests = {
            ...results.tests as Record<string, unknown>,
            scorers: {
                success: false,
                error: err instanceof Error ? err.message : "Erro desconhecido",
            },
        };
    }

    console.log("[Test API] Testes concluídos:", JSON.stringify(results, null, 2));

    return NextResponse.json(results, { status: 200 });
}
