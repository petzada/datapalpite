import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * AbacatePay Webhook Handler
 *
 * Documentation: https://docs.abacatepay.com/pages/webhooks
 *
 * Security Layers:
 * 1. Query Parameter: ?webhookSecret=xxx (optional, configured in dashboard)
 * 2. HMAC-SHA256 Signature: X-Webhook-Signature header (uses PUBLIC KEY)
 */

// AbacatePay PUBLIC KEY for HMAC signature validation
// This is a FIXED key from AbacatePay, NOT the webhook secret from dashboard
const ABACATEPAY_PUBLIC_KEY = 't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

// In-memory cache for idempotency
const processedBillings = new Set<string>()

/**
 * Verify AbacatePay webhook signature
 * Based on official documentation example
 */
function verifyAbacateSignature(rawBody: string, signatureFromHeader: string): boolean {
    try {
        const bodyBuffer = Buffer.from(rawBody, 'utf8')
        const expectedSig = crypto
            .createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
            .update(bodyBuffer)
            .digest('base64')

        // Compare base64 strings directly (as shown in docs)
        const A = Buffer.from(expectedSig)
        const B = Buffer.from(signatureFromHeader)

        return A.length === B.length && crypto.timingSafeEqual(A, B)
    } catch {
        return false
    }
}

// Webhook payload types
interface WebhookPayload {
    id: string
    event: 'billing.paid' | 'withdraw.done' | 'withdraw.failed'
    devMode: boolean
    data: {
        id: string
        status: string
        amount: number
        metadata?: {
            userId?: string
            planId?: string
        }
    }
}

export async function POST(request: NextRequest) {
    // ============================================================
    // STEP 1: Read raw body FIRST (before any parsing)
    // ============================================================
    const rawBody = await request.text()

    // Get signature header
    const signature = request.headers.get('x-webhook-signature')

    // Optional: Get webhook secret from query params (Layer 1 auth)
    const { searchParams } = new URL(request.url)
    const querySecret = searchParams.get('webhookSecret')

    console.log('[Webhook] Request received')
    console.log('[Webhook] Event ID:', rawBody.substring(0, 60))
    console.log('[Webhook] Has signature:', !!signature)
    console.log('[Webhook] Has query secret:', !!querySecret)

    // ============================================================
    // STEP 2: Validate signature (Layer 2 - HMAC)
    // ============================================================
    if (!signature) {
        console.error('[Webhook] Missing X-Webhook-Signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    if (!verifyAbacateSignature(rawBody, signature)) {
        console.error('[Webhook] Invalid signature')
        // Debug info
        const expectedSig = crypto
            .createHmac('sha256', ABACATEPAY_PUBLIC_KEY)
            .update(Buffer.from(rawBody, 'utf8'))
            .digest('base64')
        console.error('[Webhook] Expected:', expectedSig)
        console.error('[Webhook] Received:', signature)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[Webhook] Signature verified using Public Key')

    // ============================================================
    // STEP 3: Optional - Validate query secret (Layer 1)
    // ============================================================
    const configuredSecret = process.env.ABACATEPAY_WEBHOOK_SECRET
    if (configuredSecret && querySecret && querySecret !== configuredSecret) {
        console.error('[Webhook] Invalid query secret')
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    // ============================================================
    // STEP 4: Parse and validate payload
    // ============================================================
    let payload: WebhookPayload

    try {
        payload = JSON.parse(rawBody)
    } catch {
        console.error('[Webhook] Invalid JSON')
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('[Webhook] Event:', payload.event)
    console.log('[Webhook] Dev mode:', payload.devMode)

    // ============================================================
    // STEP 5: Handle events
    // ============================================================

    // Only process billing.paid events
    if (payload.event !== 'billing.paid') {
        console.log('[Webhook] Ignoring event:', payload.event)
        return NextResponse.json({ received: true, event: payload.event })
    }

    // Idempotency check
    const eventId = payload.id
    if (processedBillings.has(eventId)) {
        console.log('[Webhook] Already processed:', eventId)
        return NextResponse.json({ received: true, skipped: true })
    }

    // Extract metadata
    const metadata = payload.data?.metadata
    if (!metadata?.userId || !metadata?.planId) {
        console.error('[Webhook] Missing metadata in payload')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const { userId, planId } = metadata

    // Validate plan
    if (!['easy', 'pro'].includes(planId)) {
        console.error('[Webhook] Invalid planId:', planId)
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    console.log('[Webhook] Processing payment for user:', userId, 'plan:', planId)

    // ============================================================
    // STEP 6: Update user subscription in Supabase
    // ============================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('[Webhook] Missing Supabase credentials')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
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

    // Calculate new expiration (30 days)
    const now = new Date()
    const currentExpiration = profile?.valid_until ? new Date(profile.valid_until) : new Date(0)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    // Extend from current expiration if same plan and still valid
    // Otherwise start from today
    const newExpiration = (profile?.plano === planId && currentExpiration > now)
        ? new Date(currentExpiration.getTime() + thirtyDays)
        : new Date(now.getTime() + thirtyDays)

    console.log('[Webhook] New expiration:', newExpiration.toISOString())

    // Update profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            plano: planId,
            status: 'active',
            valid_until: newExpiration.toISOString(),
            updated_at: now.toISOString()
        })
        .eq('id', userId)

    if (updateError) {
        console.error('[Webhook] Failed to update profile:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    // Mark as processed
    processedBillings.add(eventId)

    // Cleanup cache if too large
    if (processedBillings.size > 1000) {
        const entries = Array.from(processedBillings)
        entries.slice(0, 500).forEach(id => processedBillings.delete(id))
    }

    console.log('[Webhook] Successfully activated', planId, 'for user', userId)

    return NextResponse.json({
        success: true,
        userId,
        planId,
        validUntil: newExpiration.toISOString()
    })
}
