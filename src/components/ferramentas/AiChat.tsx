"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_QUESTIONS = [
    "Qual a classificação do Brasileirão?",
    "Quais os próximos jogos da Premier League?",
    "Quem são os artilheiros da La Liga?",
    "Últimos resultados da Champions League",
];

function getMessageText(parts: any): string {
    if (!parts || !Array.isArray(parts)) return "";
    return parts
        .filter((part: any) => part.type === "text" && part.text)
        .map((part: any) => part.text)
        .join("");
}

export function AiChat() {
    const { messages, status, sendMessage, error, clearError } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });
    const [inputValue, setInputValue] = useState("");
    const [showError, setShowError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

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

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)]">
            <Card className="flex-1 mb-4 overflow-hidden">
                <CardContent className="p-0 h-full">
                    <div className="h-full overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Assistente de Futebol</h3>
                                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                                    Pergunte sobre classificações, jogos e artilheiros.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                                    {SUGGESTED_QUESTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setInputValue(q)}
                                            className="text-left text-sm p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((m) => {
                                    const text = getMessageText(m.parts) || (m as any).content;
                                    if (!text) return null;
                                    return (
                                        <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                                            {m.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                            <div className={cn("p-3 rounded-lg max-w-[85%] text-sm whitespace-pre-wrap", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                {text}
                                            </div>
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
                                            <span className="text-sm text-muted-foreground">Digitando...</span>
                                        </div>
                                    </div>
                                )}
                                {showError && (
                                    <div className="flex gap-3 justify-center">
                                        <div className="p-2 rounded-lg bg-red-100 text-red-800 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Não foi possível processar. Tente novamente.
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Digite sua pergunta..."
                    disabled={isLoading}
                    className="flex-1 h-11"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()} size="lg">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
    );
}
