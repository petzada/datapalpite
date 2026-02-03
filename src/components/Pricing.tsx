import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Easy",
        price: "R$ 14,90",
        period: "/mês",
        features: [
            "Controle de apenas uma banca",
            "Uma consulta diária com IA",
            "Calculadora EV+",
            "Histórico básico",
        ],
        cta: "Comece agora",
        highlighted: false,
    },
    {
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
        cta: "Comece agora",
        highlighted: true,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="section-padding bg-muted/30">
            <div className="container-main">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Escolha o plano ideal para você
                    </h2>
                    <p className="text-muted-foreground">
                        Teste gratuito por 7 dias. Sem necessidade de pagamentos antecipados.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all ${plan.highlighted
                                ? "border-primary bg-white shadow-xl"
                                : "border-border bg-white hover:border-primary/30"
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                                        RECOMENDADO
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

                            <Link href="/login?mode=signup" className="block">
                                <Button className="w-full rounded-full h-12">
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
