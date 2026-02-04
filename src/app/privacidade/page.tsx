import Link from "next/link";

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container-main py-16 sm:py-24 max-w-4xl mx-auto px-4">
                <Link href="/" className="text-2xl font-bold text-primary mb-8 block">
                    Data Palpite
                </Link>

                <h1 className="text-3xl sm:text-4xl font-bold mb-6">Política de Privacidade</h1>
                <p className="text-sm text-muted-foreground mb-8">Última atualização: Fevereiro de 2026</p>

                <div className="prose prose-slate max-w-none space-y-6 text-foreground">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Data Palpite (&quot;nós&quot;, &quot;nosso&quot;) está comprometida com a proteção da privacidade e
                            dos dados pessoais de seus usuários, em conformidade com a Lei Geral de Proteção de Dados
                            (LGPD - Lei n.º 13.709/2018). Esta Política de Privacidade descreve como coletamos, usamos,
                            armazenamos e protegemos suas informações pessoais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Dados que Coletamos</h2>
                        <p className="text-muted-foreground leading-relaxed">Coletamos os seguintes tipos de dados:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li><strong>Dados de cadastro:</strong> nome completo, endereço de e-mail;</li>
                            <li><strong>Dados de autenticação:</strong> informações fornecidas via login social (Google);</li>
                            <li><strong>Dados de uso:</strong> registros de apostas, bancas, configurações e preferências;</li>
                            <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, para fins de segurança e melhoria do serviço.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Base Legal para Tratamento</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            O tratamento dos dados pessoais é realizado com base nas seguintes hipóteses legais
                            previstas na LGPD:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li><strong>Execução de contrato:</strong> para prestação dos serviços contratados;</li>
                            <li><strong>Consentimento:</strong> para o envio de comunicações e e-mails informativos;</li>
                            <li><strong>Legítimo interesse:</strong> para melhoria dos serviços e segurança da plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Finalidade do Tratamento</h2>
                        <p className="text-muted-foreground leading-relaxed">Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li>Criar e gerenciar sua conta;</li>
                            <li>Fornecer os serviços contratados (gestão de bancas e apostas);</li>
                            <li>Processar pagamentos e gerenciar assinaturas;</li>
                            <li>Enviar notificações sobre sua conta e serviço;</li>
                            <li>Melhorar a experiência e funcionalidades da Plataforma;</li>
                            <li>Garantir a segurança e prevenir fraudes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Compartilhamento de Dados</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Seus dados pessoais podem ser compartilhados com:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li><strong>Processadores de pagamento:</strong> para processar transações financeiras (AbacatePay);</li>
                            <li><strong>Provedores de infraestrutura:</strong> para hospedagem e armazenamento de dados (Supabase, Vercel);</li>
                            <li><strong>Provedores de e-mail:</strong> para envio de e-mails transacionais (Resend);</li>
                            <li><strong>Provedores de IA:</strong> para funcionalidades de consulta por inteligência artificial (Google AI).</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-2">
                            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para
                            fins de marketing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Armazenamento e Segurança</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL)
                            e em repouso. Adotamos medidas técnicas e organizacionais para proteger seus dados
                            contra acesso não autorizado, perda ou destruição, incluindo autenticação segura,
                            controle de acesso e monitoramento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Seus Direitos (LGPD)</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Conforme a LGPD, você tem direito a:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los;</li>
                            <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou desatualizados;</li>
                            <li><strong>Anonimização ou eliminação:</strong> solicitar a anonimização ou exclusão de dados desnecessários;</li>
                            <li><strong>Portabilidade:</strong> solicitar a portabilidade dos seus dados;</li>
                            <li><strong>Revogação do consentimento:</strong> revogar o consentimento a qualquer momento;</li>
                            <li><strong>Eliminação:</strong> solicitar a exclusão dos dados tratados com base no consentimento;</li>
                            <li><strong>Oposição:</strong> opor-se ao tratamento quando realizado sem consentimento.</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-2">
                            Para exercer seus direitos, entre em contato pelo e-mail: privacidade@datapalpite.com.br
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Retenção de Dados</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Seus dados serão mantidos enquanto sua conta estiver ativa ou conforme necessário para
                            prestar os serviços. Após a exclusão da conta, os dados serão eliminados em até 30 dias,
                            exceto quando houver obrigação legal de retenção.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Cookies e Tecnologias Similares</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Utilizamos cookies estritamente necessários para o funcionamento da Plataforma,
                            incluindo cookies de sessão para autenticação. Não utilizamos cookies de rastreamento
                            ou publicidade.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">10. Transferência Internacional</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Alguns de nossos provedores de serviço podem estar localizados fora do Brasil.
                            Nesses casos, garantimos que a transferência internacional de dados ocorre em
                            conformidade com a LGPD, com a adoção de cláusulas contratuais padrão ou outras
                            salvaguardas adequadas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">11. Alterações nesta Política</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você
                            sobre alterações significativas por e-mail ou através da Plataforma. Recomendamos
                            revisar esta página regularmente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">12. Contato</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados,
                            entre em contato:
                        </p>
                        <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-2">
                            <li><strong>E-mail:</strong> privacidade@datapalpite.com.br</li>
                        </ul>
                    </section>
                </div>

                <Link
                    href="/login"
                    className="inline-block mt-8 text-primary hover:underline"
                >
                    &larr; Voltar para o login
                </Link>
            </div>
        </div>
    );
}
