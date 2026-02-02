import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://datapalpite.com.br'

interface CreatePaymentRequest {
    planId: 'easy' | 'pro'
}

interface AbacatePayBillingResponse {
    data: {
        id: string
        url: string
        amount: number
        status: string
        devMode: boolean
        methods: string[]
        products: Array<{
            id: string
            externalId: string
            name: string
            description: string
            quantity: number
            price: number
        }>
        frequency: string
        nextBilling: string | null
        customer: {
            id: string
            metadata: {
                name: string
                cellphone: string
                email: string
                taxId: string
            }
        } | null
        metadata: Record<string, string>
        createdAt: string
        updatedAt: string
    }
    error?: string
}

const PLAN_PRICES = {
    easy: 1490, // Price in cents
    pro: 3990,
}

const PLAN_NAMES = {
    easy: 'Plano Easy - Data Palpite',
    pro: 'Plano Pro - Data Palpite',
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            )
        }

        // Parse request body
        const body: CreatePaymentRequest = await request.json()
        const { planId } = body

        // Validate planId
        if (!planId || !['easy', 'pro'].includes(planId)) {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            )
        }

        const priceInCents = PLAN_PRICES[planId]
        const description = PLAN_NAMES[planId]

        // Check if ABACATEPAY_API_KEY is configured
        if (!process.env.ABACATEPAY_API_KEY) {
            console.error('ABACATEPAY_API_KEY is not configured')
            return NextResponse.json(
                { error: 'Configuração de pagamento incompleta' },
                { status: 500 }
            )
        }

        // Call AbacatePay API to create billing
        const abacateResponse = await fetch(`${ABACATEPAY_API_URL}/billing/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`,
            },
            body: JSON.stringify({
                frequency: 'ONE_TIME',
                methods: ['PIX'],
                products: [
                    {
                        externalId: `${planId}-${user.id}-${Date.now()}`,
                        name: description,
                        description: `Assinatura mensal do ${description}`,
                        quantity: 1,
                        price: priceInCents,
                    }
                ],
                metadata: {
                    userId: user.id,
                    planId,
                },
                returnUrl: `${BASE_URL}/pagamento/${planId}`,
                completionUrl: `${BASE_URL}/dashboard?payment=success`,
            }),
        })

        const responseText = await abacateResponse.text()

        if (!abacateResponse.ok) {
            console.error('AbacatePay error status:', abacateResponse.status)
            console.error('AbacatePay error response:', responseText)
            return NextResponse.json(
                { error: 'Erro ao gerar código PIX. Tente novamente.' },
                { status: 500 }
            )
        }

        let result: AbacatePayBillingResponse
        try {
            result = JSON.parse(responseText)
        } catch {
            console.error('Failed to parse AbacatePay response:', responseText)
            return NextResponse.json(
                { error: 'Resposta inválida do servidor de pagamento' },
                { status: 500 }
            )
        }

        if (result.error) {
            console.error('AbacatePay API error:', result.error)
            return NextResponse.json(
                { error: 'Erro ao gerar código PIX' },
                { status: 500 }
            )
        }

        // The billing/create endpoint returns a URL for payment
        // The customer needs to access this URL to see the PIX QR Code
        return NextResponse.json({
            billingId: result.data.id,
            paymentUrl: result.data.url,
            planId,
            priceInCents,
        })

    } catch (error) {
        console.error('Payment creation error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
