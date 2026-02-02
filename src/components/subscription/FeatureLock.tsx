'use client'

import { Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'

interface FeatureLockProps {
    feature: string
    requiredPlan?: 'easy' | 'pro'
    children: React.ReactNode
    showUpgradeButton?: boolean
}

export function FeatureLock({
    feature,
    requiredPlan = 'pro',
    children,
    showUpgradeButton = true,
}: FeatureLockProps) {
    return (
        <div className="relative">
            {/* Overlay de bloqueio */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{feature}</p>
                    <p className="text-xs text-muted-foreground">
                        Disponivel no plano{' '}
                        <span className="font-semibold capitalize">
                            {requiredPlan}
                        </span>
                    </p>
                    {showUpgradeButton && (
                        <Button size="sm" asChild>
                            <Link href="/planos">
                                <Crown className="mr-1 h-4 w-4" />
                                Fazer Upgrade
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Conteudo bloqueado (blur) */}
            <div className="pointer-events-none select-none blur-sm">
                {children}
            </div>
        </div>
    )
}

interface FeatureLockButtonProps {
    feature: string
    requiredPlan?: 'easy' | 'pro'
    children: React.ReactNode
}

export function FeatureLockButton({
    feature,
    requiredPlan = 'pro',
    children,
}: FeatureLockButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative inline-flex">
                        <div className="pointer-events-none opacity-50">
                            {children}
                        </div>
                        <div className="absolute -right-1 -top-1">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {feature} - Disponivel no plano{' '}
                        <span className="font-semibold capitalize">
                            {requiredPlan}
                        </span>
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
