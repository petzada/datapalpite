import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Verified sender domain from Resend dashboard
const FROM_EMAIL = 'suporte@datapalpite.com.br'
const FROM_NAME = 'Data Palpite'

interface EmailResult {
    success: boolean
    error?: string
}

/**
 * Send email verification code
 * Uses template: email-verification
 */
export async function sendEmailVerification(
    email: string,
    name: string,
    code: string
): Promise<EmailResult> {
    try {
        const { error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: 'Confirme seu e-mail - Data Palpite',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #16a34a;">Data Palpite</h1>
                    <h2>Olá, ${name}!</h2>
                    <p>Seu código de verificação é:</p>
                    <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #16a34a;">${code}</span>
                    </div>
                    <p>Este código expira em 10 minutos.</p>
                    <p>Se você não solicitou este código, ignore este e-mail.</p>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
                    <p style="color: #71717a; font-size: 12px;">Data Palpite - Análises de futebol baseadas em dados</p>
                </div>
            `,
        })

        if (error) {
            console.error('Resend error (verification):', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Email send error:', err)
        return { success: false, error: 'Erro ao enviar e-mail' }
    }
}

/**
 * Send welcome email after confirmation
 * Uses template: welcome-onboard
 */
export async function sendWelcomeEmail(
    email: string,
    name: string
): Promise<EmailResult> {
    try {
        const { error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: 'Bem-vindo ao Data Palpite! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #16a34a;">🎉 Bem-vindo ao Data Palpite!</h1>
                    <h2>Olá, ${name}!</h2>
                    <p>Sua conta foi confirmada com sucesso! Agora você tem acesso a:</p>
                    <ul>
                        <li>✅ Controle de bancas de apostas</li>
                        <li>✅ Calculadora EV+</li>
                        <li>✅ Consultas com IA para análise de partidas</li>
                        <li>✅ 7 dias de trial gratuito</li>
                    </ul>
                    <a href="https://datapalpite.com.br/dashboard" 
                       style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 24px; margin-top: 20px;">
                        Acessar Dashboard
                    </a>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
                    <p style="color: #71717a; font-size: 12px;">Data Palpite - Análises de futebol baseadas em dados</p>
                </div>
            `,
        })

        if (error) {
            console.error('Resend error (welcome):', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Email send error:', err)
        return { success: false, error: 'Erro ao enviar e-mail' }
    }
}

/**
 * Send password recovery link
 * Uses template: recuperacao-de-senha
 */
export async function sendPasswordRecovery(
    email: string,
    resetLink: string
): Promise<EmailResult> {
    try {
        const { error } = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: 'Recuperação de senha - Data Palpite',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #16a34a;">Data Palpite</h1>
                    <h2>Recuperação de senha</h2>
                    <p>Recebemos uma solicitação para redefinir sua senha.</p>
                    <p>Clique no botão abaixo para criar uma nova senha:</p>
                    <a href="${resetLink}" 
                       style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 24px; margin: 20px 0;">
                        Redefinir Senha
                    </a>
                    <p style="color: #71717a; font-size: 14px;">
                        Este link expira em 1 hora. Se você não solicitou a recuperação de senha, ignore este e-mail.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
                    <p style="color: #71717a; font-size: 12px;">Data Palpite - Análises de futebol baseadas em dados</p>
                </div>
            `,
        })

        if (error) {
            console.error('Resend error (recovery):', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Email send error:', err)
        return { success: false, error: 'Erro ao enviar e-mail' }
    }
}
