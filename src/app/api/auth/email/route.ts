import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
    sendEmailVerification,
    sendWelcomeEmail,
    sendPasswordRecovery
} from '@/lib/services/email'

type EmailType = 'verification' | 'welcome' | 'recovery'

interface EmailRequest {
    type: EmailType
    email: string
    name?: string
    code?: string
    link?: string
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // For verification/welcome, allow without auth (signup flow)
        // For recovery, also allow without auth
        const body: EmailRequest = await request.json()
        const { type, email, name, code, link } = body

        // Validate required fields
        if (!type || !email) {
            return NextResponse.json(
                { error: 'Tipo e e-mail são obrigatórios' },
                { status: 400 }
            )
        }

        let result

        switch (type) {
            case 'verification':
                if (!code) {
                    return NextResponse.json(
                        { error: 'Código é obrigatório para verificação' },
                        { status: 400 }
                    )
                }
                result = await sendEmailVerification(email, name || 'Usuário', code)
                break

            case 'welcome':
                result = await sendWelcomeEmail(email, name || 'Usuário')
                break

            case 'recovery':
                if (!link) {
                    return NextResponse.json(
                        { error: 'Link é obrigatório para recuperação' },
                        { status: 400 }
                    )
                }
                result = await sendPasswordRecovery(email, link)
                break

            default:
                return NextResponse.json(
                    { error: 'Tipo de e-mail inválido' },
                    { status: 400 }
                )
        }

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Erro ao enviar e-mail' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'E-mail enviado com sucesso'
        })

    } catch (error) {
        console.error('Email API error:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
