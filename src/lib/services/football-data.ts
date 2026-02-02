/**
 * Service para integração com a API Football-Data.org
 * Documentação: https://www.football-data.org/documentation/api
 * 
 * IMPORTANTE: Esta versão inclui:
 * - Cache via Supabase (TTL 60 min)
 * - Tratamento de rate limit (429)
 * - Tratamento de erros de rede
 */

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

/**
 * Função central para buscar dados da API com cache e tratamento de erros
 */
async function fetchFootballData({ endpoint, params }: FetchOptions): Promise<ApiResponse> {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    console.log(`[FootballData] Iniciando fetch: ${endpoint}`);
    console.log(`[FootballData] API Key configurada: ${!!apiKey}`);

    if (!apiKey) {
        console.error("[FootballData] ERRO: API Key não encontrada");
        return {
            erro: "Configuração da API de futebol incompleta. Contate o suporte.",
        };
    }

    // Verifica cache primeiro
    const cacheKey = generateCacheKey(endpoint, params);
    try {
        const cached = await getFromCache(cacheKey);
        if (cached) {
            console.log(`[FootballData] Retornando dados do CACHE: ${endpoint}`);
            return cached as ApiResponse;
        }
    } catch (cacheError) {
        console.warn("[FootballData] Erro ao verificar cache, continuando com API:", cacheError);
    }

    // Constrói URL com parâmetros
    const url = new URL(`${FOOTBALL_DATA_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    console.log(`[FootballData] Chamando API: ${url.toString()}`);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "X-Auth-Token": apiKey,
                "Content-Type": "application/json",
            },
            cache: "no-store", // Cache gerenciado pelo Supabase
        });

        // Tratamento específico para rate limit
        if (response.status === 429) {
            console.error("[FootballData] Rate limit atingido (429)");
            return {
                erro: "O limite de requisições da API foi atingido. Por favor, aguarde alguns minutos e tente novamente.",
                rateLimit: true,
            };
        }

        // Tratamento para erros de autenticação
        if (response.status === 403) {
            console.error("[FootballData] Erro de autenticação (403)");
            return {
                erro: "Erro de autenticação com a API. Verifique a configuração.",
            };
        }

        // Tratamento para recurso não encontrado
        if (response.status === 404) {
            console.error(`[FootballData] Recurso não encontrado (404): ${endpoint}`);
            return {
                erro: "Competição ou recurso não encontrado. Verifique o código da liga.",
            };
        }

        // Outros erros HTTP
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[FootballData] API Error ${response.status}: ${errorText}`);
            return {
                erro: `Erro ao consultar dados de futebol (${response.status}).`,
                details: errorText,
            };
        }

        // Parse da resposta JSON
        const data = await response.json();
        console.log(`[FootballData] Resposta recebida com sucesso para: ${endpoint}`);

        // Salva no cache (async, não bloqueia)
        saveToCache(cacheKey, endpoint, data).catch(err => {
            console.warn("[FootballData] Erro ao salvar cache:", err);
        });

        return data;
    } catch (err) {
        console.error(`[FootballData] Network/Fetch Error:`, err);
        return {
            erro: "Não foi possível conectar à API de futebol. Verifique sua conexão e tente novamente.",
            network: true,
        };
    }
}

/**
 * Obtém a tabela de classificação de uma competição
 */
export async function getStandings(competitionCode: string) {
    console.log(`[getStandings] Buscando classificação para: ${competitionCode}`);

    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/standings`,
    });

    // Retorna erro se existir
    if (data.erro) {
        return data;
    }

    // Simplificar dados para o contexto da IA
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

    console.log(`[getStandings] Encontrados ${standings?.length || 0} times`);

    const competition = data.competition as { name?: string } | undefined;
    const season = data.season as { startDate?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        temporada: season?.startDate?.slice(0, 4) || new Date().getFullYear().toString(),
        classificacao: standings || [],
    };
}

/**
 * Obtém os próximos jogos ou resultados recentes de uma competição
 */
export async function getMatches(
    competitionCode: string,
    status: "SCHEDULED" | "FINISHED" = "SCHEDULED",
    limit: number = 10
) {
    console.log(`[getMatches] Buscando partidas ${status} para: ${competitionCode}`);

    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/matches`,
        params: { status, limit: limit.toString() },
    });

    // Retorna erro se existir
    if (data.erro) {
        return data;
    }

    const matchesData = data.matches as Array<{
        utcDate: string;
        status: string;
        matchday: number;
        homeTeam: { name: string; shortName: string };
        awayTeam: { name: string; shortName: string };
        score: {
            fullTime: { home: number | null; away: number | null };
        };
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

    console.log(`[getMatches] Encontradas ${matches?.length || 0} partidas`);

    const competition = data.competition as { name?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        tipo: status === "SCHEDULED" ? "Próximos jogos" : "Resultados recentes",
        partidas: matches || [],
    };
}

/**
 * Obtém os artilheiros de uma competição
 */
export async function getScorers(competitionCode: string, limit: number = 10) {
    console.log(`[getScorers] Buscando artilheiros para: ${competitionCode}`);

    const data = await fetchFootballData({
        endpoint: `/competitions/${competitionCode}/scorers`,
        params: { limit: limit.toString() },
    });

    // Retorna erro se existir
    if (data.erro) {
        return data;
    }

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

    console.log(`[getScorers] Encontrados ${scorers?.length || 0} artilheiros`);

    const competition = data.competition as { name?: string } | undefined;
    const season = data.season as { startDate?: string } | undefined;

    return {
        competicao: competition?.name || competitionCode,
        temporada: season?.startDate?.slice(0, 4) || new Date().getFullYear().toString(),
        artilheiros: scorers || [],
    };
}

/**
 * Obtém informações de um time específico
 */
export async function getTeamInfo(teamId: number) {
    console.log(`[getTeamInfo] Buscando informações do time ID: ${teamId}`);

    const data = await fetchFootballData({
        endpoint: `/teams/${teamId}`,
    });

    // Retorna erro se existir
    if (data.erro) {
        return data;
    }

    const runningCompetitions = data.runningCompetitions as Array<{ name: string }> | undefined;

    return {
        nome: data.name as string,
        sigla: data.tla as string,
        fundado: data.founded as number,
        estadio: data.venue as string,
        competicoes: runningCompetitions?.map((c) => c.name) || [],
    };
}

/**
 * Códigos das principais competições disponíveis
 */
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
