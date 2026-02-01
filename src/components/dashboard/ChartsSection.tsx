"use client";

import { BankrollChart } from "./BankrollChart";
import { ROIBySportChart } from "./ROIBySportChart";
import type { BankrollEvolutionData, RoiBySportData } from "@/lib/actions/dashboard";

interface ChartsSectionProps {
    evolutionData: BankrollEvolutionData[];
    roiData: RoiBySportData[];
}

export function ChartsSection({ evolutionData, roiData }: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankrollChart data={evolutionData} />
            <ROIBySportChart data={roiData} />
        </div>
    );
}
