"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { BancaFormDialog } from "./BancaFormDialog";
import { DeleteBancaDialog } from "./DeleteBancaDialog";
import type { Banca } from "@/lib/actions/bancas";

interface BancasTableProps {
    bancas: Banca[];
}

// Formatar valor em BRL
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

// Formatar data
function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(dateString));
}

export function BancasTable({ bancas }: BancasTableProps) {
    const [editingBanca, setEditingBanca] = useState<Banca | null>(null);
    const [deletingBanca, setDeletingBanca] = useState<Banca | null>(null);

    if (bancas.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Nenhuma banca cadastrada</p>
                <p className="text-sm mt-1">Clique em &quot;Nova Banca&quot; para começar</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome da Banca</TableHead>
                            <TableHead className="text-right">Saldo Inicial</TableHead>
                            <TableHead className="hidden sm:table-cell text-right">Stake</TableHead>
                            <TableHead className="hidden md:table-cell">Data de Início</TableHead>
                            <TableHead className="text-right w-[100px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bancas.map((banca) => (
                            <TableRow key={banca.id}>
                                <TableCell className="font-medium">{banca.nome}</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(banca.saldo_inicial)}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                                    {banca.stake_percentual}% ({formatCurrency(banca.saldo_inicial * (banca.stake_percentual / 100))})
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                    {formatDate(banca.created_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <TooltipProvider>
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={() => setEditingBanca(banca)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Editar</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingBanca(banca)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Excluir</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <BancaFormDialog
                open={!!editingBanca}
                onOpenChange={(open: boolean) => !open && setEditingBanca(null)}
                banca={editingBanca}
            />

            {/* Delete Dialog */}
            <DeleteBancaDialog
                open={!!deletingBanca}
                onOpenChange={(open: boolean) => !open && setDeletingBanca(null)}
                banca={deletingBanca}
            />
        </>
    );
}
