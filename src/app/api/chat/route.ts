/**
 * API Route: Chat com IA para consultas de futebol
 * Utiliza Vercel AI SDK v6 + Google Gemini + Football-Data.org
 */
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

// Configuração de segurança: permitir chat por até 30s
export const maxDuration = 30;

// System Prompt configurado para o Gemini
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
    console.log("[Chat API] ========== NOVA REQUISIÇÃO ==========");
    console.log("[Chat API] GOOGLE_GENERATIVE_AI_API_KEY existe:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    console.log("[Chat API] FOOTBALL_DATA_API_KEY existe:", !!process.env.FOOTBALL_DATA_API_KEY);

    // Validação de API Keys
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("[Chat API] ERRO: GOOGLE_GENERATIVE_AI_API_KEY não configurada");
        return new Response(
            JSON.stringify({ error: "Configuração de API do Gemini incompleta" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!process.env.FOOTBALL_DATA_API_KEY) {
        console.error("[Chat API] ERRO: FOOTBALL_DATA_API_KEY não configurada");
        return new Response(
            JSON.stringify({ error: "Configuração de API de futebol incompleta" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        console.log("[Chat API] Mensagens recebidas:", messages.length);

        const result = streamText({
            model: google("gemini-2.5-flash-lite"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
            // IMPORTANTE: Permite multi-step tool calls
            // O modelo pode chamar a tool, receber o resultado e então gerar a resposta
            stopWhen: stepCountIs(5),
            tools: {
                getStandings: tool({
                    description: "Obtém a tabela de classificação de uma liga de futebol. Use para perguntas sobre posições, pontos, classificação.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição (ex: BSA, PL, PD, CL, SA, BL1, FL1)"),
                    }),
                    execute: async ({ competitionCode }) => {
                        console.log(`[Tool] getStandings chamada: ${competitionCode}`);
                        const result = await getStandings(competitionCode.toUpperCase());
                        console.log(`[Tool] getStandings resultado:`, JSON.stringify(result).substring(0, 300));
                        return result;
                    },
                }),

                getUpcomingMatches: tool({
                    description: "Obtém os próximos jogos agendados de uma liga. Use para perguntas sobre próximas partidas, jogos futuros.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de partidas a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        console.log(`[Tool] getUpcomingMatches chamada: ${competitionCode}, limit: ${limit}`);
                        const result = await getMatches(competitionCode.toUpperCase(), "SCHEDULED", limit ?? 10);
                        console.log(`[Tool] getUpcomingMatches resultado:`, JSON.stringify(result).substring(0, 300));
                        return result;
                    },
                }),

                getRecentResults: tool({
                    description: "Obtém os resultados recentes de uma liga. Use para perguntas sobre últimos jogos, resultados, placares.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de partidas a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        console.log(`[Tool] getRecentResults chamada: ${competitionCode}, limit: ${limit}`);
                        const result = await getMatches(competitionCode.toUpperCase(), "FINISHED", limit ?? 10);
                        console.log(`[Tool] getRecentResults resultado:`, JSON.stringify(result).substring(0, 300));
                        return result;
                    },
                }),

                getTopScorers: tool({
                    description: "Obtém a lista de artilheiros de uma liga. Use para perguntas sobre maiores goleadores, quem fez mais gols.",
                    inputSchema: z.object({
                        competitionCode: z.string().describe("Código da competição"),
                        limit: z.number().optional().default(10).describe("Número de artilheiros a retornar (padrão: 10)"),
                    }),
                    execute: async ({ competitionCode, limit }) => {
                        console.log(`[Tool] getTopScorers chamada: ${competitionCode}, limit: ${limit}`);
                        const result = await getScorers(competitionCode.toUpperCase(), limit ?? 10);
                        console.log(`[Tool] getTopScorers resultado:`, JSON.stringify(result).substring(0, 300));
                        return result;
                    },
                }),

                getTeamInfo: tool({
                    description: "Obtém informações detalhadas de um time específico pelo seu ID numérico. Use quando o usuário perguntar sobre um time específico e você souber o ID.",
                    inputSchema: z.object({
                        teamId: z.number().describe("ID numérico do time na API Football-Data (ex: 64 para Liverpool)"),
                    }),
                    execute: async ({ teamId }) => {
                        console.log(`[Tool] getTeamInfo chamada: ${teamId}`);
                        const result = await getTeamInfo(teamId);
                        console.log(`[Tool] getTeamInfo resultado:`, JSON.stringify(result).substring(0, 300));
                        return result;
                    },
                }),
            },
            // Callback para debug de cada step
            onStepFinish: ({ toolResults, text }) => {
                if (toolResults && toolResults.length > 0) {
                    console.log("[Chat API] Step finalizado com toolResults:", toolResults.length);
                }
                if (text) {
                    console.log("[Chat API] Step finalizado com texto:", text.substring(0, 100));
                }
            },
        });

        console.log("[Chat API] Stream iniciado com sucesso");
        return result.toUIMessageStreamResponse();

    } catch (error) {
        console.error("[Chat API] ERRO CRÍTICO:", error);
        return new Response(
            JSON.stringify({
                error: "Erro interno do servidor. Tente novamente.",
                details: error instanceof Error ? error.message : "Erro desconhecido",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
