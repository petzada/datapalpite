import { getFromCache, saveToCache, generateCacheKey } from "./cache";

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

interface FetchOptions {
    endpoint: string;
    params?: Record<string, string>;
}

interface ApiResponse {
    erro?: string;
    rateLimit?: boolean;
    network?: boolean;
    [key: string]: unknown;
}

async function fetchFootballData({ endpoint, params }: FetchOptions): Promise<ApiResponse> {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
        return { erro: "Configuração da API de futebol incompleta. Contate o suporte." };
    }

    const cacheKey = generateCacheKey(endpoint, params);
    try {
        const cached = await getFromCache(cacheKey);
        if (cached) {
            return cached as ApiResponse;
        }
    } catch {
        // Se falhar o cache, continua com a API
    }

    const url = new URL(`${FOOTBALL_DATA_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "X-Auth-Token": apiKey,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (response.status === 429) {
            return {
                erro: "O limite de requisições da API foi atingido. Por favor, aguarde alguns minutos e tente novamente.",
                rateLimit: true,
            };
        }

        if (response.status === 403) {
            return { erro: "Erro de autenticação com a API. Verifique a configuração." };
        }

        if (response.status === 404) {
            return { erro: "Competição ou recurso não encontrado. Verifique o código da liga." };
        }

        if (!response.ok) {
            return { erro: `Erro ao consultar dados de futebol (${response.status}).` };
        }

        const data = await response.json();
        saveToCache(cacheKey, endpoint, data).catch(() => { });
        return data;
    } catch {
        return {
            erro: "Não foi possível conectar à API de futebol. Verifique sua conexão e tente novamente.",
            network: true,
        };
    }
}

export async function getStandings(competitionCode: string) {
    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/standings`,
    });

    if (data.erro) return data;

    const standingsData = data.standings as Array<{
        table: Array<{
            position: number;
            team: { name: string; shortName: string };
            playedGames: number;
            won: number;
            draw: number;
            lost: number;
            points: number;
            goalsFor: number;
            goalsAgainst: number;
            goalDifference: number;
        }>;
    }> | undefined;

    const standings = standingsData?.[0]?.table?.map((team) => ({
        posicao: team.position,
        time: team.team.name,
        sigla: team.team.shortName,
        jogos: team.playedGames,
        vitorias: team.won,
        empates: team.draw,
        derrotas: team.lost,
        pontos: team.points,
        golsPro: team.goalsFor,
        golsContra: team.goalsAgainst,
        saldoGols: team.goalDifference,
    }));

    const competition = data.competition as { name?: string } | undefined;
    const season = data.season as { startDate?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        temporada: season?.startDate?.slice(0, 4) || new Date().getFullYear().toString(),
        classificacao: standings || [],
    };
}

export async function getMatches(
    competitionCode: string,
    status: "SCHEDULED" | "FINISHED" = "SCHEDULED",
    limit: number = 10
) {
    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/matches`,
        params: { status, limit: limit.toString() },
    });

    if (data.erro) return data;

    const matchesData = data.matches as Array<{
        utcDate: string;
        status: string;
        matchday: number;
        homeTeam: { name: string; shortName: string };
        awayTeam: { name: string; shortName: string };
        score: { fullTime: { home: number | null; away: number | null } };
    }> | undefined;

    const matches = matchesData?.map((match) => ({
        data: new Date(match.utcDate).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
        }),
        rodada: match.matchday,
        mandante: match.homeTeam.name,
        visitante: match.awayTeam.name,
        placar: match.status === "FINISHED"
            ? `${match.score.fullTime.home} x ${match.score.fullTime.away}`
            : "A jogar",
    }));

    const competition = data.competition as { name?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        tipo: status === "SCHEDULED" ? "Próximos jogos" : "Resultados recentes",
        partidas: matches || [],
    };
}

export async function getScorers(competitionCode: string, limit: number = 10) {
    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/scorers`,
        params: { limit: limit.toString() },
    });

    if (data.erro) return data;

    const scorersData = data.scorers as Array<{
        player: { name: string; nationality: string };
        team: { name: string };
        goals: number;
        assists: number | null;
        penalties: number | null;
    }> | undefined;

    const scorers = scorersData?.map((scorer) => ({
        jogador: scorer.player.name,
        nacionalidade: scorer.player.nationality,
        time: scorer.team.name,
        gols: scorer.goals,
        assistencias: scorer.assists || 0,
        penaltis: scorer.penalties || 0,
    }));

    const competition = data.competition as { name?: string } | undefined;
    const season = data.season as { startDate?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        temporada: season?.startDate?.slice(0, 4) || new Date().getFullYear().toString(),
        artilheiros: scorers || [],
    };
}

export async function getTeamInfo(teamId: number) {
    const data = await fetchFootballData({ endpoint: `/teams/${teamId}` });

    if (data.erro) return data;

    const runningCompetitions = data.runningCompetitions as Array<{ name: string }> | undefined;

    return {
        nome: data.name as string,
        sigla: data.tla as string,
        fundado: data.founded as number,
        estadio: data.venue as string,
        competicoes: runningCompetitions?.map((c) => c.name) || [],
    };
}

export const COMPETITION_CODES: Record<string, string> = {
    BSA: "Brasileirão Série A",
    BSB: "Brasileirão Série B",
    PL: "Premier League (Inglaterra)",
    PD: "La Liga (Espanha)",
    SA: "Serie A (Itália)",
    BL1: "Bundesliga (Alemanha)",
    FL1: "Ligue 1 (França)",
    CL: "UEFA Champions League",
    ELC: "Championship (Inglaterra)",
    PPL: "Primeira Liga (Portugal)",
};
