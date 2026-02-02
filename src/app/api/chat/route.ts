import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import {
    getStandings,
    getMatches,
    getScorers,
    COMPETITION_CODES,
} from "@/lib/services/football-data";

// Permitir streams de até 30 segundos
export const maxDuration = 30;

const SYSTEM_PROMPT = `Você é um assistente especializado em estatísticas de futebol da plataforma "Data Palpite".

## Suas Capacidades:
- Consultar classificações de ligas (Brasileirão, Premier League, La Liga, etc.)
- Verificar próximos jogos e resultados recentes
- Listar artilheiros das competições

## Regras IMPORTANTES:
1. SEMPRE use as ferramentas disponíveis para buscar dados ANTES de responder sobre estatísticas.
2. NUNCA invente dados, placares ou estatísticas. Se não conseguir buscar, diga que não encontrou.
3. NÃO dê conselhos de apostas como "aposte no time X" ou "esse jogo é seguro".
4. Apresente apenas FATOS e ESTATÍSTICAS de forma neutra.
5. Responda SEMPRE em Português do Brasil.
6. Seja conciso e direto nas respostas.

## Códigos das Ligas Disponíveis:
${Object.entries(COMPETITION_CODES).map(([code, name]) => `- ${code}: ${name}`).join("\n")}

## Exemplos de Perguntas que você pode responder:
- "Como está a classificação do Brasileirão?"
- "Quais os próximos jogos da Premier League?"
- "Quem são os artilheiros da La Liga?"
- "Quais foram os últimos resultados da Champions League?"`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = streamText({
            model: google("gemini-1.5-flash"),
            system: SYSTEM_PROMPT,
            messages,
            tools: {
                getStandings: {
                    description: "Obtém a tabela de classificação atual de uma liga de futebol",
                    inputSchema: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga (ex: BSA para Brasileirão, PL para Premier League, PD para La Liga, CL para Champions League)"),
                    }),
                    execute: async ({ competitionCode }: { competitionCode: string }) => {
                        return await getStandings(competitionCode.toUpperCase());
                    },
                },

                getUpcomingMatches: {
                    description: "Obtém os próximos jogos agendados de uma competição",
                    inputSchema: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }: { competitionCode: string; limit?: number }) => {
                        return await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit);
                    },
                },

                getRecentResults: {
                    description: "Obtém os resultados mais recentes (jogos finalizados) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }: { competitionCode: string; limit?: number }) => {
                        return await getMatches(competitionCode.toUpperCase(), "FINISHED", limit);
                    },
                },

                getTopScorers: {
                    description: "Obtém a lista de artilheiros (maiores goleadores) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogadores (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }: { competitionCode: string; limit?: number }) => {
                        return await getScorers(competitionCode.toUpperCase(), limit);
                    },
                },
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Erro na API de chat:", error);
        return new Response(
            JSON.stringify({ error: "Erro ao processar a mensagem" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
