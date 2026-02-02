"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Copy, Check, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import Image from 'next/image'

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
    brCode: string
    brCodeBase64: string
    planId: string
    priceInCents: number
}

type PaymentStatus = 'idle' | 'loading' | 'success' | 'paid' | 'error'

export function PaymentClient({
    planId,
    planName,
    planPrice,
    userName,
}: PaymentClientProps) {
    const router = useRouter()
    const [status, setStatus] = useState<PaymentStatus>('idle')
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Generate Payment on mount
    useEffect(() => {
        generatePayment()
    }, [planId])

    // Poll for payment status
    useEffect(() => {
        // Only poll if we are waiting for payment (success status)
        if (status !== 'success') return

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/payments/status?planId=${planId}`)
                if (res.ok) {
                    const data = await res.json()
                    // If isPaid is true, payment was confirmed
                    if (data.isPaid) {
                        setStatus('paid')
                        setTimeout(() => router.push('/dashboard?payment=success'), 2500)
                    }
                }
            } catch (error) {
                console.error('[Polling] Error checking status:', error)
            }
        }

        // Check immediately, then every 4 seconds
        checkStatus()
        const intervalId = setInterval(checkStatus, 4000)
        return () => clearInterval(intervalId)
    }, [planId, status, router])

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
            setPaymentData(data)
            setStatus('success') // 'success' here means QR code generated

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            setStatus('error')
        }
    }

    const copyToClipboard = () => {
        if (paymentData?.brCode) {
            navigator.clipboard.writeText(paymentData.brCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
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
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        {status === 'loading' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <h2 className="text-lg font-semibold mb-2">
                                    Gerando Pix...
                                </h2>
                                <p className="text-muted-foreground">
                                    Aguarde um momento.
                                </p>
                            </div>
                        )}

                        {status === 'success' && paymentData && (
                            <div className="flex flex-col items-center justify-center">
                                <h2 className="text-lg font-semibold mb-6">
                                    Escaneie o QR Code para pagar
                                </h2>

                                <div className="bg-white p-4 rounded-xl border-2 border-primary/20 mb-6 shadow-sm">
                                    <Image
                                        src={paymentData.brCodeBase64}
                                        alt="QR Code Pix"
                                        width={250}
                                        height={250}
                                        className="rounded-lg"
                                    />
                                </div>

                                <div className="w-full mb-6">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Ou copie o código Pix:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-muted p-3 rounded-lg text-xs font-mono truncate text-left border">
                                            {paymentData.brCode}
                                        </div>
                                        <Button
                                            onClick={copyToClipboard}
                                            size="icon"
                                            variant="outline"
                                            className={copied ? "text-green-600 border-green-600 bg-green-50" : ""}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <p className="font-semibold">Aguardando pagamento...</p>
                                    </div>
                                    <p className="text-blue-600/80">
                                        A liberação do seu plano ocorre automaticamente após a confirmação.
                                    </p>
                                </div>

                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    variant="outline"
                                    className="w-full h-10"
                                >
                                    Continuar para o dashboard
                                </Button>
                            </div>
                        )}

                        {status === 'paid' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div className="absolute -top-1 -right-1">
                                        <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-green-600 mb-2">
                                    Pagamento Confirmado!
                                </h2>
                                <p className="text-muted-foreground text-center mb-4">
                                    Seu plano {planName} foi ativado com sucesso.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Redirecionando para o dashboard...</span>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Erro ao gerar Pix</p>
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
