import { NextRequest, NextResponse } from "next/server";
import { syncAllLeagues, syncLeague, LEAGUES_TO_SYNC } from "@/lib/services/football-sync";

// Vercel Cron Jobs enviam um header especial para autenticação
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs

export async function GET(request: NextRequest) {
    // Verifica autenticação do cron job
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Permite execução se:
    // 1. Header de cron do Vercel está presente, OU
    // 2. Authorization header com CRON_SECRET está correto
    const vercelCronHeader = request.headers.get("x-vercel-cron");
    const isVercelCron = vercelCronHeader === "true";
    const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isAuthorized) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // Verifica se é uma sincronização de liga específica
    const searchParams = request.nextUrl.searchParams;
    const leagueCode = searchParams.get("league");

    try {
        if (leagueCode) {
            // Sincroniza apenas uma liga
            if (!LEAGUES_TO_SYNC.includes(leagueCode as typeof LEAGUES_TO_SYNC[number])) {
                return NextResponse.json(
                    { error: `Invalid league code: ${leagueCode}` },
                    { status: 400 }
                );
            }

            const result = await syncLeague(leagueCode);
            return NextResponse.json(result);
        }

        // Sincroniza todas as ligas
        const result = await syncAllLeagues();

        return NextResponse.json({
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("[Cron Sync] Error:", errorMessage);

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// Configuração do runtime para Vercel
export const runtime = "nodejs";
export const maxDuration = 60; // 60 segundos máximo
