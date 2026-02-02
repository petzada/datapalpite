'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Lock, Zap, Crown, LogOut, Check } from 'lucide-react'

interface UpgradeLockScreenProps {
    reason: 'trial_expired' | 'subscription_expired'
}

const plans = [
    {
        name: 'Easy',
        price: 'R$ 29',
        period: '/mes',
        description: 'Para quem esta comecando',
        features: [
            '1 Banca',
            '1 Consulta IA por dia',
            'Calculadora de Odds',
            'Dashboard basico',
            'Historico do dia',
        ],
        icon: Zap,
        popular: false,
        priceId: 'price_easy',
    },
    {
        name: 'Pro',
        price: 'R$ 59',
        period: '/mes',
        description: 'Para apostadores serios',
        features: [
            'Bancas ilimitadas',
            'Consultas IA ilimitadas',
            'Analise em tempo real',
            'Dashboard completo',
            'Historico completo',
            'Suporte prioritario',
        ],
        icon: Crown,
        popular: true,
        priceId: 'price_pro',
    },
]

export function UpgradeLockScreen({ reason }: UpgradeLockScreenProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleSelectPlan = (planName: string) => {
        router.push(`/planos?plan=${planName.toLowerCase()}`)
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
                                ? 'Seu periodo de teste acabou'
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
                            <Card
                                key={plan.name}
                                className={`relative ${plan.popular ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-border'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-3 pt-5">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <plan.icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {plan.description}
                                    </CardDescription>
                                    <div className="mt-1">
                                        <span className="text-2xl font-bold">
                                            {plan.price}
                                        </span>
                                        <span className="text-muted-foreground text-sm">
                                            {plan.period}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ul className="mb-4 space-y-1.5">
                                        {plan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() => handleSelectPlan(plan.name)}
                                        className="w-full"
                                        size="sm"
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        Escolher {plan.name}
                                    </Button>
                                </CardContent>
                            </Card>
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
