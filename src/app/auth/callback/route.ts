import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Verificar se o profile existe (fallback caso o trigger falhe)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                // Criar profile se nao existir
                if (!profile) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                        email: user.email,
                        avatar_url: user.user_metadata?.avatar_url,
                    })
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
