'use client'

import { useEffect, useState } from 'react'
import { checkAccessStatusClient, type AccessStatus } from '@/lib/subscription-client'
import { UpgradeLockScreen } from './UpgradeLockScreen'
import { Loader2 } from 'lucide-react'

interface SubscriptionGuardProps {
    children: React.ReactNode
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkAccess() {
            try {
                const status = await checkAccessStatusClient()
                setAccessStatus(status)
            } catch (error) {
                console.error('Erro ao verificar acesso:', error)
                // Em caso de erro, permitir acesso (fail-open)
                setAccessStatus({ access: 'granted' })
            } finally {
                setLoading(false)
            }
        }

        checkAccess()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (accessStatus?.access === 'blocked' && accessStatus.reason) {
        return <UpgradeLockScreen reason={accessStatus.reason} />
    }

    return <>{children}</>
}
