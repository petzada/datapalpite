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

        console.log("=== Chat API Request ===");
        console.log("Messages count:", modelMessages.length);

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            // Permitir até 5 passos para tool calling (chamada + resposta)
            stopWhen: stepCountIs(5),
            // Callbacks para debug
            onStepFinish: (stepResult) => {
                console.log("=== Step Finished ===");
                console.log("Step result keys:", Object.keys(stepResult));
                console.log("Step result:", JSON.stringify(stepResult, null, 2).slice(0, 500));
            },
            tools: {
                getStandings: {
                    description: "Obtém a tabela de classificação atual de uma liga de futebol. Use códigos como: BSA (Brasileirão), PL (Premier League), PD (La Liga), CL (Champions League)",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga (ex: BSA, PL, PD, CL)"),
                    }),
                    execute: async ({ competitionCode }) => {
                        console.log(`[Tool] Buscando classificação para: ${competitionCode}`);
                        const result = await getStandings(competitionCode.toUpperCase());
                        console.log(`[Tool] Resultado:`, JSON.stringify(result).slice(0, 200));
                        return result;
                    },
                },

                getUpcomingMatches: {
                    description: "Obtém os próximos jogos agendados de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Tool] Buscando próximos jogos para: ${competitionCode}`);
                        const result = await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit);
                        console.log(`[Tool] Resultado:`, JSON.stringify(result).slice(0, 200));
                        return result;
                    },
                },

                getRecentResults: {
                    description: "Obtém os resultados mais recentes (jogos finalizados) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogos (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Tool] Buscando resultados para: ${competitionCode}`);
                        const result = await getMatches(competitionCode.toUpperCase(), "FINISHED", limit);
                        console.log(`[Tool] Resultado:`, JSON.stringify(result).slice(0, 200));
                        return result;
                    },
                },

                getTopScorers: {
                    description: "Obtém a lista de artilheiros (maiores goleadores) de uma competição",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da liga"),
                        limit: z.number().optional().describe("Quantidade de jogadores (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Tool] Buscando artilheiros para: ${competitionCode}`);
                        const result = await getScorers(competitionCode.toUpperCase(), limit);
                        console.log(`[Tool] Resultado:`, JSON.stringify(result).slice(0, 200));
                        return result;
                    },
                },
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
