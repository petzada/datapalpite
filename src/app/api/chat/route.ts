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

// Zod schemas
const standingsSchema = z.object({
    competitionCode: z.string().describe("Código da competição: BSA, PL, PD, CL, etc."),
});

const matchesSchema = z.object({
    competitionCode: z.string().describe("Código da competição"),
    limit: z.number().optional().describe("Número de partidas a retornar"),
});

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
            tools: {
                getStandings: tool({
                    description: "Tabela de classificação de uma liga de futebol",
                    parameters: standingsSchema,
                    // @ts-ignore
                    execute: async (params: any) => {
                        console.log(`[Chat API] Executando getStandings com código: ${params.competitionCode}`);
                        return await getStandings(params.competitionCode.toUpperCase());
                    },
                }),
                getUpcomingMatches: tool({
                    description: "Próximos jogos de uma liga de futebol",
                    parameters: matchesSchema,
                    // @ts-ignore
                    execute: async (params: any) => {
                        console.log(`[Chat API] Executando getUpcomingMatches com código: ${params.competitionCode}`);
                        return await getMatches(params.competitionCode.toUpperCase(), "SCHEDULED", params.limit ?? 10);
                    },
                }),
                getRecentResults: tool({
                    description: "Resultados recentes de uma liga de futebol",
                    parameters: matchesSchema,
                    // @ts-ignore
                    execute: async (params: any) => {
                        console.log(`[Chat API] Executando getRecentResults com código: ${params.competitionCode}`);
                        return await getMatches(params.competitionCode.toUpperCase(), "FINISHED", params.limit ?? 10);
                    },
                }),
                getTopScorers: tool({
                    description: "Artilheiros de uma liga de futebol",
                    parameters: matchesSchema,
                    // @ts-ignore
                    execute: async (params: any) => {
                        console.log(`[Chat API] Executando getTopScorers com código: ${params.competitionCode}`);
                        return await getScorers(params.competitionCode.toUpperCase(), params.limit ?? 10);
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


