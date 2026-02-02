import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Use service role for webhook handling (no user context)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WebhookPayload {
    event: string
    data: {
        id: string
        status: string
        amount: number
        metadata: {
            userId: string
            planId: 'easy' | 'pro'
        }
    }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('X-Webhook-Signature')

        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET
        if (webhookSecret && signature) {
            if (!verifySignature(rawBody, signature, webhookSecret)) {
                console.error('Invalid webhook signature')
                return NextResponse.json(
                    { error: 'Assinatura inválida' },
                    { status: 401 }
                )
            }
        }

        const payload: WebhookPayload = JSON.parse(rawBody)

        // Only process billing.paid events
        if (payload.event !== 'billing.paid') {
            return NextResponse.json({ received: true, processed: false })
        }

        const { userId, planId } = payload.data.metadata

        if (!userId || !planId) {
            console.error('Missing metadata in webhook payload')
            return NextResponse.json(
                { error: 'Metadata ausente' },
                { status: 400 }
            )
        }

        // Get current user profile to check existing valid_until
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('valid_until')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('Error fetching profile:', profileError)
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            )
        }

        // Calculate new valid_until: add 30 days from current date or extend if active
        const now = new Date()
        const currentValidUntil = new Date(profile.valid_until)
        const baseDate = currentValidUntil > now ? currentValidUntil : now
        const newValidUntil = new Date(baseDate)
        newValidUntil.setDate(newValidUntil.getDate() + 30)

        // Update user profile with new plan
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                plano: planId,
                status: 'active',
                valid_until: newValidUntil.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating profile:', updateError)
            return NextResponse.json(
                { error: 'Erro ao atualizar plano' },
                { status: 500 }
            )
        }

        console.log(`✅ Payment processed: User ${userId} upgraded to ${planId} until ${newValidUntil.toISOString()}`)

        return NextResponse.json({
            received: true,
            processed: true,
            userId,
            planId,
            validUntil: newValidUntil.toISOString(),
        })

    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json(
            { error: 'Erro ao processar webhook' },
            { status: 500 }
        )
    }
}
