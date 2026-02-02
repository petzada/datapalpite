"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PlanBadge } from "@/components/subscription";
import type { PlanoTier } from "@/lib/subscription";
import {
    Check,
    X,
    Zap,
    Crown,
    ArrowLeft,
    Clock,
    Infinity,
    BarChart3,
    Bot,
    Wallet,
    History,
} from "lucide-react";

interface PlanosClientProps {
    currentPlan: PlanoTier;
    validUntil: string;
    userEmail: string;
}

const plans = [
    {
        id: "easy",
        name: "Easy",
        price: "R$ 29",
        period: "/mes",
        description: "Para quem esta comecando nas apostas esportivas",
        icon: Zap,
        popular: false,
        features: [
            { name: "1 Banca", included: true, icon: Wallet },
            { name: "1 Consulta IA por dia", included: true, icon: Bot },
            { name: "Calculadora de Odds", included: true, icon: BarChart3 },
            { name: "Dashboard basico", included: true, icon: BarChart3 },
            { name: "Historico do dia", included: true, icon: History },
            { name: "Analise em tempo real", included: false, icon: Clock },
            { name: "Historico completo", included: false, icon: History },
            { name: "Bancas ilimitadas", included: false, icon: Infinity },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "R$ 59",
        period: "/mes",
        description: "Para apostadores que levam a serio",
        icon: Crown,
        popular: true,
        features: [
            { name: "Bancas ilimitadas", included: true, icon: Infinity },
            { name: "Consultas IA ilimitadas", included: true, icon: Bot },
            { name: "Calculadora de Odds", included: true, icon: BarChart3 },
            { name: "Dashboard completo", included: true, icon: BarChart3 },
            { name: "Historico completo", included: true, icon: History },
            { name: "Analise em tempo real", included: true, icon: Clock },
            { name: "Suporte prioritario", included: true, icon: Zap },
            { name: "Exportacao de dados", included: true, icon: BarChart3 },
        ],
    },
];

export function PlanosClient({
    currentPlan,
    validUntil,
    userEmail,
}: PlanosClientProps) {
    const daysRemaining = Math.max(
        0,
        Math.ceil(
            (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
    );

    const isTrialExpired = currentPlan === "trial" && daysRemaining <= 0;

    const handleSelectPlan = (planId: string) => {
        // TODO: Integrar com Stripe Checkout
        // Por enquanto, mostrar alerta
        alert(
            `Integracao com pagamento em desenvolvimento.\n\nPlano selecionado: ${planId.toUpperCase()}\nEmail: ${userEmail}`
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao Dashboard
                        </Link>
                        <PlanBadge plan={currentPlan} daysRemaining={daysRemaining} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Escolha seu Plano</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {isTrialExpired
                            ? "Seu periodo de teste acabou. Escolha um plano para continuar usando o Data Palpite."
                            : currentPlan === "trial"
                              ? `Voce tem ${daysRemaining} dias restantes no seu trial. Escolha um plano para continuar apos o periodo de teste.`
                              : "Gerencie seu plano de assinatura."}
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;
                        const Icon = plan.icon;

                        return (
                            <Card
                                key={plan.id}
                                className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""} ${isCurrentPlan ? "ring-2 ring-emerald-500" : ""}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}
                                {isCurrentPlan && (
                                    <div className="absolute -top-3 right-4">
                                        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                                            Plano Atual
                                        </span>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-4">
                                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature.name}
                                                className={`flex items-center gap-3 text-sm ${!feature.included ? "text-muted-foreground" : ""}`}
                                            >
                                                {feature.included ? (
                                                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                                                )}
                                                <span>{feature.name}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className="w-full"
                                        variant={plan.popular ? "default" : "outline"}
                                        disabled={isCurrentPlan}
                                    >
                                        {isCurrentPlan
                                            ? "Plano Atual"
                                            : currentPlan === "pro" && plan.id === "easy"
                                              ? "Fazer Downgrade"
                                              : "Assinar Agora"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground">
                        Todos os planos incluem 7 dias de garantia. Cancele a qualquer
                        momento.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Duvidas?{" "}
                        <Link href="/contato" className="text-primary hover:underline">
                            Entre em contato
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
