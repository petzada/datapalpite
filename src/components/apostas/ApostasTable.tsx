"use client";

import { useState } from "react";
import { Target, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ResolverApostaDialog } from "./ResolverApostaDialog";
import { deleteAposta, type Aposta } from "@/lib/actions/apostas";
import { useRouter } from "next/navigation";

interface ApostasTableProps {
    apostas: Aposta[];
    tipo: "pendentes" | "finalizadas";
}

// Format currency
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

// Format date
function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    }).format(new Date(dateString));
}

// Get status badge
function getStatusBadge(status: string, lucro: number | null) {
    switch (status) {
        case "ganha":
            return <Badge className="bg-green-600">+{formatCurrency(lucro || 0)}</Badge>;
        case "perdida":
            return <Badge variant="destructive">{formatCurrency(lucro || 0)}</Badge>;
        case "anulada":
            return <Badge variant="secondary">Anulada</Badge>;
        default:
            return <Badge variant="outline">Pendente</Badge>;
    }
}

export function ApostasTable({ apostas, tipo }: ApostasTableProps) {
    const router = useRouter();
    const [resolving, setResolving] = useState<Aposta | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (apostas.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">
                    {tipo === "pendentes"
                        ? "Nenhuma aposta pendente"
                        : "Nenhuma aposta finalizada"}
                </p>
                <p className="text-sm mt-1">
                    {tipo === "pendentes"
                        ? "Suas apostas pendentes aparecerão aqui"
                        : "Resolva suas apostas para ver o histórico"}
                </p>
            </div>
        );
    }

    async function handleDelete(id: string) {
        if (confirm("Tem certeza que deseja excluir esta aposta?")) {
            await deleteAposta(id);
            router.refresh();
        }
    }

    return (
        <>
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Data</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead className="text-right w-[70px]">Odd</TableHead>
                            <TableHead className="text-right w-[100px]">Stake</TableHead>
                            {tipo === "finalizadas" && (
                                <TableHead className="text-right w-[100px]">Resultado</TableHead>
                            )}
                            <TableHead className="text-right w-[80px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apostas.map((aposta) => {
                            const primeiroEvento = aposta.eventos?.[0];
                            const isMultipla = aposta.tipo === "multipla";
                            const isExpanded = expandedId === aposta.id;

                            return (
                                <>
                                    <TableRow key={aposta.id}>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(aposta.data_aposta)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {isMultipla && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => setExpandedId(isExpanded ? null : aposta.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">
                                                        {primeiroEvento?.evento || "—"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {primeiroEvento?.esporte} • {primeiroEvento?.mercado}
                                                        {isMultipla && ` (+${(aposta.eventos?.length || 1) - 1})`}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {aposta.odds_total.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(aposta.stake)}
                                        </TableCell>
                                        {tipo === "finalizadas" && (
                                            <TableCell className="text-right">
                                                {getStatusBadge(aposta.status, aposta.lucro_prejuizo)}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <div className="flex items-center justify-end gap-1">
                                                    {tipo === "pendentes" && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => setResolving(aposta)}
                                                                >
                                                                    <Target className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Resolver</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(aposta.id)}
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

                                    {/* Expanded events for multiple bets */}
                                    {isMultipla && isExpanded && aposta.eventos?.slice(1).map((evento, idx) => (
                                        <TableRow key={`${aposta.id}-${idx}`} className="bg-muted/30">
                                            <TableCell></TableCell>
                                            <TableCell colSpan={tipo === "finalizadas" ? 4 : 3}>
                                                <div className="pl-8 text-sm">
                                                    <p className="font-medium">{evento.evento}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {evento.esporte} • {evento.mercado} • Odd: {evento.odd.toFixed(2)}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <ResolverApostaDialog
                open={!!resolving}
                onOpenChange={(open: boolean) => !open && setResolving(null)}
                aposta={resolving}
            />
        </>
    );
}
