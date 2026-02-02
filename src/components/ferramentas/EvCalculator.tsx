"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, X, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvResult {
    evPercent: number;
    evValue: number;
    fairOdd: number;
    impliedProb: number;
    isPositive: boolean;
}

function calculateEV(odd: number, prob: number, stake: number = 0): EvResult {
    const probDecimal = prob / 100;
    const fairOdd = probDecimal > 0 ? 1 / probDecimal : 0;
    const impliedProb = odd > 0 ? (1 / odd) * 100 : 0;

    // EV% = (ChanceReal * Odd) - 1
    const evPercent = (probDecimal * odd) - 1;

    // EV$ = EV% * Stake
    const evValue = evPercent * stake;

    return {
        evPercent: evPercent * 100,
        evValue,
        fairOdd,
        impliedProb,
        isPositive: evPercent > 0,
    };
}

export function EvCalculator() {
    const [oddCasa, setOddCasa] = useState<string>("2.00");
    const [probReal, setProbReal] = useState<number>(50);
    const [stake, setStake] = useState<string>("");

    const odd = parseFloat(oddCasa) || 0;
    const stakeValue = parseFloat(stake) || 0;

    const result = useMemo(() => {
        if (odd <= 0 || probReal <= 0 || probReal > 100) {
            return null;
        }
        return calculateEV(odd, probReal, stakeValue);
    }, [odd, probReal, stakeValue]);

    const handleOddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setOddCasa(value);
        }
    };

    const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setStake(value);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Dados da Aposta
                    </CardTitle>
                    <CardDescription>
                        Insira a odd da casa e sua probabilidade estimada para calcular o valor esperado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Odd da Casa */}
                    <div className="space-y-2">
                        <Label htmlFor="odd" className="text-base font-medium">
                            Odd da Casa (Decimal)
                        </Label>
                        <Input
                            id="odd"
                            type="text"
                            inputMode="decimal"
                            placeholder="Ex: 2.10"
                            value={oddCasa}
                            onChange={handleOddChange}
                            className="text-lg h-12"
                        />
                    </div>

                    {/* Probabilidade Real */}
                    <div className="space-y-2">
                        <Label htmlFor="prob" className="text-base font-medium">
                            Sua Probabilidade Estimada (%)
                        </Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="prob"
                                type="number"
                                min={1}
                                max={99}
                                value={probReal}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setProbReal(Math.min(99, Math.max(1, val)));
                                }}
                                className="text-lg h-12 w-24 text-center"
                            />
                            <input
                                type="range"
                                min={1}
                                max={99}
                                value={probReal}
                                onChange={(e) => setProbReal(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Stake (Opcional) */}
                    <div className="space-y-2">
                        <Label htmlFor="stake" className="text-base font-medium">
                            Valor da Aposta (Opcional)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                R$
                            </span>
                            <Input
                                id="stake"
                                type="text"
                                inputMode="decimal"
                                placeholder="100.00"
                                value={stake}
                                onChange={handleStakeChange}
                                className="text-lg h-12 pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Card */}
            {result && (
                <Card className={cn(
                    "border-2 transition-colors",
                    result.isPositive ? "border-emerald-500/50 bg-emerald-500/5" : "border-red-500/50 bg-red-500/5"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {result.isPositive ? (
                                <>
                                    <CheckCheck className="w-6 h-6 text-emerald-500" />
                                    <span className="text-emerald-600">Aposta de Valor!</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-6 h-6 text-red-500" />
                                    <span className="text-red-600">Valor Esperado Negativo</span>
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {result.isPositive
                                ? "Esta aposta tem expectativa matemática positiva a longo prazo."
                                : "Esta aposta não possui valor matemático positivo."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* EV Principal */}
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-1">Valor Esperado (EV)</p>
                            <p className={cn(
                                "text-3xl sm:text-4xl lg:text-5xl font-bold",
                                result.isPositive ? "text-emerald-500" : "text-red-500"
                            )}>
                                {result.evPercent >= 0 ? "+" : ""}{result.evPercent.toFixed(2)}%
                            </p>
                            {stakeValue > 0 && (
                                <p className={cn(
                                    "text-xl mt-2",
                                    result.isPositive ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {result.evValue >= 0 ? "+" : ""}R$ {result.evValue.toFixed(2)} por aposta
                                </p>
                            )}
                        </div>

                        {/* Comparativo de Probabilidades */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">Comparativo de Probabilidades</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Prob. Implícita da Casa</span>
                                    <span className="font-medium">{result.impliedProb.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-muted-foreground/50 rounded-full"
                                        style={{ width: `${Math.min(result.impliedProb, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Sua Probabilidade</span>
                                    <span className="font-medium">{probReal}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full",
                                            result.isPositive ? "bg-emerald-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${probReal}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Métricas Adicionais */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Fair Odd (Odd Justa)</p>
                                <p className="text-2xl font-semibold">{result.fairOdd.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground mb-1">Odd da Casa</p>
                                <p className="text-2xl font-semibold">{odd.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Dica */}
                        <div className={cn(
                            "p-3 rounded-lg text-sm",
                            result.isPositive ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"
                        )}>
                            {result.isPositive ? (
                                <p className="flex items-start gap-2">
                                    <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>
                                        A odd oferecida ({odd.toFixed(2)}) é maior que a odd justa ({result.fairOdd.toFixed(2)}).
                                        Isso indica valor matemático positivo.
                                    </span>
                                </p>
                            ) : (
                                <p className="flex items-start gap-2">
                                    <TrendingDown className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>
                                        A odd oferecida ({odd.toFixed(2)}) é menor que a odd justa ({result.fairOdd.toFixed(2)}).
                                        Considere buscar melhores odds ou reavaliar sua probabilidade.
                                    </span>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
