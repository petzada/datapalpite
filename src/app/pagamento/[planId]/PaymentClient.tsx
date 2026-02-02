"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Check, Loader2, CheckCircle2, QrCode } from 'lucide-react'

interface PaymentClientProps {
    planId: 'easy' | 'pro'
    planName: string
    planPrice: string
    planPriceValue: number
    userName: string
    userEmail: string
}

interface PaymentData {
    brCode: string
    brCodeBase64: string
    externalId: string
}

type PaymentStatus = 'idle' | 'loading' | 'waiting' | 'success' | 'error'

export function PaymentClient({
    planId,
    planName,
    planPrice,
    userName,
}: PaymentClientProps) {
    const router = useRouter()
    const [status, setStatus] = useState<PaymentStatus>('idle')
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pollingCount, setPollingCount] = useState(0)

    // Generate PIX QR Code on mount
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

            const data = await response.json()
            setPaymentData(data)
            setStatus('waiting')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            setStatus('error')
        }
    }

    // Poll for payment status
    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/payments/status')
            if (!response.ok) return false

            const data = await response.json()

            // Check if plan was updated to the expected plan
            if (data.plano === planId && data.isActive) {
                setStatus('success')
                return true
            }
            return false
        } catch {
            return false
        }
    }, [planId])

    // Polling effect
    useEffect(() => {
        if (status !== 'waiting') return

        const interval = setInterval(async () => {
            setPollingCount((prev) => prev + 1)
            const isPaid = await checkPaymentStatus()
            if (isPaid) {
                clearInterval(interval)
            }
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [status, checkPaymentStatus])

    // Copy PIX code to clipboard
    const handleCopy = async () => {
        if (!paymentData?.brCode) return

        try {
            await navigator.clipboard.writeText(paymentData.brCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = paymentData.brCode
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Pagamento confirmado!
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Seu plano <span className="font-semibold text-primary">{planName}</span> está ativo.
                        Aproveite todos os recursos!
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="w-full h-12 rounded-full"
                    >
                        Ir para o Dashboard
                    </Button>
                </div>
            </div>
        )
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
                                Escaneie o QR Code ou copie o código PIX abaixo.
                            </p>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        {status === 'loading' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Gerando código PIX...</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <QrCode className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Erro ao gerar pagamento</p>
                                <p className="text-muted-foreground text-sm text-center mb-4">{error}</p>
                                <Button onClick={generatePayment} variant="outline">
                                    Tentar novamente
                                </Button>
                            </div>
                        )}

                        {status === 'waiting' && paymentData && (
                            <>
                                {/* QR Code Image */}
                                <div className="flex justify-center mb-6">
                                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/30">
                                        <img
                                            src={`data:image/png;base64,${paymentData.brCodeBase64}`}
                                            alt="QR Code PIX"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                </div>

                                {/* Copy Code Section */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                                        Ou copie o código PIX:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={paymentData.brCode}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-muted rounded-lg text-sm font-mono truncate"
                                        />
                                        <Button
                                            onClick={handleCopy}
                                            variant={copied ? "default" : "outline"}
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Copiado
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copiar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Waiting Message */}
                                <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Aguardando pagamento...</p>
                                        <p className="text-xs text-muted-foreground">
                                            O pagamento será confirmado automaticamente
                                            {pollingCount > 0 && ` (verificando... ${pollingCount})`}
                                        </p>
                                    </div>
                                </div>
                            </>
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
