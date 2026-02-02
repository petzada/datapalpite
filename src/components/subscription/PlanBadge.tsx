'use client'

import { cn } from '@/lib/utils'
import type { PlanoTier } from '@/lib/subscription'

interface PlanBadgeProps {
    plan: PlanoTier
    daysRemaining?: number
    className?: string
    showLabel?: boolean
    variant?: 'default' | 'sidebar'
}

const planConfig: Record<
    PlanoTier,
    { label: string; bgClass: string; textClass: string; sidebarTextClass: string }
> = {
    trial: {
        label: 'Trial',
        bgClass: 'bg-amber-500/20',
        textClass: 'text-amber-600 dark:text-amber-400',
        sidebarTextClass: 'text-amber-600',
    },
    easy: {
        label: 'Easy',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-600 dark:text-blue-400',
        sidebarTextClass: 'text-blue-600',
    },
    pro: {
        label: 'Pro',
        bgClass: 'bg-emerald-500/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        sidebarTextClass: 'text-emerald-600',
    },
}

export function PlanBadge({
    plan,
    daysRemaining,
    className,
    showLabel = false,
    variant = 'default'
}: PlanBadgeProps) {
    const config = planConfig[plan]

    if (variant === 'sidebar') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                {showLabel && (
                    <span className="text-xs text-white/70 whitespace-nowrap">
                        Plano ativo:
                    </span>
                )}
                <div
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                        'bg-white border border-white/20',
                        config.sidebarTextClass
                    )}
                >
                    <span>{config.label}</span>
                    {plan === 'trial' && daysRemaining !== undefined && (
                        <span className="opacity-75 font-normal">
                            {daysRemaining > 0
                                ? `(${daysRemaining}d)`
                                : '(expirado)'}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                config.bgClass,
                config.textClass,
                className
            )}
        >
            <span>{config.label}</span>
            {plan === 'trial' && daysRemaining !== undefined && (
                <span className="opacity-75">
                    {daysRemaining > 0
                        ? `(${daysRemaining}d restantes)`
                        : '(expirado)'}
                </span>
            )}
        </div>
    )
}
