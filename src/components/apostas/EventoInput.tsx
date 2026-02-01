"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApostaEvento } from "@/lib/actions/apostas";

interface EventoInputProps {
    index: number;
    evento: ApostaEvento;
    onChange: (index: number, evento: ApostaEvento) => void;
    onRemove?: (index: number) => void;
    showRemove?: boolean;
}

export function EventoInput({ index, evento, onChange, onRemove, showRemove }: EventoInputProps) {
    const handleChange = (field: keyof ApostaEvento, value: string | number) => {
        onChange(index, { ...evento, [field]: value });
    };

    // Format odd input
    const handleOddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(",", ".");
        const num = parseFloat(value);
        if (!isNaN(num) || value === "" || value === ".") {
            handleChange("odd", value === "" ? 0 : num || 0);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    Evento {index + 1}
                </span>
                {showRemove && onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`esporte-${index}`}>Esporte *</Label>
                    <Input
                        id={`esporte-${index}`}
                        placeholder="Ex: Futebol"
                        value={evento.esporte}
                        onChange={(e) => handleChange("esporte", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`odd-${index}`}>Odd *</Label>
                    <Input
                        id={`odd-${index}`}
                        placeholder="1.85"
                        value={evento.odd || ""}
                        onChange={handleOddChange}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`evento-${index}`}>Evento *</Label>
                <Input
                    id={`evento-${index}`}
                    placeholder="Ex: Manchester United x Liverpool"
                    value={evento.evento}
                    onChange={(e) => handleChange("evento", e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor={`mercado-${index}`}>Mercado *</Label>
                <Input
                    id={`mercado-${index}`}
                    placeholder="Ex: Resultado final, Over 2.5 gols"
                    value={evento.mercado}
                    onChange={(e) => handleChange("mercado", e.target.value)}
                    required
                />
            </div>
        </div>
    );
}

interface AddEventoButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function AddEventoButton({ onClick, disabled }: AddEventoButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClick}
            disabled={disabled}
        >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar evento
        </Button>
    );
}
