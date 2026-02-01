"use client";

import { useState, useEffect } from "react";
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
    hideOdd?: boolean;
}

export function EventoInput({ index, evento, onChange, onRemove, showRemove, hideOdd }: EventoInputProps) {
    // Local state for odd input to allow typing decimals like "1." or "1.8"
    const [oddInput, setOddInput] = useState<string>(
        evento.odd > 0 ? evento.odd.toString() : ""
    );

    // Sync local state when evento.odd changes externally (e.g., reset form)
    useEffect(() => {
        // Intentionally only syncing when evento.odd changes from parent
        setOddInput(evento.odd > 0 ? evento.odd.toString() : "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evento.odd]);

    const handleChange = (field: keyof ApostaEvento, value: string | number) => {
        onChange(index, { ...evento, [field]: value });
    };

    // Handle odd input - accepts decimals like 1.85, 2.10, etc.
    const handleOddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Replace comma with dot for Brazilian users
        let value = e.target.value.replace(",", ".");

        // Only allow numbers and one decimal point
        if (!/^(\d*\.?\d*)$/.test(value)) {
            return;
        }

        // Limit to 2 decimal places
        const parts = value.split(".");
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + "." + parts[1].slice(0, 2);
        }

        // Update local display state immediately (allows typing "1." or "1.8")
        setOddInput(value);

        // Update parent with parsed number
        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleChange("odd", num);
        } else if (value === "" || value === ".") {
            handleChange("odd", 0);
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

            <div className={hideOdd ? "" : "grid grid-cols-2 gap-4"}>
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
                {!hideOdd && (
                    <div className="space-y-2">
                        <Label htmlFor={`odd-${index}`}>Odd *</Label>
                        <Input
                            id={`odd-${index}`}
                            type="text"
                            inputMode="decimal"
                            placeholder="1.85"
                            value={oddInput}
                            onChange={handleOddChange}
                            required
                        />
                    </div>
                )}
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
