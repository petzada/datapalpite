import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

        // Get current user profile with plan info
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plano, valid_until, status')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Perfil não encontrado' },
                { status: 404 }
            )
        }

        const now = new Date()
        const validUntil = new Date(profile.valid_until)
        const isActive = now <= validUntil && profile.plano !== 'trial'

        return NextResponse.json({
            plano: profile.plano,
            validUntil: profile.valid_until,
            status: profile.status,
            isActive,
        })

    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
