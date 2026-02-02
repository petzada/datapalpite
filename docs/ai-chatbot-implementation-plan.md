# Plano de Implementação: Chatbot de Consulta IA (Gemini + Football Data)

Este documento descreve a implementação de um assistente virtual especializado em futebol, capaz de consultar dados reais via API.

---

## 1. Stack Tecnológica

- **Framework de IA:** [Vercel AI SDK](https://sdk.vercel.ai/docs) (Padrão da indústria para Next.js).
- **Modelo de LLM:** Google Gemini 1.5 Flash (Rápido, janela de contexto longa e excelente custo-benefício/token).
- **Fonte de Dados:** [Football-Data.org API](https://www.football-data.org/) (Gratuita para testes, cobre principais ligas).

---

## 2. Passo a Passo de Implementação

### Passo 1: Obter Chaves de API
Você precisará de duas chaves antes de começar:

1.  **Google AI Studio API Key:**
    - Acesse [aistudio.google.com](https://aistudio.google.com/).
    - Gere uma chave API gratuita.
    - Adicione em `.env.local`: `GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui`

2.  **Football Data API Key:**
    - Cadastre-se em [football-data.org](https://www.football-data.org/client/register).
    - Verifique seu email para receber a chave.
    - Adicione em `.env.local`: `FOOTBALL_DATA_API_KEY=sua_chave_aqui`

### Passo 2: Instalar Dependências
Instalar o núcleo do SDK e o provedor do Google.

```bash
npm install ai @ai-sdk/google zod
```

### Passo 3: Backend (API Route com Tool Calling)
Criar o endpoint que gerencia o chat e executa as ferramentas.

**Arquivo:** `src/app/api/chat/route.ts`

```typescript
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Configuração de segurança: permitir chat por até 30s
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: `Você é um especialista em estatísticas de futebol e assistente da plataforma 'Data Palpite'.
    - Use SEMPRE a ferramenta 'getCompetitionData' ou 'getMatchHistory' para responder sobre jogos e classificações.
    - Se a ferramenta retornar dados, analise-os e responda em Português do Brasil.
    - NÃO INVENTE RESULTADOS. Se a API não retornar dados, diga que não encontrou a informação.
    - IMPORTANTE: NÃO dê dicas de apostas (ex: "aposte no time X"). Apenas apresente os fatos e estatísticas (ex: "O time X venceu 80% dos últimos jogos em casa").`,
    tools: {
      getCompetitionData: tool({
        description: 'Obtém a tabela de classificação de uma liga específica',
        parameters: z.object({
          competitionCode: z.string().describe('O código da liga (ex: PL para Premier League, BSA para Brasileirão Série A, PD para La Liga)'),
        }),
        execute: async ({ competitionCode }) => {
          const response = await fetch(`https://api.football-data.org/v4/competitions/${competitionCode}/standings`, {
            headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' },
          });
          return response.json();
        },
      }),
      // Adicionar mais tools conforme necessidade (ex: artilharia, próximos jogos)
    },
  });

  return result.toDataStreamResponse();
}
```

### Passo 4: Frontend (Interface do Chat)
Criar a página e a interface visual.

**Rota:** `/dashboard/consulta-ia/page.tsx`

```typescript
'use client';

import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send } from "lucide-react";

export default function ConsultaIaPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      <div className="flex-1 bg-muted/30 rounded-xl border p-4 mb-4 relative overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <Bot className="w-12 h-12 mb-2" />
                <p>Pergunte sobre classificações e estatísticas de futebol...</p>
             </div>
          )}
          
          <div className="space-y-4 pb-4">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background border shadow-sm'
                }`}>
                  {m.content}
                </div>
                
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-primary/10" />
                <div className="h-10 bg-muted rounded-lg w-32" />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          value={input} 
          onChange={handleInputChange} 
          placeholder="Ex: Como está a classificação do Brasileirão?"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="w-4 h-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
```

### Passo 5: Atualizar Navegação
1.  **Sidebar:** Nova label "Ferramentas" -> Item "Consulta IA" (Ícone `Bot` ou `Sparkles`).
2.  **MobileNav:** Adicionar à barra inferior também.

---

## 3. Códigos das Ligas (Football Data)
Para o prompt do sistema ser eficaz, o usuário precisa saber (ou a IA inferir) os códigos:
- **BSA:** Brasileirão Série A
- **PL:** Premier League
- **PD:** La Liga
- **SA:** Serie A (Itália)
- **BL1:** Bundesliga
- **FL1:** Ligue 1
- **CL:** Champions League

A IA (Gemini) é esperta o suficiente para entender "Campeonato Brasileiro" e converter para o parâmetro `competitionCode: 'BSA'` automaticamente na chamada da tool.
