"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BancasTable, BancaFormDialog } from "@/components/bancas";
import type { Banca } from "@/lib/actions/bancas";

interface BancasClientProps {
    bancas: Banca[];
}

export function BancasClient({ bancas }: BancasClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Gestão de Bancas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas casas de apostas e saldos
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="h-10">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Banca
                </Button>
            </div>

            {/* Table */}
            <BancasTable bancas={bancas} />

            {/* Create Dialog */}
            <BancaFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
