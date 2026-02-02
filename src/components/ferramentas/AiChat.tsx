"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
    "Como está a classificação do Brasileirão?",
    "Quais os próximos jogos da Premier League?",
    "Quem são os artilheiros da La Liga?",
    "Últimos resultados da Champions League?",
];

// Helper para extrair texto das partes da mensagem
function getMessageText(parts: Array<{ type: string; text?: string }>): string {
    return parts
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("");
}

export function AiChat() {
    const { messages, status, sendMessage, error } = useChat();
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLoading = status === "streaming" || status === "submitted";

    // Log de erro para debug
    useEffect(() => {
        if (error) {
            console.error("Erro no chat:", error);
        }
    }, [error]);

    // Auto scroll para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue.trim();
        setInputValue("");
        await sendMessage({ text: message });
    };

    const handleSuggestionClick = (question: string) => {
        setInputValue(question);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)]">
            {/* Área de Mensagens */}
            <Card className="flex-1 mb-4 overflow-hidden">
                <CardContent className="p-0 h-full">
                    <div className="h-full overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Assistente de Estatísticas
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                                    Pergunte sobre classificações, resultados e artilheiros das principais ligas de futebol do mundo.
                                </p>

                                {/* Sugestões */}
                                <div className="w-full max-w-md space-y-2">
                                    <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Sugestões de perguntas
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {SUGGESTED_QUESTIONS.map((question) => (
                                            <button
                                                key={question}
                                                onClick={() => handleSuggestionClick(question)}
                                                className="text-left text-sm p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                                            >
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => {
                                    const textContent = getMessageText(message.parts as Array<{ type: string; text?: string }>);
                                    if (!textContent) return null;

                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex gap-3",
                                                message.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                            )}

                                            <div
                                                className={cn(
                                                    "p-3 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                )}
                                            >
                                                {textContent}
                                            </div>

                                            {message.role === "user" && (
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm text-muted-foreground">
                                                Consultando dados...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-destructive" />
                                        </div>
                                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                            Erro ao processar: {error.message || "Tente novamente"}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Input de Mensagem */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Pergunte sobre estatísticas de futebol..."
                    disabled={isLoading}
                    className="flex-1 h-11"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()} size="lg">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    <span className="sr-only">Enviar</span>
                </Button>
            </form>

            {/* Aviso */}
            <p className="text-xs text-muted-foreground text-center mt-3">
                Dados fornecidos por Football-Data.org. A IA não dá conselhos de apostas.
            </p>
        </div>
    );
}
