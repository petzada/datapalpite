"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApostasTable } from "./ApostasTable";
import { ApostaFormDialog } from "./ApostaFormDialog";
import type { Aposta } from "@/lib/actions/apostas";
import type { Banca } from "@/lib/actions/bancas";

interface ApostasClientProps {
    apostasPendentes: Aposta[];
    apostasFinalizadas: Aposta[];
    bancas: Banca[];
}

export function ApostasClient({ apostasPendentes, apostasFinalizadas, bancas }: ApostasClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const hasBancas = bancas.length > 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Registro de Apostas
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Acompanhe suas apostas e resultados
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} disabled={!hasBancas}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Aposta
                </Button>
            </div>

            {/* Warning if no bancas */}
            {!hasBancas && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
                    ⚠️ Você precisa cadastrar pelo menos uma banca antes de registrar apostas.
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="pendentes" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="pendentes">
                        Pendentes
                        {apostasPendentes.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                                {apostasPendentes.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="finalizadas">
                        Finalizadas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pendentes">
                    <ApostasTable apostas={apostasPendentes} tipo="pendentes" />
                </TabsContent>

                <TabsContent value="finalizadas">
                    <ApostasTable apostas={apostasFinalizadas} tipo="finalizadas" />
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <ApostaFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                bancas={bancas}
            />
        </div>
    );
}
