"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBanca, updateBanca, type Banca } from "@/lib/actions/bancas";
import { canCreateBancaClient } from "@/lib/subscription-client";
import { Crown, AlertTriangle } from "lucide-react";

interface BancaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banca?: Banca | null;
}

export function BancaFormDialog({ open, onOpenChange, banca }: BancaFormDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(false);
    const [limitMessage, setLimitMessage] = useState<string | null>(null);
    const [checkingLimit, setCheckingLimit] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        saldo_inicial: "",
        stake_percentual: "2.00",
        notas: "",
    });

    const isEditing = !!banca;

    // Check if user can create more bancas (only when creating, not editing)
    useEffect(() => {
        async function checkLimit() {
            if (open && !banca) {
                setCheckingLimit(true);
                const result = await canCreateBancaClient();
                setLimitReached(!result.allowed);
                setLimitMessage(result.reason || null);
                setCheckingLimit(false);
            }
        }
        checkLimit();
    }, [open, banca]);

    // Reset form when dialog opens/closes or banca changes
    useEffect(() => {
        if (open && banca) {
            setFormData({
                nome: banca.nome,
                saldo_inicial: formatCurrencyInput(banca.saldo_inicial),
                stake_percentual: banca.stake_percentual?.toString() || "2.00",
                notas: banca.notas || "",
            });
            setLimitReached(false);
            setLimitMessage(null);
        } else if (open && !banca) {
            setFormData({
                nome: "",
                saldo_inicial: "",
                stake_percentual: "2.00",
                notas: "",
            });
        }
        setError(null);
    }, [open, banca]);

    // Format number to BRL currency display
    function formatCurrencyInput(value: number | string): string {
        const num = typeof value === "string" ? parseFloat(value.replace(/\D/g, "")) / 100 : value;
        if (isNaN(num)) return "";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(num);
    }

    // Parse BRL currency string to number
    function parseCurrency(value: string): number {
        const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
        return parseFloat(cleaned) || 0;
    }

    // Handle currency input with mask
    function handleCurrencyChange(e: React.ChangeEvent<HTMLInputElement>) {
        const rawValue = e.target.value.replace(/\D/g, "");
        const numValue = parseInt(rawValue, 10) / 100;
        if (isNaN(numValue) || rawValue === "") {
            setFormData({ ...formData, saldo_inicial: "" });
        } else {
            setFormData({ ...formData, saldo_inicial: formatCurrencyInput(numValue) });
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = {
            nome: formData.nome.trim(),
            saldo_inicial: parseCurrency(formData.saldo_inicial),
            stake_percentual: parseFloat(formData.stake_percentual) || 2.0,
            notas: formData.notas.trim() || undefined,
        };

        if (!data.nome) {
            setError("Nome da banca é obrigatório");
            setLoading(false);
            return;
        }

        if (data.saldo_inicial < 0) {
            setError("Saldo inicial não pode ser negativo");
            setLoading(false);
            return;
        }

        try {
            const result = isEditing
                ? await updateBanca(banca.id, data)
                : await createBanca(data);

            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || "Erro ao salvar banca");
            }
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Show limit reached message
    if (!isEditing && limitReached && !checkingLimit) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Limite de Bancas Atingido
                        </DialogTitle>
                        <DialogDescription>
                            {limitMessage}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                            <Crown className="h-8 w-8 text-amber-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Faca upgrade do seu plano para criar bancas ilimitadas e ter acesso a todas as funcionalidades.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Fechar
                        </Button>
                        <Button asChild>
                            <Link href="/planos">
                                <Crown className="mr-2 h-4 w-4" />
                                Ver Planos
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Editar Banca" : "Nova Banca"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Atualize os dados da sua banca de apostas."
                                : "Cadastre uma nova banca para gerenciar suas apostas."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome da banca *</Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Bet365, Betano..."
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>

                        {/* Saldo Inicial */}
                        <div className="space-y-2">
                            <Label htmlFor="saldo_inicial">Saldo inicial *</Label>
                            <Input
                                id="saldo_inicial"
                                placeholder="R$ 0,00"
                                value={formData.saldo_inicial}
                                onChange={handleCurrencyChange}
                                required
                            />
                        </div>

                        {/* Stake Percentual */}
                        <div className="space-y-2">
                            <Label htmlFor="stake_percentual">
                                Stake por aposta (%)
                            </Label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    id="stake_percentual_slider"
                                    min="0.5"
                                    max="10"
                                    step="0.5"
                                    value={formData.stake_percentual}
                                    onChange={(e) => setFormData({ ...formData, stake_percentual: e.target.value })}
                                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <span className="font-medium w-14 text-right">{formData.stake_percentual}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Percentual fixo da banca por aposta. Recomendado: 1-3%
                            </p>
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <Label htmlFor="notas">
                                Notas adicionais{" "}
                                <span className="text-muted-foreground">(opcional)</span>
                            </Label>
                            <textarea
                                id="notas"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Anotações sobre esta banca..."
                                value={formData.notas}
                                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                maxLength={500}
                            />
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
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
