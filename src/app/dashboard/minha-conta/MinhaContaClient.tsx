"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Calendar, Mail, User, Trash2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MinhaContaClientProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
        plan: string;
        status: string;
        validUntil: string | null;
        createdAt: string;
    };
}

const planLabels: Record<string, string> = {
    trial: "Trial (Gratuito)",
    easy: "Easy",
    pro: "Pro",
};

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(dateString));
}

export function MinhaContaClient({ user }: MinhaContaClientProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const daysRemaining = user.validUntil
        ? Math.max(0, Math.ceil((new Date(user.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    async function handleDeleteAccount() {
        if (confirmText !== "EXCLUIR") return;

        setDeleting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                setError("Erro ao processar exclusão. Contate o suporte.");
                return;
            }
            router.push("/");
        } catch {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="w-full max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Minha Conta</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie suas informações e assinatura.
                </p>
            </div>

            {/* Perfil */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Membro desde {user.createdAt ? formatDate(user.createdAt) : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assinatura */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Assinatura</CardTitle>
                    <CardDescription>Detalhes do seu plano atual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <div className="flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-500" />
                                <span className="font-semibold">{planLabels[user.plan] || user.plan}</span>
                            </div>
                            {user.validUntil && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {daysRemaining > 0
                                        ? `Válido até ${formatDate(user.validUntil)} (${daysRemaining} dias restantes)`
                                        : "Expirado"
                                    }
                                </p>
                            )}
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/planos">
                                <Crown className="mr-2 h-4 w-4" />
                                Gerenciar Plano
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Zona de Perigo */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis na sua conta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Excluir conta</p>
                            <p className="text-xs text-muted-foreground">
                                Todos os seus dados serão permanentemente removidos.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Conta
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Excluir Conta
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação é irreversível. Todos os seus dados, bancas e apostas serão permanentemente excluídos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirm">
                                Digite <span className="font-bold">EXCLUIR</span> para confirmar:
                            </Label>
                            <Input
                                id="confirm"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="EXCLUIR"
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setConfirmText("");
                            }}
                            disabled={deleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== "EXCLUIR" || deleting}
                        >
                            {deleting ? "Excluindo..." : "Excluir Permanentemente"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
