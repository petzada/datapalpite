"use client";

import { BankrollChart } from "./BankrollChart";
import { ROIBySportChart } from "./ROIBySportChart";

export function ChartsSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankrollChart />
            <ROIBySportChart />
        </div>
    );
}
