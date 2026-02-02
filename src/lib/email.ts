import { Resend } from 'resend'

// Configuracao do remetente
const FROM_EMAIL = 'Data Palpite <suporte@datapalpite.com.br>'

// Inicializacao lazy do cliente Resend para evitar erro durante build
let resendClient: Resend | null = null

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            throw new Error('RESEND_API_KEY não configurada')
        }
        resendClient = new Resend(apiKey)
    }
    return resendClient
}

// Template base para todos os e-mails
function getEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Palpite</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #16a34a; padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                Data Palpite
                            </h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                Data Palpite - Apostas baseadas em dados
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Este e-mail foi enviado automaticamente. Por favor, nao responda.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
}

/**
 * Envia e-mail de boas-vindas para novos usuarios
 */
export async function sendWelcomeEmail(email: string, name: string) {
    const content = `
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
            Bem-vindo ao Data Palpite, ${name}!
        </h2>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Estamos muito felizes em ter voce conosco! Sua conta foi criada com sucesso e voce ja pode comecar a usar todas as ferramentas.
        </p>
        <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Com o Data Palpite, voce tem acesso a:
        </p>
        <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8;">
            <li><strong>Gerenciamento de Bancas</strong> - Controle seu saldo e stakes</li>
            <li><strong>Registro de Apostas</strong> - Acompanhe seu historico completo</li>
            <li><strong>Calculadora de EV</strong> - Identifique apostas de valor</li>
            <li><strong>Consulta IA</strong> - Analises inteligentes de jogos</li>
            <li><strong>Dashboard</strong> - Visualize seu desempenho</li>
        </ul>
        <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
            Voce tem <strong>7 dias de acesso gratuito</strong> a todas as funcionalidades. Aproveite!
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
                <td style="background-color: #16a34a; border-radius: 8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://datapalpite.com'}/dashboard"
                       style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        Acessar Dashboard
                    </a>
                </td>
            </tr>
        </table>
    `

    try {
        const resend = getResendClient()
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Bem-vindo ao Data Palpite!',
            html: getEmailTemplate(content),
        })

        if (error) {
            console.error('Erro ao enviar e-mail de boas-vindas:', error)
            return { success: false, error }
        }

        console.log('E-mail de boas-vindas enviado:', data?.id)
        return { success: true, data }
    } catch (error) {
        console.error('Erro inesperado ao enviar e-mail:', error)
        return { success: false, error }
    }
}

/**
 * Envia e-mail generico (para uso futuro)
 */
export async function sendEmail({
    to,
    subject,
    content,
}: {
    to: string
    subject: string
    content: string
}) {
    try {
        const resend = getResendClient()
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject,
            html: getEmailTemplate(content),
        })

        if (error) {
            console.error('Erro ao enviar e-mail:', error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Erro inesperado ao enviar e-mail:', error)
        return { success: false, error }
    }
}
