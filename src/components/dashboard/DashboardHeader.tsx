"use client";

import { Calendar } from "lucide-react";
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
    return (
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
    );
}
