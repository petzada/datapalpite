"use client";

import { Wallet, TrendingUp, Target, DollarSign, AlertTriangle } from "lucide-react";
import { KPICard } from "./KPICard";

// Mock data for skeleton phase
const mockKPIs = [
    {
        title: "Saldo Atual",
        value: "R$ 0,00",
        description: "Valor total disponível na sua banca de apostas.",
        icon: Wallet,
    },
    {
        title: "ROI",
        value: "0,00%",
        description: "Retorno sobre o investimento total apostado. Quanto maior, melhor seu desempenho.",
        icon: TrendingUp,
    },
    {
        title: "Win Rate",
        value: "0,00%",
        description: "Percentual de apostas vencedoras em relação ao total de apostas realizadas.",
        icon: Target,
    },
    {
        title: "P&L",
        value: "R$ 0,00",
        description: "Lucro ou prejuízo acumulado. Diferença entre seus ganhos e perdas totais.",
        icon: DollarSign,
    },
    {
        title: "Risco de Ruína",
        value: "0,00%",
        description: "Probabilidade de perder toda a banca com base no seu nível de risco atual.",
        icon: AlertTriangle,
    },
];

export function KPISection() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {mockKPIs.map((kpi) => (
                <KPICard
                    key={kpi.title}
                    title={kpi.title}
                    value={kpi.value}
                    description={kpi.description}
                    icon={kpi.icon}
                />
            ))}
        </div>
    );
}
