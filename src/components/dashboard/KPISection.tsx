"use client";

import { Wallet, TrendingUp, Target, DollarSign, AlertTriangle } from "lucide-react";
import { KPICard } from "./KPICard";
import type { DashboardStats } from "@/lib/actions/dashboard";
import { processarRoR, formatRoR, getRoRColor } from "@/lib/ror";

interface KPISectionProps {
    stats: DashboardStats;
}

export function KPISection({ stats }: KPISectionProps) {
    // Formatar moeda
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

    // Formatar percentual
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    // Calcular Win Rate
    const apostasValidas = stats.apostasGanhas + stats.apostasPerdidas;
    const winRate = apostasValidas > 0
        ? (stats.apostasGanhas / apostasValidas) * 100
        : 0;

    // Calcular ROI
    const roi = stats.totalStakes > 0
        ? (stats.totalPL / stats.totalStakes) * 100
        : 0;

    // Calcular RoR
    const rorData = processarRoR({
        winRate: winRate / 100, // Converter para 0-1
        oddMedia: stats.oddMedia,
        stakePercent: stats.stakePercentualMedio,
        totalApostas: stats.totalApostas,
    });

    // Cor do P&L
    const plColor = stats.totalPL > 0 ? "green" : stats.totalPL < 0 ? "red" : "default";

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <KPICard
                title="Saldo Atual"
                value={formatCurrency(stats.saldoTotal)}
                description="Valor total disponível na sua banca de apostas."
                icon={Wallet}
            />
            <KPICard
                title="ROI"
                value={formatPercent(roi)}
                description="Retorno sobre o investimento total apostado. Quanto maior, melhor seu desempenho."
                icon={TrendingUp}
                color={roi > 0 ? "green" : roi < 0 ? "red" : "default"}
            />
            <KPICard
                title="Win Rate"
                value={formatPercent(winRate)}
                description="Percentual de apostas vencedoras em relação ao total de apostas realizadas."
                icon={Target}
                secondaryValue={`${stats.apostasGanhas}/${apostasValidas} apostas`}
            />
            <KPICard
                title="P&L"
                value={formatCurrency(stats.totalPL)}
                description="Lucro ou prejuízo acumulado. Diferença entre seus ganhos e perdas totais."
                icon={DollarSign}
                color={plColor}
            />
            <KPICard
                title="Risco de Ruína"
                value={formatRoR(rorData.rorReal)}
                description={rorData.hasRealData
                    ? "Probabilidade real de perder toda a banca, baseada no seu histórico."
                    : "Probabilidade planejada de ruína. Registre mais apostas para o cálculo real."
                }
                icon={AlertTriangle}
                color={getRoRColor(rorData.rorReal)}
                secondaryValue={rorData.hasRealData ? `planejado: ${formatRoR(rorData.rorPlanejado)}` : undefined}
                showWarning={rorData.isWarning}
            />
        </div>
    );
}
