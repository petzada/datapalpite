"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, ExternalLink, AlertCircle } from 'lucide-react'

interface PaymentClientProps {
    planId: 'easy' | 'pro'
    planName: string
    planPrice: string
    planPriceValue: number
    userName: string
    userEmail: string
}

interface PaymentResponse {
    billingId: string
    paymentUrl: string
    planId: string
    priceInCents: number
}

type PaymentStatus = 'idle' | 'loading' | 'redirecting' | 'error'

export function PaymentClient({
    planId,
    planName,
    planPrice,
    userName,
}: PaymentClientProps) {
    const router = useRouter()
    const [status, setStatus] = useState<PaymentStatus>('idle')
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Generate Payment URL on mount
    useEffect(() => {
        generatePayment()
    }, [planId])

    const generatePayment = async () => {
        setStatus('loading')
        setError(null)

        try {
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao gerar pagamento')
            }

            const data: PaymentResponse = await response.json()
            setPaymentUrl(data.paymentUrl)

            // Auto redirect after a short delay
            setStatus('redirecting')
            setTimeout(() => {
                window.location.href = data.paymentUrl
            }, 1000)

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            setStatus('error')
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/planos"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar aos planos
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-lg mx-auto">
                    {/* Plan Info Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold">Plano {planName}</h1>
                                <p className="text-muted-foreground text-sm">Assinatura mensal</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{planPrice}</p>
                                <p className="text-muted-foreground text-sm">/mês</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                Olá, <span className="font-medium text-foreground">{userName}</span>!
                                Você será redirecionado para o pagamento seguro.
                            </p>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        {(status === 'loading' || status === 'redirecting') && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <h2 className="text-lg font-semibold mb-2">
                                    {status === 'loading' ? 'Gerando pagamento...' : 'Redirecionando...'}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    Por favor, aguarde um instante.
                                </p>
                                {status === 'redirecting' && paymentUrl && (
                                    <Button onClick={() => window.location.href = paymentUrl} className="mt-2">
                                        Clique aqui se não for redirecionado
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Erro ao iniciar pagamento</p>
                                <p className="text-muted-foreground text-sm text-center mb-6">{error}</p>
                                <Button onClick={generatePayment} variant="outline">
                                    Tentar novamente
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Problemas com o pagamento?{' '}
                        <Link href="/suporte" className="text-primary hover:underline">
                            Entre em contato
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
