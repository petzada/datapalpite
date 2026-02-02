
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('plano, valid_until')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const now = new Date()
        const validUntil = new Date(profile.valid_until)
        const isValid = validUntil > now

        return NextResponse.json({
            plan: profile.plano,
            validUntil: profile.valid_until,
            isValid,
            isPaid: isValid && profile.plano !== 'trial' // Simplified check
        })

    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
