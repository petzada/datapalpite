import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { z } from "zod";
import {
    getStandings,
    getMatches,
    getScorers,
    COMPETITION_CODES,
} from "@/lib/services/football-data";

// Permitir streams de até 30 segundos
export const maxDuration = 30;

// Mensagem genérica para erros (sem detalhes técnicos)
const GENERIC_ERROR = "Não foi possível processar sua solicitação no momento.";

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
7. Se o usuário perguntar algo fora do escopo de futebol, educadamente redirecione para estatísticas de futebol.
8. NUNCA revele informações técnicas, códigos de erro ou detalhes internos do sistema.

## Códigos das Ligas Disponíveis:
${Object.entries(COMPETITION_CODES).map(([code, name]) => `- ${code}: ${name}`).join("\n")}

## Exemplos de Perguntas que você pode responder:
- "Como está a classificação do Brasileirão?"
- "Quais os próximos jogos da Premier League?"
- "Quem são os artilheiros da La Liga?"
- "Quais foram os últimos resultados da Champions League?"`;

export async function POST(req: Request) {
    // Verificar chaves de API antes de iniciar (log apenas no servidor)
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("[Chat API] GOOGLE_GENERATIVE_AI_API_KEY não configurada");
        return new Response(
            JSON.stringify({ error: GENERIC_ERROR }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
    if (!process.env.FOOTBALL_DATA_API_KEY) {
        console.error("[Chat API] FOOTBALL_DATA_API_KEY não configurada");
        return new Response(
            JSON.stringify({ error: GENERIC_ERROR }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const body = await req.json();
        const { messages } = body;

        // Validar entrada
        if (!messages || !Array.isArray(messages)) {
            console.error("[Chat API] Mensagens inválidas recebidas");
            return new Response(
                JSON.stringify({ error: GENERIC_ERROR }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Converter UIMessages para ModelMessages
        const modelMessages = await convertToModelMessages(messages);

        // Log apenas no servidor (não expor ao cliente)
        if (process.env.NODE_ENV === "development") {
            console.log("[Chat API] Processando", modelMessages.length, "mensagens");
        }

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            stopWhen: stepCountIs(5),
            // Log de debug apenas em desenvolvimento
            onStepFinish: (stepResult) => {
                if (process.env.NODE_ENV === "development") {
                    console.log("[Chat API] Step concluído:", Object.keys(stepResult).join(", "));
                }
            },
            tools: {
                getStandings: {
                    description: "Obtém a tabela de classificação atual de uma liga de futebol. Use códigos como: BSA (Brasileirão), PL (Premier League), PD (La Liga), CL (Champions League)",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga (ex: BSA, PL, PD, CL)"),
                    }),
                    execute: async ({ competitionCode }) => {
                        if (process.env.NODE_ENV === "development") {
                            console.log("[Tool] getStandings:", competitionCode);
                        }
                        try {
                            return await getStandings(competitionCode.toUpperCase());
                        } catch (error) {
                            console.error("[Tool] Erro em getStandings:", error);
                            return { erro: "Dados indisponíveis no momento" };
                        }
                    },
                },

                getUpcomingMatches: {
                    description: "Obtém os próximos jogos agendados de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        if (process.env.NODE_ENV === "development") {
                            console.log("[Tool] getUpcomingMatches:", competitionCode, limit);
                        }
                        try {
                            return await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit);
                        } catch (error) {
                            console.error("[Tool] Erro em getUpcomingMatches:", error);
                            return { erro: "Dados indisponíveis no momento" };
                        }
                    },
                },

                getRecentResults: {
                    description: "Obtém os resultados mais recentes (jogos finalizados) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        if (process.env.NODE_ENV === "development") {
                            console.log("[Tool] getRecentResults:", competitionCode, limit);
                        }
                        try {
                            return await getMatches(competitionCode.toUpperCase(), "FINISHED", limit);
                        } catch (error) {
                            console.error("[Tool] Erro em getRecentResults:", error);
                            return { erro: "Dados indisponíveis no momento" };
                        }
                    },
                },

                getTopScorers: {
                    description: "Obtém a lista de artilheiros (maiores goleadores) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogadores (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        if (process.env.NODE_ENV === "development") {
                            console.log("[Tool] getTopScorers:", competitionCode, limit);
                        }
                        try {
                            return await getScorers(competitionCode.toUpperCase(), limit);
                        } catch (error) {
                            console.error("[Tool] Erro em getTopScorers:", error);
                            return { erro: "Dados indisponíveis no momento" };
                        }
                    },
                },
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        // Log detalhado apenas no servidor
        console.error("[Chat API] Erro interno:", error);

        // Retornar mensagem genérica ao cliente
        return new Response(
            JSON.stringify({ error: GENERIC_ERROR }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
