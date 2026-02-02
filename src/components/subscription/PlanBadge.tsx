'use client'

import { cn } from '@/lib/utils'
import type { PlanoTier } from '@/lib/subscription'

interface PlanBadgeProps {
    plan: PlanoTier
    daysRemaining?: number
    className?: string
}

const planConfig: Record<
    PlanoTier,
    { label: string; bgClass: string; textClass: string }
> = {
    trial: {
        label: 'Trial',
        bgClass: 'bg-amber-500/20',
        textClass: 'text-amber-600 dark:text-amber-400',
    },
    easy: {
        label: 'Easy',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-600 dark:text-blue-400',
    },
    pro: {
        label: 'Pro',
        bgClass: 'bg-emerald-500/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
    },
}

export function PlanBadge({ plan, daysRemaining, className }: PlanBadgeProps) {
    const config = planConfig[plan]

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
