"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
    "Como está a classificação do Brasileirão?",
    "Quais os próximos jogos da Premier League?",
    "Quem são os artilheiros da La Liga?",
    "Últimos resultados da Champions League?",
];

// Sugestões para mostrar após erro
const ERROR_SUGGESTIONS = [
    "Classificação do Brasileirão",
    "Próximos jogos da Premier League",
];

// Helper para extrair texto das partes da mensagem
function getMessageText(parts: Array<{ type: string; text?: string }> | undefined | null): string {
    if (!parts || !Array.isArray(parts)) return "";
    return parts
        .filter((part) => part.type === "text" && part.text)
        .map((part) => part.text)
        .join("");
}

// Mensagem amigável para o usuário (sem detalhes técnicos)
const FRIENDLY_ERROR_MESSAGE = "Desculpe, não consegui processar sua pergunta. Por favor, tente novamente ou reformule sua pergunta sobre estatísticas de futebol.";

export function AiChat() {
    const { messages, status, sendMessage, error, clearError } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [showError, setShowError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLoading = status === "streaming" || status === "submitted";

    // Mostrar erro amigável quando houver erro
    useEffect(() => {
        if (error) {
            setShowError(true);
            // Auto-esconder erro após 10 segundos
            const timer = setTimeout(() => {
                setShowError(false);
                clearError();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    // Auto scroll para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, showError]);

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

    const handleErrorSuggestionClick = (question: string) => {
        setShowError(false);
        clearError();
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
                                    const textContent = getMessageText(message.parts as Array<{ type: string; text?: string }>) || (message as any).content;
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

                                {showError && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="space-y-3 max-w-[85%]">
                                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
                                                {FRIENDLY_ERROR_MESSAGE}
                                            </div>
                                            {/* Sugestões após erro */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    Tente:
                                                </span>
                                                {ERROR_SUGGESTIONS.map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        onClick={() => handleErrorSuggestionClick(suggestion)}
                                                        className="text-xs px-2 py-1 rounded-md border bg-background hover:bg-muted transition-colors"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
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
