/**
 * Service para integração com a API Football-Data.org
 * Documentação: https://www.football-data.org/documentation/api
 */

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

interface FetchOptions {
    endpoint: string;
    params?: Record<string, string>;
}

async function fetchFootballData({ endpoint, params }: FetchOptions) {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;

    if (!apiKey) {
        throw new Error("FOOTBALL_DATA_API_KEY não configurada");
    }

    const url = new URL(`${FOOTBALL_DATA_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        headers: {
            "X-Auth-Token": apiKey,
        },
        next: { revalidate: 300 }, // Cache de 5 minutos
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Football Data API error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

/**
 * Obtém a tabela de classificação de uma competição
 */
export async function getStandings(competitionCode: string) {
    try {
        const data = await fetchFootballData({
            endpoint: `/competitions/${competitionCode}/standings`,
        });

        // Simplificar dados para o contexto da IA
        const standings = data.standings?.[0]?.table?.map((team: {
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
        }) => ({
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

        return {
            competicao: data.competition?.name,
            temporada: data.season?.startDate?.slice(0, 4),
            classificacao: standings || [],
        };
    } catch (error) {
        console.error("Erro ao buscar classificação:", error);
        return { erro: "Não foi possível obter a classificação. Verifique o código da liga." };
    }
}

/**
 * Obtém os próximos jogos ou resultados recentes de uma competição
 */
export async function getMatches(competitionCode: string, status: "SCHEDULED" | "FINISHED" = "SCHEDULED", limit: number = 10) {
    try {
        const data = await fetchFootballData({
            endpoint: `/competitions/${competitionCode}/matches`,
            params: { status, limit: limit.toString() },
        });

        const matches = data.matches?.map((match: {
            utcDate: string;
            status: string;
            matchday: number;
            homeTeam: { name: string; shortName: string };
            awayTeam: { name: string; shortName: string };
            score: {
                fullTime: { home: number | null; away: number | null };
            };
        }) => ({
            data: new Date(match.utcDate).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }),
            rodada: match.matchday,
            mandante: match.homeTeam.name,
            visitante: match.awayTeam.name,
            placar: match.status === "FINISHED"
                ? `${match.score.fullTime.home} x ${match.score.fullTime.away}`
                : "A jogar",
        }));

        return {
            competicao: data.competition?.name,
            tipo: status === "SCHEDULED" ? "Próximos jogos" : "Resultados recentes",
            partidas: matches || [],
        };
    } catch (error) {
        console.error("Erro ao buscar partidas:", error);
        return { erro: "Não foi possível obter as partidas." };
    }
}

/**
 * Obtém os artilheiros de uma competição
 */
export async function getScorers(competitionCode: string, limit: number = 10) {
    try {
        const data = await fetchFootballData({
            endpoint: `/competitions/${competitionCode}/scorers`,
            params: { limit: limit.toString() },
        });

        const scorers = data.scorers?.map((scorer: {
            player: { name: string; nationality: string };
            team: { name: string };
            goals: number;
            assists: number | null;
            penalties: number | null;
        }) => ({
            jogador: scorer.player.name,
            nacionalidade: scorer.player.nationality,
            time: scorer.team.name,
            gols: scorer.goals,
            assistencias: scorer.assists || 0,
            penaltis: scorer.penalties || 0,
        }));

        return {
            competicao: data.competition?.name,
            temporada: data.season?.startDate?.slice(0, 4),
            artilheiros: scorers || [],
        };
    } catch (error) {
        console.error("Erro ao buscar artilheiros:", error);
        return { erro: "Não foi possível obter os artilheiros." };
    }
}

/**
 * Obtém informações de um time específico
 */
export async function getTeamInfo(teamId: number) {
    try {
        const data = await fetchFootballData({
            endpoint: `/teams/${teamId}`,
        });

        return {
            nome: data.name,
            sigla: data.tla,
            fundado: data.founded,
            estadio: data.venue,
            competicoes: data.runningCompetitions?.map((c: { name: string }) => c.name) || [],
        };
    } catch (error) {
        console.error("Erro ao buscar time:", error);
        return { erro: "Não foi possível obter informações do time." };
    }
}

/**
 * Códigos das principais competições disponíveis
 */
export const COMPETITION_CODES = {
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
} as const;
