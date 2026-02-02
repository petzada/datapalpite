"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, CheckCircle2, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
    userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
    const searchParams = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            setShowSuccess(true);
            // Remove query param from URL without refresh
            window.history.replaceState({}, '', '/dashboard');
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    return (
        <>
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm">Pagamento confirmado!</p>
                            <p className="text-xs text-green-600">Seu plano foi ativado com sucesso.</p>
                        </div>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="text-green-600 hover:text-green-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Bem vindo ao seu painel
                    </h1>
                    {userName && (
                        <p className="text-muted-foreground mt-1">
                            Olá, {userName}! Veja como estão suas apostas.
                        </p>
                    )}
                </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                {/* Period Filter */}
                <Select defaultValue="30">
                    <SelectTrigger className="w-[140px]">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="365">1 ano</SelectItem>
                        <SelectItem value="all">Todo período</SelectItem>
                    </SelectContent>
                </Select>

                {/* Betting House Filter */}
                <Select defaultValue="all">
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Casa de apostas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {/* Other houses will be populated based on user's registered houses */}
                    </SelectContent>
                </Select>
            </div>
            </div>
        </>
    );
}
