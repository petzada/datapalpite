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
import type { RoiBySportData } from "@/lib/actions/dashboard";

interface ROIBySportChartProps {
    data: RoiBySportData[];
}

export function ROIBySportChart({ data }: ROIBySportChartProps) {
    const hasData = data && data.length > 0;
    // Custom Tooltip para mostrar mais informações
    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: { payload: RoiBySportData }[];
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div
                    style={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        padding: "12px",
                    }}
                >
                    <p style={{ fontWeight: 600, marginBottom: "8px" }}>{label}</p>
                    <p style={{ color: item.roi >= 0 ? "#22c55e" : "#ef4444" }}>
                        ROI: {item.roi.toFixed(2)}%
                    </p>
                    <p style={{ color: item.profit >= 0 ? "#22c55e" : "#ef4444" }}>
                        Lucro: R$ {item.profit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-muted-foreground">
                        Volume: R$ {item.volume.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-muted-foreground">
                        Apostas: {item.betsCount}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    ROI por Esporte
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
                            <BarChart
                                data={data}
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
                                    width={80}
                                    className="text-muted-foreground"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.roi >= 0 ? "#22c55e" : "#ef4444"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
