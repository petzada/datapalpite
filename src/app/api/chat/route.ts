import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod";
import {
    getStandings,
    getMatches,
    getScorers,
    getTeamInfo,
    COMPETITION_CODES,
} from "@/lib/services/football-data";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Você é um assistente especializado em estatísticas de futebol da plataforma "Data Palpite".

## Suas Capacidades:
- Consultar classificações de ligas (tabelas)
- Verificar próximos jogos programados
- Mostrar resultados recentes de partidas
- Listar artilheiros de competições
- Buscar informações detalhadas de times

## Regras OBRIGATÓRIAS:
1. SEMPRE use as ferramentas disponíveis para buscar dados reais. NUNCA invente informações.
2. Se uma ferramenta retornar erro (rate limit, não encontrado, etc.), informe o usuário de forma educada.
3. NÃO dê conselhos de apostas, dicas de palpites ou sugestões sobre em quem apostar.
4. Responda APENAS com fatos e estatísticas verificáveis.
5. Responda sempre em Português do Brasil.
6. Seja conciso e formate os dados de forma legível.
7. Se o usuário perguntar sobre uma competição, converta automaticamente o nome para o código correto.
8. Após receber os dados da ferramenta, SEMPRE gere uma resposta formatada para o usuário.

## Códigos das Competições Disponíveis:
${Object.entries(COMPETITION_CODES).map(([code, name]) => `- ${code}: ${name}`).join("\n")}

## Exemplos de Mapeamento:
- "Brasileirão" ou "Campeonato Brasileiro" → BSA
- "Premier League" ou "Inglês" → PL
- "La Liga" ou "Espanhol" → PD
- "Champions League" ou "Champions" → CL
- "Serie A italiana" ou "Italiano" → SA
- "Bundesliga" ou "Alemão" → BL1
- "Ligue 1" ou "Francês" → FL1`;

export async function POST(req: Request) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return new Response(
            JSON.stringify({ error: "Configuração de API do Gemini incompleta" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!process.env.FOOTBALL_DATA_API_KEY) {
        return new Response(
            JSON.stringify({ error: "Configuração de API de futebol incompleta" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            stopWhen: stepCountIs(5),
            tools: {
                getStandings: tool({
                    description: "Obtém a tabela de classificação de uma liga de futebol. Use para perguntas sobre posições, pontos, classificação.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição (ex: BSA, PL, PD, CL, SA, BL1, FL1)"),
                    }),
                    execute: async ({ competitionCode }) => {
                        return await getStandings(competitionCode.toUpperCase());
                    },
                }),

                getUpcomingMatches: tool({
                    description: "Obtém os próximos jogos agendados de uma liga. Use para perguntas sobre próximas partidas, jogos futuros.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de partidas a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        return await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit ?? 10);
                    },
                }),

                getRecentResults: tool({
                    description: "Obtém os resultados recentes de uma liga. Use para perguntas sobre últimos jogos, resultados, placares.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de partidas a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        return await getMatches(competitionCode.toUpperCase(), "FINISHED", limit ?? 10);
                    },
                }),

                getTopScorers: tool({
                    description: "Obtém a lista de artilheiros de uma liga. Use para perguntas sobre maiores goleadores, quem fez mais gols.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de artilheiros a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        return await getScorers(competitionCode.toUpperCase(), limit ?? 10);
                    },
                }),

                getTeamInfo: tool({
                    description: "Obtém informações detalhadas de um time específico pelo seu ID numérico.",
                    inputSchema: z.object({
                        teamId: z.number().describe("ID numérico do time na API Football-Data"),
                    }),
                    execute: async ({ teamId }) => {
                        return await getTeamInfo(teamId);
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();

    } catch (error) {
        console.error("[Chat API] Erro:", error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor. Tente novamente." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
