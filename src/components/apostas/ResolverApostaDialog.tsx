"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { resolverAposta, type Aposta } from "@/lib/actions/apostas";

interface ResolverApostaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    aposta: Aposta | null;
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function ResolverApostaDialog({ open, onOpenChange, aposta }: ResolverApostaDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultado, setResultado] = useState<"ganha" | "perdida" | "anulada">("ganha");

    // Get first event summary
    const eventoResumo = aposta?.eventos?.[0]
        ? `${aposta.eventos[0].evento} - ${aposta.eventos[0].mercado}`
        : "";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!aposta) return;

        setLoading(true);
        setError(null);

        try {
            const result = await resolverAposta(aposta.id, resultado);

            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || "Erro ao resolver aposta");
            }
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Resolver Aposta</DialogTitle>
                        <DialogDescription>
                            Selecione o resultado da aposta para atualizar suas métricas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Aposta info */}
                        <div className="p-3 bg-muted rounded-lg text-sm">
                            <p className="font-medium truncate">{eventoResumo}</p>
                            <div className="flex gap-4 mt-1 text-muted-foreground">
                                <span>Odd: {aposta?.odds_total.toFixed(2)}</span>
                                <span>Stake: {aposta ? formatCurrency(aposta.stake) : ""}</span>
                            </div>
                        </div>

                        {/* Resultado */}
                        <div className="space-y-3">
                            <Label>Resultado</Label>
                            <RadioGroup
                                value={resultado}
                                onValueChange={(v) => setResultado(v as "ganha" | "perdida" | "anulada")}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ganha" id="ganha" />
                                    <Label htmlFor="ganha" className="font-normal cursor-pointer">
                                        ✅ Ganha
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="perdida" id="perdida" />
                                    <Label htmlFor="perdida" className="font-normal cursor-pointer">
                                        ❌ Perdida
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="anulada" id="anulada" />
                                    <Label htmlFor="anulada" className="font-normal cursor-pointer">
                                        ⚪ Anulada
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
