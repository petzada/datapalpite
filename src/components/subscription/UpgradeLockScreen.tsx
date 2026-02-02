'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Lock, LogOut, Check } from 'lucide-react'

interface UpgradeLockScreenProps {
    reason: 'trial_expired' | 'subscription_expired'
}

const plans = [
    {
        id: 'easy',
        name: 'Easy',
        price: 'R$ 14,90',
        period: '/mês',
        features: [
            'Controle de apenas uma banca',
            'Uma consulta diária com IA',
            'Calculadora EV+',
            'Histórico básico',
        ],
        highlighted: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$ 39,90',
        period: '/mês',
        features: [
            'Controle ilimitado de bancas',
            'Consultas com IA ilimitadas',
            'Calculadora EV+',
            'Histórico completo',
            'Análises de mercado em tempo real',
        ],
        highlighted: true,
    },
]

export function UpgradeLockScreen({ reason }: UpgradeLockScreenProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleSelectPlan = (planId: string) => {
        router.push(`/planos?plan=${planId}`)
    }

    return (
        <div className="relative min-h-[calc(100vh-8rem)]">
            {/* Overlay apenas na area do dashboard (nao cobre sidebar) */}
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-background/95 backdrop-blur-sm border shadow-lg">
                <div className="mx-auto max-w-3xl px-6 py-8 overflow-y-auto max-h-[90vh]">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                            <Lock className="h-7 w-7 text-amber-500" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">
                            {reason === 'trial_expired'
                                ? 'Seu período de teste acabou'
                                : 'Sua assinatura expirou'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Escolha um plano para continuar tendo acesso a todas as
                            ferramentas do Data Palpite.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-5 rounded-2xl border-2 transition-all ${
                                    plan.highlighted
                                        ? 'border-primary bg-white shadow-lg'
                                        : 'border-border bg-white hover:border-primary/30'
                                }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                        <span className="bg-primary text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                                            RECOMENDADO
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-5">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs">
                                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className="w-full rounded-full"
                                    size="sm"
                                >
                                    Comece agora
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-muted-foreground"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair da conta
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
