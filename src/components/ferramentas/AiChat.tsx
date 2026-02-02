"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
    "Qual a classificação do Brasileirão?",
    "Quais os próximos jogos da Premier League?",
    "Quem são os artilheiros da La Liga?",
    "Últimos resultados da Champions League",
];

export function AiChat() {
    const [inputValue, setInputValue] = useState("");
    const { messages, sendMessage, status, error } = useChat();

    const [showError, setShowError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLoading = status === "streaming" || status === "submitted";

    // Scroll automático para novas mensagens
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Mostrar erro temporariamente
    useEffect(() => {
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Função para enviar mensagem
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue.trim();
        setInputValue("");
        await sendMessage({ text: message });
    };

    // Função para usar sugestão
    const handleSuggestion = (question: string) => {
        setInputValue(question);
    };

    // Extrair texto das partes da mensagem (SDK v6)
    const getMessageContent = (message: typeof messages[0]): string => {
        if (!message.parts || !Array.isArray(message.parts)) {
            return "";
        }
        return message.parts
            .filter((part) => part.type === "text")
            .map((part) => {
                if (part.type === "text") {
                    return part.text;
                }
                return "";
            })
            .join("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)]">
            {/* Área de mensagens */}
            <Card className="flex-1 mb-4 overflow-hidden">
                <CardContent className="p-0 h-full">
                    <div className="h-full overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            // Estado vazio - mostrar sugestões
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Assistente de Futebol
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                                    Pergunte sobre classificações, jogos, resultados e artilheiros
                                    das principais ligas do mundo.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSuggestion(q)}
                                            className="text-left text-sm p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>

                                {/* Disclaimer */}
                                <p className="text-xs text-muted-foreground mt-6 max-w-sm">
                                    ⚠️ Este assistente fornece apenas dados estatísticos.
                                    Não oferecemos dicas de apostas.
                                </p>
                            </div>
                        ) : (
                            // Lista de mensagens
                            <div className="space-y-4">
                                {messages.map((m) => {
                                    const content = getMessageContent(m);
                                    if (!content) return null;

                                    return (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                "flex gap-3",
                                                m.role === "user" ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {/* Avatar do assistente */}
                                            {m.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                            )}

                                            {/* Bolha da mensagem */}
                                            <div
                                                className={cn(
                                                    "p-3 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap",
                                                    m.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                )}
                                            >
                                                {content}
                                            </div>

                                            {/* Avatar do usuário */}
                                            {m.role === "user" && (
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Indicador de loading */}
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

                                {/* Mensagem de erro */}
                                {showError && error && (
                                    <div className="flex gap-3 justify-center">
                                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>
                                                {error.message || "Não foi possível processar. Tente novamente."}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowError(false)}
                                                className="ml-2"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Scroll anchor */}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Input de mensagem */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua pergunta sobre futebol..."
                    disabled={isLoading}
                    className="flex-1 h-11"
                />
                <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}
