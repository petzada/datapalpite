import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages } from "ai";
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
    // Verificar chaves de API antes de iniciar
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return new Response(JSON.stringify({ error: "Chave da API do Google não configurada" }), { status: 500 });
    }
    if (!process.env.FOOTBALL_DATA_API_KEY) {
        return new Response(JSON.stringify({ error: "Chave da API Football Data não configurada" }), { status: 500 });
    }

    try {
        const { messages } = await req.json();

        // Converter UIMessages para ModelMessages (formato esperado pelo streamText)
        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model: google("gemini-1.5-flash"),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            tools: {
                getStandings: tool({
                    description: "Obtém a tabela de classificação atual de uma liga de futebol",
                    parameters: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga (ex: BSA para Brasileirão, PL para Premier League, PD para La Liga, CL para Champions League)"),
                    }),
                    // @ts-expect-error - Zod inference mismatch
                    execute: async ({ competitionCode }: any) => {
                        console.log(`Buscando classificação para: ${competitionCode}`);
                        return await getStandings(competitionCode.toUpperCase());
                    },
                }),

                getUpcomingMatches: tool({
                    description: "Obtém os próximos jogos agendados de uma competição",
                    parameters: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    // @ts-expect-error - Zod inference mismatch
                    execute: async ({ competitionCode, limit = 10 }: any) => {
                        console.log(`Buscando próximos jogos para: ${competitionCode}`);
                        return await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit);
                    },
                }),

                getRecentResults: tool({
                    description: "Obtém os resultados mais recentes (jogos finalizados) de uma competição",
                    parameters: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    // @ts-expect-error - Zod inference mismatch
                    execute: async ({ competitionCode, limit = 10 }: any) => {
                        console.log(`Buscando resultados para: ${competitionCode}`);
                        return await getMatches(competitionCode.toUpperCase(), "FINISHED", limit);
                    },
                }),

                getTopScorers: tool({
                    description: "Obtém a lista de artilheiros (maiores goleadores) de uma competição",
                    parameters: z.object({
                        competitionCode: z
                            .string()
                            .describe("Código da liga"),
                        limit: z
                            .number()
                            .optional()
                            .describe("Quantidade de jogadores (padrão: 10)"),
                    }),
                    // @ts-expect-error - Zod inference mismatch
                    execute: async ({ competitionCode, limit = 10 }: any) => {
                        console.log(`Buscando artilheiros para: ${competitionCode}`);
                        return await getScorers(competitionCode.toUpperCase(), limit);
                    },
                }),
            },
        });

        // Usar toUIMessageStreamResponse para compatibilidade com useChat v3
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("Erro na API de chat:", error);
        return new Response(
            JSON.stringify({ error: "Erro ao processar a mensagem" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
