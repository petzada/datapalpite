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
                // O trigger 'on_auth_user_created' no banco de dados ja cria o perfil automaticamente.
                // Entao verificamos se o usuario foi criado recentemente (ex: nos ultimos 5 minutos)
                // para decidir se enviamos o e-mail de boas-vindas.
                const isNewUser = new Date().getTime() - new Date(user.created_at).getTime() < 5 * 60 * 1000 // 5 minutos

                if (isNewUser) {
                    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'

                    // Verificamos se o perfil existe apenas para garantir que o trigger funcionou
                    // Se nao existir, poderiamos cria-lo aqui como fallback, mas o foco agora e o email.

                    if (user.email) {
                        sendWelcomeEmail(user.email, userName).catch((err) => {
                            console.error('Falha ao enviar e-mail de boas-vindas:', err)
                        })
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
