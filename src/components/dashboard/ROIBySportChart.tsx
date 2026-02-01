"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

// Mock data for skeleton phase
const mockData = [
    { sport: "Futebol", roi: 12.5 },
    { sport: "Basquete", roi: 8.2 },
    { sport: "Tênis", roi: -3.4 },
    { sport: "MMA", roi: 15.8 },
    { sport: "E-sports", roi: 5.1 },
];

export function ROIBySportChart() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    ROI por Esporte
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={mockData}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                type="category"
                                dataKey="sport"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                width={70}
                                className="text-muted-foreground"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                                labelStyle={{ fontWeight: 600 }}
                                formatter={(value) => [`${Number(value).toFixed(2)}%`, "ROI"]}
                            />
                            <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                                {mockData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.roi >= 0 ? "#22c55e" : "#ef4444"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
