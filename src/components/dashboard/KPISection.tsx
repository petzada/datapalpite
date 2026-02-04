"use client";

import { useState } from "react";
import { Wallet, TrendingUp, Target, DollarSign, AlertTriangle } from "lucide-react";
import { KPICard } from "./KPICard";
import type { DashboardStats, BancaWithPL } from "@/lib/actions/dashboard";
import { processarRoR, formatRoR, getRoRColor } from "@/lib/ror";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface KPISectionProps {
    stats: DashboardStats;
    bancas?: BancaWithPL[];
}

export function KPISection({ stats, bancas = [] }: KPISectionProps) {
    const [saldoDialogOpen, setSaldoDialogOpen] = useState(false);

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
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div onClick={() => bancas.length > 0 && setSaldoDialogOpen(true)} className={bancas.length > 0 ? "cursor-pointer" : ""}>
                    <KPICard
                        title="Saldo Atual"
                        value={formatCurrency(stats.saldoTotal)}
                        description="Clique para ver detalhes por banca."
                        icon={Wallet}
                        secondaryValue={bancas.length > 0 ? `${bancas.length} banca${bancas.length > 1 ? "s" : ""}` : undefined}
                    />
                </div>
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

            {/* Dialog de detalhes do saldo por banca */}
            <Dialog open={saldoDialogOpen} onOpenChange={setSaldoDialogOpen}>
                <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Saldo por Banca</DialogTitle>
                        <DialogDescription>
                            Detalhamento do saldo em cada banca cadastrada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {bancas.map((banca) => (
                            <div key={banca.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div>
                                    <p className="font-medium text-sm">{banca.nome}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Inicial: {formatCurrency(banca.saldo_inicial)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{formatCurrency(banca.saldoAtual)}</p>
                                    <p className={`text-xs ${banca.totalPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        P&L: {banca.totalPL >= 0 ? "+" : ""}{formatCurrency(banca.totalPL)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {/* Total */}
                        <div className="flex items-center justify-between p-3 rounded-lg border-t pt-4 mt-2">
                            <p className="font-semibold text-sm">Total</p>
                            <p className="font-bold text-sm">{formatCurrency(stats.saldoTotal)}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
