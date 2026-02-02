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
        priceId: 'price_easy', // Placeholder para Stripe
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
        priceId: 'price_pro', // Placeholder para Stripe
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
        // TODO: Integrar com Stripe
        router.push(`/planos?plan=${planName.toLowerCase()}`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                        <Lock className="h-8 w-8 text-amber-500" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold">
                        {reason === 'trial_expired'
                            ? 'Seu periodo de teste acabou'
                            : 'Sua assinatura expirou'}
                    </h1>
                    <p className="text-muted-foreground">
                        Escolha um plano para continuar tendo acesso a todas as
                        ferramentas do Data Palpite.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                        Mais Popular
                                    </span>
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                    <plan.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription>
                                    {plan.description}
                                </CardDescription>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">
                                        {plan.price}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {plan.period}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="mb-6 space-y-2">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={() => handleSelectPlan(plan.name)}
                                    className="w-full"
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
                        onClick={handleLogout}
                        className="text-muted-foreground"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da conta
                    </Button>
                </div>
            </div>
        </div>
    )
}
