"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EventoInput, AddEventoButton } from "./EventoInput";
import { createAposta, type ApostaEvento } from "@/lib/actions/apostas";
import type { Banca } from "@/lib/actions/bancas";

interface ApostaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bancas: Banca[];
}

const emptyEvento: ApostaEvento = {
    esporte: "",
    evento: "",
    mercado: "",
    odd: 0,
};

export function ApostaFormDialog({ open, onOpenChange, bancas }: ApostaFormDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tipo, setTipo] = useState<"simples" | "multipla">("simples");
    const [bancaId, setBancaId] = useState("");
    const [dataAposta, setDataAposta] = useState("");
    const [stake, setStake] = useState("");
    const [eventos, setEventos] = useState<ApostaEvento[]>([{ ...emptyEvento }]);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setTipo("simples");
            setBancaId("");
            setDataAposta(new Date().toISOString().split("T")[0]);
            setStake("");
            setEventos([{ ...emptyEvento }]);
            setError(null);
        }
    }, [open]);

    // Format currency input
    function handleStakeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const rawValue = e.target.value.replace(/\D/g, "");
        const numValue = parseInt(rawValue, 10) / 100;
        if (isNaN(numValue) || rawValue === "") {
            setStake("");
        } else {
            setStake(
                new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format(numValue)
            );
        }
    }

    // Parse stake
    function parseStake(value: string): number {
        const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
        return parseFloat(cleaned) || 0;
    }

    // Handle evento change
    function handleEventoChange(index: number, evento: ApostaEvento) {
        const newEventos = [...eventos];
        newEventos[index] = evento;
        setEventos(newEventos);
    }

    // Add evento
    function addEvento() {
        if (eventos.length < 20) {
            setEventos([...eventos, { ...emptyEvento }]);
        }
    }

    // Remove evento
    function removeEvento(index: number) {
        if (eventos.length > 1) {
            setEventos(eventos.filter((_, i) => i !== index));
        }
    }

    // Calculate combined odds
    const oddsTotal = eventos.reduce((acc, ev) => acc * (ev.odd || 1), 1);

    // Format date for display
    function formatDateInput(value: string): string {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    // Parse date input (dd/mm/yyyy -> yyyy-mm-dd)
    function parseDateInput(value: string): string {
        const parts = value.split("/");
        if (parts.length === 3 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return "";
    }

    // Handle date change
    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        const formatted = formatDateInput(e.target.value);
        setDataAposta(formatted);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate
        if (!bancaId) {
            setError("Selecione uma banca");
            setLoading(false);
            return;
        }

        const parsedDate = parseDateInput(dataAposta);
        if (!parsedDate) {
            setError("Data inválida (use dd/mm/aaaa)");
            setLoading(false);
            return;
        }

        const parsedStake = parseStake(stake);
        if (parsedStake <= 0) {
            setError("Stake deve ser maior que zero");
            setLoading(false);
            return;
        }

        // Validate eventos
        for (const ev of eventos) {
            if (!ev.esporte || !ev.evento || !ev.mercado || !ev.odd || ev.odd <= 0) {
                setError("Preencha todos os campos dos eventos");
                setLoading(false);
                return;
            }
        }

        try {
            const result = await createAposta({
                banca_id: bancaId,
                tipo,
                data_aposta: parsedDate,
                stake: parsedStake,
                eventos,
            });

            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || "Erro ao criar aposta");
            }
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    // Format date value for display (yyyy-mm-dd -> dd/mm/yyyy)
    function getDisplayDate(value: string): string {
        if (value.includes("-")) {
            const parts = value.split("-");
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nova Aposta</DialogTitle>
                        <DialogDescription>
                            Registre uma nova aposta para acompanhar seu desempenho.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Tipo Switch */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={tipo === "simples" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => {
                                    setTipo("simples");
                                    setEventos([eventos[0] || { ...emptyEvento }]);
                                }}
                            >
                                Aposta Simples
                            </Button>
                            <Button
                                type="button"
                                variant={tipo === "multipla" ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setTipo("multipla")}
                            >
                                Aposta Múltipla
                            </Button>
                        </div>

                        {/* Banca e Data */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="banca">Banca *</Label>
                                <Select value={bancaId} onValueChange={setBancaId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bancas.map((banca) => (
                                            <SelectItem key={banca.id} value={banca.id}>
                                                {banca.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data">Data *</Label>
                                <Input
                                    id="data"
                                    placeholder="dd/mm/aaaa"
                                    value={getDisplayDate(dataAposta)}
                                    onChange={handleDateChange}
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>

                        {/* Eventos */}
                        <div className="space-y-3">
                            {eventos.map((evento, index) => (
                                <EventoInput
                                    key={index}
                                    index={index}
                                    evento={evento}
                                    onChange={handleEventoChange}
                                    onRemove={removeEvento}
                                    showRemove={tipo === "multipla" && eventos.length > 1}
                                />
                            ))}

                            {tipo === "multipla" && (
                                <AddEventoButton
                                    onClick={addEvento}
                                    disabled={eventos.length >= 20}
                                />
                            )}
                        </div>

                        {/* Stake */}
                        <div className="space-y-2">
                            <Label htmlFor="stake">Stake *</Label>
                            <Input
                                id="stake"
                                placeholder="R$ 0,00"
                                value={stake}
                                onChange={handleStakeChange}
                                required
                            />
                        </div>

                        {/* Odds total para múltipla */}
                        {tipo === "multipla" && eventos.length > 1 && (
                            <div className="text-sm text-muted-foreground text-right">
                                Odd combinada: <strong>{oddsTotal.toFixed(2)}</strong>
                            </div>
                        )}

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
                        <Button type="submit" disabled={loading || bancas.length === 0}>
                            {loading ? "Salvando..." : "Salvar Aposta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
