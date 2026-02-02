import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get optional planId from query params for specific plan check
        const { searchParams } = new URL(request.url)
        const targetPlanId = searchParams.get('planId')

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plano, valid_until, status')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const now = new Date()
        const validUntil = profile.valid_until ? new Date(profile.valid_until) : new Date(0)
        const isValid = validUntil > now
        const isPaidPlan = profile.plano === 'easy' || profile.plano === 'pro'

        // If checking for specific plan, verify it matches
        const matchesTargetPlan = targetPlanId ? profile.plano === targetPlanId : true

        return NextResponse.json({
            plan: profile.plano,
            validUntil: profile.valid_until,
            isValid,
            isPaid: isValid && isPaidPlan && matchesTargetPlan,
            status: profile.status
        })

    } catch (error) {
        console.error('[PaymentStatus] Error:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
