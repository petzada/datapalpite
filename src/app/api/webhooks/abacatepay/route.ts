import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const ABACATEPAY_WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// In-memory cache for processed billing IDs (prevents duplicate processing within same instance)
// For production at scale, use Redis or database table
const processedBillings = new Set<string>()

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('X-Webhook-Signature')

        // Validate environment variables
        if (!ABACATEPAY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error('[Webhook] Missing environment variables')
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
        }

        // Validate signature header exists
        if (!signature) {
            console.warn('[Webhook] Missing X-Webhook-Signature header')
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
        }

        // Verify HMAC SHA256 signature using timing-safe comparison
        const hmac = crypto.createHmac('sha256', ABACATEPAY_WEBHOOK_SECRET)
        const expectedSignature = hmac.update(rawBody).digest('hex')

        const signatureBuffer = Buffer.from(signature)
        const expectedBuffer = Buffer.from(expectedSignature)

        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            console.warn('[Webhook] Invalid signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse and validate body
        let body: {
            event: string
            data?: {
                id?: string
                metadata?: {
                    userId?: string
                    planId?: string
                }
            }
        }

        try {
            body = JSON.parse(rawBody)
        } catch {
            console.error('[Webhook] Failed to parse JSON body')
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        // Return 200 immediately for non-payment events
        if (body.event !== 'billing.paid') {
            console.log(`[Webhook] Received event: ${body.event} - ignoring`)
            return NextResponse.json({ received: true, event: body.event })
        }

        // Extract billing ID for idempotency
        const billingId = body.data?.id
        if (!billingId) {
            console.error('[Webhook] Missing billing ID in payload')
            return NextResponse.json({ error: 'Missing billing ID' }, { status: 400 })
        }

        // Idempotency check: Skip if already processed in this instance
        if (processedBillings.has(billingId)) {
            console.log(`[Webhook] Billing ${billingId} already processed - skipping`)
            return NextResponse.json({ received: true, skipped: true, reason: 'already_processed' })
        }

        // Extract and validate metadata
        const metadata = body.data?.metadata
        if (!metadata?.userId || !metadata?.planId) {
            console.error('[Webhook] Missing required metadata:', { billingId, metadata })
            return NextResponse.json({ error: 'Missing userId or planId in metadata' }, { status: 400 })
        }

        const { userId, planId } = metadata

        // Validate planId
        if (!['easy', 'pro'].includes(planId)) {
            console.error('[Webhook] Invalid planId:', planId)
            return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
        }

        console.log(`[Webhook] Processing billing.paid: billingId=${billingId}, userId=${userId}, planId=${planId}`)

        // Create Supabase admin client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Get current profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('valid_until, plano')
            .eq('id', userId)
            .single()

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('[Webhook] Failed to fetch profile:', profileError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Calculate new valid_until date
        const now = new Date()
        let newValidUntil: Date

        const currentValidUntil = profile?.valid_until ? new Date(profile.valid_until) : new Date(0)

        // If same plan and still valid, extend from current expiration
        // Otherwise, start fresh from today
        if (profile?.plano === planId && currentValidUntil > now) {
            newValidUntil = new Date(currentValidUntil.getTime() + (30 * 24 * 60 * 60 * 1000))
            console.log(`[Webhook] Extending subscription from ${currentValidUntil.toISOString()} to ${newValidUntil.toISOString()}`)
        } else {
            newValidUntil = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
            console.log(`[Webhook] New subscription until ${newValidUntil.toISOString()}`)
        }

        // Update profile with new subscription data
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                plano: planId,
                status: 'active',
                valid_until: newValidUntil.toISOString(),
                updated_at: now.toISOString()
            })
            .eq('id', userId)

        if (updateError) {
            console.error('[Webhook] Failed to update profile:', updateError)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        // Mark as processed in memory cache
        processedBillings.add(billingId)

        // Cleanup old entries from memory cache (keep last 1000)
        if (processedBillings.size > 1000) {
            const entries = Array.from(processedBillings)
            entries.slice(0, 500).forEach(id => processedBillings.delete(id))
        }

        console.log(`[Webhook] Successfully activated ${planId} for user ${userId}`)

        return NextResponse.json({
            success: true,
            userId,
            planId,
            validUntil: newValidUntil.toISOString()
        })

    } catch (err) {
        console.error('[Webhook] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
