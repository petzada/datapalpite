import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages, stepCountIs, UIMessage } from "ai";
import { z } from "zod";
import {
    getStandings,
    getMatches,
    getScorers,
    COMPETITION_CODES,
} from "@/lib/services/football-data";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Você é um assistente especializado em estatísticas de futebol da plataforma "Data Palpite".

## Suas Capacidades:
- Consultar classificações de ligas
- Verificar próximos jogos e resultados
- Listar artilheiros

## Regras:
1. SEMPRE use as ferramentas para buscar dados.
2. NUNCA invente dados.
3. NÃO dê conselhos de apostas.
4. Responda apenas FATOS.
5. Responda em Português do Brasil.
6. Seja conciso e formate os dados de forma legível.

## Códigos das Ligas:
${Object.entries(COMPETITION_CODES).map(([code, name]) => `- ${code}: ${name}`).join("\n")}`;

export async function POST(req: Request) {
    console.log("[Chat API] Iniciando requisição...");
    console.log("[Chat API] GOOGLE_GENERATIVE_AI_API_KEY existe:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    console.log("[Chat API] FOOTBALL_DATA_API_KEY existe:", !!process.env.FOOTBALL_DATA_API_KEY);

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || !process.env.FOOTBALL_DATA_API_KEY) {
        console.error("[Chat API] Erro: API Keys não configuradas");
        return new Response(JSON.stringify({ error: "Configuração de API incompleta" }), { status: 500 });
    }

    try {
        const { messages }: { messages: UIMessage[] } = await req.json();
        console.log("[Chat API] Mensagens recebidas:", messages.length);

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            stopWhen: stepCountIs(5),
            onStepFinish: ({ stepType, toolCalls, toolResults }) => {
                console.log(`[Chat API] Step concluído: ${stepType}`);
                if (toolCalls) {
                    console.log(`[Chat API] Tool calls:`, toolCalls.map(t => t.toolName));
                }
                if (toolResults) {
                    console.log(`[Chat API] Tool results:`, toolResults.map(r => ({
                        toolCallId: r.toolCallId,
                        hasResult: !!r.result,
                    })));
                }
            },
            tools: {
                getStandings: tool({
                    description: "Tabela de classificação. Use códigos: BSA, PL, PD, CL",
                    parameters: z.object({ competitionCode: z.string() }),
                    execute: async ({ competitionCode }) => {
                        console.log(`[Chat API] Executando getStandings com código: ${competitionCode}`);
                        try {
                            return await getStandings(competitionCode.toUpperCase());
                        } catch (error) {
                            console.error("[Chat API] Erro em getStandings:", error);
                            return { erro: `Não foi possível buscar a classificação. Verifique se o código ${competitionCode} está correto.` };
                        }
                    },
                }),
                getUpcomingMatches: tool({
                    description: "Próximos jogos",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Chat API] Executando getUpcomingMatches com código: ${competitionCode}`);
                        try {
                            return await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit);
                        } catch (error) {
                            console.error("[Chat API] Erro em getUpcomingMatches:", error);
                            return { erro: `Não foi possível buscar os próximos jogos.` };
                        }
                    },
                }),
                getRecentResults: tool({
                    description: "Resultados recentes",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Chat API] Executando getRecentResults com código: ${competitionCode}`);
                        try {
                            return await getMatches(competitionCode.toUpperCase(), "FINISHED", limit);
                        } catch (error) {
                            console.error("[Chat API] Erro em getRecentResults:", error);
                            return { erro: `Não foi possível buscar os resultados.` };
                        }
                    },
                }),
                getTopScorers: tool({
                    description: "Artilheiros",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    execute: async ({ competitionCode, limit = 10 }) => {
                        console.log(`[Chat API] Executando getTopScorers com código: ${competitionCode}`);
                        try {
                            return await getScorers(competitionCode.toUpperCase(), limit);
                        } catch (error) {
                            console.error("[Chat API] Erro em getTopScorers:", error);
                            return { erro: `Não foi possível buscar os artilheiros.` };
                        }
                    },
                }),
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error("[Chat API] Erro interno:", error);
        return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
    }
}

