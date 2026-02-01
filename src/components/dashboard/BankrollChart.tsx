"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock data for skeleton phase
const mockData = [
    { date: "01/01", value: 1000 },
    { date: "05/01", value: 1050 },
    { date: "10/01", value: 980 },
    { date: "15/01", value: 1120 },
    { date: "20/01", value: 1200 },
    { date: "25/01", value: 1150 },
    { date: "30/01", value: 1280 },
];

export function BankrollChart() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    Evolução da Banca
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={mockData}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
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
                                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Saldo"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#166534"
                                strokeWidth={2}
                                dot={{ fill: "#166534", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: "#22c55e" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
