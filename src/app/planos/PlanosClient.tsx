"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/subscription";
import type { PlanoTier } from "@/lib/subscription";
import { Check, ArrowLeft } from "lucide-react";

interface PlanosClientProps {
    currentPlan: PlanoTier;
    validUntil: string;
    userEmail: string;
}

const plans = [
    {
        id: "easy",
        name: "Easy",
        price: "R$ 14,90",
        period: "/mês",
        features: [
            "Controle de apenas uma banca",
            "Uma consulta diária com IA",
            "Calculadora EV+",
            "Histórico básico",
        ],
        highlighted: false,
    },
    {
        id: "pro",
        name: "Pro",
        price: "R$ 39,90",
        period: "/mês",
        features: [
            "Controle ilimitado de bancas",
            "Consultas com IA ilimitadas",
            "Calculadora EV+",
            "Histórico completo",
            "Análises de mercado em tempo real",
        ],
        highlighted: true,
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
        alert(
            `Integração com pagamento em desenvolvimento.\n\nPlano selecionado: ${planId.toUpperCase()}\nEmail: ${userEmail}`
        );
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="bg-background border-b">
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
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Escolha o plano ideal para você
                    </h2>
                    <p className="text-muted-foreground">
                        {isTrialExpired
                            ? "Seu período de teste acabou. Escolha um plano para continuar."
                            : currentPlan === "trial"
                              ? `Você tem ${daysRemaining} dias restantes no trial. Teste grátis por 7 dias. Cancele quando quiser.`
                              : "Teste grátis por 7 dias. Cancele quando quiser."}
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all ${
                                    plan.highlighted
                                        ? "border-primary bg-white shadow-xl"
                                        : "border-border bg-white hover:border-primary/30"
                                } ${isCurrentPlan ? "ring-2 ring-emerald-500" : ""}`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                                            RECOMENDADO
                                        </span>
                                    </div>
                                )}
                                {isCurrentPlan && (
                                    <div className="absolute -top-3 right-4">
                                        <span className="bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                                            PLANO ATUAL
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className="w-full rounded-full h-12"
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan
                                        ? "Plano Atual"
                                        : currentPlan === "pro" && plan.id === "easy"
                                          ? "Fazer Downgrade"
                                          : "Comece agora"}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Todos os planos incluem 7 dias de garantia. Cancele a qualquer momento.
                    </p>
                </div>
            </main>
        </div>
    );
}
