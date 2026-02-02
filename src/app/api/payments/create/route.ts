import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1'

interface CreatePaymentRequest {
    planId: 'easy' | 'pro'
}

interface AbacatePayResponse {
    data: {
        brCode: string
        brCodeBase64: string
        externalId: string
    }
    error?: {
        message: string
    }
}

const PLAN_PRICES = {
    easy: 14.90,
    pro: 39.90,
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

        const price = PLAN_PRICES[planId]
        const description = PLAN_NAMES[planId]

        // Get user profile for metadata
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single()

        // Call AbacatePay API to create PIX QR Code
        const abacateResponse = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`,
            },
            body: JSON.stringify({
                amount: price,
                description,
                expiresIn: 3600, // 1 hour
                customer: {
                    email: profile?.email || user.email,
                    name: profile?.full_name || 'Cliente Data Palpite',
                },
                metadata: {
                    userId: user.id,
                    planId,
                },
            }),
        })

        if (!abacateResponse.ok) {
            const errorData = await abacateResponse.json()
            console.error('AbacatePay error:', errorData)
            return NextResponse.json(
                { error: 'Erro ao gerar código PIX' },
                { status: 500 }
            )
        }

        const result: AbacatePayResponse = await abacateResponse.json()

        return NextResponse.json({
            brCode: result.data.brCode,
            brCodeBase64: result.data.brCodeBase64,
            externalId: result.data.externalId,
            planId,
            price,
        })

    } catch (error) {
        console.error('Payment creation error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
