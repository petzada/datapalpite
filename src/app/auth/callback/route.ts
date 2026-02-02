import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

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
                // Verificar se o profile existe (fallback essencial caso o trigger falhe ou banco esteja inconsistente)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                let shouldSendEmail = false

                if (!profile) {
                    // Cenario 1: Profile nao existe (Trigger falhou ou usuario ja existia sem profile)
                    // Criamos manualmente
                    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'

                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: userName,
                        email: user.email,
                        avatar_url: user.user_metadata?.avatar_url,
                    })

                    if (!insertError) {
                        shouldSendEmail = true
                        console.log('Profile criado manualmente no callback')
                    } else {
                        console.error('Erro ao criar profile manualmente:', insertError)
                    }
                } else {
                    // Cenario 2: Profile ja existe (Trigger funcionou)
                    // Verificamos se e um usuario NOVO (criado nos ultimos 5 minutos) para evitar spam em logins subsequentes
                    const isNewUser = new Date().getTime() - new Date(user.created_at).getTime() < 5 * 60 * 1000 // 5 minutos
                    if (isNewUser) {
                        shouldSendEmail = true
                    }
                }

                // Enviar e-mail se necessario
                if (shouldSendEmail && user.email) {
                    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'
                    sendWelcomeEmail(user.email, userName).catch((err) => {
                        console.error('Falha ao enviar e-mail de boas-vindas:', err)
                    })
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
