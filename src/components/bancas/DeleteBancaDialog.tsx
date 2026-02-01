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
import { deleteBanca, type Banca } from "@/lib/actions/bancas";

interface DeleteBancaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banca: Banca | null;
}

export function DeleteBancaDialog({ open, onOpenChange, banca }: DeleteBancaDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        if (!banca) return;

        setLoading(true);
        setError(null);

        try {
            const result = await deleteBanca(banca.id);

            if (result.success) {
                onOpenChange(false);
                router.refresh();
            } else {
                setError(result.error || "Erro ao excluir banca");
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
                <DialogHeader>
                    <DialogTitle>Excluir Banca</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir a banca <strong>&quot;{banca?.nome}&quot;</strong>?
                        Esta ação é permanente e não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
