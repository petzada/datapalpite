import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
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
6. Seja conciso.

## Códigos das Ligas:
${Object.entries(COMPETITION_CODES).map(([code, name]) => `- ${code}: ${name}`).join("\n")}`;

export async function POST(req: Request) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || !process.env.FOOTBALL_DATA_API_KEY) {
        return new Response(JSON.stringify({ error: "Configuração de API incompleta" }), { status: 500 });
    }

    try {
        const { messages } = await req.json();
        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model: google("gemini-2.5-flash-lite-preview-02-05"), // Atualizado para 2.5 Flash Lite
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            stopWhen: stepCountIs(5),
            tools: {
                getStandings: tool({
                    description: "Tabela de classificação. Use códigos: BSA, PL, PD, CL",
                    parameters: z.object({ competitionCode: z.string() }),
                    // @ts-expect-error
                    execute: async ({ competitionCode }) => await getStandings(competitionCode.toUpperCase()),
                }),
                getUpcomingMatches: tool({
                    description: "Próximos jogos",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    // @ts-expect-error
                    execute: async ({ competitionCode, limit = 10 }) => await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit),
                }),
                getRecentResults: tool({
                    description: "Resultados recentes",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    // @ts-expect-error
                    execute: async ({ competitionCode, limit = 10 }) => await getMatches(competitionCode.toUpperCase(), "FINISHED", limit),
                }),
                getTopScorers: tool({
                    description: "Artilheiros",
                    parameters: z.object({ competitionCode: z.string(), limit: z.number().optional() }),
                    // @ts-expect-error
                    execute: async ({ competitionCode, limit = 10 }) => await getScorers(competitionCode.toUpperCase(), limit),
                }),
            },
        });

        // @ts-expect-error
        return result.toDataStreamResponse({
            getErrorMessage: () => "Erro no processamento da IA",
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
    }
}
