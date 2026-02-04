"use client";

import { BankrollChart } from "./BankrollChart";
import { ROIBySportChart } from "./ROIBySportChart";
import type { MultiSeriesEvolutionData, RoiBySportData } from "@/lib/actions/dashboard";

interface ChartsSectionProps {
    evolutionData: MultiSeriesEvolutionData[];
    roiData: RoiBySportData[];
    bancaNomes?: string[];
}

export function ChartsSection({ evolutionData, roiData, bancaNomes = [] }: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankrollChart data={evolutionData} bancaNomes={bancaNomes} />
            <ROIBySportChart data={roiData} />
        </div>
    );
}
