import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, MessageCircle } from "lucide-react"

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao início
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Central de Suporte</h1>
                    <p className="text-muted-foreground mb-12">
                        Estamos aqui para ajudar. Escolha uma das opções abaixo para entrar em contato conosco.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">E-mail</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Para dúvidas gerais e suporte técnico via e-mail.
                            </p>
                            <Button asChild className="w-full">
                                <a href="mailto:suporte@datapalpite.com.br">
                                    Enviar E-mail
                                </a>
                            </Button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">WhatsApp</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Fale diretamente com nosso time pelo WhatsApp.
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    Iniciar Conversa
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
