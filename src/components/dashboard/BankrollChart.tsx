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
import type { BankrollEvolutionData } from "@/lib/actions/dashboard";

interface BankrollChartProps {
    data: BankrollEvolutionData[];
}

export function BankrollChart({ data }: BankrollChartProps) {
    const hasData = data && data.length > 0;
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    Evolução da Banca
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
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
                                    formatter={(value: number) => [
                                        `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                        "Saldo",
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="saldo"
                                    stroke="#166534"
                                    strokeWidth={2}
                                    dot={{ fill: "#166534", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: "#22c55e" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
