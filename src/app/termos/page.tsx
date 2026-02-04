import Link from "next/link";

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container-main py-16 sm:py-24 max-w-4xl mx-auto px-4">
                <Link href="/" className="text-2xl font-bold text-primary mb-8 block">
                    Data Palpite
                </Link>

                <h1 className="text-3xl sm:text-4xl font-bold mb-6">Termos de Uso</h1>
                <p className="text-sm text-muted-foreground mb-8">Última atualização: Fevereiro de 2026</p>

                <div className="prose prose-slate max-w-none space-y-6 text-foreground">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Ao acessar e utilizar a plataforma Data Palpite (&quot;Plataforma&quot;), você concorda em cumprir e ficar
                            vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
                            não deverá utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Data Palpite é uma plataforma de gerenciamento e análise de apostas esportivas.
                            Nosso serviço oferece ferramentas para registro de apostas, controle de bancas,
                            cálculos de valor esperado (EV), análise de desempenho e consultas via inteligência artificial.
                            A Plataforma não realiza, promove ou intermedia apostas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Cadastro e Conta</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Para utilizar a Plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas.
                            Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas
                            as atividades realizadas em sua conta. Você deve ter pelo menos 18 anos de idade para
                            utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Planos e Pagamentos</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Plataforma oferece planos gratuitos e pagos. Os planos pagos são cobrados conforme os
                            valores e periodicidade descritos na página de planos. Os pagamentos são processados via
                            PIX através de processadores de pagamento terceirizados. A Data Palpite reserva-se o
                            direito de alterar os valores dos planos mediante aviso prévio de 30 dias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Uso Adequado</h2>
                        <p className="text-muted-foreground leading-relaxed">Ao utilizar a Plataforma, você concorda em:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li>Não utilizar o serviço para fins ilegais ou não autorizados;</li>
                            <li>Não tentar acessar áreas restritas da Plataforma;</li>
                            <li>Não compartilhar sua conta com terceiros;</li>
                            <li>Não realizar engenharia reversa ou tentar extrair o código-fonte;</li>
                            <li>Não utilizar robôs, scrapers ou meios automatizados para acessar o serviço.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Isenção de Responsabilidade</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Data Palpite é uma ferramenta de gestão e análise. Não garantimos lucros, resultados
                            ou retornos financeiros. As decisões de apostas são de exclusiva responsabilidade do
                            usuário. Os cálculos, estatísticas e análises fornecidos pela Plataforma, incluindo os
                            gerados por inteligência artificial, são meramente informativos e não constituem
                            aconselhamento financeiro ou de apostas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">7. Propriedade Intelectual</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Todo o conteúdo da Plataforma, incluindo textos, gráficos, logotipos, ícones, imagens,
                            compilações de dados e software, é de propriedade da Data Palpite ou de seus licenciadores
                            e está protegido pelas leis brasileiras de propriedade intelectual.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">8. Rescisão</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Data Palpite pode suspender ou encerrar sua conta a qualquer momento, com ou sem motivo,
                            mediante notificação. Você pode cancelar sua conta a qualquer momento através das
                            configurações da conta. Em caso de cancelamento, seus dados serão tratados conforme
                            nossa Política de Privacidade.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">9. Limitação de Responsabilidade</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Em nenhuma circunstância a Data Palpite, seus diretores, funcionários ou parceiros serão
                            responsáveis por quaisquer danos indiretos, incidentais, especiais ou consequenciais
                            decorrentes do uso ou impossibilidade de uso da Plataforma, incluindo perdas financeiras
                            relacionadas a apostas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">10. Alterações nos Termos</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações
                            entrarão em vigor imediatamente após a publicação na Plataforma. O uso continuado do
                            serviço após as alterações constitui aceitação dos novos termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">11. Legislação Aplicável</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer
                            controvérsia decorrente destes Termos será submetida ao foro da comarca do domicílio
                            do usuário, conforme previsto no Código de Defesa do Consumidor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">12. Contato</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Para dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail:
                            suporte@datapalpite.com.br
                        </p>
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
