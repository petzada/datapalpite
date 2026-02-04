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
    Legend,
} from "recharts";
import type { MultiSeriesEvolutionData } from "@/lib/actions/dashboard";

const BANCA_COLORS = [
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ef4444", // red
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#84cc16", // lime
    "#f97316", // orange
];

interface BankrollChartProps {
    data: MultiSeriesEvolutionData[];
    bancaNomes?: string[];
}

export function BankrollChart({ data, bancaNomes = [] }: BankrollChartProps) {
    const hasData = data && data.length > 0;
    const showMultiLine = bancaNomes.length > 1;

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    Evolução da Banca
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] lg:h-[300px] w-full">
                    {!hasData ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Sem apostas finalizadas para exibir
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
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
                                    tickFormatter={(value) =>
                                        `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    }
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
                                    formatter={(value, name) => [
                                        `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                        name === "total" ? "Total" : String(name),
                                    ]}
                                />
                                {showMultiLine && <Legend />}
                                {/* Total line */}
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    name="Total"
                                    stroke="#166534"
                                    strokeWidth={2}
                                    dot={{ fill: "#166534", strokeWidth: 2, r: showMultiLine ? 3 : 4 }}
                                    activeDot={{ r: 6, fill: "#22c55e" }}
                                />
                                {/* Individual banca lines */}
                                {showMultiLine && bancaNomes.map((nome, i) => (
                                    <Line
                                        key={nome}
                                        type="monotone"
                                        dataKey={nome}
                                        name={nome}
                                        stroke={BANCA_COLORS[i % BANCA_COLORS.length]}
                                        strokeWidth={1.5}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
