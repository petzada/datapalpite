import Link from "next/link";

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container-main py-16 sm:py-24">
                <Link href="/" className="text-2xl font-bold text-primary mb-8 block">
                    Data Palpite
                </Link>

                <h1 className="text-3xl sm:text-4xl font-bold mb-6">Política de Privacidade</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-muted-foreground">
                        Esta página está em construção. A política de privacidade completa será
                        disponibilizada em breve.
                    </p>
                </div>

                <Link
                    href="/login"
                    className="inline-block mt-8 text-primary hover:underline"
                >
                    ← Voltar para o login
                </Link>
            </div>
        </div>
    );
}
