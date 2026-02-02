
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const ABACATEPAY_WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('X-Webhook-Signature')

        if (!ABACATEPAY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error('Missing env vars')
            return NextResponse.json({ error: 'Config error' }, { status: 500 })
        }

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
        }

        // Verify HMAC
        const hmac = crypto.createHmac('sha256', ABACATEPAY_WEBHOOK_SECRET)
        const digest = hmac.update(rawBody).digest('hex')

        const signatureBuffer = Buffer.from(signature)
        const digestBuffer = Buffer.from(digest)

        if (signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse body
        const body = JSON.parse(rawBody)

        // Return 200 immediately for validation (idempotency/retries)
        if (body.event !== 'billing.paid') {
            return NextResponse.json({ received: true })
        }

        const metadata = body.data?.metadata
        if (!metadata?.userId || !metadata?.planId) {
            console.error('Missing metadata:', body.data)
            return NextResponse.json({ error: 'Metadata missing' }, { status: 400 })
        }

        const { userId, planId } = metadata

        // Update Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Get current profile
        const { data: profile } = await supabase.from('profiles').select('valid_until, plano').eq('id', userId).single()

        const now = new Date()
        let newValidUntil = new Date()
        const currentValidUntil = profile?.valid_until ? new Date(profile.valid_until) : new Date(0)

        // Extend or Reset
        if (profile?.plano === planId && currentValidUntil > now) {
            newValidUntil = new Date(currentValidUntil.getTime() + (30 * 24 * 60 * 60 * 1000))
        } else {
            newValidUntil.setDate(now.getDate() + 30)
        }

        const { error: updateError } = await supabase.from('profiles').update({
            plano: planId,
            status: 'active',
            valid_until: newValidUntil.toISOString(),
            updated_at: now.toISOString()
        }).eq('id', userId)

        if (updateError) {
            console.error('Update failed:', updateError)
            return NextResponse.json({ error: 'DB Update failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (err) {
        console.error('Webhook error:', err)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
